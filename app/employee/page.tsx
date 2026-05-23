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
export default function EmployeesPage() {
  const { role, loading } = useAuthGuard(["admin"])
  const [employees, setEmployees] = useState<Account[]>([])
  const [Loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Account | null>(null)
  const [phoneState, setPhoneState] = useState("")
  const [fullNameState, setFullNameState] = useState("")
  const [roleState, setRoleState] = useState("")
  const [emailState, setEmailState] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error) setEmployees(data || [])
      setLoading(false)
    }

    fetchEmployees()
  }, [])
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return

    const user = JSON.parse(storedUser)

    setCurrentUserId(user.id) // or employee_id
  }, [])

  const filtered = employees
  .filter((emp) => emp.id !== currentUserId) // ✅ REMOVE YOURSELF
  .filter((emp) =>
    emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.email?.toLowerCase().includes(search.toLowerCase())
  )

  // const filtered = employees.filter((emp) =>
  //   emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
  //   emp.email?.toLowerCase().includes(search.toLowerCase())
  // )

  const handleUpdateUser = async (updatedData: {
        full_name: string
        role: string
      }) => {
        if (!selectedUser) return

        const { error } = await supabase
          .from("accounts")
          .update({
            full_name: updatedData.full_name,
            role: updatedData.role,
          })
          .eq("id", selectedUser.id)

        if (error) {
          alert(error.message)
          return
        }

        // ✅ refresh table
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

        if (error) {
          alert(error.message)
          return
        }

        alert("Account deleted")

        setEmployees((prev) =>
          prev.filter((e) => e.id !== selectedUser.id)
        )

        setShowProfileModal(false)
        setSelectedUser(null)
      }
  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">

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
          <Link href="/adminDashboard">
            <NavItem icon={faCashRegister} label="Dashboard" />
          </Link>
          <Link href="/inventoryPage">
          <NavItem icon={faBoxesStacked} label="Inventory" />
          </Link>
          <Link href="/analyticsPage">
            <NavItem icon={<HistoryEduIcon />} label="Analytics"/>
          </Link>
          <Link href="/employee">
            <NavItem icon={<HistoryEduIcon />} label="Employee" active/>
          </Link>
          <Link href="/utang">
            <NavItem icon={<HistoryEduIcon />} label="Utang" />
          </Link>
          <Link href="/profile">
            <NavItem icon={faCircleUser} label="Users" />
          </Link>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 w-full">
        

        {/* HEADER */}
        <div className="p-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">

          <div>
            <h2 className="text-3xl font-bold text-primary">Employees</h2>
            <p className="text-gray-500">
              Manage your store staff access and payroll details.
            </p>
          </div>

          {/* SEARCH */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="border p-2 rounded-lg w-full md:w-80"
          />

          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-xl"
          >
            Add New User
          </button>
        </div>
        {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6">
            {/* Total Staff */}
            <div className="p-5 bg-white rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                👥
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase">Total Staff</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>

            {/* Active Now (based on status) */}
          <div className="p-5 bg-white rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700">
              ⚡
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Active Now</p>
              <p className="text-2xl font-bold">
                {employees.filter(e => e.status === "active").length}
              </p>
            </div>
          </div>

          {/* Break */}
          <div className="p-5 bg-white rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              ☕
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">On Break</p>
              <p className="text-2xl font-bold">
                {employees.filter(e => e.status === "break").length}
              </p>
            </div>
          </div>

        </div>

        {/* TABLE */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full min-w-175 border-collapse">

            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Employee</th>
                <th className="p-3">Role</th>
                <th className="p-3">ID</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>

              {Loading ? (
                <tr><td className="p-4">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="p-4">No employees found</td></tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="border-t hover:bg-gray-50 transition">

                    <td className="p-3 flex items-center gap-3">
                      <img
                        src={emp.profile_image || "/default.png"}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-semibold">{emp.full_name}</p>
                        <p className="text-sm text-gray-500">{emp.email}</p>
                      </div>
                    </td>

                    <td className="p-3">{emp.role}</td>
                    <td className="p-3 font-mono">{emp.employee_id}</td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          emp.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
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
                        className="px-4 py-2 bg-[#003527] text-white rounded-lg"
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
        <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-yellow-400 rounded-full shadow-lg text-xl">
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
              phone={phoneState} // or selectedUser.phone if you have it
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
