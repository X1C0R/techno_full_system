"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCashRegister,
  faBoxesStacked,
  faCircleUser,
} from "@fortawesome/free-solid-svg-icons"
import HistoryEduIcon from "@mui/icons-material/HistoryEdu"
import AddNewUser from "@/components/addNewUser"
import EditUserModal from "@/components/editUserModal"
import { useAuthGuard } from "../hooks/useAuthGuard"

type Account = {
  id: string
  full_name: string
  email: string
  role: string
  status: string
  employee_id: string
  profile_image: string
  phone: string
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

export default function EmployeesPage() {
  const { role, loading } = useAuthGuard(["admin", "manager"])
  const [employees, setEmployees] = useState<Account[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Account | null>(null)
  const [phoneState, setPhoneState] = useState("")
  const [fullNameState, setFullNameState] = useState("")
  const [emailState, setEmailState] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState("") // ✅ logged-in user's role

  // FETCH EMPLOYEES
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error) setEmployees(data || [])
      setLoadingData(false)
    }
    fetchEmployees()
  }, [])

  // GET LOGGED IN USER
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return
    const user = JSON.parse(storedUser)
    setCurrentUserId(user.id)
    setCurrentUserRole(user.role?.trim().toLowerCase()) // ✅ get role from localStorage
  }, [])

  const otherEmployees = employees.filter((emp) => emp.id !== currentUserId)

  const filtered = otherEmployees.filter((emp) =>
    emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleUpdateUser = async (updatedData: { full_name: string; role: string }) => {
    if (!selectedUser) return

    const { error } = await supabase
      .from("accounts")
      .update({ full_name: updatedData.full_name, role: updatedData.role })
      .eq("id", selectedUser.id)

    if (error) { alert(error.message); return }

    const { data } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: false })

    setEmployees(data || [])
    setShowProfileModal(false)
    setSelectedUser(null)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    const confirmDelete = confirm("Are you sure you want to delete this account?")
    if (!confirmDelete) return

    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", selectedUser.id)

    if (error) { alert(error.message); return }

    alert("Account deleted")
    setEmployees((prev) => prev.filter((e) => e.id !== selectedUser.id))
    setShowProfileModal(false)
    setSelectedUser(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <div className="bg-[#f8f9ff] text-on-surface font-body-md min-h-screen flex overflow-hidden">

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

          {/* ✅ use currentUserRole NOT selectedUser?.role */}
          {currentUserRole === "admin" && (
            <Link href="/adminDashboard">
              <NavItem icon={faCashRegister} label="Dashboard" />
            </Link>
          )}

          {currentUserRole === "manager" && (
            <Link href="/managerDashboard">
              <NavItem icon={faCashRegister} label="Dashboard" />
            </Link>
          )}

          <Link href="/inventoryPage">
            <NavItem icon={faBoxesStacked} label="Inventory" />
          </Link>

          {currentUserRole === "admin" && (
            <Link href="/analyticsPage">
              <NavItem icon={<HistoryEduIcon />} label="Analytics" />
            </Link>
          )}

          <Link href="/employee">
            <NavItem icon={<HistoryEduIcon />} label="Employee" active />
          </Link>

          <Link href="/utang">
            <NavItem icon={<HistoryEduIcon />} label="Utang" />
          </Link>

          <Link href="/profile">
            <NavItem icon={faCircleUser} label="Users" />
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
      <main className="flex-1 w-full overflow-y-auto mt-14 md:mt-0">

        {/* HEADER */}
        <div className="p-4 md:p-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#003527]">Employees</h2>
            <p className="text-gray-500 text-sm">Manage your store staff access and payroll details.</p>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="border p-2 rounded-lg w-full md:w-80 text-sm"
          />

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#003527] text-white px-6 py-3 rounded-xl text-sm font-semibold"
          >
            Add New User
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 md:px-6">
          <div className="p-5 bg-white rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700">
              👥
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Total Staff</p>
              <p className="text-2xl font-bold">{otherEmployees.length}</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700">
              ⚡
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Active Now</p>
              <p className="text-2xl font-bold">
                {otherEmployees.filter((e) => e.status === "active").length}
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              ☕
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">On Break</p>
              <p className="text-2xl font-bold">
                {otherEmployees.filter((e) => e.status === "break").length}
              </p>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="p-4 md:p-6 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 text-sm">Employee</th>
                <th className="p-3 text-sm">Role</th>
                <th className="p-3 text-sm">ID</th>
                <th className="p-3 text-sm">Status</th>
                <th className="p-3 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingData ? (
                <tr><td className="p-4 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="p-4 text-gray-400">No employees found</td></tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.profile_image || ""}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-sm">{emp.full_name}</p>
                          <p className="text-xs text-gray-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{emp.role}</td>
                    <td className="p-3 font-mono text-sm">{emp.employee_id}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        emp.status === "active"
                          ? "bg-green-100 text-green-700"
                          : emp.status === "break"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(emp)
                          setFullNameState(emp.full_name || "")
                          setPhoneState(emp.phone || "")
                          setEmailState(emp.email || "")
                          setShowProfileModal(true)
                        }}
                        className="px-4 py-2 bg-[#003527] text-white rounded-lg text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE FAB */}
        <button
          onClick={() => setShowModal(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#FFB900] rounded-full shadow-lg text-2xl font-bold text-[#003527]"
        >
          +
        </button>
      </main>

      {showModal && (
        <AddNewUser onClose={() => setShowModal(false)} />
      )}

      {selectedUser && (
        <EditUserModal
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false)
            setSelectedUser(null)
          }}
          profileImage={selectedUser.profile_image}
          fullname={fullNameState}
          email={emailState}
          role={selectedUser.role}
          phone={phoneState}
          employeeId={selectedUser.employee_id}
          saving={false}
          setFullName={setFullNameState}
          setPhone={setPhoneState}
          setEmail={setEmailState}
          handleImageUpload={() => {}}
          handleSave={handleUpdateUser}
          handleDelete={handleDeleteUser}
        />
      )}
    </div>
  )
}