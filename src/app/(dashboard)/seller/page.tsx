"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import type { OrderStatus } from "@/lib/store";
import Header from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { formatMAD } from "@/lib/utils";
import {
  ShoppingCart, CheckCircle, Clock, TrendingUp, Plus, AlertCircle,
} from "lucide-react";
import Link from "next/link";

// ── Detect Supabase UUID vs mock ID (e.g. "USR-1001")
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type DisplayOrder = {
  orderId:      string;
  customerName: string;
  city:         string;
  productTitle: string;
  status:       OrderStatus;
  createdAt:    string;
  totalCost:    number;
};

type SupabaseOrder = {
  id:            string;
  tracking_id:   string | null;
  customer_name: string;
  city:          string;
  product:       string;
  amount:        number;
  status:        string;
  created_at:    string;
};

function normaliseSupabaseOrder(o: SupabaseOrder): DisplayOrder {
  return {
    orderId:      o.tracking_id ?? `ORD-${o.id.slice(0, 6).toUpperCase()}`,
    customerName: o.customer_name,
    city:         o.city,
    productTitle: o.product,
    status:       (o.status || "PENDING_CONFIRM") as OrderStatus,
    createdAt:    new Date(o.created_at).toLocaleString("fr-MA"),
    totalCost:    Number(o.amount),
  };
}

export default function SellerDashboard() {
  const t = useTranslations("SellerDashboard");
  const locale = useLocale();
  const { getCurrentUser, getSellerOrders } = useStore();
  const user = getCurrentUser();

  const [supaOrders, setSupaOrders] = useState<DisplayOrder[] | null>(null);

  useEffect(() => {
    if (!user || !UUID_RE.test(user.sellerId)) return;

    const sellerId = user.sellerId;

    async function fetchOrders() {
      try {
        const { data } = await supabase
          .from("orders")
          .select("id, tracking_id, customer_name, city, product, amount, status, created_at")
          .eq("seller_id", sellerId)
          .order("created_at", { ascending: false });

        setSupaOrders((data as SupabaseOrder[] ?? []).map(normaliseSupabaseOrder));
      } catch {
        setSupaOrders([]);
      }
    }

    fetchOrders();
  }, [user?.sellerId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null;

  const orders: DisplayOrder[] =
    supaOrders !== null
      ? supaOrders
      : getSellerOrders(user.sellerId).map((o) => ({
          orderId:      o.orderId,
          customerName: o.customerName,
          city:         o.city,
          productTitle: o.productTitle,
          status:       o.status,
          createdAt:    o.createdAt,
          totalCost:    o.totalCost,
        }));

  const recent = orders.slice(0, 5);

  const stats = {
    total:          orders.length,
    pendingBalance: orders.filter((o) => o.status === "PENDING_BALANCE").length,
    pendingConfirm: orders.filter((o) => o.status === "PENDING_CONFIRM").length,
    readyToShip:    orders.filter((o) => o.status === "READY_TO_SHIP").length,
    delivered:      orders.filter((o) => o.status === "DELIVERED").length,
  };

  const frozen = orders.filter((o) => o.status === "PENDING_BALANCE");

  const statCards = [
    { label: t("totalOrders"),   value: stats.total,          icon: ShoppingCart, color: "#4361EE", bg: "#EEF2FF", variant: "default"  as const },
    { label: t("pendingConfirm"), value: stats.pendingConfirm, icon: Clock,        color: "#C2410C", bg: "#FFF7ED", variant: "default"  as const },
    { label: t("readyToShip"),    value: stats.readyToShip,    icon: TrendingUp,   color: "#1D4ED8", bg: "#EFF6FF", variant: "default"  as const },
    { label: t("delivered"),      value: stats.delivered,      icon: CheckCircle,  color: "#16A34A", bg: "#F0FDF4", variant: "success"  as const },
  ];

  const dateLocale = locale === "ar" ? "ar-MA" : "fr-MA";
  const todayStr = new Date().toLocaleDateString(dateLocale, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const colHeaders = [
    t("colOrder"), t("colCustomer"), t("colCity"),
    t("colProduct"), t("colStatus"), t("colDate"),
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]">
      <Header title={t("headerTitle")} />

      <div className="flex-1 p-6 space-y-6">
        {/* Welcome + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1E293B]">
              {t("greeting")}, <span style={{ color: "#4361EE" }}>{user.name.split(" ")[0]}</span> 👋
            </h2>
            <p className="text-[#64748B] text-sm mt-0.5">{todayStr}</p>
          </div>
          <Link
            href="/seller/orders/new"
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm"
            style={{ background: "#4361EE" }}
          >
            <Plus className="w-4 h-4" />
            {t("addOrder")}
          </Link>
        </div>

        {/* Wallet hero + stat cards */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Wallet */}
          <div
            className="lg:col-span-2 rounded-xl p-6 text-white flex flex-col justify-between"
            style={{ background: "linear-gradient(135deg, #4361EE 0%, #3254D4 100%)" }}
          >
            <div>
              <p className="text-white/70 text-xs font-medium">{t("walletBalance")}</p>
              <p className="text-3xl font-black mt-1">{formatMAD(user.walletBalance)}</p>
            </div>
            <div className="flex gap-3 mt-4">
              <div className="flex-1 rounded-lg p-3" style={{ background: "rgba(255,255,255,0.15)" }}>
                <p className="text-white/60 text-[10px]">{t("pendingOrders")}</p>
                <p className="text-white font-bold text-lg">{stats.pendingBalance}</p>
              </div>
              <div className="flex-1 rounded-lg p-3" style={{ background: "rgba(255,255,255,0.15)" }}>
                <p className="text-white/60 text-[10px]">{t("delivered")}</p>
                <p className="text-white font-bold text-lg">{stats.delivered}</p>
              </div>
            </div>
            <Link href="/seller/wallet" className="mt-3 text-xs text-white/60 hover:text-white transition-colors">
              {t("manageWallet")}
            </Link>
          </div>

          {/* Stat cards */}
          {statCards.map(({ label, value, icon: Icon, color, bg, variant }) => (
            <Card key={label} variant={variant} className="flex flex-col justify-between gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="text-[#64748B] text-xs">{label}</p>
                <p className="text-3xl font-black text-[#1E293B] mt-0.5">{value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Frozen order alerts */}
        {frozen.length > 0 && (
          <div className="space-y-2">
            {frozen.map((o) => (
              <div
                key={o.orderId}
                className="flex items-center gap-3 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA]"
              >
                <AlertCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[#991B1B] font-semibold text-sm">{t("frozenAlert")}</p>
                  <p className="text-[#DC2626] text-xs mt-0.5">
                    {o.orderId} · {o.productTitle} · {t("frozenNeeds")}{" "}
                    <strong>{formatMAD(o.totalCost)}</strong>
                  </p>
                </div>
                <Link
                  href="/seller/wallet"
                  className="text-xs font-bold px-3 py-1.5 rounded-lg text-white flex-shrink-0"
                  style={{ background: "#FB923C" }}
                >
                  {t("topUpWallet")}
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Recent orders table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("recentOrders")}</CardTitle>
            <Link
              href="/seller/orders"
              className="text-xs font-semibold hover:underline"
              style={{ color: "#4361EE" }}
            >
              {t("viewAll")}
            </Link>
          </CardHeader>

          {recent.length === 0 ? (
            <p className="text-center text-[#94A3B8] py-8 text-sm">{t("noOrders")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F1F5F9]">
                    {colHeaders.map((h) => (
                      <th
                        key={h}
                        className="pb-3 text-right text-xs font-semibold text-[#94A3B8] px-3 first:pr-0"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8FAFC]">
                  {recent.map((o) => (
                    <tr key={o.orderId} className="hover:bg-[#F8FAFC] transition-colors">
                      <td
                        className="py-3 px-3 first:pr-0 font-mono font-bold text-xs"
                        style={{ color: "#4361EE" }}
                      >
                        {o.orderId}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#1E293B]">{o.customerName}</td>
                      <td className="py-3 px-3 text-[#64748B]">{o.city}</td>
                      <td className="py-3 px-3 text-[#64748B] max-w-32 truncate">{o.productTitle}</td>
                      <td className="py-3 px-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="py-3 px-3 text-[#94A3B8] text-xs">{o.createdAt}</td>
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
