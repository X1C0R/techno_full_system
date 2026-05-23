"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import {
  faCashRegister,
  faBoxesStacked,
  faCircleUser,
  faBoxArchive,
  faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons"
import HistoryEduIcon from "@mui/icons-material/HistoryEdu"
import { useAuthGuard } from "../hooks/useAuthGuard"

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
        flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer
        transition-all duration-200
        ${
          active
            ? "bg-[#FFB900] text-[#F54900]"
            : "hover:bg-[#FFB900] hover:text-[#F54900]"
        }
      `}
    >
      {typeof icon === "object" && icon?.type ? (
        icon
      ) : (
        <FontAwesomeIcon icon={icon} />
      )}
      {label}
    </div>
  )
}
export const dynamic = "force-dynamic"
export default function InventoryPage() {
    const { role, loading } = useAuthGuard(["cashier", "manager", "admin"])
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState("All")
  const [search, setSearch] = useState("")
  const [Loading, setLoading] = useState(true)
  const [account, setAccount] = useState<Account | null>(null)

  // ✅ FETCH PRODUCTS FROM SUPABASE
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true })

      if (error) {
        console.error("Fetch error:", error)
        return
      }

      setProducts(data || [])
      setFiltered(data || [])
      setLoading(false)
    }

    fetchProducts()
  }, [])

  // ✅ FILTER BY CATEGORY + SEARCH
  useEffect(() => {
    let result = products

    if (activeCategory !== "All") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === activeCategory.toLowerCase()
      )
    }

    if (search.trim()) {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.barcode?.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFiltered(result)
  }, [activeCategory, search, products])

  // ✅ FETCH USER
  useEffect(() => {
    const fetchUser = async () => {
      const stored = localStorage.getItem("user")
      if (!stored) return

      const parsed = JSON.parse(stored)

      const { data } = await supabase
        .from("accounts")
        .select("full_name, role, profile_image")
        .eq("id", parsed.id)
        .single()

      if (!data) return

      setAccount({
        fullname: data.full_name,
        role: data.role,
        profileImage: data.profile_image || "/default-avatar.png",
      })
    }

    fetchUser()
  }, [])

  // ✅ DYNAMIC STATS
  const totalItems = products.length
  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= 10).length
  const outOfStock = products.filter((p) => p.quantity === 0).length

  // ✅ UNIQUE CATEGORIES from DB
  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ]

  // ✅ CATEGORY FILTER HANDLER
  const handleCategory = (cat: string) => {
    setActiveCategory(cat)

    const grid = document.getElementById("product-grid")
    if (!grid) return
    grid.style.opacity = "0.4"
    grid.style.transform = "translateY(10px)"
    setTimeout(() => {
      grid.style.opacity = "1"
      grid.style.transform = "translateY(0)"
    }, 300)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body-md">

      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 flex justify-between items-center bg-[#003527] text-white p-4 z-50">
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
          
          {account?.role === "cashier" && (
          <Link href="/ScannerPage">
            <NavItem icon={faCashRegister} label="Cashier"/>
          </Link>
          )}
          
          <Link href="/inventoryPage">
            <NavItem icon={faBoxesStacked} label="Inventory" active />
          </Link>
          {account?.role === "admin" && (
            <>
              <Link href="/analyticsPage">
                <NavItem icon={<HistoryEduIcon />} label="Analytics" />
              </Link>
              <Link href="/employee">
                <NavItem icon={<HistoryEduIcon />} label="Employee" />
              </Link> 
            </>
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
            />
            <div>
              <p className="font-semibold text-sm">
                {account?.fullname || "Loading..."}
              </p>
              <p className="text-sm text-[#FFB900]">{account?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex flex-col flex-1 h-screen overflow-auto">

        {/* TOP BAR */}
        <header className="flex items-center justify-between px-6 py-4 bg-surface sticky top-0 z-40">
          <div className="w-full max-w-md relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 rounded-full bg-surface-container-highest"
              placeholder="Search products, SKUs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <span className="material-symbols-outlined">notifications</span>
            <span className="material-symbols-outlined">help</span>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-6 space-y-6">

          {/* HEADER */}
          <div>
            <h2 className="text-2xl font-bold text-primary">Inventory Management</h2>
            <p className="text-on-surface-variant">Monitor your stock levels</p>
          </div>

          {/* CATEGORY FILTER */}
          <div className="flex gap-3 overflow-x-auto">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => handleCategory(cat)}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-md"
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* STATS */}
          <div className="grid md:grid-cols-4 gap-4">
            {[
              ["Total Items", String(totalItems), "inventory"],
              ["Low Stock", String(lowStock), "warning"],
              ["Out of Stock", String(outOfStock), "error"],
              ["In Stock", String(totalItems - outOfStock), "trending_up"],
            ].map(([label, value, icon], i) => (
              <div key={i} className="p-5 bg-white rounded-xl border flex gap-4">
                <span className="material-symbols-outlined">{icon}</span>
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* PRODUCTS */}
          <div
            id="product-grid"
            className="space-y-3"
            style={{ transition: "opacity 0.3s ease, transform 0.3s ease" }}
          >
            {Loading ? (
              <p className="text-center text-gray-400 py-10">Loading products...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-gray-400 py-10">No products found.</p>
            ) : (
              filtered.map((p, i) => {
                // ✅ STOCK STATUS
                const isOutOfStock = p.quantity === 0
                const isLowStock = p.quantity > 0 && p.quantity <= 10

                return (
                  <div
                    key={p.id ?? i}
                    className="p-4 bg-white rounded-xl border flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">

                      {/* ✅ INDICATOR DOT */}
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          isOutOfStock
                            ? "bg-red-500"
                            : isLowStock
                            ? "bg-yellow-400"
                            : "bg-green-500"
                        }`}
                      />

                      <div>
                        <h3 className="font-bold">{p.name}</h3>
                        <p className="text-sm text-gray-500">{p.category}</p>
                        <p className={`text-sm font-medium ${
                          isOutOfStock
                            ? "text-red-500"
                            : isLowStock
                            ? "text-yellow-500"
                            : "text-gray-500"
                        }`}>
                          Stock: {p.quantity}
                          {isOutOfStock && " · Out of Stock"}
                          {isLowStock && " · Low Stock"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">₱{Number(p.price).toFixed(2)}</p>
                      {account?.role == "admin" && (
                      <button className="mt-2 px-3 py-1 bg-primary text-white rounded">
                        Edit
                      </button>
                      )}
                      {account?.role == "cashier" && (
                      <button
                        className="mt-2 px-3 py-1 bg-primary text-white rounded disabled:opacity-40"
                        disabled={p.quantity === 0}
                        onClick={() => {
                          // ✅ get existing cart from localStorage
                          const existing = localStorage.getItem("cart")
                          const cart = existing ? JSON.parse(existing) : []

                          // ✅ check if product already in cart
                          const index = cart.findIndex((i: any) => i.barcode === p.barcode)

                          if (index !== -1) {
                            cart[index].qty += 1
                          } else {
                            cart.push({ ...p, qty: 1 })
                          }

                          // ✅ save back to localStorage
                          localStorage.setItem("cart", JSON.stringify(cart))

                          alert(`${p.name} added to cart!`)
                        }}
                      >
                        Buy
                      </button>
                    )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

        </div>
      </main>
    </div>
  )
}