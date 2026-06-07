"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { MockSeller } from "@/lib/store";
import {
  LayoutDashboard, Users, Wallet, ClipboardList,
  Package, BarChart3, Settings, LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin",          icon: LayoutDashboard, label: "لوحة القيادة" },
  { href: "/admin/sellers",  icon: Users,           label: "البائعون" },
  { href: "/admin/finance",  icon: Wallet,          label: "الماليات" },
  { href: "/admin/orders",   icon: ClipboardList,   label: "الطلبات" },
  { href: "/admin/products", icon: Package,         label: "المنتجات" },
  { href: "/admin/reports",  icon: BarChart3,       label: "التقارير" },
];

interface Props { user: MockSeller }

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useStore();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-60 flex-shrink-0 h-full flex flex-col overflow-y-auto" style={{ background: "#3254D4" }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="text-xl font-black tracking-wide">
          <span className="text-white">WinWin</span>
          <span style={{ color: "#FB923C" }}>COD</span>
        </h1>
        <p className="text-white/50 text-[10px] mt-0.5 font-light">لوحة الإدارة</p>
      </div>

      {/* Admin badge */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "#FB923C", color: "#fff" }}>
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user.name}</p>
            <p className="text-white/40 text-[9px]">مدير النظام</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
              isActive(href)
                ? "bg-white text-[#3254D4] font-semibold shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <Link href="/admin/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <Settings className="w-4 h-4" />
          الإعدادات
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-white/10 hover:text-red-200 transition-all">
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
