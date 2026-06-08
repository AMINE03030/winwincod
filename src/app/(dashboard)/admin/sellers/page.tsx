"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useStore } from "@/lib/store";
import type { MockSeller } from "@/lib/store";
import { formatMAD } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/Badge";
import {
  Search, Eye, Lock, Unlock, CircleDollarSign, X,
  TrendingUp, ShoppingCart, Wallet, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle,
} from "lucide-react";

// ── Slide-Over Panel ──────────────────────────────────────────────────────────

function SellerSlideOver({
  seller,
  onClose,
}: {
  seller: MockSeller;
  onClose: () => void;
}) {
  const t = useTranslations("AdminSellers");
  const { orders, transactions, blockSeller, unblockSeller, adjustBalance } = useStore();
  const [adjustMode, setAdjustMode] = useState(false);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const sellerOrders = orders.filter((o) => o.sellerId === seller.sellerId);
  const sellerTxs = transactions
    .filter((tx) => tx.sellerId === seller.sellerId)
    .slice()
    .reverse()
    .slice(0, 5);
  const lastFiveOrders = [...sellerOrders].reverse().slice(0, 5);
  const delivered = sellerOrders.filter((o) => o.status === "DELIVERED").length;
  const deliveryRate = sellerOrders.length > 0 ? Math.round((delivered / sellerOrders.length) * 100) : 0;

  const txTypeLabel: Record<string, string> = {
    DEPOSIT: t("txDeposit"), DEDUCTION: t("txDeduction"),
    PAYOUT: t("txPayout"),   REFUND: t("txRefund"),
  };
  const txTypeColor: Record<string, string> = {
    DEPOSIT: "#16A34A", DEDUCTION: "#DC2626", PAYOUT: "#FB923C", REFUND: "#4361EE",
  };

  async function handleBlock() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    seller.blocked ? unblockSeller(seller.sellerId) : blockSeller(seller.sellerId);
    setLoading(false);
    toast.success(seller.blocked ? t("toastActivated") : t("toastSuspended"));
  }

  async function handleAdjust() {
    const val = parseFloat(amount);
    if (isNaN(val) || val === 0) { toast.error(t("toastInvalidAmount")); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    adjustBalance(seller.sellerId, val, desc || undefined!);
    setLoading(false);
    setAdjustMode(false);
    setAmount("");
    setDesc("");
    toast.success(val > 0
      ? t("toastAddedAmount", { amount: formatMAD(val) })
      : t("toastDeductedAmount", { amount: formatMAD(Math.abs(val)) }));
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] animate-backdropIn"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 left-0 h-full w-[420px] z-[70] flex flex-col overflow-hidden animate-slideIn"
        style={{ background: "#FFFFFF", boxShadow: "-4px 0 40px rgba(0,0,0,0.12)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]"
          style={{ background: "#F8FAFC" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold"
              style={{ background: "#4361EE", color: "#fff" }}>
              {seller.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-[#1E293B]">{seller.name}</p>
              <p className="text-xs font-mono text-[#64748B]">{seller.sellerId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              seller.blocked
                ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                : "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]"
            }`}>
              {seller.blocked ? t("filterBlocked") : t("filterActive")}
            </span>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#E2E8F0] transition-colors text-[#64748B]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-x-reverse divide-[#E2E8F0] border-b border-[#E2E8F0]">
            {[
              { icon: Wallet,       label: t("balance"),       value: formatMAD(seller.walletBalance), color: "#4361EE" },
              { icon: ShoppingCart, label: t("ordersLabel"),   value: String(sellerOrders.length),     color: "#C2410C" },
              { icon: TrendingUp,   label: t("deliveryLabel"), value: `${deliveryRate}%`,              color: "#16A34A" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col items-center py-4 px-2 gap-1">
                <Icon className="w-4 h-4" style={{ color }} />
                <p className="text-base font-black text-[#1E293B]">{value}</p>
                <p className="text-[10px] text-[#94A3B8]">{label}</p>
              </div>
            ))}
          </div>

          <div className="p-5 space-y-5">
            {/* Contact info */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">{t("contactInfo")}</p>
              <div className="p-3 rounded-xl border border-[#E2E8F0] space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">{t("email")}</span>
                  <span className="font-medium text-[#1E293B]">{seller.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">{t("phone")}</span>
                  <span className="font-mono font-medium text-[#1E293B]">{seller.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">{t("joinDate")}</span>
                  <span className="font-medium text-[#1E293B]">{seller.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Last 5 orders */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">{t("lastOrders")}</p>
              {lastFiveOrders.length === 0 ? (
                <p className="text-xs text-[#94A3B8] text-center py-4">{t("noOrdersYet")}</p>
              ) : (
                <div className="space-y-1.5">
                  {lastFiveOrders.map((o) => (
                    <div key={o.orderId}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-[#F1F5F9] hover:border-[#E2E8F0] transition-colors">
                      <div>
                        <p className="font-mono text-[10px] font-bold" style={{ color: "#4361EE" }}>{o.orderId}</p>
                        <p className="text-xs text-[#1E293B] font-medium">{o.customerName}</p>
                        <p className="text-[10px] text-[#94A3B8]">{o.city} · {o.createdAt.slice(0, 10)}</p>
                      </div>
                      <OrderStatusBadge status={o.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Last 5 transactions */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">{t("lastTxs")}</p>
              {sellerTxs.length === 0 ? (
                <p className="text-xs text-[#94A3B8] text-center py-4">{t("noTxsYet")}</p>
              ) : (
                <div className="space-y-1.5">
                  {sellerTxs.map((tx) => (
                    <div key={tx.transactionId}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-[#F1F5F9]">
                      <div>
                        <p className="font-mono text-[10px] font-bold text-[#64748B]">{tx.transactionId}</p>
                        <p className="text-xs text-[#64748B]">{tx.description}</p>
                        <p className="text-[10px] text-[#94A3B8]">{tx.createdAt.slice(0, 10)}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold" style={{ color: txTypeColor[tx.type] }}>
                          {tx.type === "DEDUCTION" ? "-" : "+"}{formatMAD(tx.amount)}
                        </p>
                        <p className="text-[10px] text-[#94A3B8]">{txTypeLabel[tx.type]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Balance adjust */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">{t("adjustBalance")}</p>
              {!adjustMode ? (
                <button
                  onClick={() => setAdjustMode(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all hover:opacity-90"
                  style={{ borderColor: "#FB923C", color: "#FB923C", background: "#FFF7ED" }}>
                  <CircleDollarSign className="w-4 h-4" />
                  {t("adjustWallet")}
                </button>
              ) : (
                <div className="p-3 rounded-xl border border-[#E2E8F0] space-y-2.5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAmount((v) => (parseFloat(v) > 0 ? String(parseFloat(v)) : "100"))}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 flex items-center gap-1 transition-all"
                      style={{ borderColor: "#16A34A", color: "#16A34A", background: "#F0FDF4" }}>
                      <CheckCircle2 className="w-3 h-3" /> {t("add")}
                    </button>
                    <button
                      onClick={() => setAmount((v) => (parseFloat(v) > 0 ? String(-parseFloat(v)) : "-100"))}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 flex items-center gap-1 transition-all"
                      style={{ borderColor: "#DC2626", color: "#DC2626", background: "#FEF2F2" }}>
                      <XCircle className="w-3 h-3" /> {t("deduct")}
                    </button>
                  </div>
                  <input
                    type="number"
                    placeholder={t("amountPlaceholder")}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:ring-2"
                    style={{ background: "#F8FAFC" }}
                  />
                  <input
                    type="text"
                    placeholder={t("reasonPlaceholder")}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:ring-2"
                    style={{ background: "#F8FAFC" }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAdjust}
                      disabled={loading}
                      className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
                      style={{ background: "#4361EE" }}>
                      {loading ? t("applying") : t("applyBtn")}
                    </button>
                    <button
                      onClick={() => { setAdjustMode(false); setAmount(""); setDesc(""); }}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all">
                      {t("cancelBtn")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-[#E2E8F0] flex gap-2" style={{ background: "#F8FAFC" }}>
          <button
            onClick={handleBlock}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition-all disabled:opacity-50"
            style={
              seller.blocked
                ? { borderColor: "#16A34A", color: "#16A34A", background: "#F0FDF4" }
                : { borderColor: "#DC2626", color: "#DC2626", background: "#FEF2F2" }
            }>
            {seller.blocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {seller.blocked ? t("activate") : t("suspend")}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type FilterType = "all" | "active" | "blocked";

export default function AdminSellersPage() {
  const t = useTranslations("AdminSellers");
  const { sellers, orders } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sellerList = sellers.filter((s) => s.role === "SELLER");

  const FILTER_LABELS: Record<FilterType, string> = {
    all: t("filterAll"), active: t("filterActive"), blocked: t("filterBlocked"),
  };

  const colHeaders = [
    t("colSeller"), t("colId"), t("colBalance"),
    t("colOrders"), t("colDelivery"), t("colStatus"), t("colActions"),
  ];

  const filtered = useMemo(() => {
    return sellerList.filter((s) => {
      const matchSearch =
        !search ||
        s.name.includes(search) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.sellerId.includes(search);
      const matchFilter =
        filter === "all" ||
        (filter === "active" && !s.blocked) ||
        (filter === "blocked" && s.blocked);
      return matchSearch && matchFilter;
    });
  }, [sellerList, search, filter]);

  const selectedSeller = selectedId ? sellers.find((s) => s.sellerId === selectedId) : null;

  const counts = {
    all: sellerList.length,
    active: sellerList.filter((s) => !s.blocked).length,
    blocked: sellerList.filter((s) => s.blocked).length,
  };

  return (
    <div className="p-6 space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-56 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE] bg-white"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5">
          {(["all", "active", "blocked"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
              style={
                filter === f
                  ? { background: "#4361EE", color: "#fff", borderColor: "#4361EE" }
                  : { background: "#fff", color: "#64748B", borderColor: "#E2E8F0" }
              }>
              {FILTER_LABELS[f]} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card card-primary overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F1F5F9]" style={{ background: "#F8FAFC" }}>
                {colHeaders.map((h) => (
                  <th key={h} className="py-3 px-4 text-right text-xs font-semibold text-[#94A3B8] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {filtered.map((s) => {
                const sellerOrders = orders.filter((o) => o.sellerId === s.sellerId);
                const delivered = sellerOrders.filter((o) => o.status === "DELIVERED").length;
                const rate = sellerOrders.length > 0 ? Math.round((delivered / sellerOrders.length) * 100) : 0;
                return (
                  <tr key={s.sellerId} className="hover:bg-[#F8FAFC] transition-colors">
                    {/* Avatar + name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: s.blocked ? "#F1F5F9" : "#EEF2FF", color: s.blocked ? "#94A3B8" : "#4361EE" }}>
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1E293B] whitespace-nowrap">{s.name}</p>
                          <p className="text-xs text-[#94A3B8]">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-bold" style={{ color: "#4361EE" }}>
                      {s.sellerId}
                    </td>
                    <td className="py-3 px-4 font-bold text-sm" style={{ color: "#FB923C" }}>
                      {formatMAD(s.walletBalance)}
                    </td>
                    <td className="py-3 px-4 text-[#1E293B] font-semibold text-center">
                      {sellerOrders.length}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        rate >= 60 ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-[#FEF2F2] text-[#DC2626]"
                      }`}>
                        {rate}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        s.blocked
                          ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                          : "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]"
                      }`}>
                        {s.blocked ? t("filterBlocked") : t("filterActive")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedId(s.sellerId)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#4361EE] hover:border-[#4361EE] hover:bg-[#EEF2FF] transition-all">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedId(s.sellerId)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#DC2626] hover:border-[#DC2626] hover:bg-[#FEF2F2] transition-all">
                          {s.blocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setSelectedId(s.sellerId)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#FB923C] hover:border-[#FB923C] hover:bg-[#FFF7ED] transition-all">
                          <CircleDollarSign className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#94A3B8]">
                    {t("noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-5 py-3 border-t border-[#F1F5F9] flex items-center justify-between"
          style={{ background: "#F8FAFC" }}>
          <p className="text-xs text-[#64748B]">
            {filtered.length} {t("from")} {sellerList.length} {t("seller")}
          </p>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-white transition-all disabled:opacity-30" disabled>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: "#4361EE", color: "#fff" }}>
              1
            </span>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-white transition-all disabled:opacity-30" disabled>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over */}
      {selectedSeller && (
        <SellerSlideOver seller={selectedSeller} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
