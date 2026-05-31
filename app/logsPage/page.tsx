"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCashRegister,
  faBoxesStacked,
  faCircleUser,
} from "@fortawesome/free-solid-svg-icons"
import HistoryEduIcon from "@mui/icons-material/HistoryEdu"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import { useAuthGuard } from "../hooks/useAuthGuard"
import { faAddressBook  } from "@fortawesome/free-solid-svg-icons"
import StickyNote2Icon from '@mui/icons-material/StickyNote2'
import ReceiptIcon from '@mui/icons-material/Receipt';

type ActiveUser = {
  id: string
  full_name: string
  email: string
  role: string
  status: string
  employee_id: string
  profile_image: string
  clock_in?: string
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

export default function ActiveLogsPage() {
  const { role, loading } = useAuthGuard(["admin", "manager"])
  const [open, setOpen] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [search, setSearch] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [syncing, setSyncing] = useState(true)

  // FETCH LOGGED-IN USER
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

  // FETCH ACTIVE USERS
  const fetchActiveLogs = async () => {
    setSyncing(true)

    const { data: accounts, error } = await supabase
      .from("accounts")
      .select("id, full_name, email, role, status, employee_id, profile_image")
      .eq("status", "active")
      .order("full_name", { ascending: true })

    if (error || !accounts) {
      setSyncing(false)
      return
    }

    // ✅ fetch latest shift clock_in for each active user
    const usersWithShifts = await Promise.all(
      accounts.map(async (user) => {
        const { data: shift } = await supabase
          .from("shifts")
          .select("clock_in")
          .eq("employee_id", user.employee_id)
          .is("clock_out", null)
          .order("clock_in", { ascending: false })
          .limit(1)
          .single()

        return {
          ...user,
          clock_in: shift?.clock_in || null,
        }
      })
    )

    setActiveUsers(usersWithShifts)
    setSyncing(false)
  }

  useEffect(() => {
    fetchActiveLogs()
  }, [])

  // ✅ REFRESH HANDLER
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchActiveLogs()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const filtered = activeUsers.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  )

  const formatTime = (isoString: string | undefined) => {
    if (!isoString) return "—"
    return new Date(isoString).toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#f8f9ff]">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#f8f9ff] text-[#121c28] overflow-hidden">

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
          transform transition-transform duration-300 z-40
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="pl-4 pt-16 md:pt-6">
          <h1 className="text-5xl font-bold text-[#FFB900]">Tory</h1>
          <p className="text-sm">POS SYSTEM</p>
        </div>

        <nav className="flex flex-col gap-2 mt-6 px-4">

          {account?.role === "admin" && (
            <Link href="/adminDashboard">
              <NavItem icon={faCashRegister} label="Dashboard" />
            </Link>
          )}

            <Link href="/managerDashboard">
              <NavItem icon={faCashRegister} label="Dashboard"  />
            </Link>

             {(account?.role === "cashier" || account?.role === "manager") && (
                <Link href="/ScannerPage">
                  <NavItem icon={faCashRegister} label="Cashier" />
                </Link>
              )}


          <Link href="/inventoryPage">
            <NavItem icon={faBoxesStacked} label="Inventory" />
          </Link>

          {account?.role === "admin" && (
             <Link href="/analyticsPage">
              <NavItem icon={<HistoryEduIcon />} label="Analytics" />
            </Link>
          )}

          <Link href="/employee">
            <NavItem icon={faAddressBook} label="Employee"  />
          </Link>

            <Link href="/logsPage">
              <NavItem icon={<StickyNote2Icon/>} label="Logs" active/>
            </Link>

          <Link href="/recieptPage">
            <NavItem icon={<ReceiptIcon/>} label="Reciept"  />
          </Link>           

          <Link href="/utang">
            <NavItem icon={<HistoryEduIcon />} label="Utang" />
          </Link>

          <Link href="/profile">
            <NavItem icon={faCircleUser} label="Users" />
          </Link>
        </nav>

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
      <main className="flex-1 overflow-y-auto mt-14 md:mt-0 flex flex-col">

        {/* TOP BAR */}
        <header className="sticky top-0 z-40 bg-[#f8f9ff]/80 backdrop-blur-md flex justify-between items-center px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="relative max-w-md w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#eef4ff] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#003527]/20 outline-none"
              placeholder="Search user logs..."
            />
          </div>
          {/* <div className="flex items-center gap-3 ml-4">
            <button className="relative p-2 text-gray-500 hover:bg-[#eef4ff] rounded-full transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <button className="p-2 text-gray-500 hover:bg-[#eef4ff] rounded-full transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div> */}
        </header>

        {/* CONTENT */}
        <section className="p-4 md:p-6 space-y-6">

          {/* PAGE HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#003527]">Active User Logs</h2>
              <p className="text-gray-500 text-sm mt-1">
                Real-time monitoring of currently logged-in employees.
              </p>
            </div>

            {/* SUMMARY CARD */}
            <div className="bg-[#003527] p-5 md:p-6 rounded-2xl flex items-center gap-5 text-white w-full md:w-auto md:min-w-[260px] shadow-lg">
              <div className="p-3 bg-[#fea619] text-[#2a1700] rounded-xl">
                <span className="material-symbols-outlined text-3xl">person_search</span>
              </div>
              <div>
                <p className="text-[#80bea6] text-xs font-bold uppercase tracking-wider">
                  Total Active Users
                </p>
                <h3 className="text-4xl font-bold text-[#ffb95f]">{activeUsers.length}</h3>
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex gap-2 flex-wrap">
              <span className="px-4 py-1.5 bg-[#064e3b] text-[#b0f0d6] rounded-full text-xs font-bold uppercase tracking-widest">
                Live Updates
              </span>
              <span className="px-4 py-1.5 bg-[#eef4ff] text-gray-500 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className={`w-2 h-2 bg-[#fea619] rounded-full ${syncing ? "animate-pulse" : ""}`} />
                {syncing ? "Syncing..." : "Up to date"}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#003527] text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span className={`material-symbols-outlined ${refreshing ? "animate-spin" : ""}`}>
                refresh
              </span>
              Refresh Logs
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eef4ff]/50">
                    {["Employee", "Role", "Login Time", "Employee ID", "Status"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-6 md:px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider ${
                          i === 4 ? "text-right" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-gray-400 text-sm">
                        {syncing ? "Loading active users..." : "No active users found"}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user, index) => (
                      <tr
                        key={user.id}
                        className="hover:bg-[#f8f9ff] transition-colors group"
                        style={{
                          animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
                        }}
                      >
                        {/* EMPLOYEE */}
                        <td className="px-6 md:px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="relative flex-shrink-0">
                              <img
                                src={user.profile_image || "/default-avatar.png"}
                                className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow"
                              />
                              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#fea619] border-2 border-white rounded-full" />
                            </div>
                            <div>
                              <p className="font-bold text-[#003527] text-sm">{user.full_name}</p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* ROLE */}
                        <td className="px-6 md:px-8 py-5">
                          <span className="px-3 py-1 bg-[#eef4ff] text-[#003527] font-bold rounded-lg text-xs uppercase">
                            {user.role}
                          </span>
                        </td>

                        {/* LOGIN TIME */}
                        <td className="px-6 md:px-8 py-5 text-sm font-medium text-gray-500">
                          {formatTime(user.clock_in)}
                        </td>

                        {/* EMPLOYEE ID */}
                        <td className="px-6 md:px-8 py-5 font-mono text-sm text-gray-400">
                          {user.employee_id}
                        </td>

                        {/* STATUS */}
                        <td className="px-6 md:px-8 py-5 text-right">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#b0f0d6]/20 text-[#003527] rounded-full font-bold text-xs uppercase tracking-tighter">
                            <span className="w-1.5 h-1.5 bg-[#003527] rounded-full animate-pulse" />
                            Active
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* TABLE FOOTER */}
            <div className="px-6 md:px-8 py-4 bg-[#eef4ff]/30 flex justify-between items-center border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing {filtered.length} of {activeUsers.length} active users
              </p>
              <div className="flex gap-2">
                <button
                  disabled
                  className="p-2 hover:bg-[#eef4ff] rounded-lg transition-colors disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="p-2 hover:bg-[#eef4ff] rounded-lg transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* LOGIN PATTERNS */}
            <div className="md:col-span-2 bg-[#d5e6df] p-6 md:p-8 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="text-lg font-bold text-[#101e1a] mb-2">Login Patterns</h4>
                <p className="text-[#3b4a44] text-sm max-w-sm">
                  All terminals are currently operating within scheduled hours.
                  No suspicious activity detected in the last 24 hours.
                </p>
              </div>
              <div className="p-5 md:p-6 bg-white/20 backdrop-blur rounded-2xl border border-white/30 flex-shrink-0">
                <span className="material-symbols-outlined text-4xl text-[#101e1a]">verified_user</span>
              </div>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#003527]/5 rounded-full blur-3xl" />
            </div>

            {/* QUICK ACTION */}
            <div className="bg-[#ffddb8] p-6 md:p-8 rounded-[2rem] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#2a1700] uppercase tracking-widest mb-4">
                  Quick Action
                </h4>
                <p className="text-[#653e00] text-sm">
                  Need to broadcast a message to all active terminals?
                </p>
              </div>
              <button className="mt-6 py-3 px-6 bg-[#2a1700] text-[#ffb95f] rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[0.98] transition-transform">
                <span className="material-symbols-outlined">campaign</span>
                Send Notice
              </button>
            </div>

          </div>
        </section>
      </main>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}