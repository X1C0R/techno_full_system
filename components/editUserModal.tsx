"use client"
export const dynamic = "force-dynamic"
import { useEffect, useState } from "react"

type Props = {
  isOpen: boolean
  onClose: () => void

  // pass your existing states/handlers
  profileImage: string
  fullname: string
  email: string
  role: string
  phone: string
  employeeId: string
  saving: boolean

  setFullName: (v: string) => void
  setPhone: (v: string) => void
  setEmail: (v: string) => void
  handleImageUpload: (e: any) => void
  handleDelete: () => void
  handleSave: (data: { full_name: string; role: string }) => void
}


export default function ProfileModal({
  isOpen,
  onClose,
  profileImage,
  fullname,
  email,
  role,
  phone,
  employeeId,
  saving,
  setFullName,
  setPhone,
  setEmail,
  handleImageUpload,
  handleSave,
  handleDelete,
}: Props) {

  const [roleState, setRoleState] = useState(role)

    useEffect(() => {
    setRoleState(role)
  }, [role])

  if (!isOpen) return null


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-[#f8f9ff] p-6 rounded-xl max-w-4xl w-full relative overflow-y-auto max-h-[90vh]">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600"
        >
          ✕
        </button>

        {/* ===== YOUR UI (UNCHANGED) ===== */}

        <div className="bg-white p-6 rounded-xl shadow mb-6 flex gap-6 items-center">

          <div className="flex flex-col items-center">
            <img
              src={profileImage || "/default-avatar.png"}
              className="w-24 h-24 rounded-full object-cover bg-gray-300"
            />
            <label className="mt-2 text-sm cursor-pointer px-3 py-1 rounded inline-block">
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <h3 className="text-2xl font-bold">
              {fullname || "No Name Yet"}
            </h3>
            <p className="text-green-700 font-semibold">{role}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>

          <div className="ml-auto flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={() =>
                handleSave({
                  full_name: fullname,
                  role: roleState,
                })
              }
              className="px-4 py-2 bg-[#003527] text-white rounded-lg flex items-center gap-2"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <h4 className="font-bold text-lg">Personal Information</h4>

            <div>
              <label className="text-sm text-gray-500">Full Name</label>
              <input
                className="w-full border p-2 rounded"
                value={fullname}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Email</label>
              <input
                className="w-full border p-2 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Phone</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={phone}
                onChange={(e) => {
                  let value = e.target.value

                  if (value.startsWith("+63")) {
                    value = value.slice(3)
                  }

                  value = value.replace(/\D/g, "")
                  value = value.slice(0, 10)

                  setPhone("+63" + value)
                }}
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Employee ID</label>
              <input
                className="w-full border p-2 rounded bg-gray-100"
                value={employeeId}
                disabled
              />
            </div>
          </div>
          <div className="p-4 rounded flex flex-col h-full">
            <label className="text-sm text-gray-500">Role</label>

            <select
              className="w-full border p-2 rounded mt-2"
              value={roleState}
              onChange={(e) => setRoleState(e.target.value)}
            >
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
              <option value="admin">Admin</option>
            </select>

            {/* PUSH BUTTON TO BOTTOM */}
            <button
              onClick={handleDelete}
              className="mt-auto px-4 py-2 bg-red-600 text-white rounded-lg flex items-center justify-center gap-2"
            >
              Remove Account
            </button>
          </div>
          
        </div>

      </div>
    </div>
  )
}