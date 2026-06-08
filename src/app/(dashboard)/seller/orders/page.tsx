"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useStore } from "@/lib/store";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import type { OrderStatus } from "@/lib/store";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function OrdersPage() {
  const t = useTranslations("SellerOrders");
  const { getCurrentUser, getSellerOrders } = useStore();
  const user = getCurrentUser();
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  if (!user) return null;

  const all   = getSellerOrders(user.sellerId);
  const shown = [...(filter === "ALL" ? all : all.filter((o) => o.status === filter))].reverse();

  const FILTERS: { label: string; value: OrderStatus | "ALL" }[] = [
    { label: t("filterAll"),            value: "ALL" },
    { label: t("filterPendingBalance"), value: "PENDING_BALANCE" },
    { label: t("filterPendingConfirm"), value: "PENDING_CONFIRM" },
    { label: t("filterReadyToShip"),    value: "READY_TO_SHIP" },
    { label: t("filterDelivered"),      value: "DELIVERED" },
    { label: t("filterCancelled"),      value: "CANCELLED" },
  ];

  const colHeaders = [
    t("colOrder"), t("colCustomer"), t("colPhone"),
    t("colCity"), t("colProduct"), t("colQty"),
    t("colCost"), t("colStatus"), t("colDate"),
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]">
      <Header title={t("headerTitle")} />

      <div className="flex-1 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B]">{t("heading")}</h2>
            <p className="text-[#64748B] text-sm">{all.length} {t("total")}</p>
          </div>
          <Link href="/seller/orders/new"
            className="flex items-center gap-2 text-white px-5 py-2 rounded-xl font-bold text-sm transition-all"
            style={{ background: "#4361EE" }}>
            <Plus className="w-4 h-4" /> {t("addOrder")}
          </Link>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(({ label, value }) => {
            const count = value === "ALL" ? all.length : all.filter((o) => o.status === value).length;
            return (
              <button key={value} onClick={() => setFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  filter === value
                    ? "text-white border-transparent"
                    : "text-[#64748B] border-[#E2E8F0] bg-white hover:border-[#4361EE] hover:text-[#4361EE]"
                }`}
                style={filter === value ? { background: "#4361EE" } : {}}>
                {label}
                <span className={`mr-1.5 ${filter === value ? "text-white/70" : "text-[#94A3B8]"}`}>({count})</span>
              </button>
            );
          })}
        </div>

        <Card noPad>
          {shown.length === 0 ? (
            <p className="text-center text-[#94A3B8] py-12 text-sm">{t("noOrders")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F1F5F9]">
                    {colHeaders.map((h) => (
                      <th key={h} className="py-3 px-4 text-right text-xs font-semibold text-[#94A3B8]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8FAFC]">
                  {shown.map((o) => (
                    <tr key={o.orderId} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs" style={{ color: "#4361EE" }}>{o.orderId}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{o.customerName}</td>
                      <td className="py-3.5 px-4 text-[#64748B] font-mono text-xs" dir="ltr">{o.customerPhone}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{o.city}</td>
                      <td className="py-3.5 px-4 text-[#64748B] max-w-28 truncate">{o.productTitle}</td>
                      <td className="py-3.5 px-4 text-center text-[#1E293B] font-semibold">{o.quantity}</td>
                      <td className="py-3.5 px-4 font-semibold" style={{ color: "#FB923C" }}>{o.totalCost} د.م</td>
                      <td className="py-3.5 px-4"><OrderStatusBadge status={o.status} /></td>
                      <td className="py-3.5 px-4 text-[#94A3B8] text-xs">{o.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
