"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LogoutModal from "@/components/logout_modal";
import {
  faBoxesStacked,
  faCashRegister,
  faCircleUser,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import { useAuthGuard } from "../hooks/useAuthGuard";
import ReceiptIcon from '@mui/icons-material/Receipt';
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

export default function ProfilePage() {
  const { role, loading } = useAuthGuard(["cashier", "manager", "admin"])
  const [saving, setSaving] = useState(false)
  const [Loading, setLoading] = useState(true)
  const [phone, setPhone] = useState("")
  const [fullname, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [Role, setRole] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [todaySales, setTodaySales] = useState(0)
  const [hoursWorked, setHoursWorked] = useState(0)
  const [shifts, setShifts] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [pausing, setPausing] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // LOAD USER
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true)
      const storedUser = localStorage.getItem("user")
      if (!storedUser) { setLoading(false); return }
      const parsedUser = JSON.parse(storedUser)

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("email", parsedUser.email)
        .single()

      if (error || !data) { setLoading(false); return }

      setEmail(data.email)
      setFullName(data.full_name ?? "")
      setPhone(data.phone ?? "")
      setProfileImage(data.profile_image + "?t=" + Date.now())
      setRole(data.role ?? "")
      setEmployeeId(data.employee_id ?? "")
      localStorage.setItem("user", JSON.stringify(data))
      setLoading(false)
    }
    loadUser()
  }, [])

  // FETCH SHIFTS
  useEffect(() => {
    const fetchShiftData = async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) return
      const user = JSON.parse(storedUser)
      const empId = user.employee_id || user.id

      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .eq("employee_id", empId)
        .is("clock_out", null)

      if (error) { console.error("SHIFT ERROR:", error); return }
      setShifts(data || [])
    }
    fetchShiftData()
  }, [])

  // HOURS TIMER
  useEffect(() => {
    const interval = setInterval(() => {
      let totalSeconds = 0
      shifts.forEach((shift: any) => {
        const clockIn = new Date(shift.clock_in).getTime()
        let endTime
        if (shift.clock_out) endTime = new Date(shift.clock_out).getTime()
        else if (shift.is_paused && shift.paused_at) endTime = new Date(shift.paused_at).getTime()
        else endTime = Date.now()
        totalSeconds += (endTime - clockIn) / 1000
      })
      setHoursWorked(totalSeconds / 3600)
    }, 1000)
    return () => clearInterval(interval)
  }, [shifts])

  // FETCH SALES
  useEffect(() => {
    const fetchSales = async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) return
      const user = JSON.parse(storedUser)

      const { data, error } = await supabase
        .from("sales")
        .select("total")
        .eq("employee_id", user.employee_id)
        .eq("payment_method", "cash")

      if (error) { console.error(error); return }
      const total = data?.reduce((sum, s) => sum + (Number(s.total) || 0), 0) || 0
      setTodaySales(total)
    }
    fetchSales()
  }, [])

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const storedUser = localStorage.getItem("user")
    if (!storedUser) { alert("No user session"); return }
    const parsedUser = JSON.parse(storedUser)
    const fileExt = file.name.split(".").pop()
    const fileName = `${parsedUser.employee_id}.${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true })

    if (uploadError) { console.error(uploadError); alert("Upload failed"); return }

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)
    setProfileImage(data.publicUrl + "?+=" + Date.now())
    e.target.value = ""
  }

  const handleSave = async () => {
    if (!phone || phone.trim() === "" || phone === "+63") {
      alert("Phone number is required"); return
    }
    if (phone.length !== 13) {
      alert("Phone must be 10 digits after +63"); return
    }
    setSaving(true)
    const storedUser = localStorage.getItem("user")
    if (!storedUser) { alert("No user session"); setSaving(false); return }
    const parsedUser = JSON.parse(storedUser)

    const { data, error } = await supabase
      .from("accounts")
      .update({
        full_name: fullname,
        phone: phone,
        profile_image: profileImage,
        updated_at: new Date().toISOString(),
      })
      .eq("email", parsedUser.email)
      .select()
      .maybeSingle()

    setSaving(false)
    if (error) { console.error("FULL ERROR:", error); alert(error.message); return }
    if (!data) { alert("No row updated (check your email match)"); return }
    localStorage.setItem("user", JSON.stringify(data))
    alert("Profile updated successfully")
  }

  const handleLogout = async () => {
    try {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) return
      const user = JSON.parse(storedUser)

      const { data: shift } = await supabase
        .from("shifts")
        .select("*")
        .eq("employee_id", user.employee_id)
        .is("clock_out", null)
        .maybeSingle()

      if (shift) {
        await supabase
          .from("shifts")
          .update({ clock_out: new Date().toISOString(), is_paused: false, paused_at: null })
          .eq("id", shift.id)
      }

      await supabase
        .from("accounts")
        .update({ status: "offline" })
        .eq("employee_id", user.employee_id)

      localStorage.removeItem("user")
      router.push("/login")
    } catch (err) {
      console.error("LOGOUT ERROR:", err)
    }
  }

  const handlePause = async () => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return
    const user = JSON.parse(storedUser)

    const { data: shift, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("employee_id", user.employee_id)
      .is("clock_out", null)
      .maybeSingle()

    if (error || !shift) return
    const now = new Date().toISOString()

    await supabase
      .from("shifts")
      .update({ is_paused: true, paused_at: now })
      .eq("id", shift.id)

    await supabase
      .from("accounts")
      .update({ status: "break" })
      .eq("employee_id", user.employee_id)

    localStorage.removeItem("user")
    router.push("/login")
  }

  const formatHours = (decimalHours: number) => {
    const totalSeconds = Math.floor(decimalHours * 3600)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    return `${hours}:${minutes.toString().padStart(2, "0")}`
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <>
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
            {Role === "admin" && (
              <Link href="/adminDashboard">
                <NavItem icon={faCashRegister} label="Dashboard" />
              </Link>
            )}
            {Role === "manager" && (
              <Link href="/managerDashboard">
                <NavItem icon={faCashRegister} label="Dashboard" />
              </Link>
            )}
            {(Role === "cashier" || Role === "manager") && (
              <Link href="/ScannerPage">
                <NavItem icon={faCashRegister} label="Cashier" />
              </Link>
            )}
            <Link href="/inventoryPage">
              <NavItem icon={faBoxesStacked} label="Inventory" />
            </Link>
            {Role === "admin" && (
              <>
                <Link href="/analyticsPage">
                  <NavItem icon={<HistoryEduIcon />} label="Analytics" />
                </Link>   
              </>
            )}
            {(Role === "manager" || Role === "admin" ) && (
              <Link href="/employee">
                <NavItem icon={<HistoryEduIcon />} label="Employee" />
              </Link>
            )}
            {Role === "manager" && (
              <Link href="/logsPage">
                <NavItem icon={<HistoryEduIcon />} label="Logs"  />
              </Link>
            )}

          <Link href="/recieptPage">
            <NavItem icon={<ReceiptIcon />} label="Reciept" />
          </Link>

            <Link href="/utang">
              <NavItem icon={<HistoryEduIcon />} label="Utang" />
            </Link>
            <Link href="/profile">
              <NavItem icon={faCircleUser} label="Users" active />
            </Link>
          </nav>
        </aside>

        {/* OVERLAY */}
        {open && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto mt-14 md:mt-0 p-4 md:p-8">

          {/* TOP BAR */}
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold text-[#003527]">
              Cashier Portal
            </h2>
          </div>

          {/* PROFILE CARD */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow mb-6">

            {/* MOBILE: stacked layout */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">

              {/* IMAGE */}
              <div className="flex flex-col items-center">
                <img
                  src={profileImage || "No image"}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover bg-gray-300"
                />
                <label className="mt-2 text-sm cursor-pointer px-3 py-1 rounded inline-block text-center">
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* USER INFO */}
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold">
                  {fullname || "No Name Yet"}
                </h3>
                <p className="text-green-700 font-semibold">{Role}</p>
                <p className="text-sm text-gray-500">{email}</p>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-4 py-2 border rounded-lg text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 sm:flex-none px-4 py-2 bg-[#003527] text-white rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* LEFT — Personal Info */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow space-y-4">
              <h4 className="font-bold text-lg">Personal Information</h4>

              <div>
                <label className="text-sm text-gray-500">Full Name</label>
                <input
                  className="w-full border p-2 rounded mt-1"
                  value={fullname}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Email</label>
                <input
                  className="w-full border p-2 rounded mt-1 bg-gray-50"
                  value={email}
                  readOnly
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded mt-1"
                  value={phone}
                  onChange={(e) => {
                    let value = e.target.value
                    if (value.startsWith("+63")) value = value.slice(3)
                    value = value.replace(/\D/g, "").slice(0, 10)
                    setPhone("+63" + value)
                  }}
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Employee ID</label>
                <input
                  className="w-full border p-2 rounded mt-1 bg-gray-100"
                  value={employeeId}
                  disabled
                />
              </div>
            </div>

            {/* RIGHT — Shift + Logout */}
            <div className="space-y-4 md:space-y-6">
              <div className="bg-[#003527] text-white p-4 md:p-6 rounded-xl">
                <h4 className="text-lg font-bold mb-4">Shift Summary</h4>
                <p>Hours: {formatHours(hoursWorked)}</p>
                <p>Sales: ₱{todaySales.toLocaleString()}</p>
              </div>

              <div className="bg-yellow-100 p-4 md:p-6 rounded-xl">
                <h5 className="font-bold">Tip</h5>
                <p className="text-sm">
                  Check inventory before shift to speed up sales.
                </p>
              </div>

              <div className="flex justify-end">
                <div
                  className="border-2 rounded-md p-1.5 bg-gray-700 font-medium text-lg text-white cursor-pointer flex items-center gap-1"
                  onClick={() => {
                    if (Role === "admin") {
                      handleLogout()
                    } else {
                      setShowModal(true)
                    }
                  }}
                >
                  <LogoutIcon />
                  Logout
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <LogoutModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onBreak={async () => {
          try {
            setPausing(true)
            await handlePause()
            setShowModal(false)
          } catch (err) {
            alert("Failed to pause shift")
          } finally {
            setPausing(false)
          }
        }}
        onLogout={async () => {
          setShowModal(false)
          await handleLogout()
        }}
      />
    </>
  )
}