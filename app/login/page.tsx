"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ResumeShiftModal from "@/components/resume_shift"
export const dynamic = "force-dynamic"
export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showResumeModal, setShowResumeModal] = useState(false)

  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!email || !password) {
    alert("Please fill all fields")
    return
  }

  setLoading(true)

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .single()

  setLoading(false)

  if (error || !data) {
    alert("Invalid login")
    return
  }

  // =========================
  // 💾 SAVE USER
  // =========================
  localStorage.setItem("user", JSON.stringify(data))

  // =========================
  // 🟢 SET USER ACTIVE (IMPORTANT ADDITION)
  // =========================
  await supabase
    .from("accounts")
    .update({ status: "active" })
    .eq("id", data.id)

  const employeeId = data.employee_id

  // =========================
  // 🔍 CHECK PAUSED SHIFT
  // =========================
  const { data: pausedShift } = await supabase
    .from("shifts")
    .select("*")
    .eq("employee_id", employeeId)
    .is("clock_out", null)
    .single()

  if (pausedShift?.is_paused) {
    setShowResumeModal(true)
    return
  }

  // =========================
  // 🚀 AUTO CLOCK-IN
  // =========================
  if (data.role === "cashier" || data.role === "manager") {
    const { data: existingShift } = await supabase
      .from("shifts")
      .select("*")
      .eq("employee_id", employeeId)
      .is("clock_out", null)
      .single()

    if (!existingShift) {
      await supabase.from("shifts").insert([
        {
          employee_id: employeeId,
          clock_in: new Date().toISOString(),
          clock_out: null,
          is_paused: false,
        },
      ])
    }
  }

  // =========================
  // 🚀 REDIRECT
  // =========================
    if (data.role === "admin") {
      router.push("/adminDashboard")
    } else if (data.role === "manager") {
      router.push("/managerDashboard")
    } else {
      router.push("/ScannerPage")
    }
  }

  // =========================
  // ▶️ RESUME SHIFT
  // =========================
  const handleResume = async () => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return

    const user = JSON.parse(storedUser)

    const { data: shift } = await supabase
      .from("shifts")
      .select("*")
      .eq("employee_id", user.employee_id)
      .is("clock_out", null)
      .single()

    if (!shift) return

    await supabase
      .from("shifts")
      .update({
        is_paused: false,
        paused_at: null,
      })
      .eq("id", shift.id)

    setShowResumeModal(false)

    router.push("/ScannerPage")
  }

  // =========================
  // 🔄 START NEW SHIFT
  // =========================
  const handleNewShift = async () => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return

    const user = JSON.parse(storedUser)

    // close old shift
    await supabase
      .from("shifts")
      .update({
        clock_out: new Date().toISOString(),
      })
      .eq("employee_id", user.employee_id)
      .is("clock_out", null)

    // start new shift
    await supabase.from("shifts").insert([
      {
        employee_id: user.employee_id,
        clock_in: new Date().toISOString(),
        clock_out: null,
        is_paused: false,
      },
    ])

    setShowResumeModal(false)

    router.push("/ScannerPage")
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center px-4">
      <div className="w-full max-w-110 bg-white rounded-xl shadow-lg border p-8">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <span className="text-3xl">🏪</span>
            <h1 className="text-2xl font-bold text-emerald-900">Tory</h1>
          </div>

          <p className="text-gray-500">
            Welcome back! Log in to manage your store inventory.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-6">

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              placeholder="name@store.com"
              className="w-full mt-2 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="w-full mt-2 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 text-white py-4 rounded-lg font-bold hover:scale-[0.99] transition"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

        </form>

        {/* FOOTER */}
        {/* <div className="text-center mt-8 text-sm text-gray-500">
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-emerald-700 font-bold cursor-pointer"
          >
            Register Store
          </span>
        </div> */}
      </div>

      {/* ✅ MODAL */}
      {showResumeModal && (
        <ResumeShiftModal
          isOpen={showResumeModal}
          onResume={handleResume}
          onNewShift={handleNewShift}
          onClose={() => setShowResumeModal(false)}
        />
      )}
    </div>
  )
}