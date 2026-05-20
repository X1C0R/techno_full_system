"use client"
import { useState } from "react"

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


  if (!isOpen) return null

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

      <div className="bg-[#f8f9ff] w-full max-w-5xl rounded-xl shadow-lg overflow-hidden">

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
              let value = e.target.value;

              // remove +63 if user types it manually
              if (value.startsWith("+63")) {
                value = value.slice(3);
              }

              // allow numbers only
              value = value.replace(/\D/g, "");

              // limit to 10 digits (PH mobile: 9XXXXXXXXX)
              value = value.slice(0, 10);

              // always format as +63XXXXXXXXXX
              setCustomerPhone("+63" + value);
            }}
            placeholder="Customer Phone"
            className="w-full border-2 p-4 rounded-lg mt-3 focus:outline-none focus:ring-2 focus:ring-green-700"
          />
          </section>

          {/* PRODUCT LIST */}
          <section className="bg-white rounded-xl shadow-sm border overflow-hidden">

            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-green-900">
                Product List
              </h3>
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

                      <td className="p-4 font-semibold">
                        {item.name}
                      </td>

                      <td className="p-4 text-right">
                        ₱{item.price}
                      </td>

                      <td className="p-4 text-center">
                        {item.qty}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {/* FOOTER */}
            <div className="p-6 flex justify-between items-center border-t">

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={onComplete}
                  className="px-6 py-2 bg-green-900 text-white rounded-lg"
                >
                  Complete Sale
                </button>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">
                  Total:
                </p>
                <p className="text-2xl font-extrabold text-green-900">
                  ₱{total.toFixed(2)}
                </p>
              </div>

            </div>

          </section>

        </div>

      </div>
    </div>
    
  )
}