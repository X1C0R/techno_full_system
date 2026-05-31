"use client"

export default function ReceiptModal({ open, sale, items, onClose }: any) {
  if (!open || !sale) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-[400px] p-6 rounded-xl">

        <h2 className="text-xl font-bold mb-4">Receipt</h2>

        <p>ID: #{sale.id.slice(-6)}</p>
        <p>Date: {new Date(sale.created_at).toLocaleString()}</p>

        <div className="border-t my-3" />

        {items.map((i: any) => (
          <div key={i.id} className="flex justify-between">
            <span>{i.product_name}</span>
            <span>₱{i.price * i.qty}</span>
          </div>
        ))}

        <div className="border-t mt-3 pt-2 font-bold">
          Total: ₱{sale.total}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-200 p-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  )
}