"use client";

import { useTranslations, useLocale } from "next-intl";
import { useStore } from "@/lib/store";
import { formatMAD } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Users, ShoppingCart, TrendingUp, CircleDollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

// ── Sub-components ────────────────────────────────────────────────────────────

function KPICard({
  label, value, sub, icon: Icon, iconBg, iconColor, trend, trendUp,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; iconBg: string; iconColor: string;
  trend?: string; trendUp?: boolean;
}) {
  return (
    <div className="card card-primary p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendUp
              ? "bg-[#F0FDF4] text-[#16A34A]"
              : "bg-[#FEF2F2] text-[#DC2626]"
          }`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-black text-[#1E293B] leading-none">{value}</p>
        {sub && <p className="text-xs text-[#94A3B8] mt-0.5">{sub}</p>}
        <p className="text-xs text-[#64748B] mt-1.5">{label}</p>
      </div>
    </div>
  );
}

function WeeklyBarChart({ data }: {
  data: { day: string; orders: number; isToday?: boolean }[];
}) {
  const max = Math.max(...data.map((d) => d.orders));
  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[9px] font-bold" style={{ color: d.isToday ? "#4361EE" : "#94A3B8" }}>
            {d.orders}
          </span>
          <div
            className="w-full rounded-t-md transition-all duration-700"
            style={{
              height: `${Math.max((d.orders / max) * 100, 4)}%`,
              background: d.isToday
                ? "linear-gradient(180deg, #4361EE 0%, #3254D4 100%)"
                : "rgba(67, 97, 238, 0.2)",
              borderRadius: "4px 4px 0 0",
            }}
          />
          <span
            className="text-[9px] font-medium text-center leading-none"
            style={{ color: d.isToday ? "#4361EE" : "#94A3B8" }}>
            {d.day.slice(0, 2)}
          </span>
        </div>
      ))}
    </div>
  );
}

function TopSellersChart({ items }: { items: { name: string; count: number; sellerId: string }[] }) {
  const max = Math.max(...items.map((s) => s.count), 1);
  return (
    <div className="space-y-3">
      {items.map((s, i) => (
        <div key={s.sellerId} className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{ background: i === 0 ? "#4361EE" : "#F1F5F9", color: i === 0 ? "#fff" : "#64748B" }}>
            {i + 1}
          </div>
          <span className="text-xs font-medium text-[#1E293B] w-24 truncate flex-shrink-0">{s.name}</span>
          <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
            <div
              className="h-full rounded-full flex items-center justify-end pl-2 transition-all duration-700"
              style={{
                width: `${Math.max((s.count / max) * 100, 6)}%`,
                background: i === 0
                  ? "linear-gradient(90deg, #4361EE, #3254D4)"
                  : "rgba(67,97,238,0.25)",
                minWidth: 24,
              }}>
              <span className="text-[9px] font-bold" style={{ color: i === 0 ? "#fff" : "#4361EE" }}>
                {s.count}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const t = useTranslations("AdminDashboard");
  const locale = useLocale();
  const dateLocale = locale === "ar" ? "ar-MA" : "fr-MA";

  const { sellers, orders, transactions } = useStore();

  // Week data derived from real dates (June 1–7, 2026)
  const baseDate = new Date(2026, 5, 1);
  const weekCounts = [8, 14, 22, 18, 27, 35, 31];
  const weekData = weekCounts.map((count, i) => {
    const date = new Date(baseDate.getTime() + i * 86400000);
    return {
      day:     date.toLocaleDateString(dateLocale, { weekday: "long" }),
      orders:  count,
      isToday: i === 6,
    };
  });

  const sellerList = sellers.filter((s) => s.role === "SELLER");
  const activeSellers = sellerList.filter((s) => !s.blocked).length;
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;
  const deliveryRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
  const monthlyRevenue = transactions
    .filter((tx) => tx.type === "DEPOSIT" && tx.status === "APPROVED" && tx.createdAt.startsWith("2026-06"))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const topSellers = sellerList
    .map((s) => ({ ...s, count: orders.filter((o) => o.sellerId === s.sellerId).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentOrders = [...orders].reverse().slice(0, 10);

  const weekDateRange = `${new Date(2026, 5, 1).toLocaleDateString(dateLocale, { day: "2-digit", month: "short" })} – ${new Date(2026, 5, 7).toLocaleDateString(dateLocale, { day: "2-digit", month: "short", year: "numeric" })}`;

  const todaySub = new Date(2026, 5, 7).toLocaleDateString(dateLocale, {
    weekday: "long", day: "numeric", month: "long",
  });

  const kpis = [
    {
      label: t("activeSellers"),
      value: String(activeSellers),
      sub: `${t("fromTotal")} ${sellerList.length} ${t("seller")}`,
      icon: Users,
      iconBg: "#EEF2FF",
      iconColor: "#4361EE",
      trend: "+2",
      trendUp: true,
    },
    {
      label: t("todayOrders"),
      value: "31",
      sub: todaySub,
      icon: ShoppingCart,
      iconBg: "#FFF7ED",
      iconColor: "#C2410C",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: t("deliveryRate"),
      value: `${deliveryRate}%`,
      sub: `${deliveredOrders} / ${totalOrders}`,
      icon: TrendingUp,
      iconBg: deliveryRate >= 60 ? "#F0FDF4" : "#FEF2F2",
      iconColor: deliveryRate >= 60 ? "#16A34A" : "#DC2626",
      trend: deliveryRate >= 60 ? "+3%" : "-2%",
      trendUp: deliveryRate >= 60,
    },
    {
      label: t("monthRevenue"),
      value: formatMAD(monthlyRevenue),
      sub: t("approvedDeposits"),
      icon: CircleDollarSign,
      iconBg: "#FFF7ED",
      iconColor: "#FB923C",
      trend: "+18%",
      trendUp: true,
    },
  ];

  const colHeaders = [
    t("colOrder"), t("colSeller"), t("colCustomer"),
    t("colCity"), t("colProduct"), t("colStatus"), t("colDate"),
  ];

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 7-day bar chart */}
        <div className="card card-primary p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#1E293B] text-sm">{t("weekChart")}</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">{weekDateRange}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#4361EE" }} />
              <span className="text-xs text-[#64748B]">{t("today")}</span>
              <div className="w-2.5 h-2.5 rounded-sm mr-2" style={{ background: "rgba(67,97,238,0.2)" }} />
              <span className="text-xs text-[#64748B]">{t("previous")}</span>
            </div>
          </div>
          <WeeklyBarChart data={weekData} />
          <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
            <span className="text-xs text-[#64748B]">{t("weekTotal")}</span>
            <span className="text-sm font-bold text-[#1E293B]">
              {weekCounts.reduce((s, n) => s + n, 0)} {t("orders")}
            </span>
          </div>
        </div>

        {/* Top sellers */}
        <div className="card card-primary p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#1E293B] text-sm">{t("topSellers")}</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">{t("byOrderCount")}</p>
            </div>
          </div>
          <TopSellersChart items={topSellers} />
        </div>
      </div>

      {/* Activity feed */}
      <div className="card card-primary">
        <div className="p-5 border-b border-[#F1F5F9] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#1E293B] text-sm">{t("recentActivity")}</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {t("lastOrdersFrom", { count: recentOrders.length })}
            </p>
          </div>
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
              {recentOrders.map((o) => {
                const seller = sellers.find((s) => s.sellerId === o.sellerId);
                return (
                  <tr key={o.orderId} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-xs" style={{ color: "#4361EE" }}>
                      {o.orderId}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#64748B]">{seller?.name ?? o.sellerId}</td>
                    <td className="py-3 px-4 font-semibold text-[#1E293B] whitespace-nowrap">{o.customerName}</td>
                    <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">{o.city}</td>
                    <td className="py-3 px-4 text-[#64748B] max-w-32 truncate">{o.productTitle}</td>
                    <td className="py-3 px-4"><OrderStatusBadge status={o.status} /></td>
                    <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">{o.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
