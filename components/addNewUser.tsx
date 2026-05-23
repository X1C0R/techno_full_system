"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
export const dynamic = "force-dynamic"
export default function RegisterModal({ onClose }: { onClose: () => void }) {

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !email || !password || !role) {
      alert("Please fill all fields")
      return
    }

    setLoading(true)

    const { error } = await supabase.from("accounts").insert([
      {
        email,
        password,
        role,
        full_name: fullName,
      },
    ])

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert("Account created successfully!")
    window.location.reload()
    onClose() // ✅ CLOSE MODAL PROPERLY

    router.refresh() // optional (if using app router)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="w-full max-w-xl bg-white rounded-4xl shadow-xl border border-emerald-50 p-8 md:p-12 relative">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500"
        >
          ✕
        </button>

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-emerald-900">
            Create Account
          </h1>
          <p className="text-gray-500 mt-2">
            Add a new user to the system.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleRegister} className="space-y-6">

          <input
            className="p-4 border rounded-xl w-full"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="p-4 border rounded-xl w-full"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="p-4 border rounded-xl w-full"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* ROLE SELECT */}
          <select
            className="p-4 border rounded-xl w-full"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Select Role</option>
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold"
          >
            {loading ? "Creating account..." : "Register User"}
          </button>

        </form>
      </div>
    </div>
  )
}