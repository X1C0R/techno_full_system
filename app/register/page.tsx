"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !email || !password) {
      alert("Please fill all fields")
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from("accounts")
      .insert([
        {
          email,
          password,
          role: "user",
          full_name: fullName,
        }
      ])

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert("Account created successfully!")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center px-4">

      <div className="w-full max-w-xl bg-white rounded-4xl shadow-xl border border-emerald-50 p-8 md:p-12">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-emerald-900">
            Start Your Business Journey
          </h1>
          <p className="text-gray-500 mt-2">
            Create your store account and manage your business professionally.
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




          {/* EMAIL */}
          <input
            className="p-4 border rounded-xl w-full"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          <input
            className="p-4 border rounded-xl w-full"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:scale-[0.99] transition"
          >
            {loading ? "Creating account..." : "Register Store"}
          </button>

        </form>

        {/* LOGIN LINK */}
        <p className="text-center mt-6 text-gray-500">
          Already have an account?{" "}
          <span
            className="text-emerald-700 font-bold cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  )
}