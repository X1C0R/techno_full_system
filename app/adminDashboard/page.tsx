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
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import {
  faCashRegister,
  faBoxesStacked,
  faCircleUser,
  faBoxArchive,
  faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons"

import HistoryEduIcon from "@mui/icons-material/HistoryEdu"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

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

export default function AdminDashboard() {
  const [hoverInventory, setHoverInventory] = useState(false)

  const [hoverItem, setHoverItem] = useState<string | null>(null)
  const [account, setAccount] = useState<Account | null>(null)

  const [products, setProducts] = useState<any[]>([])
  const [pieData, setPieData] = useState<StockItem[]>([])
  const [barData, setBarData] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"day" | "month">("day")

  const [totalProducts, setTotalProducts] = useState(0)
  const [lowStock, setLowStock] = useState(0)
  const [outOfStock, setOutOfStock] = useState(0)

  // ---------------- STOCK ----------------
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*")
      if (error || !data) return

      setProducts(data)

      let inStock = 0
      let lowStock = 0
      let outOfStock = 0

      data.forEach((p) => {
        const qty = Number(p.quantity ?? 0)

        if (qty <= 0) outOfStock++
        else if (qty <= 5) lowStock++
        else inStock++
      })

      setPieData([
        { name: "In Stock", value: inStock },
        { name: "Low Stock", value: lowStock },
        { name: "Out of Stock", value: outOfStock },
      ])
    }

    fetchProducts()
  }, [])

  // ---------------- USER ----------------
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) return

      const parsed = JSON.parse(storedUser)

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

  // ---------------- SALES ----------------
  useEffect(() => {
  const fetchSales = async () => {
    const { data, error } = await supabase
      .from("sales")
      .select("sale_date, sale_month, total, payment_method")

    if (error || !data) {
      console.log("Supabase error:", error)
      return
    }

    // console.log("RAW SALES:", data)

    const grouped: Record<string, number> = {}

    data
      .filter(
        (sale) =>
          (sale.payment_method || "").toLowerCase().trim() === "cash"
      )
      .forEach((sale) => {
        const key =
          viewMode === "day" ? sale.sale_date : sale.sale_month

        if (!key) return

        grouped[key] =
          (grouped[key] || 0) + Number(sale.total || 0)
      })

    const formatted = Object.entries(grouped).map(([name, sales]) => ({
      name,
      sales,
    }))

    // console.log("FINAL BAR DATA:", formatted)

    setBarData(formatted)
  }

    fetchSales()
  }, [viewMode])

  const getStockStatus = (qty: number) => {
    if (qty <= 0) return "out"
    if (qty <= 5) return "low"
    return "normal"
  }

  useEffect(() => {
  const fetchStats = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("quantity")

    if (error || !data) {
      console.log(error)
      return
    }

    let total = data.length
    let low = 0
    let out = 0

    data.forEach((p) => {
      const qty = Number(p.quantity || 0)

      if (qty <= 0) out++
      else if (qty <= 5) low++
    })

    setTotalProducts(total)
    setLowStock(low)
    setOutOfStock(out)
  }

  fetchStats()
}, [])

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#003527] text-white ">
        <div className="flex-col pl-4">
        <h1 className="text-6xl font-bold text-[#FFB900]">Tory</h1>
        <p className="text-white pl-2">POS SYSTEM</p>
        </div>
        

        <nav className="flex flex-col gap-2.5 mt-6 pl-4 pr-4">
            <div className={`p-0.5 pl-2.5 pt-2.5 pb-2.5 flex-row flex gap-1 items-center rounded-md w-52 font-medium transition-all duration-300  ${hoverInventory ? "bg-transparent text-white" : "bg-[#FFB900] text-[#F54900]"}`}>
              <FontAwesomeIcon icon={faCashRegister} />
              Dashboard
            </div>
          <div 
          onMouseEnter={() => setHoverInventory(true)}
          onMouseLeave={() => setHoverInventory(false)}
          className="flex items-center gap-2 p-2  rounded cursor-pointer hover:bg-[#FFB900] hover:text-[#F54900] transition-all duration-300 ">
            <FontAwesomeIcon icon={faBoxesStacked} />
            Inventory
          </div>

          <Link href="/analyticsPage">
            <div 
            onMouseEnter={() => setHoverInventory(true)}
            onMouseLeave={() => setHoverInventory(false)}
            className="flex items-center gap-2 p-1 pt-2 pb-2 rounded cursor-pointer hover:bg-[#FFB900] hover:text-[#F54900] transition-all duration-300 ">
              <HistoryEduIcon />
              Analylitics
            </div>
          </Link>

          <Link href="/profile">
            <div 
            onMouseEnter={() => setHoverInventory(true)}
            onMouseLeave={() => setHoverInventory(false)}
            className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-[#FFB900] hover:text-[#F54900] transition-all duration-300 ">
              <FontAwesomeIcon icon={faCircleUser} />
              Users
            </div>
          </Link>

         
        </nav>
         <div className="mt-96 text-white p-1.5">
            <div className="flex flex-row gap-2.5 items-center border rounded-2xl p-1.5">
              <img
                src={account?.profileImage || "/default-avatar.png"}
                className="w-10 h-10 rounded-full object-cover bg-gray-300"
              />
              <div>
              <p className="font-semibold text-sm text-nowrap">
                {account?.fullname || "Loading..."}
              </p>
              <p className="text-sm text-[#FFB900]">
                {account?.role || ""}
              </p>
              </div>
            </div>
          </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 pl-2 pr-2 overflow-hidden">

        {/* <h1 className="text-3xl font-bold text-[#003527]">
          Admin Dashboard
        </h1> */}

        <div className="grid md:grid-cols-2 gap-4 mb-1 p-1">

          {/* PIE */}
          <div className="bg-white rounded-xl p-4 shadow mb-1">
            <h2 className="font-bold text-[#003527]">Stock Status</h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            
          </div>
          <div className="flex flex-col gap-2 mt-2.5">
            <div className="border rounded-sm bg-[#003527] flex flex-row h-fit p-5 shadow">
              <FontAwesomeIcon icon={faBoxArchive} className="text-gray-200 text-6xl"/>
              <div className="flex flex-col">
                <h1 className="text-gray-200 text-md">Total Producs</h1>
                <h1 className="text-4xl font-bold text-gray-200">{totalProducts}</h1>
              </div>
            </div>
            <div className="border rounded-sm flex flex-row  h-fit p-5 shadow">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="text-6xl text-[#FFB900]"/>
                  <div className="flex flex-col">
                    <h1 className="text-md">Low Stock Alerts</h1>
                    <h1 className="text-4xl">{lowStock}</h1>
                  </div>
            </div>
            <div className="border rounded-sm flex flex-row h-fit p-5 shadow">
              <span className="text-6xl text-[#FEA619]">
                ❌
              </span>
                  <div className="flex flex-col">
                    <h1 className="text-md">Out of Stock</h1>
                    <h1 className="text-4xl">1{outOfStock}</h1>
                  </div>
            </div>
          </div>

          
        </div>
        {/* BAR */}
          <div className="bg-white h-fit rounded-xl p-6 shadow">

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

           <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#003527" radius={[6,6,0,0]} />
              </BarChart>
          </ResponsiveContainer>
          </div>
          </div>
      </main>
    </div>
  )
}