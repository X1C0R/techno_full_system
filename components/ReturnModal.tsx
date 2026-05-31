"use client";

import { useEffect, useState } from "react";

type SaleItem = {
  id: string;
  product_name: string;
  barcode: string;
  price: number;
  qty: number;
  category: string;
};

type ReturnModalProps = {
  open: boolean;
  onClose: () => void;
  sale: any;
  items?: SaleItem[];
  onSubmit: (data: {
    selectedItems: Record<string, SaleItem>;
    reason: string;
    managerPassword: string;
    total: number;
  }) => void;
};

export default function ReturnModal({
  open,
  onClose,
  sale,
  items = [],
  onSubmit,
}: ReturnModalProps) {
  const [selectedItems, setSelectedItems] = useState<Record<string, SaleItem>>({});
  const [reason, setReason] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (open) {
      setSelectedItems({});
      setReason("");
      setManagerPassword("");
      setTotal(0);
    }
  }, [open]);

  const toggleItem = (item: SaleItem) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };

      if (updated[item.id]) {
        delete updated[item.id];
      } else {
        updated[item.id] = item;
      }

      return updated;
    });
  };

  useEffect(() => {
    let newTotal = 0;

    Object.values(selectedItems).forEach((item) => {
      const price = Number(item?.price ?? 0);
      const qty = Number(item?.qty ?? 0);
      newTotal += price * qty;
    });

    setTotal(newTotal);
  }, [selectedItems]);

  const canSubmit =
    Object.keys(selectedItems).length > 0 &&
    reason.trim() !== "" &&
    managerPassword.trim() !== "";

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-green-900 text-white px-6 py-4 flex justify-between">
          <div>
            <h2 className="text-xl font-bold">Process Return</h2>
            <p className="text-sm opacity-80">
              Receipt #{sale?.id?.slice?.(-6)}
            </p>
          </div>

          <button onClick={onClose}>✕</button>
        </div>

        {/* ITEMS */}
        <div className="p-6 max-h-80 overflow-y-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th></th>
                <th>Product</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Price</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {items?.map((item) => {
                const price = Number(item?.price ?? 0);
                const qty = Number(item?.qty ?? 0);

                return (
                  <tr key={item.id} className="border-b">
                    {/* CHECKBOX */}
                    <td className="py-3">
                      <input
                        type="checkbox"
                        checked={!!selectedItems[item.id]}
                        onChange={() => toggleItem(item)}
                        className="w-5 h-5"
                      />
                    </td>

                    {/* PRODUCT */}
                    <td>
                      <p className="font-semibold">
                        {item?.product_name || "No name"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item?.barcode}
                      </p>
                    </td>

                    {/* QTY */}
                    <td className="text-center">{qty}</td>

                    {/* PRICE */}
                    <td className="text-right">
                      ₱{price.toFixed(2)}
                    </td>

                    {/* SUBTOTAL */}
                    <td className="text-right">
                      ₱{(price * qty).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div className="px-6 py-4 flex justify-between bg-gray-50">
          <p className="font-semibold">Selected Return Total</p>
          <p className="text-green-700 font-bold">
            ₱{total.toFixed(2)}
          </p>
        </div>

        {/* FORM */}
        <div className="p-6 space-y-4 border-t">

          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border p-3 rounded"
          >
            <option value="">Select reason</option>
            <option value="damaged">Damaged</option>
            <option value="wrong">Wrong item</option>
            <option value="change_mind">Customer changed mind</option>
          </select>

          <input
            type="password"
            placeholder="Manager password"
            value={managerPassword}
            onChange={(e) => setManagerPassword(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>

            <button
              disabled={!canSubmit}
              onClick={() =>
                onSubmit({ selectedItems, reason, managerPassword, total })
              }
              className="px-6 py-2 bg-green-800 text-white rounded disabled:opacity-50"
            >
              Confirm Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}