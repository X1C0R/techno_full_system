import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export function useAuthGuard(allowedRoles?: string[]) {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user")

      // ✅ NO USER — redirect to login
      if (!storedUser) {
        router.replace("/login")
        return
      }

      const parsed = JSON.parse(storedUser)

      const { data, error } = await supabase
        .from("accounts")
        .select("role")
        .eq("id", parsed.id)
        .single()

      if (error || !data) {
        router.replace("/login")
        return
      }

      const cleanRole = data.role?.trim().toLowerCase()

      // ✅ ROLE NOT ALLOWED — redirect based on their actual role
      if (allowedRoles && !allowedRoles.includes(cleanRole)) {
        if (cleanRole === "admin") {
          router.replace("/adminDashboard")
        } else if (cleanRole === "manager") {
          router.replace("/managerDashboard")
        } else {
          router.replace("/ScannerPage")
        }
        return
      }

      setRole(cleanRole)
      setLoading(false)
    }

    checkAuth()
  }, [])

  return { role, loading }
}