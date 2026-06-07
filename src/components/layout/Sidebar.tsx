"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import {
  LayoutDashboard, ShoppingCart, Package, Wallet, Phone,
  Settings, LogOut, ShieldCheck, BarChart3, Users,
} from "lucide-react";

const sellerNav = [
  { href: "/seller",           icon: LayoutDashboard, label: "لوحة القيادة" },
  { href: "/seller/orders",    icon: ShoppingCart,    label: "طلباتي" },
  { href: "/seller/products",  icon: Package,         label: "المنتجات" },
  { href: "/seller/wallet",    icon: Wallet,          label: "المحفظة" },
];

const callCenterNav = [
  { href: "/call-center",       icon: Phone,      label: "قائمة الانتظار" },
  { href: "/call-center/stats", icon: BarChart3,  label: "الإحصائيات" },
];

const adminNav = [
  { href: "/admin",           icon: ShieldCheck,     label: "لوحة المراقبة" },
  { href: "/admin/sellers",   icon: Users,           label: "البائعون" },
  { href: "/admin/deposits",  icon: Wallet,          label: "الإيداعات" },
  { href: "/admin/products",  icon: Package,         label: "المنتجات" },
];

interface SidebarProps { role?: "SELLER" | "CALL_CENTER" | "ADMIN"; }

export default function Sidebar({ role = "SELLER" }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { logout } = useStore();

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
        <p className="text-white/50 text-[10px] mt-0.5 font-light">منصة الكود الاحترافية</p>
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
        <Link href="/settings"
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
