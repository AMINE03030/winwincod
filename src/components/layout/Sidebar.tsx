"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  LayoutDashboard, ShoppingCart, Package, Wallet, Phone,
  Settings, LogOut, ShieldCheck, BarChart3, Users,
} from "lucide-react";

interface SidebarProps { role?: "SELLER" | "CALL_CENTER" | "ADMIN"; }

export default function Sidebar({ role = "SELLER" }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { logout } = useStore();
  const t = useTranslations("Nav");

  const sellerNav = [
    { href: "/seller",           icon: LayoutDashboard, label: t("dashboard") },
    { href: "/seller/orders",    icon: ShoppingCart,    label: t("myOrders") },
    { href: "/seller/products",  icon: Package,         label: t("products") },
    { href: "/seller/wallet",    icon: Wallet,          label: t("wallet") },
  ];

  const callCenterNav = [
    { href: "/call-center",       icon: Phone,      label: t("callQueue") },
    { href: "/call-center/stats", icon: BarChart3,  label: t("stats") },
  ];

  const adminNav = [
    { href: "/admin",           icon: ShieldCheck,     label: t("adminDashboard") },
    { href: "/admin/sellers",   icon: Users,           label: t("sellers") },
    { href: "/admin/deposits",  icon: Wallet,          label: t("deposits") },
    { href: "/admin/products",  icon: Package,         label: t("products") },
  ];

  const navItems =
    role === "ADMIN" ? adminNav :
    role === "CALL_CENTER" ? callCenterNav :
    sellerNav;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <aside className="fixed right-0 top-0 h-screen w-60 flex flex-col z-40" style={{ background: "#3254D4" }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="text-xl font-black tracking-wide">
          <span className="text-white">WinWin</span>
          <span style={{ color: "#FB923C" }}>COD</span>
        </h1>
        <p className="text-white/50 text-[10px] mt-0.5 font-light">{t("platformSubtitle")}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                active
                  ? "bg-white text-[#3254D4] font-semibold shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <div className="px-3 py-2">
          <LanguageSwitcher />
        </div>
        <Link href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <Settings className="w-4 h-4" />
          {t("settings")}
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-white/10 hover:text-red-200 transition-all">
          <LogOut className="w-4 h-4" />
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}
