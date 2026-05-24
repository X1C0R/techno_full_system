"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Product = {
  id: string
  name: string
  barcode: string
  price: number
  quantity: number
  category: string
  created_by: string
  created_at: string
}

type AddedByAccount = {
  full_name: string
  role: string
  profile_image: string
  status: string
}

type EditProductModalProps = {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onSave: (updated: {
  quantity: number
  category: string
  price: number
}) => void
}

const CATEGORIES = [
  "Canned Goods",
  "Instant Noodles",
  "Beverages",
  "Snacks",
  "Candy",
  "Cookies",
  "Other",
]

export default function EditProductModal({
  isOpen,
  onClose,
  product,
  onSave,
}: EditProductModalProps) {

  const [quantity, setQuantity] = useState(0)
  const [category, setCategory] = useState("")
  const [saving, setSaving] = useState(false)
  const [addedBy, setAddedBy] = useState<AddedByAccount | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [price, setPrice] = useState(0)

  useEffect(() => {
    if (product) {
      setQuantity(product.quantity)
      setPrice(product.price || 0)
      setCategory(product.category || "")
      fetchAddedBy(product.created_by)
    }
  }, [product])

  // ✅ FIXED: uses accounts.id (UUID)
  const fetchAddedBy = async (userId: string) => {
    if (!userId) return

    const { data, error } = await supabase
      .from("accounts")
      .select("full_name, role, profile_image, status")
      .eq("id", userId)
      .single()

    if (error || !data) {
      setAddedBy(null)
      return
    }

    setAddedBy(data)
  }

  const handleSave = async () => {
    setSaving(true)
    await onSave({ quantity, category, price})
    
    setSaving(false)

    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)

    onClose()
  }

  const changeStock = (delta: number) => {
    setQuantity((prev) => Math.max(0, prev + delta))
  }

  const stockStatus = () => {
    if (quantity === 0)
      return { label: "Out of Stock", color: "bg-red-100 text-red-600" }
    if (quantity <= 10)
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-700" }
    return { label: "In Stock", color: "bg-green-100 text-green-700" }
  }

  if (!isOpen || !product) return null

  const status = stockStatus()
  
  return (
    <>
      {/* OVERLAY */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">

        <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">

          {/* HEADER */}
          <div className="p-6 bg-[#003527] text-white">
            <h2 className="text-xl font-bold">{product.name}</h2>
            <p className="text-xs text-[#95d3ba]">{product.barcode}</p>
          </div>

          {/* BODY */}
          <div className="p-6 space-y-6">

            {/* STOCK */}
            <div>
              <label className="text-sm font-semibold">Stock Quantity</label>

              <div className="flex items-center border rounded-xl overflow-hidden">
                <button onClick={() => changeStock(-1)} className="px-4 py-3">
                  -
                </button>

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(0, Number(e.target.value)))
                  }
                  className="w-full text-center text-xl font-bold"
                />

                <button onClick={() => changeStock(1)} className="px-4 py-3">
                  +
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-500">Price</label>

              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-[#eef4ff] border border-gray-200 rounded-xl px-5 py-4 text-[#003527] font-bold"
                placeholder="Enter price"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="text-sm font-semibold">Category</label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-xl p-3"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* ADDED BY */}
            <div className="p-4 border rounded-xl flex gap-4 items-center">

              <img
                src={addedBy?.profile_image || ""}
                className="w-12 h-12 rounded-full object-cover"
              />

              <div>
                <p className="font-bold">
                  {addedBy?.full_name || "Unknown"}
                </p>
                <p className="text-xs text-gray-500">
                  {addedBy?.role || "—"}
                </p>
              </div>

              <span
                className={`ml-auto w-3 h-3 rounded-full ${
                  addedBy?.status === "active"
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              />
            </div>

          </div>

          {/* FOOTER */}
          <div className="p-5 flex justify-end gap-3 border-t">

            <button onClick={onClose} className="px-6 py-2 border rounded-xl">
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#003527] text-white rounded-xl"
            >
              {saving ? "Saving..." : "Save"}
            </button>

          </div>

        </div>
      </div>

      {/* TOAST */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-2 rounded-full">
          Saved successfully
        </div>
      )}
    </>
  )
}