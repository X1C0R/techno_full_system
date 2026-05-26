"use client"

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCashRegister,
  faBoxesStacked,
  faCircleUser,
  faBoxArchive,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons"

import HistoryEduIcon from "@mui/icons-material/HistoryEdu"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import { useAuthGuard } from "../hooks/useAuthGuard"

const COLORS = ["#003527", "#FFB900", "#FEA619"]

type Account = {
  fullname: string
  role: string
  profileImage: string
}

type StockItem = {
  name: string
  value: number
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
export default function AdminDashboard() {
  const { role, loading } = useAuthGuard(["admin"])
  const [open, setOpen] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)

  const [pieData, setPieData] = useState<StockItem[]>([])
  const [barData, setBarData] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"day" | "month">("day")

  const [totalProducts, setTotalProducts] = useState(0)
  const [lowStock, setLowStock] = useState(0)
  const [outOfStock, setOutOfStock] = useState(0)

  /* ---------------- PRODUCTS ---------------- */
  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from("products").select("*")
      if (!data) return

      let inStock = 0
      let low = 0
      let out = 0

      data.forEach((p) => {
        const qty = Number(p.quantity ?? 0)
        if (qty <= 0) out++
        else if (qty <= 10) low++
        else inStock++
      })

      setPieData([
        { name: "In Stock", value: inStock },
        { name: "Low Stock", value: low },
        { name: "Out of Stock", value: out },
      ])

      setTotalProducts(data.length)
      setLowStock(low)
      setOutOfStock(out)
    }

    fetchProducts()
  }, [])

  /* ---------------- USER ---------------- */
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

  /* ---------------- SALES ---------------- */
  useEffect(() => {
    const fetchSales = async () => {
      const { data } = await supabase
        .from("sales")
        .select("sale_date, sale_month, total, payment_method")

      if (!data) return

      const grouped: Record<string, number> = {}

      data
        .filter((s) => (s.payment_method || "").toLowerCase() === "cash")
        .forEach((sale) => {
          const key = viewMode === "day" ? sale.sale_date : sale.sale_month
          if (!key) return

          grouped[key] = (grouped[key] || 0) + Number(sale.total || 0)
        })

      setBarData(
        Object.entries(grouped).map(([name, sales]) => ({
          name,
          sales,
        }))
      )
    }

    fetchSales()
  }, [viewMode])

  return (
    <div className="flex h-screen bg-background text-on-background font-body-md">

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
            <NavItem icon={faCashRegister} label="Dashboard" active />
          <Link href="/inventoryPage">
            <NavItem icon={faBoxesStacked} label="Inventory" />
          </Link>
          <Link href="/analyticsPage">
            <NavItem icon={<HistoryEduIcon />} label="Analytics" />
          </Link>
          <Link href="/employee">
            <NavItem icon={<HistoryEduIcon />} label="Employee" />
          </Link>
          <Link href="/utang">
            <NavItem icon={<HistoryEduIcon />} label="Utang" />
          </Link>
          <Link href="/profile">
            <NavItem icon={faCircleUser} label="Users" />
          </Link>
        </nav>

        {/* PROFILE FIX */}
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

      {/* MAIN */}
      <main className="flex-1 p-4 overflow-y-auto mt-14 md:mt-0">
        <div className="grid md:grid-cols-2 gap-4 overflow-hidden">
          {/* PIE */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-bold text-[#003527]">Stock Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={110}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* STATS */}
          <div className="flex flex-col gap-2">
            <div className="bg-[#003527] text-white p-5 rounded shadow flex gap-3">
              <FontAwesomeIcon icon={faBoxArchive} />
              <div>
                <h1>Total Products</h1>
                <p className="text-3xl">{totalProducts}</p>
              </div>
            </div>

            <div className="p-5 border rounded shadow flex gap-3">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-[#FFB900]" />
              <div>
                <h1>Low Stock</h1>
                <p className="text-3xl">{lowStock}</p>
              </div>
            </div>

            <div className="p-5 border rounded shadow flex gap-3">
              <span className="text-[#FEA619] text-3xl">❌</span>
              <div>
                <h1>Out of Stock</h1>
                <p className="text-3xl">{outOfStock}</p>
              </div>
            </div>
          </div>
        </div>

        {/* BAR */}
        <div className="bg-white mt-4 p-4 rounded-xl shadow overflow-hidden">
          <div className="flex justify-between mb-3">
            <h2 className="font-bold text-[#003527]">Sales</h2>

            <div className="flex gap-2">
              <button onClick={() => setViewMode("day")} className="px-3 py-1 bg-gray-200 rounded">
                Daily
              </button>
              <button onClick={() => setViewMode("month")} className="px-3 py-1 bg-gray-200 rounded">
                Monthly
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#003527" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  )
}