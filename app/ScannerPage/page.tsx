"use client"
import "./scanner.css"
import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCashRegister, faBoxesStacked, faCircleUser, faAddressBook } from "@fortawesome/free-solid-svg-icons"
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import PaymentsIcon from '@mui/icons-material/Payments';
import Link from "next/link"
import UtangModal from "@/components/utang_modal"
import { Timestamp } from "next/dist/server/lib/cache-handlers/types"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import { useAuthGuard } from "../hooks/useAuthGuard"
import StickyNote2Icon from '@mui/icons-material/StickyNote2';

const CART_KEY = "POS_CART"

type Product = {
  name: string
  price: number
  barcode: string
  quantity: number
  created_at: Timestamp
  category: string
}

type CartItem = Product & {
  qty: number
}

type Account = {
  fullname: string
  role: string
  profileImage: string
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: any
  label: string
  active?: boolean
}) {
  return (
    <div
      className={`
        flex items-center gap-4 px-6 py-4 rounded-xl mx-3
        font-bold transition-all duration-200 cursor-pointer
        ${active
          ? "bg-[#064e3b] text-[#b0f0d6]"
          : "text-[#95d3ba] hover:bg-[#064e3b]/20 hover:text-white"
        }
      `}
    >
      {typeof icon === "object" && icon?.type ? (
        icon
      ) : (
        <FontAwesomeIcon icon={icon} />
      )}
      <span className="text-sm font-bold">{label}</span>
    </div>
  )
}

export const dynamic = "force-dynamic"

export default function Dashboard() {
  const { role, loading } = useAuthGuard(["cashier", "manager", "admin"])
  const [cart, setCart] = useState<CartItem[]>([])
  const [account, setAccount] = useState<Account | null>(null)
  const [hoverUtang, setHoverUtang] = useState(false)
  const [selected, setSelected] = useState<"cash" | "utang">("cash")
  const [showUtangModal, setShowUtangModal] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [loadingSale, setLoadingSale] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [cartSearch, setCartSearch] = useState("")
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── TRACK IF INITIAL LOAD IS DONE ───────────────────────────────────────
  // Prevents the persist effect from writing an empty [] over a valid saved cart
  // during the brief moment before the load effect runs.
  const isLoaded = useRef(false)

  // ─── LOAD CART FROM LOCALSTORAGE ON MOUNT ────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed)
        }
      } catch {
        localStorage.removeItem(CART_KEY)
      }
    }
    // Mark load as complete so the persist effect can start writing
    isLoaded.current = true
  }, [])

  // ─── PERSIST CART TO LOCALSTORAGE on every change ────────────────────────
  // ✅ FIX: removed the `if (cart.length === 0) return` guard.
  // That was the bug — when you decremented qty the updated cart never saved,
  // so on refresh the old stale cart came back.
  // Now we always write. If cart is empty we remove the key to keep storage clean.
  useEffect(() => {
    if (!isLoaded.current) return  // don't overwrite on first render before load
    if (cart.length === 0) {
      localStorage.removeItem(CART_KEY)
    } else {
      localStorage.setItem(CART_KEY, JSON.stringify(cart))
    }
  }, [cart])

  // ─── FETCH PRODUCTS ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("name, price, barcode, quantity, category, created_at")
      if (!error && data) setProducts(data)
    }
    fetchProducts()
  }, [])

  // ─── LIVE SCANS ───────────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("scans")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scans" },
        async (payload) => {
          const scan = payload.new as { barcode: string }

          const { data: product } = await supabase
            .from("products")
            .select("name, price, barcode, quantity, category, created_at")
            .eq("barcode", scan.barcode)
            .single()

          if (!product) return

          setCart((prev) => {
            const existing = prev.find((i) => i.barcode === product.barcode)
            if (existing) {
              return prev.map((i) =>
                i.barcode === product.barcode ? { ...i, qty: i.qty + 1 } : i
              )
            }
            return [...prev, { ...product, qty: 1 }]
          })
        }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [])

  // ─── FETCH USER ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) return
      const parsed = JSON.parse(storedUser)
      const { data, error } = await supabase
        .from("accounts")
        .select("full_name, role, profile_image")
        .eq("id", parsed.id)
        .single()
      if (error || !data) return
      setAccount({
        fullname: data.full_name,
        role: data.role?.trim().toLowerCase(),
        profileImage: data.profile_image
          ? data.profile_image + "?t=" + Date.now()
          : "/default-avatar.png",
      })
    }
    fetchUser()
  }, [])

  // ─── MEMOIZED TOTALS ──────────────────────────────────────────────────────
  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
    const tax = subtotal * 0.12
    return { subtotal, tax, total: subtotal + tax }
  }, [cart])

  // ─── MEMOIZED SEARCH RESULTS ──────────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!search.trim()) return []
    const lower = search.toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(lower)).slice(0, 8)
  }, [search, products])

  // ─── MEMOIZED FILTERED CART (grid) ───────────────────────────────────────
  const filteredCart = useMemo(() => {
    if (!search.trim()) return cart
    const lower = search.toLowerCase()
    return cart.filter((p) => p.name.toLowerCase().includes(lower))
  }, [cart, search])

  // ─── MEMOIZED FILTERED CART (right panel) ────────────────────────────────
  const filteredCartPanel = useMemo(() => {
    if (!cartSearch.trim()) return cart
    const lower = cartSearch.toLowerCase()
    return cart.filter((item) => item.name.toLowerCase().includes(lower))
  }, [cart, cartSearch])

  // ─── DEBOUNCED SEARCH ─────────────────────────────────────────────────────
  function handleSearch(value: string) {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearch(value), 150)
  }

  // ─── STABLE updateQty ────────────────────────────────────────────────────
  // ✅ FIX: state update triggers the persist effect above which saves to localStorage.
  // Whether the item came from a scan or from the inventory Buy button doesn't matter —
  // both live in the same cart array, and every change now gets persisted immediately.
  const updateQty = useCallback((barcode: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.barcode === barcode ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    )
  }, [])

  // ─── ADD TO CART (from search dropdown) ──────────────────────────────────
  const addToCart = useCallback((p: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.barcode === p.barcode)
      if (existing) {
        return prev.map((i) =>
          i.barcode === p.barcode ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [...prev, { ...p, qty: 1 }]
    })
    setSearchInput("")
    setSearch("")
  }, [])

  // ─── COMPLETE SALE ────────────────────────────────────────────────────────
  const handleCompleteSale = async () => {
    if (cart.length === 0) { alert("Cart is empty"); return }
    const storedUser = localStorage.getItem("user")
    if (!storedUser) { alert("No user session"); return }
    const user = JSON.parse(storedUser)
    if (selected === "utang" && (!customerName || !customerPhone)) {
      alert("Fill customer details"); return
    }

    setLoadingSale(true)

    try {
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          employee_id: user.employee_id,
          total, tax, subtotal,
          payment_method: selected,
          customer_name: selected === "utang" ? customerName : null,
          customer_phone: selected === "utang" ? customerPhone : null,
          sale_month: new Date().toISOString().slice(0, 7),
        })
        .select()
        .single()
      if (saleError) throw saleError

      const items = cart.map((item) => ({
        sale_id: sale.id,
        product_name: item.name,
        price: item.price,
        qty: item.qty,
        barcode: item.barcode,
        category: item.category,
        created_at: new Date().toISOString(),
      }))
      const { error: itemsError } = await supabase.from("sale_items").insert(items)
      if (itemsError) throw itemsError

      // Parallel stock deduction
      await Promise.all(
        cart.map(async (item) => {
          const { data: product, error: fetchError } = await supabase
            .from("products")
            .select("quantity")
            .eq("barcode", item.barcode)
            .single()
          if (fetchError) throw fetchError
          if (!product) return
          const { error: updateError } = await supabase
            .from("products")
            .update({ quantity: product.quantity - item.qty })
            .eq("barcode", item.barcode)
          if (updateError) throw updateError
        })
      )

      if (selected === "utang") {
        const { error: utangError } = await supabase.from("utang_records").insert({
          sale_id: sale.id,
          employee_id: user.employee_id,
          customer_name: customerName,
          customer_phone: customerPhone,
          total,
        })
        if (utangError) throw utangError
      }

      setCart([])
      // cart.length === 0 now, persist effect will call localStorage.removeItem cleanly
      setCustomerName("")
      setCustomerPhone("")
      setShowUtangModal(false)
      alert("Sale completed successfully!")
    } catch (err: any) {
      console.error("SALE ERROR:", err)
      alert(err.message || "Something went wrong")
    } finally {
      setLoadingSale(false)
    }
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden text-on-background font-body-md bg-gray-100">

        {/* LEFT NAV */}
        <div className="md:hidden flex justify-between items-center bg-[#003527] text-white p-4">
          <h1 className="text-xl font-bold text-[#FFB900]">Tory POS</h1>
          <button onClick={() => setOpen(!open)}>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* SIDEBAR */}
        <aside
          className={`
            fixed md:static top-0 left-0
            h-screen w-64 bg-[#003527] text-white
            flex flex-col overflow-hidden
            transform transition-transform duration-300 z-50
            ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="pl-4 pt-6">
            <h1 className="text-5xl font-bold text-[#FFB900]">Tory</h1>
            <p className="text-sm">POS SYSTEM</p>
          </div>

          <nav className="flex flex-col gap-2 mt-6 px-4">
            {account?.role === "admin" && (
              <Link href="/adminDashboard">
                <NavItem icon={faCashRegister} label="Dashboard" />
              </Link>
            )}
            {account?.role === "manager" && (
              <Link href="/managerDashboard">
                <NavItem icon={faCashRegister} label="Dashboard" />
              </Link>
            )}
            <Link href="/ScannerPage">
              <NavItem icon={faCashRegister} label="Cashier" active />
            </Link>
            <Link href="/inventoryPage">
              <NavItem icon={faBoxesStacked} label="Inventory" />
            </Link>

            {account?.role === "admin" && (
              <Link href="/analyticsPage">
                <NavItem icon={<HistoryEduIcon />} label="Analytics" />
              </Link>
            )}

            {(account?.role === "admin" || account?.role === "manager") && (
              <>
                
                <Link href="/employee">
                  <NavItem icon={faAddressBook} label="Employee" />
                </Link>
              </>
            )}
            {account?.role === "manager" && (
              <Link href="/logsPage">
                <NavItem icon={<StickyNote2Icon />} label="Logs" />
              </Link>
            )}
            <Link href="/utang">
              <NavItem icon={<HistoryEduIcon />} label="Utang" />
            </Link>
            <Link href="/profile">
              <NavItem icon={faCircleUser} label="Users" />
            </Link>
          </nav>

          {/* PROFILE */}
          <div className="mt-auto p-4">
            <div className="flex items-center gap-3 border rounded-xl p-2">
              <img
                src={account?.profileImage || "/default-avatar.png"}
                className="w-10 h-10 rounded-full object-cover"
                loading="lazy"
              />
              <div>
                <p className="font-semibold text-sm">{account?.fullname || "Loading..."}</p>
                <p className="text-sm text-[#FFB900]">{account?.role}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* PRODUCT SEARCH BAR */}
        <div className="flex-1">
          <div className="flex items-center gap-2.5 px-2.5 mt-2 border-b pb-1.5">
            <h2 className="font-bold text-2xl border-r pr-2">Tory POS</h2>
            <input
              type="text"
              placeholder="Search product..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-gray-300 rounded-md px-3 py-1 text-sm w-64 h-8"
            />
            {/* SEARCH DROPDOWN */}
            {searchResults.length > 0 && (
              <div className="absolute top-12 left-96 bg-white shadow-lg rounded-md w-96 z-50 max-h-60 overflow-auto">
                {searchResults.map((p) => (
                  <div
                    key={p.barcode}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => addToCart(p)}
                  >
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-green-600">₱{p.price}</p>
                    <p className="text-green-600">Quantity: {p.quantity}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT GRID */}
          <div className="p-2.5 grid grid-cols-1 md:grid-cols-3 md:grid-rows-4 gap-2.5">
            {filteredCart.length === 0 ? (
              <p className="text-gray-400">No scanned products yet...</p>
            ) : (
              filteredCart.map((p) => (
                <div key={p.barcode} className="bg-white p-4 pb-10 rounded shadow w-3xs h-fit">
                  <h3 className="font-bold">{p.name}</h3>
                  <p className="text-green-600">₱{p.price}</p>
                  <p className="text-xs text-gray-400">Qty: {p.qty}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT CART */}
        <div className="w-96 h-1/2 bg-white p-4 border-l rounded-2xl rounded-tl-none rounded-tr-none rounded-br-none ml-auto">
          {filteredCartPanel.length === 0 ? (
            <p className="text-gray-400">Scan a product...</p>
          ) : (
            filteredCartPanel.map((item) => (
              <div key={item.barcode} className="flex justify-between mb-3">
                <div>
                  <p>{item.name}</p>
                  <p className="text-sm text-gray-500">₱{item.price} × {item.qty}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateQty(item.barcode, -1)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.barcode, 1)}>+</button>
                </div>
              </div>
            ))
          )}

          <hr className="my-4" />
          <p>Subtotal: ₱{subtotal.toFixed(2)}</p>
          <p>Tax: ₱{tax.toFixed(2)}</p>
          <p className="font-bold text-lg mb-10">Total: ₱{total.toFixed(2)}</p>

          <div className="flex flex-col h-auto">
            <div className="flex flex-row gap-10 pl-11">
              {/* UTANG */}
              <div
                onMouseEnter={() => setHoverUtang(true)}
                onMouseLeave={() => setHoverUtang(false)}
                onClick={() => { setSelected("utang"); setShowUtangModal(true) }}
                className={`flex flex-row border-2 p-2.5 w-28 justify-center rounded-md transition-all duration-300 cursor-pointer
                ${selected === "utang" || hoverUtang
                  ? "border-[#FFB900] bg-[#FFB900] text-black"
                  : "border-gray-500 bg-transparent"}`}
              >
                <HistoryEduIcon />
                <span className="ml-1">UTANG</span>
              </div>

              {/* CASH */}
              <div
                onClick={() => setSelected("cash")}
                className={`flex flex-row border-2 p-2.5 w-28 justify-center rounded-md transition-all duration-300 cursor-pointer
                ${selected === "cash" && !hoverUtang
                  ? "border-[#FFB900] bg-[#FFB900] text-black"
                  : "border-gray-500 bg-transparent text-black"}`}
              >
                <PaymentsIcon />
                <span className="ml-1">CASH</span>
              </div>
            </div>
            <button
              onClick={handleCompleteSale}
              className="p-2.5 w-full mt-2.5 rounded-md bg-gray-700 font-medium text-2xl text-white"
            >
              {loadingSale ? "Processing..." : "Complete Sale"}
            </button>
          </div>
        </div>
      </div>

      {/* UTANG MODAL */}
      <UtangModal
        isOpen={showUtangModal}
        onClose={() => setShowUtangModal(false)}
        onComplete={handleCompleteSale}
        cart={cart}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
      />
    </>
  )
}