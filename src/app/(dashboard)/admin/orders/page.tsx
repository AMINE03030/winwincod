"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import type { OrderStatus } from "@/lib/store";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { formatMAD } from "@/lib/utils";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Status filter chips ──────────────────────────────────────────────────────

type StatusFilter = "ALL" | OrderStatus;

const STATUS_CHIPS: { key: StatusFilter; label: string }[] = [
  { key: "ALL",             label: "الكل" },
  { key: "PENDING_BALANCE", label: "رصيد غير كافٍ" },
  { key: "PENDING_CONFIRM", label: "في انتظار التأكيد" },
  { key: "READY_TO_SHIP",   label: "جاهز للشحن" },
  { key: "SHIPPED",         label: "تم الشحن" },
  { key: "DELIVERED",       label: "تم التسليم" },
  { key: "CANCELLED",       label: "ملغي" },
  { key: "NO_ANSWER",       label: "لا يرد" },
];

const STATUS_COLORS: Record<StatusFilter, { bg: string; text: string; border: string }> = {
  ALL:             { bg: "#4361EE", text: "#fff",    border: "#4361EE" },
  PENDING_BALANCE: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  PENDING_CONFIRM: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  READY_TO_SHIP:   { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  SHIPPED:         { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  DELIVERED:       { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
  CANCELLED:       { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  NO_ANSWER:       { bg: "#F8FAFC", text: "#64748B", border: "#CBD5E1" },
};

const PAGE_SIZE = 15;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const { sellers, orders } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sellerFilter, setSellerFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [page, setPage] = useState(1);

  const sellerList = sellers.filter((s) => s.role === "SELLER");
  const cities = useMemo(
    () => [...new Set(orders.map((o) => o.city))].sort(),
    [orders]
  );

  const filtered = useMemo(() => {
    setPage(1);
    return [...orders].reverse().filter((o) => {
      const matchSearch =
        !search ||
        o.orderId.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.includes(search) ||
        o.customerPhone.includes(search);
      const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
      const matchSeller = !sellerFilter || o.sellerId === sellerFilter;
      const matchCity = !cityFilter || o.city === cityFilter;
      return matchSearch && matchStatus && matchSeller && matchCity;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, search, statusFilter, sellerFilter, cityFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const countByStatus = useMemo(() => {
    const c: Record<string, number> = {};
    orders.forEach((o) => { c[o.status] = (c[o.status] ?? 0) + 1; });
    return c;
  }, [orders]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setSellerFilter("");
    setCityFilter("");
  }

  const hasActiveFilters = search || statusFilter !== "ALL" || sellerFilter || cityFilter;

  return (
    <div className="p-6 space-y-5 animate-fadeIn">
      {/* Filters bar */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-56 max-w-xs">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="بحث برقم الطلب أو اسم العميل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-9 pl-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE] bg-white"
            />
          </div>

          {/* Seller */}
          <select
            value={sellerFilter}
            onChange={(e) => setSellerFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 bg-white">
            <option value="">كل البائعين</option>
            {sellerList.map((s) => (
              <option key={s.sellerId} value={s.sellerId}>{s.name}</option>
            ))}
          </select>

          {/* City */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 bg-white">
            <option value="">كل المدن</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#DC2626] border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] transition-all">
              <X className="w-3.5 h-3.5" />
              مسح الفلاتر
            </button>
          )}
        </div>

        {/* Status chips */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_CHIPS.map(({ key, label }) => {
            const count = key === "ALL" ? orders.length : (countByStatus[key] ?? 0);
            const active = statusFilter === key;
            const colors = STATUS_COLORS[key];
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5"
                style={
                  active
                    ? { background: key === "ALL" ? "#4361EE" : colors.bg, color: key === "ALL" ? "#fff" : colors.text, borderColor: colors.border, fontWeight: 700 }
                    : { background: "#fff", color: "#64748B", borderColor: "#E2E8F0" }
                }>
                {label}
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="card card-primary overflow-hidden">
        <div className="px-5 py-3 border-b border-[#F1F5F9] flex items-center justify-between"
          style={{ background: "#F8FAFC" }}>
          <p className="text-xs font-semibold text-[#64748B]">
            {filtered.length} طلب — صفحة {page} من {Math.max(1, totalPages)}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                {["رقم الطلب", "البائع", "العميل", "الهاتف", "المدينة", "المنتج", "الكمية", "التكلفة", "الحالة", "التاريخ"].map((h) => (
                  <th key={h} className="py-3 px-4 text-right text-xs font-semibold text-[#94A3B8] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {paginated.map((o) => {
                const seller = sellers.find((s) => s.sellerId === o.sellerId);
                return (
                  <tr key={o.orderId} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-xs" style={{ color: "#4361EE" }}>
                      {o.orderId}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <p className="font-semibold text-[#1E293B] whitespace-nowrap">{seller?.name ?? o.sellerId}</p>
                      <p className="text-[#94A3B8] font-mono">{o.sellerId}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#1E293B] whitespace-nowrap">{o.customerName}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-[#64748B]" dir="ltr">{o.customerPhone}</span>
                    </td>
                    <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">{o.city}</td>
                    <td className="py-3 px-4 text-[#64748B] max-w-36 truncate">{o.productTitle}</td>
                    <td className="py-3 px-4 text-center font-semibold text-[#1E293B]">{o.quantity}</td>
                    <td className="py-3 px-4 font-bold text-sm" style={{ color: "#FB923C" }}>
                      {formatMAD(o.totalCost)}
                    </td>
                    <td className="py-3 px-4">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">{o.createdAt}</td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-sm text-[#94A3B8]">
                    لا توجد طلبات مطابقة للفلاتر المحددة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[#F1F5F9] flex items-center justify-between"
            style={{ background: "#F8FAFC" }}>
            <p className="text-xs text-[#64748B]">
              عرض {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} من {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-white transition-all disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all border"
                  style={
                    p === page
                      ? { background: "#4361EE", color: "#fff", borderColor: "#4361EE" }
                      : { background: "#fff", color: "#64748B", borderColor: "#E2E8F0" }
                  }>
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-white transition-all disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
