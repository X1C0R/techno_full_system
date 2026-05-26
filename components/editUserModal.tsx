"use client"

import { useEffect, useState } from "react"

type Props = {
  isOpen: boolean
  onClose: () => void
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
  handleSave: (data: { full_name: string; role: string }) => Promise<void>
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
  handleImageUpload,
  handleSave,
  handleDelete,
}: Props) {
  const [draftName, setDraftName] = useState(fullname)
  const [draftEmail, setDraftEmail] = useState(email)
  const [draftPhone, setDraftPhone] = useState(phone)
  const [roleState, setRoleState] = useState(role)
  const [currentUserRole, setCurrentUserRole] = useState("")

  // ✅ local preview — shows immediately before upload finishes
  const [previewImage, setPreviewImage] = useState(profileImage)

  // sync props → draft when opening modal
  useEffect(() => {
    setDraftName(fullname)
    setDraftEmail(email)
    setDraftPhone(phone)
    setRoleState(role)
    setPreviewImage(profileImage) // ✅ sync preview when modal opens
  }, [fullname, email, phone, role, profileImage, isOpen])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return
    const user = JSON.parse(storedUser)
    setCurrentUserRole(user.role?.toLowerCase() || "")
  }, [])

  if (!isOpen) return null

  // ✅ show preview immediately, then trigger actual upload
  const handleFileChange = (e: any) => {
    const file = e.target.files[0]
    if (!file) return

    // ✅ instantly show preview using URL.createObjectURL
    const localUrl = URL.createObjectURL(file)
    setPreviewImage(localUrl)

    // ✅ trigger actual upload to Supabase
    handleImageUpload(e)
  }

  const onSaveClick = async () => {
    await handleSave({
      full_name: draftName,
      role: roleState,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#f8f9ff] p-6 rounded-xl max-w-4xl w-full relative overflow-y-auto max-h-[90vh]">

        {/* CLOSE */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600">
          ✕
        </button>

        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl shadow mb-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">

          {/* IMAGE — shows preview instantly */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center">
              <img
                src={previewImage || "/default-avatar.png"}
                className="w-24 h-24 rounded-full object-cover bg-gray-300"
              />
              <label className="mt-2 text-sm cursor-pointer px-3 py-1 rounded">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* LIVE PREVIEW TEXT */}
          <div>
            <h3 className="text-2xl font-bold">{draftName || "No Name Yet"}</h3>
            <p className="text-green-700 font-semibold">{role}</p>
            <p className="text-sm text-gray-500">{draftEmail}</p>
          </div>

          {/* ACTIONS */}
          <div className="sm:ml-auto flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm">
              Cancel
            </button>
            <button
              onClick={onSaveClick}
              className="px-4 py-2 bg-[#003527] text-white rounded-lg text-sm"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT */}
          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <h4 className="font-bold text-lg">Personal Information</h4>

            <div>
              <label className="text-xs text-gray-500">Full Name</label>
              <input
                className="w-full border p-2 rounded mt-1"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input
                className="w-full border p-2 rounded mt-1 bg-gray-50"
                value={draftEmail}
                onChange={(e) => setDraftEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Phone</label>
              <input
                className="w-full border p-2 rounded mt-1"
                value={draftPhone}
                onChange={(e) => {
                  let value = e.target.value
                  if (value.startsWith("+63")) value = value.slice(3)
                  value = value.replace(/\D/g, "").slice(0, 10)
                  setDraftPhone("+63" + value)
                }}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Employee ID</label>
              <input
                className="w-full border p-2 rounded mt-1 bg-gray-100"
                value={employeeId}
                disabled
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white p-6 rounded-xl shadow flex flex-col">
            <label className="text-sm text-gray-500">Role</label>
            <select
              className="w-full border p-2 rounded mt-2"
              value={roleState}
              onChange={(e) => setRoleState(e.target.value)}
            >
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
              {currentUserRole === "admin" && (
                <option value="admin">Admin</option>
              )}
            </select>

            {/* DELETE */}
            <button
              onClick={handleDelete}
              className="w-full bg-red-600 text-white p-2 rounded mt-6"
            >
              Remove Account
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}