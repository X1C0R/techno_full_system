"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ReceiptModal from "@/components/ReceiptModal";
import ReturnModal from "@/components/ReturnModal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import {
  faCashRegister,
  faBoxesStacked,
  faCircleUser,
  faAddressBook,
} from "@fortawesome/free-solid-svg-icons";
import ReceiptIcon from '@mui/icons-material/Receipt';

import React from "react";

type Sale = any;
type SaleItem = any;

// Return record shape loaded from DB
type ReturnSummary = {
  id: string;
  sale_id: string;
  refund_total: number;
  reason: string;
  created_at: string;
  employee_id: string;
  accounts?: {
    full_name: string;
  };
  return_items: {
    product_name: string;
    qty: number;
    price: number;
  }[];
};

// NAV ITEM
function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: any
  label: string
  active?: boolean
}) {
  return (
    <div
      className={`
        flex items-center gap-4 px-6 py-4 rounded-xl mx-3
        font-bold transition-all duration-200 cursor-pointer
        ${active
          ? "bg-[#064e3b] text-[#b0f0d6]"
          : "text-[#95d3ba] hover:bg-[#064e3b]/20 hover:text-white"
        }
      `}
    >
      {typeof icon === "object" && icon?.type ? (
        icon
      ) : (
        <FontAwesomeIcon icon={icon} />
      )}
      <span className="text-sm font-bold">{label}</span>
    </div>
  )
}

// PAYMENT METHOD BADGE
function PaymentBadge({ method }: { method?: string }) {
  if (!method) return <span className="text-gray-400 text-xs">—</span>;
  const styles: Record<string, string> = {
    cash: "bg-[#b0f0d6]/30 text-[#003527]",
    gcash: "bg-[#ffddb8]/30 text-[#653e00]",
    pautang: "bg-[#ffdad6] text-[#ba1a1a]",
  };
  const icons: Record<string, string> = { cash: "💵", gcash: "📱", pautang: "📒" };
  const key = method.toLowerCase();
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ${styles[key] ?? "bg-gray-100 text-gray-600"}`}>
      {icons[key] ?? "💳"} {method}
    </span>
  );
}

export default function ReceiptsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [account, setAccount] = useState<any>(null);
  const [totalToday, setTotalToday] = useState(0);

  // Returns state
  const [returnsBySale, setReturnsBySale] = useState<Record<string, ReturnSummary[]>>({});
  const [totalReturnedToday, setTotalReturnedToday] = useState(0);
  const [totalReturnCount, setTotalReturnCount] = useState(0);

  // Expanded return details per row
  const [expandedReturns, setExpandedReturns] = useState<Record<string, boolean>>({});

  const [showReceipt, setShowReceipt] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // LOAD ACCOUNT
useEffect(() => {
  const load = async () => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const parsed = JSON.parse(stored);

    // 1. Get account first
    const { data: acc, error: accError } = await supabase
      .from("accounts")
      .select("role, employee_id, profile_image, full_name")
      .eq("id", parsed.id)
      .single();

    if (accError || !acc) {
      console.error(accError);
      return;
    }

    // store account
    setAccount({
      fullname: acc.full_name,
      role: acc.role,
      profileImage: acc.profile_image,
      employee_id: acc.employee_id,
    });

    // 2. Build sales query AFTER we already have acc
    let query = supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });

    // IMPORTANT: restrict only if NOT manager
    if (acc.role !== "manager") {
      query = query.eq("employee_id", acc.employee_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      return;
    }

    const rows = data || [];
    setSales(rows);

    // 3. today calculation (unchanged)
    const today = new Date().toDateString();

    const todayTotal = rows
      .filter((s) => new Date(s.created_at).toDateString() === today)
      .reduce((sum: number, s: any) => sum + (s.total || 0), 0);

    setTotalToday(todayTotal);
  };

  load();
}, []);

  // LOAD SALES
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("sales")
        .select("*")
        .order("created_at", { ascending: false });
      const rows = data || [];
      setSales(rows);
      const today = new Date().toDateString();
      const todayTotal = rows
        .filter((s) => new Date(s.created_at).toDateString() === today)
        .reduce((sum: number, s: any) => sum + (s.total || 0), 0);
      setTotalToday(todayTotal);
    };
    load();
  }, []);

  // LOAD ALL RETURNS (with items) so we can show indicators per sale
useEffect(() => {
  const load = async () => {
    const { data: returns } = await supabase
      .from("returns")
      .select(`
          id,
          sale_id,
          refund_total,
          reason,
          created_at,
          employee_id,
          accounts:employee_id (
            full_name
          ),
          return_items(
            product_name,
            qty,
            price,
            created_at
          )
        `)
      .order("created_at", { ascending: false });

    if (!returns) return;

    // =========================
    // GROUP BY SALE ID
    // =========================
    const grouped: Record<string, ReturnSummary[]> = {};

    returns.forEach((r: any) => {
      const key = String(r.sale_id);

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });

    setReturnsBySale(grouped);

    // =========================
    // TODAY RANGE
    // =========================
    const now = new Date();

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    // =========================
    // FLATTEN RETURN ITEMS
    // (IMPORTANT CHANGE)
    // =========================
      const todayReturns = returns.filter((r: any) => {
    if (!r.created_at) return false;
    const d = new Date(r.created_at);
    return d >= start && d <= end;
  });

// count ALL returned items today
    const todayItems = todayReturns.flatMap((r: any) =>
      (r.return_items || []).map((item: any) => ({
        qty: item.qty,
        price: item.price,
      }))
    );




    // =========================
    // UPDATE STATS
    // =========================
    setTotalReturnCount(todayItems.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0));

    setTotalReturnedToday(
      todayItems.reduce(
        (sum: number, item: any) =>
          sum + Number(item.price || 0) * Number(item.qty || 0),
        0
      )
    );
  };

  load();
}, []); 

  // VIEW RECEIPT
  const openReceipt = async (sale: Sale) => {
    setSelectedSale(sale);
    const { data } = await supabase.from("sale_items").select("*").eq("sale_id", sale.id);
    setItems(data || []);
    setShowReceipt(true);
  };

  // OPEN RETURN MODAL
  const openReturnModal = async (sale: Sale) => {
    setSelectedSale(sale);
    const { data } = await supabase.from("sale_items").select("*").eq("sale_id", sale.id);
    setItems(data || []);
    setShowReturnModal(true);
  };

  // SUBMIT RETURN
  const handleReturnSubmit = async ({
  selectedItems,
  reason,
  managerPassword,
}: {
  selectedItems: Record<string, any>;
  reason: string;
  managerPassword: string;
  total: number;
}) => {
  const saleId = String(selectedSale?.id);
  if (!saleId) {
    alert("No sale selected");
    return;
  }

  try {
    // 1. Validate manager
    const { data: managers } = await supabase
      .from("accounts")
      .select("employee_id, password")
      .in("role", ["admin", "manager"]);

    const valid = managers?.find((m) => m.password === managerPassword);
    if (!valid) {
      alert("Invalid manager password");
      return;
    }

    // 2. Compute refund
    let refund_total = 0;

    const returnItems = Object.values(selectedItems).map((item) => {
      const lineTotal = Number(item.price || 0) * Number(item.qty || 0);
      refund_total += lineTotal;

      return {
        product_name: item.product_name,
        barcode: item.barcode,
        price: Number(item.price || 0),
        qty: Number(item.qty || 0),
        category: item.category,
      };
    });

    // 3. Insert return
    const { data: returnRow, error: returnError } = await supabase
      .from("returns")
      .insert({
        sale_id: saleId,
        employee_id: account.employee_id,
        reason,
        refund_total,
        status: "pending",
      })
      .select()
      .single();

    if (returnError) throw returnError;

    // 4. Insert return items
    const { error: itemsError } =await supabase
  .from("return_items")
  .insert(
    returnItems.map((i) => ({
      return_id: returnRow.id,
      ...i,
      created_at: returnRow.created_at, // ✅ PASS THE RETURN TIME
    }))
  );

    if (itemsError) throw itemsError;

    // 5. Update / delete sale_items
    // for (const item of Object.values(selectedItems)) {
    //   const saleItem = items.find((i) => i.id === item.id);
    //   if (!saleItem) continue;

    //   const remainingQty =
    //     Number(saleItem.qty || 0) - Number(item.qty || 0);

    //   if (remainingQty <= 0) {
    //     await supabase
    //       .from("sale_items")
    //       .delete()
    //       .eq("id", saleItem.id);
    //   } else {
    //     await supabase
    //       .from("sale_items")
    //       .update({ qty: remainingQty })
    //       .eq("id", saleItem.id);
    //   }
    // }

    // 6. Restock inventory
    for (const item of returnItems) {
      if (!item.barcode) continue;

      const { data: product } = await supabase
        .from("products")
        .select("id, quantity")
        .eq("barcode", item.barcode)
        .single();

      if (product) {
        await supabase
          .from("products")
          .update({
            quantity: Number(product.quantity) + item.qty,
          })
          .eq("id", product.id);
      }
    }

    // 7. Update sale totals
    const { data: freshSale } = await supabase
      .from("sales")
      .select("id, total, subtotal")
      .eq("id", saleId)
      .single();

    const newTotal = Math.max(
      0,
      Number(freshSale?.total || 0) - refund_total
    );

    const newSubtotal = Math.max(
      0,
      Number(freshSale?.subtotal || 0) - refund_total
    );

    const { data: updatedSale } = await supabase
      .from("sales")
      .update({
        total: newTotal,
        subtotal: newSubtotal,
      })
      .eq("id", saleId)
      .select()
      .single();

    // 8. Update sales UI
    setSales((prev) =>
      prev.map((s) =>
        String(s.id) === saleId ? { ...s, total: updatedSale?.total } : s
      )
    );

    // 9. Update returns UI (FIXED)
    const newReturn: ReturnSummary = {
      id: returnRow.id,
      sale_id: saleId,
      refund_total,
      reason,
      created_at: returnRow.created_at,
      employee_id: valid.employee_id,
      accounts: {
        full_name: account?.fullname || "Unknown",
      },
      return_items: returnItems.map(i => ({
        product_name: i.product_name,
        qty: i.qty,
        price: i.price,
      }))
    };

    setReturnsBySale((prev) => {
      const updated = { ...prev };
      updated[saleId] = [...(updated[saleId] || []), newReturn];
      return updated;
    });

    // ✅ IMPORTANT: update summary cards instantly
    setTotalReturnCount((prev) => prev + 1);

    const now = new Date();

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const created = new Date(returnRow.created_at);

    const isToday = created >= start && created <= end;

    if (isToday) {
      setTotalReturnedToday((prev) => prev + refund_total);
    }

    // 10. Close modal
    setShowReturnModal(false);

    alert(`Return processed! ₱${refund_total.toFixed(2)} deducted.`);
  } catch (err: any) {
    alert(err.message);
  }
};

const approveReturn = async (returnId: string) => {
  // 1. get return + items
  const { data: ret } = await supabase
    .from("returns")
    .select("*, return_items(*)")
    .eq("id", returnId)
    .single();

  if (!ret) return;

  // 2. restock products
  for (const item of ret.return_items) {
    const { data: product } = await supabase
      .from("products")
      .select("id, quantity, category")
      .eq("name", item.product_name)
      .single();

    if (product) {
      await supabase
        .from("products")
        .update({
          quantity: Number(product.quantity) + item.qty,
          category: "return" // ✅ mark category
        })
        .eq("id", product.id);
    }
  }

  // 3. mark return as approved
  await supabase
    .from("returns")
    .update({ status: "approved" })
    .eq("id", returnId);
};
  const todayCount = sales.filter(
    (s) => new Date(s.created_at).toDateString() === new Date().toDateString()
  ).length;

  const filtered = sales.filter((s) =>
    s.id?.slice(-6).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9ff]">

      <div className="md:hidden fixed top-0 left-0 right-0 flex justify-between items-center bg-[#003527] text-white p-4 z-50">
        <h1 className="text-xl font-bold text-[#FFB900]">Tory POS</h1>
        <button onClick={() => setOpen(!open)}>
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
      
      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static top-0 left-0
          h-screen w-64 bg-[#003527] text-white
          flex flex-col overflow-hidden
          transform transition-transform duration-300 z-40
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="pl-4 pt-16 md:pt-6">
          <h1 className="text-5xl font-bold text-[#FFB900]">Tory</h1>
          <p className="text-sm">POS SYSTEM</p>
        </div>

        <nav className="flex flex-col gap-2 mt-6 px-4">

          {account?.role === "admin" && (
            <Link href="/adminDashboard">
              <NavItem icon={faCashRegister} label="Dashboard" />
            </Link>
          )}

          {account?.role === "manager" && (
            <Link href="/managerDashboard">
              <NavItem icon={faCashRegister} label="Dashboard" />
            </Link>
          )}


             {(account?.role === "cashier" || account?.role === "manager") && (
                <Link href="/ScannerPage">
                  <NavItem icon={faCashRegister} label="Cashier" />
                </Link>
              )}


          <Link href="/inventoryPage">
            <NavItem icon={faBoxesStacked} label="Inventory" />
          </Link>

          {account?.role === "admin" && (
             <Link href="/analyticsPage">
              <NavItem icon={<HistoryEduIcon />} label="Analytics" />
            </Link>
          )}
          
        {(account?.role === "manager" || account?.role === "admin") && (
          <Link href="/employee">
            <NavItem icon={faAddressBook} label="Employee"  />
          </Link>
        )}

          {account?.role === "manager" && (
          <Link href="/logsPage">
            <NavItem icon={<StickyNote2Icon/>} label="Logs"/>
          </Link>
          )}

          <Link href="/recieptPage">
            <NavItem icon={<ReceiptIcon/>} label="Reciept" active />
          </Link>

          <Link href="/utang">
            <NavItem icon={<HistoryEduIcon />} label="Utang" />
          </Link>

          <Link href="/profile">
            <NavItem icon={faCircleUser} label="Users" />
          </Link>
        </nav>

          <div className="mt-auto p-4">
            <div className="flex items-center gap-3 border rounded-xl p-2">
              <img
                src={account?.profileImage}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-sm">
                  {account?.fullname || "Loading..."}
                </p>
                <p className="text-sm text-[#FFB900]">{account?.role}</p>
              </div>
            </div>
          </div>
      </aside>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* TOP APP BAR */}
        <header className="w-full sticky top-0 z-30 flex items-center justify-between px-6 h-16 bg-white border-b border-[#bfc9c3]/30 shadow-sm shrink-0">
          <div className="relative w-full max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707974] text-sm">🔍</span>
            <input
              className="w-full pl-9 pr-4 py-2 bg-[#e5eeff] border-none rounded-full text-sm focus:ring-2 focus:ring-[#003527]/20 outline-none transition-all"
              placeholder="Search transactions, receipts, or items..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* <div className="flex items-center gap-3 ml-4">
            <button className="w-10 h-10 flex items-center justify-center text-[#707974] hover:text-[#003527] hover:bg-[#e5eeff] rounded-full transition-all">🔔</button>
            <button className="w-10 h-10 flex items-center justify-center text-[#707974] hover:text-[#003527] hover:bg-[#e5eeff] rounded-full transition-all">⚙️</button>
          </div> */}
        </header>

        {/* SCROLLABLE CANVAS */}
        <div className="flex-1 overflow-y-auto p-8 pt-6">

          {/* PAGE HEADING + SUMMARY CARDS */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#003527]">Sales Receipts</h2>
              <p className="text-[#404944] mt-1">History of all transactions processed.</p>
            </div>

            <div className="flex gap-4 flex-wrap">


              {/* Returns Today */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#ffdad6] flex items-center gap-4 min-w-45">
                <div className="w-12 h-12 rounded-xl bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a] text-2xl">↩️</div>
                <div>
                  <p className="text-[11px] text-[#707974] uppercase tracking-wider font-semibold">Returns Today</p>
                  <p className="text-xl font-bold text-[#ba1a1a]">
                    {totalReturnCount} <span className="text-sm font-normal text-[#707974]">returns</span>
                  </p>
                  <p className="text-xs text-[#ba1a1a] font-semibold">
                    –₱{totalReturnedToday.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#bfc9c3]/30 mb-6">
            <div className="flex flex-col lg:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707974] text-sm">🧾</span>
                <input
                  className="w-full pl-11 pr-4 py-3 bg-[#f8f9ff] border border-[#bfc9c3] rounded-xl text-sm focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 outline-none transition-all"
                  placeholder="Search by Receipt ID (e.g. #abc123)"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                {/* <button className="px-4 py-3 bg-[#003527] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all">Today</button>
                <button className="px-4 py-3 bg-[#f8f9ff] border border-[#bfc9c3] text-[#404944] rounded-xl text-sm font-bold hover:bg-[#e5eeff] transition-all">Yesterday</button>
                <button className="px-4 py-3 bg-[#f8f9ff] border border-[#bfc9c3] text-[#404944] rounded-xl text-sm font-bold hover:bg-[#e5eeff] transition-all">Last 7 Days</button> */}
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#bfc9c3]/30 overflow-hidden mb-8">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#eef4ff] text-[#404944] uppercase text-[12px] tracking-wider font-semibold">
                <tr>
                  <th className="px-8 py-5">Receipt ID</th>
                  <th className="px-6 py-5">Date &amp; Time</th>
                  <th className="px-6 py-5">Payment</th>
                  <th className="px-6 py-5">Returns</th>
                  <th className="px-6 py-5 text-right">Total Amount</th>
                  <th className="px-8 py-5 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((s) => {
                  const saleReturns = returnsBySale[String(s.id)] || [];
                  const hasReturns = saleReturns.length > 0;
                  const totalReturnedForSale = saleReturns.reduce(
                    (sum, r) => sum + Number(r.refund_total || 0), 0
                  );
                  const returnedItemCount = saleReturns.reduce(
                    (sum, r) => sum + r.return_items.reduce((s2, i) => s2 + Number(i.qty || 0), 0), 0
                  );
                  const isExpanded = expandedReturns[s.id];

                  return (
                    <React.Fragment key={s.id}>
                      <tr
                        key={s.id}
                        className={`hover:bg-[#f8f9ff] transition-colors cursor-pointer border-t border-[#bfc9c3]/20 ${
                          hasReturns ? "bg-[#fff8f8]" : ""
                        }`}
                      >
                        {/* RECEIPT ID */}
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#003527]">
                              #{s.id.slice(-6).toUpperCase()}
                            </span>
                            {hasReturns && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold">
                                ↩ {saleReturns.length} return{saleReturns.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* DATE */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">
                              {new Date(s.created_at).toLocaleDateString("en-PH", {
                                month: "short", day: "numeric", year: "numeric",
                              })}
                            </span>
                            <span className="text-xs text-[#707974]">
                              {new Date(s.created_at).toLocaleTimeString("en-PH", {
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </td>

                        {/* PAYMENT */}
                        <td className="px-6 py-4">
                          <PaymentBadge method={s.payment_method} />
                        </td>

                        {/* RETURNS COLUMN */}
                        <td className="px-6 py-4">
                          {hasReturns ? (
                            <button
                              onClick={() =>
                                setExpandedReturns((prev) => ({
                                  ...prev,
                                  [s.id]: !prev[s.id],
                                }))
                              }
                              className="flex flex-col items-start gap-0.5 group"
                            >
                              <span className="text-xs font-bold text-[#ba1a1a]">
                                {returnedItemCount} item{returnedItemCount > 1 ? "s" : ""} returned
                              </span>
                              <span className="text-[11px] text-[#707974]">
                                –₱{totalReturnedForSale.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-[10px] text-[#003527] underline group-hover:no-underline">
                                {isExpanded ? "▲ hide" : "▼ details"}
                              </span>
                            </button>
                          ) : (
                            <span className="text-xs text-[#bfc9c3]">—</span>
                          )}
                        </td>

                        {/* TOTAL */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-[#003527]">
                              ₱{Number(s.total).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </span>
                            {hasReturns && (
                              <span className="text-[11px] text-[#ba1a1a] font-semibold">
                                after return
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-8 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openReceipt(s)}
                              className="p-2 hover:bg-[#e5eeff] rounded-full text-[#707974] hover:text-[#003527] transition-all"
                              title="View Receipt"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => openReturnModal(s)}
                              className="px-3 py-1.5 bg-[#ffdad6] text-[#ba1a1a] rounded-lg text-xs font-bold hover:opacity-80 transition-all"
                            >
                              Return
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* EXPANDED RETURN DETAILS */}
                      {isExpanded && saleReturns.map((ret) => (
                        <tr key={ret.id} className="bg-[#fff4f4]">
                          <td colSpan={6} className="px-10 py-3">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="text-xs font-bold text-[#003527]">
                                    Processed by: {ret.accounts?.full_name || "Unknown"}
                                  </p>
                                  <p className="text-[11px] text-[#707974]">
                                    Employee ID: {ret.employee_id}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wider">
                                  Return — {new Date(ret.created_at).toLocaleString("en-PH", {
                                    month: "short", day: "numeric",
                                    hour: "2-digit", minute: "2-digit",
                                  })}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-semibold">
                                  {ret.reason}
                                </span>
                                <span className="text-xs font-bold text-[#ba1a1a] ml-auto">
                                  Refund: –₱{Number(ret.refund_total).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {ret.return_items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 bg-white border border-[#ffdad6] rounded-xl px-3 py-2"
                                  >
                                    <span className="text-sm">↩️</span>
                                    <div>
                                      <p className="text-xs font-bold text-[#121c28]">{item.product_name}</p>
                                      <p className="text-[11px] text-[#707974]">
                                        Qty: {item.qty} × ₱{Number(item.price).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-[#707974]">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="px-8 py-5 bg-[#eef4ff] flex items-center justify-between border-t border-[#bfc9c3]/20">
              <p className="text-xs text-[#707974]">
                Showing {filtered.length} of {sales.length} transactions
              </p>
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#bfc9c3] text-[#707974] hover:bg-white transition-all text-sm">‹</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#003527] text-white font-bold text-xs">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#bfc9c3] text-[#404944] hover:bg-white transition-all text-xs">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#bfc9c3] text-[#707974] hover:bg-white transition-all text-sm">›</button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* MODALS */}
      <ReceiptModal
        open={showReceipt}
        sale={selectedSale}
        items={items}
        onClose={() => setShowReceipt(false)}
      />
      <ReturnModal
        open={showReturnModal}
        sale={selectedSale}
        items={items}
        onClose={() => setShowReturnModal(false)}
        onSubmit={handleReturnSubmit}
      />
    </div>
  );
}