"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type ReturnItem = {
  product_name: string;
  barcode: string;
  qty: number;
  price: number;
};

type ReturnRequest = {
  id: string;
  sale_id: string;
  reason: string;
  refund_total: number;
  status?: string;
  return_items: ReturnItem[];
  employee_id: string;
  created_at: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  request: ReturnRequest | null;
  onUpdated?: () => void;
  managerId: string;
};

export default function ReturnProductPending({
  open,
  onClose,
  request,
  onUpdated,
  managerId,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!open || !request) return null;

  const logInventory = async (
    productName: string,
    qty: number,
    type: "return_in" | "adjustment"
  ) => {
    await supabase.from("inventory_logs").insert({
      product_name: productName,
      qty,
      type,
      created_at: new Date().toISOString(),
      employee_id: managerId,
    });
  };

  const approveReturn = async (returnData: any) => {
  setLoading(true);

  // 1. mark return approved
  const { error: updateError } = await supabase
    .from("returns")
    .update({ status: "approved" })
    .eq("id", returnData.id);

  if (updateError) {
    console.error("RETURN UPDATE ERROR:", updateError);
    setLoading(false);
    return;
  }

  // 2. restock products
  for (const item of returnData.return_items) {
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("id, quantity")
      .eq("name", item.product_name) // must match DB column
      .single();

    if (fetchError || !product) {
      console.error("PRODUCT NOT FOUND:", item.product_name);
      continue;
    }

    const { error: stockError } = await supabase
      .from("products")
      .update({
        quantity: product.quantity + item.qty,
      })
      .eq("id", product.id);

    if (stockError) {
      console.error("STOCK UPDATE ERROR:", stockError);
    }
  }

  onUpdated?.();
  onClose();
  setLoading(false);
};

  const handleReject = async () => {
    setLoading(true);

    try {
      await supabase
        .from("returns")
        .update({ status: "rejected" })
        .eq("id", request.id);

      onUpdated?.();
      onClose();
    } catch (err: any) {
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] rounded-xl p-5 space-y-4">

        <h2 className="text-lg font-bold">Return Approval</h2>

        <p className="text-sm text-gray-600">
          Reason: <span className="font-semibold">{request.reason}</span>
        </p>

        <div className="border rounded p-3 max-h-60 overflow-y-auto space-y-2">
          {request.return_items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.product_name}</span>
              <span>
                {item.qty} × ₱{item.price}
              </span>
            </div>
          ))}
        </div>

        <p className="text-right font-bold">
          Refund: ₱{request.refund_total.toFixed(2)}
        </p>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-3">
          <button
            onClick={handleReject}
            disabled={loading}
            className="px-4 py-2 bg-red-100 text-red-600 rounded"
          >
            Reject
          </button>

          <button
            onClick={() => approveReturn(request)}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Approve
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function setReturnRequests(arg0: (prev: any) => any) {
  throw new Error("Function not implemented.");
}
