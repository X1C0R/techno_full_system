"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"

type CartItem = {
  name: string
  price: number
  qty: number
}

type Props = {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onComplete: () => void
  customerName: string
  setCustomerName: (value: string) => void
  customerPhone: string
  setCustomerPhone: (value: string) => void
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type VerificationStatus = "idle" | "loading" | "verified" | "not_found" | "incomplete"

export default function UtangModal({
  isOpen,
  onClose,
  cart,
  onComplete,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
}: Props) {
  const [record, setRecord] = useState<any>(null)
  const [status, setStatus] = useState<VerificationStatus>("idle")

  // Keep a ref to the current customerName so the realtime callback
  // can access the latest value without stale closure issues
  const customerNameRef = useRef(customerName)
  useEffect(() => {
    customerNameRef.current = customerName
  }, [customerName])

  // ─── Core fetch function ──────────────────────────────────────────────────
  async function fetchUtang(name: string) {
    if (!name.trim()) {
      setRecord(null)
      setStatus("idle")
      return
    }

    setStatus("loading")

    const { data } = await supabase
      .from("utang_records")
      .select("id, id_image_url, signature_url, customer_name, status")
      .eq("customer_name", name.trim())
      .not("signature_url", "is", null)
      .not("id_image_url", "is", null)
      .limit(1)
      .maybeSingle()

    if (!data) {
      // Check if they exist but are just missing docs
      const { data: anyRecord } = await supabase
        .from("utang_records")
        .select("id, signature_url, id_image_url")
        .eq("customer_name", name.trim())
        .limit(1)
        .maybeSingle()

      setRecord(anyRecord || null)
      setStatus(anyRecord ? "incomplete" : "not_found")
      return
    }

    setRecord(data)
    setStatus("verified")
  }

  // ─── Debounced fetch when customerName changes ────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => fetchUtang(customerName), 500)
    return () => clearTimeout(t)
  }, [customerName])

  // ─── Realtime subscription — re-fetches when Android saves a new record ───
  useEffect(() => {
    if (!isOpen) return

    const channel = supabase
      .channel("utang_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "utang_records",
        },
        (payload) => {
          const newRow = payload.new as any

          // Only re-fetch if the new row matches the name currently typed
          const currentName = customerNameRef.current.trim().toLowerCase()
          const incomingName = (newRow.customer_name || "").trim().toLowerCase()

          if (currentName && currentName === incomingName) {
            fetchUtang(customerNameRef.current)
          }
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [isOpen])

  if (!isOpen) return null

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const canComplete = status === "verified"

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#f8f9ff] w-full max-w-5xl rounded-xl shadow-lg max-h-screen overflow-y-auto">
        <div className="p-6 md:p-8 flex flex-col gap-6">

          {/* CUSTOMER INFO */}
          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold text-lg mb-4 text-green-900">
              Customer Information
            </h3>

            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="w-full border-2 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
            />

            <input
              value={customerPhone}
              onChange={(e) => {
                let value = e.target.value
                if (value.startsWith("+63")) value = value.slice(3)
                value = value.replace(/\D/g, "").slice(0, 10)
                setCustomerPhone("+63" + value)
              }}
              placeholder="Customer Phone"
              className="w-full border-2 p-4 rounded-lg mt-3 focus:outline-none focus:ring-2 focus:ring-green-700"
            />

            {/* Status badge */}
            {status === "loading" && (
              <p className="mt-3 text-sm text-gray-400 animate-pulse">
                Checking customer record...
              </p>
            )}

            {status === "verified" && (
              <div className="mt-3 flex items-center gap-2 text-green-700 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Customer verified — signature and ID on file
              </div>
            )}

            {status === "not_found" && customerName.trim().length > 2 && (
              <div className="mt-3 flex items-center gap-2 text-red-600 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" />
                Waiting for customer to register via the Android app...
              </div>
            )}

            {status === "incomplete" && (
              <div className="mt-3 flex items-center gap-2 text-yellow-600 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block animate-pulse" />
                Customer exists but is missing signature or ID — waiting for Android app...
              </div>
            )}
          </section>

          {/* PRODUCT LIST */}
          <section className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-green-900">Product List</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4 text-right">Price</th>
                    <th className="p-4 text-center">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-4 font-semibold">{item.name}</td>
                      <td className="p-4 text-right">₱{item.price}</td>
                      <td className="p-4 text-center">{item.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 flex justify-between items-center border-t">
              <div className="flex gap-3">
                <button onClick={onClose} className="px-6 py-2 border rounded-lg">
                  Cancel
                </button>

                <button
                  onClick={onComplete}
                  disabled={!canComplete}
                  title={!canComplete ? "Customer must be verified before completing sale" : ""}
                  className={`px-6 py-2 rounded-lg text-white font-semibold transition-all
                    ${canComplete
                      ? "bg-green-900 hover:bg-green-800"
                      : "bg-gray-300 cursor-not-allowed text-gray-500"
                    }`}
                >
                  Complete Sale
                </button>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">Total:</p>
                <p className="text-2xl font-extrabold text-green-900">
                  ₱{total.toFixed(2)}
                </p>
              </div>
            </div>
          </section>

          {/* VERIFICATION PANEL */}
          {status === "verified" && record && (
            <section className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="font-bold text-green-900 mb-4 text-lg">
                Utang Verification
              </h3>

              <p className="font-semibold mb-1">{record.customer_name}</p>
              <p className="text-sm mb-4 text-gray-500">Status: {record.status}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold mb-2">ID Image</p>
                  <img
                    src={record.id_image_url}
                    alt="Customer ID"
                    className="w-full rounded-lg border object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold mb-2">Signature</p>
                  <img
                    src={record.signature_url}
                    alt="Customer Signature"
                    className="w-full rounded-lg border bg-white object-contain"
                  />
                </div>
              </div>
            </section>
          )}

          {/* INCOMPLETE WARNING */}
          {status === "incomplete" && (
            <section className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <h3 className="font-bold text-yellow-800 mb-2">Missing Documents</h3>
              <p className="text-sm text-yellow-700">
                This customer has a record but is missing{" "}
                {!record?.signature_url && !record?.id_image_url
                  ? "both signature and ID photo"
                  : !record?.signature_url
                  ? "a signature"
                  : "an ID photo"
                }. They must complete registration via the Android app.
              </p>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}