"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useStore } from "@/lib/store";
import type { MockTransaction } from "@/lib/store";
import { formatMAD } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { TransactionStatusBadge } from "@/components/ui/Badge";
import {
  CheckCircle2, XCircle, Eye, Download, Search,
  Banknote, ArrowUpCircle, List,
} from "lucide-react";

// ─── CSV Export ───────────────────────────────────────────────────────────────

interface CsvLabels {
  header: string[];
  typeLabel: Record<string, string>;
  statusLabel: Record<string, string>;
  filename: string;
  toast: string;
}

function exportCSV(txs: MockTransaction[], sellerMap: Map<string, string>, labels: CsvLabels) {
  const rows = txs.map((t) => [
    t.transactionId,
    sellerMap.get(t.sellerId) ?? t.sellerId,
    labels.typeLabel[t.type] ?? t.type,
    t.amount,
    labels.statusLabel[t.status] ?? t.status,
    t.description,
    t.createdAt,
  ].map(String).join(","));

  const csv = "﻿" + [labels.header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = labels.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(labels.toast);
}

// ─── Tab: Deposit Requests ────────────────────────────────────────────────────

function DepositsTab() {
  const t = useTranslations("AdminFinance");
  const { sellers, getPendingDeposits, approveDeposit, rejectDeposit } = useStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const pending = getPendingDeposits();

  async function handleApprove(id: string) {
    setLoadingId(id);
    await new Promise((r) => setTimeout(r, 700));
    approveDeposit(id);
    setLoadingId(null);
    toast.success(t("toastApproved"));
  }

  async function handleReject(id: string) {
    setLoadingId(id);
    await new Promise((r) => setTimeout(r, 400));
    rejectDeposit(id);
    setLoadingId(null);
    toast.error(t("toastDepositRejected"));
  }

  return (
    <div className="space-y-4">
      {pending.length === 0 ? (
        <div className="card p-16 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: "#16A34A" }} />
          <h3 className="text-lg font-bold text-[#1E293B] mb-1">{t("depositEmpty")}</h3>
          <p className="text-sm text-[#64748B]">{t("depositEmptyDesc")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((tx) => {
            const seller = sellers.find((s) => s.sellerId === tx.sellerId);
            const isLoad = loadingId === tx.transactionId;
            return (
              <div key={tx.transactionId} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm"
                    style={{ background: "#EEF2FF", color: "#4361EE" }}>
                    {seller?.name.charAt(0) ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-[#1E293B]">{seller?.name ?? tx.sellerId}</p>
                        <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                          {tx.sellerId} · {tx.transactionId}
                        </p>
                        <p className="text-xs text-[#64748B] mt-1">{tx.createdAt}</p>
                        {tx.receiptFileName && (
                          <p className="text-xs text-[#4361EE] mt-1 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {t("receipt")}: {tx.receiptFileName}
                          </p>
                        )}
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="text-2xl font-black" style={{ color: "#16A34A" }}>
                          {formatMAD(tx.amount)}
                        </p>
                        <TransactionStatusBadge status="PENDING" className="mt-1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs text-[#64748B] hover:text-[#4361EE] hover:border-[#4361EE] transition-all bg-white">
                        <Eye className="w-3.5 h-3.5" /> {t("viewReceipt")}
                      </button>
                      <Button variant="success" size="sm" loading={isLoad}
                        onClick={() => handleApprove(tx.transactionId)} className="flex-1 gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t("approve")}
                      </Button>
                      <Button variant="danger" size="sm" disabled={isLoad}
                        onClick={() => handleReject(tx.transactionId)} className="gap-1">
                        <XCircle className="w-3.5 h-3.5" /> {t("reject")}
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
  const t = useTranslations("AdminFinance");
  const { sellers, withdrawalRequests, approveWithdrawal, rejectWithdrawal } = useStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handlePay(id: string) {
    setLoadingId(id);
    await new Promise((r) => setTimeout(r, 700));
    approveWithdrawal(id);
    setLoadingId(null);
    toast.success(t("toastPaid"));
  }

  async function handleReject(id: string) {
    setLoadingId(id);
    await new Promise((r) => setTimeout(r, 400));
    rejectWithdrawal(id);
    setLoadingId(null);
    toast.error(t("toastWithdrawRejected"));
  }

  const statusColor: Record<string, { bg: string; text: string; border: string }> = {
    PENDING:  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    PAID:     { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
    REJECTED: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  };

  const statusLabel: Record<string, string> = {
    PENDING:  t("statusPending"),
    PAID:     t("statusPaid"),
    REJECTED: t("statusRejected"),
  };

  const colHeaders = [
    t("withdrawColRequest"), t("withdrawColSeller"), t("withdrawColAmount"),
    t("withdrawColBank"), t("withdrawColAccount"), t("withdrawColDate"),
    t("withdrawColStatus"), t("withdrawColAction"),
  ];

  return (
    <div className="card card-financial overflow-hidden">
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
                          {isLoad ? "..." : t("markPaid")}
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
  const t = useTranslations("AdminFinance");
  const { sellers, transactions } = useStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TxType>("ALL");
  const [sellerFilter, setSellerFilter] = useState("");

  const sellerMap = useMemo(
    () => new Map(sellers.filter((s) => s.role === "SELLER").map((s) => [s.sellerId, s.name])),
    [sellers]
  );

  const filtered = useMemo(() => {
    return [...transactions].reverse().filter((tx) => {
      const matchSearch =
        !search ||
        tx.transactionId.includes(search) ||
        tx.description.includes(search) ||
        tx.sellerId.includes(search);
      const matchType = typeFilter === "ALL" || tx.type === typeFilter;
      const matchSeller = !sellerFilter || tx.sellerId === sellerFilter;
      return matchSearch && matchType && matchSeller;
    });
  }, [transactions, search, typeFilter, sellerFilter]);

  const typeLabel: Record<string, string> = {
    DEPOSIT: t("txDeposit"), DEDUCTION: t("txDeduction"),
    PAYOUT:  t("txPayout"),  REFUND:    t("txRefund"),
  };
  const typeColor: Record<string, { bg: string; text: string }> = {
    DEPOSIT:   { bg: "#F0FDF4", text: "#16A34A" },
    DEDUCTION: { bg: "#FEF2F2", text: "#DC2626" },
    PAYOUT:    { bg: "#FFF7ED", text: "#C2410C" },
    REFUND:    { bg: "#EEF2FF", text: "#4361EE" },
  };

  const typeChips: { key: TxType; label: string }[] = [
    { key: "ALL",       label: t("chipAll") },
    { key: "DEPOSIT",   label: t("chipDeposits") },
    { key: "DEDUCTION", label: t("chipDeductions") },
    { key: "PAYOUT",    label: t("chipPayout") },
    { key: "REFUND",    label: t("chipRefunds") },
  ];

  const colHeaders = [
    t("logColId"), t("logColSeller"), t("logColType"),
    t("logColAmount"), t("logColDesc"), t("logColStatus"), t("logColDate"),
  ];

  const sellerList = sellers.filter((s) => s.role === "SELLER");

  function handleExport() {
    exportCSV(filtered, sellerMap, {
      header: [
        t("csvColId"), t("csvColSeller"), t("csvColType"),
        t("csvColAmount"), t("csvColStatus"), t("csvColDesc"), t("csvColDate"),
      ],
      typeLabel: {
        DEPOSIT: t("txDeposit"), DEDUCTION: t("txDeduction"),
        PAYOUT: t("txPayout"),   REFUND:    t("txRefund"),
      },
      statusLabel: {
        PENDING:  t("csvStatusPending"),
        APPROVED: t("csvStatusApproved"),
        REJECTED: t("csvStatusRejected"),
      },
      filename: `winwincod-transactions-${new Date().toISOString().split("T")[0]}.csv`,
      toast: t("csvExported"),
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder={t("logSearchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE] bg-white"
          />
        </div>

        <select
          value={sellerFilter}
          onChange={(e) => setSellerFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 bg-white">
          <option value="">{t("allSellers")}</option>
          {sellerList.map((s) => (
            <option key={s.sellerId} value={s.sellerId}>{s.name}</option>
          ))}
        </select>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] hover:text-[#4361EE] hover:border-[#4361EE] hover:bg-[#EEF2FF] transition-all bg-white font-semibold">
          <Download className="w-4 h-4" />
          {t("exportCSV")}
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
          <span className="text-xs text-[#64748B]">{filtered.length} {t("transactions")}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                {colHeaders.map((h) => (
                  <th key={h} className="py-3 px-4 text-right text-xs font-semibold text-[#94A3B8] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {filtered.slice(0, 50).map((tx) => {
                const seller = sellers.find((s) => s.sellerId === tx.sellerId);
                const tc = typeColor[tx.type] ?? { bg: "#F8FAFC", text: "#64748B" };
                const isCredit = tx.type === "DEPOSIT" || tx.type === "REFUND";
                return (
                  <tr key={tx.transactionId} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-bold" style={{ color: "#4361EE" }}>
                      {tx.transactionId}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <p className="font-semibold text-[#1E293B]">{seller?.name ?? tx.sellerId}</p>
                      <p className="text-[#94A3B8]">{tx.sellerId}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: tc.bg, color: tc.text }}>
                        {typeLabel[tx.type] ?? tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-sm"
                      style={{ color: isCredit ? "#16A34A" : "#DC2626" }}>
                      {isCredit ? "+" : "-"}{formatMAD(tx.amount)}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#64748B] max-w-40 truncate">{tx.description}</td>
                    <td className="py-3 px-4">
                      <TransactionStatusBadge status={tx.status} />
                    </td>
                    <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">{tx.createdAt}</td>
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
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "deposits" | "withdrawals" | "log";

export default function AdminFinancePage() {
  const t = useTranslations("AdminFinance");
  const [activeTab, setActiveTab] = useState<Tab>("deposits");
  const { getPendingDeposits, getPendingWithdrawals } = useStore();

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "deposits",    label: t("tabDeposits"),    icon: Banknote       },
    { key: "withdrawals", label: t("tabWithdrawals"), icon: ArrowUpCircle  },
    { key: "log",         label: t("tabLog"),         icon: List           },
  ];

  const pendingDeposits    = getPendingDeposits().length;
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
                    color: "#fff",
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
        {activeTab === "deposits"    && <DepositsTab />}
        {activeTab === "withdrawals" && <WithdrawalsTab />}
        {activeTab === "log"         && <TransactionLogTab />}
      </div>
    </div>
  );
}
