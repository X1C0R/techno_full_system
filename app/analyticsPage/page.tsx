"use client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts"
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
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
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import { useAuthGuard } from "../hooks/useAuthGuard";

type Account = {
  fullname: string
  role: string
  profileImage: string
}

type TopProduct = {
  name: string
  category: string
  qty: number
  revenue: number
}

/* ✅ FIXED NAV ITEM (OUTSIDE COMPONENT) */
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
export default function Analylitics() {
  const { role, loading } = useAuthGuard(["admin"])
  const [barData, setBarData] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [viewMode, setViewMode] = useState("day");
  const [hoverInventory, setHoverInventory] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)
  const [salesCount, setSalesCount] = useState(0)
  const [allSale, setAllSale] = useState(0);
  const [topProduct, setTopProduct] = useState<TopProduct[]>([])

    const [open, setOpen] = useState(false)

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
      .select("sale_date, sale_month, total, payment_method");

    if (error || !data) {
      console.log("Supabase error:", error);
      return;
    }

    const grouped: Record<string, number> = {};
    let total = 0;

    data
      .filter(
        (sale) =>
          (sale.payment_method || "").toLowerCase().trim() === "cash"
      )
      .forEach((sale) => {
        let key = "";

        if (viewMode === "day") {
          key = sale.sale_date; 
        }

        if (viewMode === "month") {
          key = sale.sale_month;
        }

        if (viewMode === "year") {
          key = sale.sale_month?.split("-")[0]; 
        }

        if (!key) return;

        const value = Number(sale.total || 0);

        grouped[key] = (grouped[key] || 0) + value;
        total += value; 
      });

    const formatted = Object.entries(grouped)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => a.name.localeCompare(b.name));

    setBarData(formatted);
    setTotalSales(total); // correct total
  };

    fetchSales();
  }, [viewMode]);


  // ---------------- SALE COUNTS ----------------
 useEffect(() => {
  const fetchSalesCount = async () => {
    const { data, error } = await supabase
      .from("sale_items")
      .select("created_at, qty, price")

    if (error || !data) {
      console.log("Supabase error:", error)
      return
    }

    console.log("items", data)

    const today = new Date().toISOString().split("T")[0]

    const todayItems = data.filter((sale) => {
      if (!sale.created_at) return false

      const saleDate = new Date(sale.created_at)
        .toISOString()
        .split("T")[0]

      return saleDate === today
    })

    // total quantity sold
    const totalQty = todayItems.reduce(
      (sum, sale) => sum + Number(sale.qty || 0),
      0
    )

    // 💰 total revenue (qty × price)
    const totalPrice = todayItems.reduce(
      (sum, sale) =>
        sum + Number(sale.qty || 0) * Number(sale.price || 0),
      0
    )

    setSalesCount(totalQty)
    setAllSale(totalPrice) // <-- make sure you have this state
  }

    fetchSalesCount()
  }, [])
  // ---------------- MOST SELLING PRODUCT ----------------
  useEffect(() => {
  const fetchTopProducts = async () => {
    const { data, error } = await supabase
      .from("sale_items")
      .select("product_name, category, qty, price")

    if (error || !data) {
      console.log("Supabase error:", error)
      return
    }

    const grouped: Record<string, any> = {}

    data.forEach((item) => {
      const name = item.product_name || "Unknown"
      const category = item.category || "Uncategorized"
      const qty = Number(item.qty || 0)
      const price = Number(item.price || 0)

      if (!grouped[name]) {
        grouped[name] = {
          name,
          category,
          qty: 0,
          revenue: 0,
        }
      }

      grouped[name].qty += qty
      grouped[name].revenue += qty * price
    })

    const sorted = Object.values(grouped)
      .sort((a: any, b: any) => b.qty - a.qty)

    setTopProduct(sorted.slice(0, 5)) // top 5 products
  }

    fetchTopProducts()
  }, [])

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] text-[#121c28]">

      {/* SIDEBAR */}
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
          <Link href="/adminDashboard">
            <NavItem icon={faCashRegister} label="Dashboard" />
          </Link>
          <Link href="/inventoryPage">
            <NavItem icon={faBoxesStacked} label="Inventory" />
          </Link>
          <Link href="/analyticsPage">
            <NavItem icon={<HistoryEduIcon />} label="Analytics" active  />
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
      <main className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Analytics Reports</h2>
        </div>

        {/* SALES OVERVIEW */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* CHART */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between mb-6">
              <div>
                <h3 className="font-bold">Sales Overview</h3>
                <p className="text-sm text-gray-500">Real-time revenue</p>
              </div>

              {/* TOGGLE */}
              <div className="flex bg-gray-100 rounded-lg">
                {["Day", "Month", "Year"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setViewMode(tab.toLowerCase())}
                    className={`px-4 py-1 rounded ${
                      viewMode === tab.toLowerCase()
                        ? "bg-white shadow text-green-900"
                        : "text-gray-500"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* REAL DATA BARS */}
            <div className="h-48 w-full">
              {barData.length === 0 ? (
                <p className="text-sm text-gray-400">No data</p>
              ) : (
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip />

                    <Bar
                      dataKey="sales"
                      fill="#003527"
                      radius={[6, 6, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* SUMMARY CARD */}
          <div className="bg-green-900 text-white p-6 rounded-xl">
            <p>Total Sales</p>
            <h2 className="text-2xl font-bold">
              ₱{totalSales.toLocaleString()}
            </h2>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between bg-white/20 p-2 rounded">
                <span>All Product Sell Today</span>
                <span>{salesCount}</span>
              </div>
              <div className="flex justify-between bg-white/20 p-2 rounded">
                <span>Total SALE Today</span>
                <span>₱ {allSale}</span>
                
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white p-6 rounded-xl shadow mt-6">
          <h3 className="font-bold mb-4">Top Products</h3>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th>Product</th>
                <th>Category</th>
                <th>Qty</th>
                <th className="text-right">Revenue</th>
              </tr>
            </thead>

            <tbody>
              {topProduct.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-400 py-4">
                    No data
                  </td>
                </tr>
              ) : (
                topProduct.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.qty}</td>
                    <td className="text-right">
                      ₱{item.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}