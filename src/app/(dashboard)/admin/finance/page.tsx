"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useStore } from "@/lib/store";
import type { MockTransaction } from "@/lib/store";
import { formatMAD } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { TransactionStatusBadge } from "@/components/ui/Badge";
import {
  CheckCircle2, XCircle, Eye, Download, Search, Filter,
  Banknote, ArrowUpCircle, List,
} from "lucide-react";

// ─── CSV Export ───────────────────────────────────────────────────────────────

function exportCSV(txs: MockTransaction[], sellerMap: Map<string, string>) {
  const header = ["الرقم", "البائع", "النوع", "المبلغ (درهم)", "الحالة", "الوصف", "التاريخ"];
  const typeLabel: Record<string, string> = {
    DEPOSIT: "إيداع", DEDUCTION: "خصم", PAYOUT: "صرف", REFUND: "استرداد",
  };
  const statusLabel: Record<string, string> = {
    PENDING: "معلق", APPROVED: "معتمد", REJECTED: "مرفوض",
  };
  const rows = txs.map((t) => [
    t.transactionId,
    sellerMap.get(t.sellerId) ?? t.sellerId,
    typeLabel[t.type] ?? t.type,
    t.amount,
    statusLabel[t.status] ?? t.status,
    t.description,
    t.createdAt,
  ].map(String).join(","));

  const csv = "﻿" + [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `winwincod-transactions-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("تم تصدير الملف");
}

// ─── Tab: Deposit Requests ────────────────────────────────────────────────────

function DepositsTab() {
  const { sellers, getPendingDeposits, approveDeposit, rejectDeposit } = useStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const pending = getPendingDeposits();

  async function handleApprove(id: string) {
    setLoadingId(id);
    await new Promise((r) => setTimeout(r, 700));
    approveDeposit(id);
    setLoadingId(null);
    toast.success("تمت الموافقة على الإيداع وإضافة الرصيد");
  }

  async function handleReject(id: string) {
    setLoadingId(id);
    await new Promise((r) => setTimeout(r, 400));
    rejectDeposit(id);
    setLoadingId(null);
    toast.error("تم رفض طلب الإيداع");
  }

  return (
    <div className="space-y-4">
      {pending.length === 0 ? (
        <div className="card p-16 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: "#16A34A" }} />
          <h3 className="text-lg font-bold text-[#1E293B] mb-1">لا توجد إيداعات معلقة</h3>
          <p className="text-sm text-[#64748B]">تمت معالجة جميع طلبات الإيداع</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((t) => {
            const seller = sellers.find((s) => s.sellerId === t.sellerId);
            const isLoad = loadingId === t.transactionId;
            return (
              <div key={t.transactionId} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Seller avatar */}
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm"
                    style={{ background: "#EEF2FF", color: "#4361EE" }}>
                    {seller?.name.charAt(0) ?? "?"}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-[#1E293B]">{seller?.name ?? t.sellerId}</p>
                        <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                          {t.sellerId} · {t.transactionId}
                        </p>
                        <p className="text-xs text-[#64748B] mt-1">{t.createdAt}</p>
                        {t.receiptFileName && (
                          <p className="text-xs text-[#4361EE] mt-1 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            وصل: {t.receiptFileName}
                          </p>
                        )}
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="text-2xl font-black" style={{ color: "#16A34A" }}>
                          {formatMAD(t.amount)}
                        </p>
                        <TransactionStatusBadge status="PENDING" className="mt-1" />
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs text-[#64748B] hover:text-[#4361EE] hover:border-[#4361EE] transition-all bg-white">
                        <Eye className="w-3.5 h-3.5" /> عرض الوصل
                      </button>
                      <Button variant="success" size="sm" loading={isLoad}
                        onClick={() => handleApprove(t.transactionId)} className="flex-1 gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> موافقة
                      </Button>
                      <Button variant="danger" size="sm" disabled={isLoad}
                        onClick={() => handleReject(t.transactionId)} className="gap-1">
                        <XCircle className="w-3.5 h-3.5" /> رفض
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Withdrawal Requests ─────────────────────────────────────────────────

function WithdrawalsTab() {
  const { sellers, withdrawalRequests, approveWithdrawal, rejectWithdrawal } = useStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handlePay(id: string) {
    setLoadingId(id);
    await new Promise((r) => setTimeout(r, 700));
    approveWithdrawal(id);
    setLoadingId(null);
    toast.success("تم تسجيل الدفع وخصم الرصيد");
  }

  async function handleReject(id: string) {
    setLoadingId(id);
    await new Promise((r) => setTimeout(r, 400));
    rejectWithdrawal(id);
    setLoadingId(null);
    toast.error("تم رفض طلب السحب");
  }

  const statusColor: Record<string, { bg: string; text: string; border: string }> = {
    PENDING:  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    PAID:     { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
    REJECTED: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  };
  const statusLabel: Record<string, string> = {
    PENDING: "معلق", PAID: "مدفوع", REJECTED: "مرفوض",
  };

  return (
    <div className="card card-financial overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#F1F5F9]" style={{ background: "#F8FAFC" }}>
              {["الطلب", "البائع", "المبلغ", "البنك", "رقم الحساب", "التاريخ", "الحالة", "إجراء"].map((h) => (
                <th key={h} className="py-3 px-4 text-right text-xs font-semibold text-[#94A3B8] whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {withdrawalRequests.map((r) => {
              const seller = sellers.find((s) => s.sellerId === r.sellerId);
              const isLoad = loadingId === r.requestId;
              const sc = statusColor[r.status];
              return (
                <tr key={r.requestId} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 font-mono text-xs font-bold" style={{ color: "#4361EE" }}>
                    {r.requestId}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-[#1E293B] whitespace-nowrap">{seller?.name ?? r.sellerId}</p>
                    <p className="text-xs text-[#94A3B8]">{r.sellerId}</p>
                  </td>
                  <td className="py-3 px-4 font-black text-base" style={{ color: "#16A34A" }}>
                    {formatMAD(r.amount)}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#64748B] whitespace-nowrap">{r.bankName}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs text-[#1E293B]" dir="ltr">{r.bankAccount}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">{r.createdAt}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}>
                      {statusLabel[r.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {r.status === "PENDING" ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePay(r.requestId)}
                          disabled={isLoad}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border-2 transition-all disabled:opacity-50"
                          style={{ borderColor: "#16A34A", color: "#16A34A", background: "#F0FDF4" }}>
                          <CheckCircle2 className="w-3 h-3" />
                          {isLoad ? "..." : "تم الدفع"}
                        </button>
                        <button
                          onClick={() => handleReject(r.requestId)}
                          disabled={isLoad}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#DC2626] hover:bg-[#FEF2F2] transition-all disabled:opacity-50">
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[#94A3B8]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Transaction Log ─────────────────────────────────────────────────────

type TxType = "ALL" | "DEPOSIT" | "DEDUCTION" | "PAYOUT" | "REFUND";

function TransactionLogTab() {
  const { sellers, transactions } = useStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TxType>("ALL");
  const [sellerFilter, setSellerFilter] = useState("");

  const sellerMap = useMemo(
    () => new Map(sellers.filter((s) => s.role === "SELLER").map((s) => [s.sellerId, s.name])),
    [sellers]
  );

  const filtered = useMemo(() => {
    return [...transactions].reverse().filter((t) => {
      const matchSearch =
        !search ||
        t.transactionId.includes(search) ||
        t.description.includes(search) ||
        t.sellerId.includes(search);
      const matchType = typeFilter === "ALL" || t.type === typeFilter;
      const matchSeller = !sellerFilter || t.sellerId === sellerFilter;
      return matchSearch && matchType && matchSeller;
    });
  }, [transactions, search, typeFilter, sellerFilter]);

  const typeLabel: Record<string, string> = {
    DEPOSIT: "إيداع", DEDUCTION: "خصم", PAYOUT: "صرف", REFUND: "استرداد",
  };
  const typeColor: Record<string, { bg: string; text: string }> = {
    DEPOSIT:   { bg: "#F0FDF4", text: "#16A34A" },
    DEDUCTION: { bg: "#FEF2F2", text: "#DC2626" },
    PAYOUT:    { bg: "#FFF7ED", text: "#C2410C" },
    REFUND:    { bg: "#EEF2FF", text: "#4361EE" },
  };
  const typeChips: { key: TxType; label: string }[] = [
    { key: "ALL",       label: "الكل" },
    { key: "DEPOSIT",   label: "إيداعات" },
    { key: "DEDUCTION", label: "خصومات" },
    { key: "PAYOUT",    label: "صرف" },
    { key: "REFUND",    label: "استردادات" },
  ];

  const sellerList = sellers.filter((s) => s.role === "SELLER");

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="بحث برقم المعاملة أو الوصف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE] bg-white"
          />
        </div>

        <select
          value={sellerFilter}
          onChange={(e) => setSellerFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 bg-white">
          <option value="">كل البائعين</option>
          {sellerList.map((s) => (
            <option key={s.sellerId} value={s.sellerId}>{s.name}</option>
          ))}
        </select>

        <button
          onClick={() => exportCSV(filtered, sellerMap)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] hover:text-[#4361EE] hover:border-[#4361EE] hover:bg-[#EEF2FF] transition-all bg-white font-semibold">
          <Download className="w-4 h-4" />
          تصدير CSV
        </button>
      </div>

      {/* Type chips */}
      <div className="flex gap-1.5 flex-wrap">
        {typeChips.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
            style={
              typeFilter === key
                ? { background: "#4361EE", color: "#fff", borderColor: "#4361EE" }
                : { background: "#fff", color: "#64748B", borderColor: "#E2E8F0" }
            }>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-[#F1F5F9] flex items-center justify-between"
          style={{ background: "#F8FAFC" }}>
          <span className="text-xs text-[#64748B]">{filtered.length} معاملة</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                {["المعرف", "البائع", "النوع", "المبلغ", "الوصف", "الحالة", "التاريخ"].map((h) => (
                  <th key={h} className="py-3 px-4 text-right text-xs font-semibold text-[#94A3B8] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {filtered.slice(0, 50).map((t) => {
                const seller = sellers.find((s) => s.sellerId === t.sellerId);
                const tc = typeColor[t.type] ?? { bg: "#F8FAFC", text: "#64748B" };
                const isCredit = t.type === "DEPOSIT" || t.type === "REFUND";
                return (
                  <tr key={t.transactionId} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-bold" style={{ color: "#4361EE" }}>
                      {t.transactionId}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <p className="font-semibold text-[#1E293B]">{seller?.name ?? t.sellerId}</p>
                      <p className="text-[#94A3B8]">{t.sellerId}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: tc.bg, color: tc.text }}>
                        {typeLabel[t.type] ?? t.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-sm"
                      style={{ color: isCredit ? "#16A34A" : "#DC2626" }}>
                      {isCredit ? "+" : "-"}{formatMAD(t.amount)}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#64748B] max-w-40 truncate">{t.description}</td>
                    <td className="py-3 px-4">
                      <TransactionStatusBadge status={t.status} />
                    </td>
                    <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">{t.createdAt}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#94A3B8]">
                    لا توجد نتائج مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "deposits" | "withdrawals" | "log";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "deposits",    label: "طلبات الإيداع",   icon: Banknote       },
  { key: "withdrawals", label: "طلبات السحب",      icon: ArrowUpCircle  },
  { key: "log",         label: "سجل المعاملات",   icon: List           },
];

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<Tab>("deposits");
  const { getPendingDeposits, getPendingWithdrawals } = useStore();

  const pendingDeposits = getPendingDeposits().length;
  const pendingWithdrawals = getPendingWithdrawals().length;

  const badges: Record<Tab, number> = {
    deposits: pendingDeposits,
    withdrawals: pendingWithdrawals,
    log: 0,
  };

  return (
    <div className="p-6 space-y-5 animate-fadeIn">
      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-2xl border border-[#E2E8F0] bg-white w-fit">
        {TABS.map(({ key, label, icon: Icon }) => {
          const badge = badges[key];
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={
                activeTab === key
                  ? { background: "#4361EE", color: "#fff", boxShadow: "0 2px 8px rgba(67,97,238,0.3)" }
                  : { color: "#64748B" }
              }>
              <Icon className="w-4 h-4" />
              {label}
              {badge > 0 && (
                <span className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                  style={{
                    background: activeTab === key ? "rgba(255,255,255,0.25)" : "#FB923C",
                    color: activeTab === key ? "#fff" : "#fff",
                  }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="animate-fadeIn" key={activeTab}>
        {activeTab === "deposits" && <DepositsTab />}
        {activeTab === "withdrawals" && <WithdrawalsTab />}
        {activeTab === "log" && <TransactionLogTab />}
      </div>
    </div>
  );
}
