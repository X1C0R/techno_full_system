"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Shift = {
  id: string
  employee_id: string
  clock_in: string
  clock_out: string | null
  created_at: string
  total_paused_seconds: number
}

export default function WorkHoursModal({
  open,
  onClose,
  employeeId,
}: {
  open: boolean
  onClose: () => void
  employeeId: string
}) {
  const [view, setView] = useState<"daily" | "monthly">("daily")
  const [shifts, setShifts] = useState<Shift[]>([])
  const [totalHours, setTotalHours] = useState(0)

  // ─────────────────────────────────────────────
  // ✅ CALCULATE HOURS
  // ─────────────────────────────────────────────
  const calculateHours = (shift: Shift) => {
    if (!shift.clock_in) return 0

    const start = new Date(shift.clock_in).getTime()

    const end = shift.clock_out
      ? new Date(shift.clock_out).getTime()
      : Date.now()

    const totalSeconds = (end - start) / 1000
    const workedSeconds =
      totalSeconds - Number(shift.total_paused_seconds || 0)

    return workedSeconds / 3600
  }

  // ─────────────────────────────────────────────
  // ✅ FETCH SHIFTS
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!open) return

    const fetchShifts = async () => {
      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false })

      if (error || !data) return

      setShifts(data)

      const total = data.reduce((sum, shift) => {
        return sum + calculateHours(shift)
      }, 0)

      setTotalHours(total)
    }

    fetchShifts()
  }, [open, employeeId])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      
      {/* MODAL CONTAINER */}
      <div className="bg-surface-bright w-full max-w-2xl max-h-[90vh] rounded-4xl shadow-2xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="px-8 pt-8 pb-6 flex justify-between items-start border-b border-outline-variant/30">
          <div>
            <h1 className="font-bold text-xl text-primary">
              Work Hours Summary
            </h1>
            <p className="text-sm text-gray-400">
              Employee ID: {employeeId}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* TOGGLE */}
        <div className="px-8 py-4 flex justify-center">
          <div className="bg-surface-container-high p-1 rounded-xl flex gap-1 w-full max-w-xs">
            <button
              onClick={() => setView("daily")}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
                view === "daily"
                  ? "bg-white shadow text-primary"
                  : "text-gray-400"
              }`}
            >
              Daily View
            </button>

            <button
              onClick={() => setView("monthly")}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
                view === "monthly"
                  ? "bg-white shadow text-primary"
                  : "text-gray-400"
              }`}
            >
              Monthly View
            </button>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

          {/* DAILY VIEW */}
          {view === "daily" && (
            <div className="space-y-3">
              {shifts.length === 0 ? (
                <p className="text-center text-gray-400">
                  No shifts found
                </p>
              ) : (
                shifts.map((shift) => {
                  const hours = calculateHours(shift)

                  return (
                    <div
                      key={shift.id}
                      className="p-4 rounded-xl border border-outline-variant/30 bg-white flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold">
                          {new Date(
                            shift.created_at
                          ).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(
                            shift.clock_in
                          ).toLocaleTimeString()}{" "}
                          -{" "}
                          {shift.clock_out
                            ? new Date(
                                shift.clock_out
                              ).toLocaleTimeString()
                            : "Active"}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-primary">
                          {hours.toFixed(2)}h
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* MONTHLY VIEW */}
          {view === "monthly" && (
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {totalHours.toFixed(1)}h
              </div>
              <p className="text-gray-400 mt-2">
                Total Hours This Month
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-surface-container px-8 py-6 border-t">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl hover:scale-95 transition"
            >
              Confirm & Close
            </button>

            <button className="px-6 py-4 border-2 border-primary text-primary font-bold rounded-2xl">
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}