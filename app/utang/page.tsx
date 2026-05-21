"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCashRegister, faBoxesStacked, faCircleUser } from "@fortawesome/free-solid-svg-icons"
import HistoryEduIcon from '@mui/icons-material/HistoryEdu'
import PaymentsIcon from '@mui/icons-material/Payments'
import Link from "next/link"
import { User } from "lucide-react"

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

export default function UtangPage() {

  const [account, setAccount] = useState<Account | null>(null)
  const [hoverInventory, setHoverInventory] = useState(false)

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

    const searchInput = document.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement | null

    if (searchInput) {
      const focus = () => {
        searchInput.parentElement?.classList.add("scale-[1.02]")
      }

      const blur = () => {
        searchInput.parentElement?.classList.remove("scale-[1.02]")
      }

      searchInput.addEventListener("focus", focus)
      searchInput.addEventListener("blur", blur)

      return () => {
        searchInput.removeEventListener("focus", focus)
        searchInput.removeEventListener("blur", blur)
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] text-[#121c28]">

      {/* SIDEBAR (UNCHANGED) */}
      <div className="flex-col bg-[#003527] lg:w-3xs md:w-52 sm:w-1">
        <div className="flex-col pl-4">
          <h1 className="text-6xl font-bold text-[#FFB900]">Tory</h1>
          <p className="text-white pl-2">POS SYSTEM</p>
        </div>

        <div className="flex-col mt-6 ml-5 cursor-pointer">
          <Link href={account?.role === "admin" ? "/adminDashboard" : "/ScannerPage"}>
          <div className="flex-col mt-6 cursor-pointer">
            <div
              className="p-0.5 pl-2.5 pt-2.5 pb-2.5 flex flex-row gap-1 items-center rounded-md w-52 font-medium text-white hover:bg-[#FFB900] hover:text-[#F54900] transition-all duration-300  "
               onMouseEnter={() => setHoverInventory(true)}
              onMouseLeave={() => setHoverInventory(false)}
              >
              <FontAwesomeIcon icon={faCashRegister} />
              <h1>{account?.role === "admin" ? "Dashboard" : "Cashier"}</h1>
            </div>
          </div>
        </Link>

          <Link href="/inventory">
            <div
              onMouseEnter={() => setHoverInventory(true)}
              onMouseLeave={() => setHoverInventory(false)}
              className="mt-2.5 p-0.5 pl-2.5 pt-2.5 pb-2.5 flex-row flex gap-1 items-center rounded-md w-52 font-medium text-white hover:bg-[#FFB900] hover:text-[#F54900]"
            >
              <FontAwesomeIcon icon={faBoxesStacked} />
              <h1>Inventory</h1>
            </div>
          </Link>

          <Link href="/utang">
            <div
              className={`mt-2.5 p-2 flex items-center gap-2 rounded-md w-52 font-medium transition-all duration-300 ${
                hoverInventory
                  ? "bg-transparent text-white"
                  : "bg-[#FFB900] text-[#F54900]"
              }`}>
              <HistoryEduIcon />
              <h1>Utang</h1>
            </div>
          </Link>

          <Link href="/profile">
            <div
              onMouseEnter={() => setHoverInventory(true)}
              onMouseLeave={() => setHoverInventory(false)}
              className="mt-2.5 p-0.5 pl-2.5 pt-2.5 pb-2.5 flex-row flex gap-1 items-center rounded-md w-52 font-medium text-white hover:bg-[#FFB900] hover:text-[#F54900]">
              <FontAwesomeIcon icon={faCircleUser} />
              <h1>Profile</h1>
            </div>
          </Link>
        </div>

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
      </div>

      {/* MAIN (UNCHANGED UI) */}
      <main className=" flex-1">

        {/* TOP BAR */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b sticky top-0">
          <div className="w-full max-w-md">
            <input
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
                  {utangRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-gray-400">
                        No utang records found
                      </td>
                    </tr>
                  ) : (
                    utangRecords.map((record) => (
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
                          <button className="bg-[#003527] text-white px-3 py-1 rounded">
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
    </div>
  )
}