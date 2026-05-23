"use client"

import { useState } from "react"
import { X, Eye, EyeOff } from "lucide-react"

type DebtItem = {
  name: string
  category: string
  qty: number
  price: number
}

type Props = {
  isOpen: boolean
  onClose: () => void
  customerName: string
  customerId: string
  items: DebtItem[]
  total: number
  date: string
  onPay: (password: string) => void
}

export default function PautangSettlementModal({
  isOpen,
  onClose,
  customerName,
  customerId,
  items,
  total,
  date,
  onPay,
}: Props) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">

      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-[#003527]">
              Pautang Settlement
            </h2>
            <p className="text-sm text-gray-500">Authorization Required</p>
          </div>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">

          {/* CUSTOMER */}
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-gray-500">Customer</p>
              <h3 className="text-lg font-bold">{customerName}</h3>
              <p className="text-xs text-gray-400">{customerId}</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-semibold">{date}</p>
            </div>
          </div>

          {/* ITEMS */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Item</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{item.name}</td>
                    <td className="p-3 text-center">{item.qty}</td>
                    <td className="p-3 text-right">₱{item.price}</td>
                    <td className="p-3 text-right">
                      ₱{item.qty * item.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTAL */}
          <div className="flex justify-between bg-green-50 p-4 rounded-lg border">
            <p className="font-semibold">Total</p>
            <p className="text-xl font-bold">₱{total}</p>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium">
              Manager Password
            </label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-3 rounded-lg"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 p-6 border-t">

          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>

          <button
            onClick={() => onPay(password)}
            className="px-4 py-2 bg-[#003527] text-white rounded-lg"
          >
            Pay Now
          </button>

        </div>
      </div>
    </div>
  )
}