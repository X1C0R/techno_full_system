"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCashRegister, faBoxesStacked, faCircleUser } from "@fortawesome/free-solid-svg-icons"
import HistoryEduIcon from '@mui/icons-material/HistoryEdu'
import PaymentsIcon from '@mui/icons-material/Payments'
import Link from "next/link"
import { User } from "lucide-react"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import Payment from "@/components/utangPayment"

type Account = {
  fullname: string
  role: string
  profileImage: string
  employee_id: string
}

type UtangRecord = {
  id: string
  customer_name: string
  customer_phone: string
  total: number
  created_at: string
  employee_id: string
  accounts?: {
    full_name: string
    employee_id: string
  }
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
export default function UtangPage() {

  const [account, setAccount] = useState<Account | null>(null)
  const [hoverInventory, setHoverInventory] = useState(false)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])


  // ✅ NEW: UTANG DATA
  const [utangRecords, setUtangRecords] = useState<UtangRecord[]>([])

  // GET ACCOUNT LOGIN
  useEffect(() => {
    const storedUser = localStorage.getItem("user")

    if (!storedUser) return

    const user = JSON.parse(storedUser)

    setAccount({
      fullname: user.full_name,
      role: user.role,
      profileImage: user.profile_image
        ? user.profile_image + "?t=" + Date.now()
        : "/default-avatar.png",
        employee_id: user.employee_id,
    })
  }, [])

  // ✅ FETCH UTANG RECORDS
  useEffect(() => {
  const fetchUtang = async () => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return

    const user = JSON.parse(storedUser)

    let query = supabase
      .from("utang_records")
      .select(`
        *,
        accounts (
          full_name,
          employee_id
        )
      `)
      .eq("status", "unpaid")
      .order("created_at", { ascending: false })

    // ✅ Only filter if NOT admin
    if (user.role !== "admin") {
      query = query.eq("employee_id", user.employee_id)
    }

    const { data, error } = await query

    if (error) {
      console.log("UTANG ERROR:", error.message)
      return
    }

    setUtangRecords(data || [])
  }
      fetchUtang()
    }, [])
   const filteredRecords = useMemo(() => {
  const searchQuery = search.toLowerCase()

  return utangRecords.filter((item) =>
    item.customer_name?.toLowerCase().includes(searchQuery) ||
    item.customer_phone?.toLowerCase().includes(searchQuery) ||
    item.accounts?.full_name?.toLowerCase().includes(searchQuery)
  )
}, [search, utangRecords])

  // ✅ CALCULATIONS
  const totalOutstanding = utangRecords.reduce(
    (sum, item) => sum + (item.total || 0),
    0
  )

  const numberOfDebts = utangRecords.length

  useEffect(() => {
    const cards = document.querySelectorAll(".bento-card")

    cards.forEach((card) => {
      const el = card as HTMLElement

      const down = () => {
        el.style.transform = "scale(0.98)"
      }

      const up = () => {
        el.style.transform = "translateY(-2px)"
      }

      el.addEventListener("mousedown", down)
      el.addEventListener("mouseup", up)

      return () => {
        el.removeEventListener("mousedown", down)
        el.removeEventListener("mouseup", up)
      }
    })
  }, [])

  const openPayment = async (utangId: string) => {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("id", utangId)

  if (error) {
    console.log(error)
    return
  }

  setItems(data || [])

  const debt = utangRecords.find((u) => u.id === utangId)
  if (!debt) return

  setSelectedDebt(debt)
  setPaymentOpen(true)
}

  const handlePay = async (password: string) => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}")

  const { data: accountData, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("employee_id", storedUser.employee_id)
    .single()

  if (error || !accountData) {
    alert("Account not found")
    return
  }

  if (accountData.password !== password) {
    alert("Wrong password")
    return
  }

  if (!selectedDebt?.id) return

  const { error: updateError } = await supabase
    .from("utang_records")
    .update({ status: "paid" })
    .eq("id", selectedDebt.id)

  if (updateError) {
    alert("Failed to update payment")
    return
  }
  
  const { error: salesError } = await supabase
    .from("sales")
    .update({
      payment_method: "cash" // ✅ important consistency
    })
    .eq("id", selectedDebt.sale_id)

  if (salesError) {
    console.log("Sales update error:", salesError.message)
  }

  alert("Payment successful!")
  setPaymentOpen(false)
}

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] text-[#121c28]">

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
          {account?.role == "admin" && (
          <Link href="/adminDashboard">
            <NavItem icon={faCashRegister} label="Dashboard" />
          </Link>
          )}
          {account?.role == "cashier" && (
          <Link href="/ScannerPage">
            <NavItem icon={faCashRegister} label="Cashier"/>
          </Link>
          )}
          
          
          <Link href="/inventoryPage">
            <NavItem icon={faBoxesStacked} label="Inventory" />
          </Link>
          {account?.role === "admin" && (
            <>
          <Link href="/analyticsPage">
            <NavItem icon={<HistoryEduIcon />} label="Analytics"/>
          </Link>
          <Link href="/employee">
            <NavItem icon={<HistoryEduIcon />} label="Employee" />
          </Link>
            </>
          )}
          
          <Link href="/utang">
            <NavItem icon={<HistoryEduIcon />} label="Utang" active />
          </Link>
          <Link href="/profile">
            <NavItem icon={faCircleUser} label="Users" />
          </Link>
        </nav>

        {/* PROFILE FIX */}
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

      {/* MAIN (UNCHANGED UI) */}
      <main className=" flex-1 overflow-y-scroll">

        {/* TOP BAR */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b sticky top-0">
          <div className="w-full max-w-md">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-full px-4 py-2"
              placeholder="Search customers or debt entries..."
            />
          </div>
        </header>

        {/* CONTENT */}
        <section className="p-8">

          <div className="flex justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#003527]">
                TORY DEPT
              </h2>
              <p className="text-gray-500">
                Manage customer debts
              </p>
            </div>
          </div>

          {/* SUMMARY (NOW DYNAMIC) */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">

            <div className="bento-card p-6 bg-white rounded-2xl border">
              <p>Total Outstanding Credit</p>
              <h3 className="text-3xl font-bold text-[#003527]">
                ₱{totalOutstanding.toFixed(2)}
              </h3>
            </div>

            <div className="bento-card p-6 bg-white rounded-2xl border">
              <p>Number of Debts</p>
              <h3 className="text-3xl font-bold">
                {numberOfDebts} Customers
              </h3>
            </div>
          </div>

          {/* TABLE (NOW DYNAMIC) */}
          <div className="bg-white rounded-2xl border overflow-hidden">

            <div className="p-4 border-b font-bold">
              Customer Debt List
            </div>

            <table className="w-full text-left overflow-auto">

             <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Contact</th>

                  {account?.role === "admin" && (
                    <th className="p-4">Employee</th>
                  )}

                  <th className="p-4">Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-gray-400">
                      No utang records found
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="border-t">
                      <td className="p-4">{record.customer_name}</td>
                      <td className="p-4">{record.customer_phone}</td>

                      {account?.role === "admin" && (
                        <td className="p-4">
                          {record.accounts?.full_name || "Unknown"}
                        </td>
                      )}

                      <td className="p-4 text-red-500">
                        ₱{record.total.toFixed(2)}
                      </td>

                      <td className="p-4">
                        {new Date(record.created_at).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          disabled={!record.id}
                          onClick={() => openPayment(record.id)}
                          className="bg-[#003527] text-white px-3 py-1 rounded disabled:opacity-50"
                        >
                          Pay
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>

          </div>

        </section>
      </main>
      <Payment
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        customerName={selectedDebt?.customer_name || ""}
        customerId={selectedDebt?.id || ""}
        items={items}
        total={selectedDebt?.total || 0}
        date={selectedDebt?.created_at || ""}
        onPay={handlePay}
      />
    </div>
    
  )
}