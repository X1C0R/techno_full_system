"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useAuthGuard } from "../hooks/useAuthGuard"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCashRegister, faBoxesStacked, faCircleUser } from "@fortawesome/free-solid-svg-icons"
import HistoryEduIcon from "@mui/icons-material/HistoryEdu"

type Account = {
  fullname: string
  role: string
  profileImage: string
}

type StaffMember = {
  id: string
  full_name: string
  role: string
  status: string
  employee_id: string
  profile_image: string
}

type TopProduct = {
  name: string
  category: string
  qty: number
  revenue: number
}

type UtangRecord = {
  id: string
  customer_name: string
  total: number
  created_at: string
  status: string
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
        ${active
          ? "bg-[#FFB900] text-[#F54900]"
          : "hover:bg-[#FFB900] hover:text-[#F54900]"
        }
      `}
    >
      {typeof icon === "object" && icon?.type ? icon : <FontAwesomeIcon icon={icon} />}
      {label}
    </div>
  )
}

export const dynamic = "force-dynamic"

export default function ManagerDashboard() {
  const { role, loading } = useAuthGuard(["manager", "admin"])
  const [open, setOpen] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)
  const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily")

  // Stats
  const [totalSales, setTotalSales] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [totalUtang, setTotalUtang] = useState(0)

  // Data
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [barData, setBarData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [utangRecords, setUtangRecords] = useState<UtangRecord[]>([])
  const [showToast, setShowToast] = useState(false)

  // USER
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
        profileImage: data.profile_image,
      })
    }
    fetchUser()
  }, [])

  // SALES + BAR CHART
  useEffect(() => {
  const fetchSales = async () => {
    const { data, error } = await supabase
      .from("sales")
      .select("sale_date, sale_month, total, payment_method")

    if (error || !data) return

    const grouped: Record<string, number> = {}

    let total = 0

    data
      .filter((s) => (s.payment_method || "").toLowerCase() === "cash")
      .forEach((sale) => {
        const key =
          viewMode === "daily"
            ? sale.sale_date
            : sale.sale_month

        if (!key) return

        const value = Number(sale.total || 0)

        grouped[key] = (grouped[key] || 0) + value
      })

    // ⚡ build chart data (ALL DAYS)
    const chartData = Object.entries(grouped)
      .map(([name, sales]) => ({
        name,
        sales,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    setBarData(chartData)

    // ⚡ FIX: total should come from ALL filtered sales (not grouped loop confusion)
    total = Object.values(grouped).reduce((a, b) => a + b, 0)

    setTotalSales(total)
  }

  fetchSales()
}, [viewMode])

  // LOW STOCK
  useEffect(() => {
    const fetchStock = async () => {
      const { data } = await supabase.from("products").select("quantity")
      if (!data) return
      setLowStockCount(data.filter((p) => Number(p.quantity) <= 10 && Number(p.quantity) > 0).length)
    }
    fetchStock()
  }, [])

  // STAFF
  useEffect(() => {
    const fetchStaff = async () => {
      const { data } = await supabase
        .from("accounts")
        .select("id, full_name, role, status, employee_id, profile_image")
        .order("created_at", { ascending: false })
      setStaff(data || [])
    }
    fetchStaff()
  }, [])

  // TOP PRODUCTS TODAY
  useEffect(() => {
    const fetchTopProducts = async () => {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

      const { data, error } = await supabase
        .from("sale_items")
        .select("product_name, category, qty, price")
        .gte("created_at", startOfDay)
        .lt("created_at", endOfDay)

      if (error || !data) return

      const grouped: Record<string, any> = {}
      data.forEach((item) => {
        const name = item.product_name || "Unknown"
        if (!grouped[name]) {
          grouped[name] = { name, category: item.category || "Uncategorized", qty: 0, revenue: 0 }
        }
        grouped[name].qty += Number(item.qty || 0)
        grouped[name].revenue += Number(item.qty || 0) * Number(item.price || 0)
      })

      setTopProducts(
        Object.values(grouped)
          .sort((a: any, b: any) => b.qty - a.qty)
          .slice(0, 5)
      )
    }
    fetchTopProducts()
  }, [])

  // UTANG
  useEffect(() => {
    const fetchUtang = async () => {
      const { data } = await supabase
        .from("utang_records")
        .select("id, customer_name, total, created_at, status")
        .order("created_at", { ascending: false })
        .limit(5)
      setUtangRecords(data || [])
      setTotalUtang(
        (data || [])
          .filter((u) => u.status === "unpaid")
          .reduce((sum, u) => sum + Number(u.total || 0), 0)
      )
    }
    fetchUtang()
  }, [])

  // TOAST
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const activeStaff = staff.filter((s) => s.status === "active").length

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#f8f9ff]">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#f8f9ff] overflow-hidden">

      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 flex justify-between items-center bg-[#003527] text-white p-4 z-50">
        <h1 className="text-xl font-bold text-[#fea619]">Tory POS</h1>
        <button onClick={() => setOpen(!open)}>
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* SIDEBAR */}
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
          <div className="pl-4 pt-16 md:pt-6">
            <h1 className="text-5xl font-bold text-[#FFB900]">Tory</h1>
            <p className="text-sm">POS SYSTEM</p>
          </div>

          <nav className="flex flex-col gap-2 mt-6 px-4">
            <Link href="/managerDashboard">
              <NavItem icon={faCashRegister} label="Dashboard" active />
            </Link>
            <Link href="/ScannerPage">
              <NavItem icon={faCashRegister} label="Cashier" />
            </Link>
            <Link href="/inventoryPage">
              <NavItem icon={faBoxesStacked} label="Inventory" />
            </Link>
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
                src={account?.profileImage}
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

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto mt-14 md:mt-0 p-4 md:p-6">

        {/* TOP NAV */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                className="w-full pl-12 pr-4 py-3 rounded-full bg-[#eef4ff] border-none outline-none focus:ring-2 focus:ring-[#003527]/20"
                placeholder="Search transactions, inventory..."
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#eef4ff] transition-colors">
              <span className="material-symbols-outlined text-gray-500">notifications</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#eef4ff] transition-colors">
              <span className="material-symbols-outlined text-gray-500">settings</span>
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-[#121c28]">Dashboard Overview</p>
              <p className="text-xs text-gray-400">
                {new Date().toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </header>

        {/* STATS CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Total Sales */}
          <div className="bg-white p-6 rounded-4xl border border-[#d5e6df] shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#b0f0d6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#003527]">payments</span>
              </div>
              <span className="text-xs font-bold text-[#003527] px-3 py-1 bg-[#003527]/10 rounded-full">
                Cash Only
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today's Total Sales</p>
              <h2 className="text-2xl font-bold text-[#121c28]">₱{totalSales.toLocaleString()}</h2>
            </div>
          </div>

          {/* Active Staff */}
          <div className="bg-white p-6 rounded-4xl border border-[#d5e6df] shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffddb8] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#855300]">badge</span>
              </div>
              <span className="text-xs font-bold text-[#855300] px-3 py-1 bg-[#855300]/10 rounded-full">
                On Shift
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Staff</p>
              <h2 className="text-2xl font-bold text-[#121c28]">{activeStaff} / {staff.length}</h2>
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white p-6 rounded-4xl border border-[#d5e6df] shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffdad6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
              </div>
              <span className="text-xs font-bold text-[#ba1a1a] px-3 py-1 bg-[#ba1a1a]/10 rounded-full">
                Urgent
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Low Stock Items</p>
              <h2 className="text-2xl font-bold text-[#121c28]">{lowStockCount} Items</h2>
            </div>
          </div>

          {/* Utang */}
          <div className="bg-[#003527] p-6 rounded-4xl shadow-lg flex flex-col justify-between overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#064e3b] rounded-full blur-2xl opacity-50" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#fea619] flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-[#2a1700]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
                  menu_book
                </span>
              </div>
              <span className="text-xs font-bold text-[#fea619] px-3 py-1 bg-[#fea619]/10 rounded-full">
                Receivables
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-semibold text-[#95d3ba] uppercase tracking-wider">Total Unpaid Utang</p>
              <h2 className="text-2xl font-bold text-[#b0f0d6]">₱{totalUtang.toLocaleString()}</h2>
            </div>
          </div>
        </section>

        {/* SALES CHART */}
        <section className="bg-white p-4 md:p-6 rounded-[2.5rem] border border-[#d5e6df] shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-xl font-bold text-[#121c28]">Cash Sales Performance</h3>
              <p className="text-sm text-gray-400">Tracking your store's daily revenue growth</p>
            </div>
            <div className="flex bg-[#eef4ff] p-1.5 rounded-2xl">
              {["Daily", "Monthly"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setViewMode(tab.toLowerCase() as "daily" | "monthly")}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                    viewMode === tab.toLowerCase()
                      ? "bg-white shadow text-[#003527]"
                      : "text-gray-400 hover:text-[#003527]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            {barData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center pt-10">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis hide />
                  <Tooltip formatter={(v: any) => `₱${Number(v).toLocaleString()}`} />
                  <Bar dataKey="sales" fill="#003527" radius={[8, 8, 0, 0]}
                    isAnimationActive animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* STAFF MONITOR */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#121c28]">Staff Monitor</h3>
            <Link href="/employee">
              <span className="text-[#003527] font-bold text-sm hover:underline flex items-center gap-1 cursor-pointer">
                View All
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>
          </div>

          {/* MOBILE — cards */}
          <div className="md:hidden space-y-3">
            {staff.slice(0, 4).map((emp) => (
              <div key={emp.id} className="bg-white p-4 rounded-2xl border border-[#d5e6df] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={emp.profile_image || "No Image"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-sm">{emp.full_name}</p>
                    <p className="text-xs text-gray-400">{emp.role}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  emp.status === "active"
                    ? "bg-[#003527]/10 text-[#003527]"
                    : emp.status === "break"
                    ? "bg-[#ffddb8] text-[#855300]"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {emp.status}
                </span>
              </div>
            ))}
          </div>

          {/* DESKTOP — table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase">
                  <th className="px-6 pb-2">Employee</th>
                  <th className="px-6 pb-2">Role</th>
                  <th className="px-6 pb-2">Status</th>
                  <th className="px-6 pb-2">Employee ID</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-gray-400 text-sm">No staff found</td>
                  </tr>
                ) : (
                  staff.slice(0, 5).map((emp) => (
                    <tr key={emp.id} className="bg-white hover:bg-[#eef4ff] transition-colors rounded-2xl">
                      <td className="px-6 py-4 rounded-l-2xl">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.profile_image}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold text-sm">{emp.full_name}</p>
                            <p className="text-xs text-gray-400">ID: {emp.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{emp.role}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                          emp.status === "active"
                            ? "bg-[#003527]/10 text-[#003527]"
                            : emp.status === "break"
                            ? "bg-[#ffddb8] text-[#855300]"
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            emp.status === "active" ? "bg-[#003527] animate-pulse" :
                            emp.status === "break" ? "bg-[#855300]" : "bg-gray-300"
                          }`} />
                          {emp.status || "offline"}
                        </span>
                      </td>
                      <td className="px-6 py-4 rounded-r-2xl font-mono text-sm text-gray-400">
                        {emp.employee_id}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* BOTTOM GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* TOP PRODUCTS */}
          <div className="bg-white p-4 md:p-6 rounded-4xl border border-[#d5e6df] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#121c28]">Top Products Today</h3>
              <span className="material-symbols-outlined text-gray-400">trending_up</span>
            </div>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No sales today</p>
              ) : (
                topProducts.map((product, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-[#eef4ff] rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-[#003527]">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-[#003527]">{product.qty} Sold</p>
                      <p className="text-xs text-gray-400">₱{product.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* UTANG SUMMARY */}
          <div className="bg-white p-4 md:p-6 rounded-4xl border border-[#d5e6df] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#121c28]">Recent Utang</h3>
              <Link href="/utang">
                <button className="bg-[#fea619] text-[#2a1700] px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  View All
                </button>
              </Link>
            </div>
            <div className="space-y-1">
              {utangRecords.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No utang records</p>
              ) : (
                utangRecords.map((record) => {
                  const initials = record.customer_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()

                  return (
                    <div key={record.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#ffddb8] flex items-center justify-center text-[#855300] font-bold text-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{record.customer_name}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(record.created_at).toLocaleDateString("en-PH", {
                              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${record.status === "paid" ? "line-through text-gray-400" : "text-red-500"}`}>
                          ₱{Number(record.total).toLocaleString()}
                        </p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${
                          record.status === "paid" ? "text-[#003527]" : "text-red-500"
                        }`}>
                          {record.status}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}