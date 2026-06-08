"use client";

import { Bell, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStore } from "@/lib/store";
import { formatMAD } from "@/lib/utils";
import Link from "next/link";

interface HeaderProps { title?: string; }

export default function Header({ title }: HeaderProps) {
  const { getCurrentUser } = useStore();
  const t = useTranslations("Nav");
  const user = getCurrentUser();
  if (!user) return null;

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        {title && <h2 className="text-base font-bold text-[#1E293B]">{title}</h2>}
      </div>

      <div className="flex items-center gap-3">
        {/* Wallet balance pill — only for sellers */}
        {user.role === "SELLER" && (
          <Link href="/seller/wallet"
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-white text-sm hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg, #4361EE, #3254D4)" }}>
            <div className="text-right">
              <p className="text-white/70 text-[10px] leading-none font-medium">{t("wallet")}</p>
              <p className="text-white font-bold text-base leading-tight">{formatMAD(user.walletBalance)}</p>
            </div>
          </Link>
        )}

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#4361EE] hover:border-[#4361EE] transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FB923C] rounded-full" />
        </button>

        {/* User chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#F8FAFC] transition-all cursor-pointer">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "#4361EE" }}>
            {user.name[0]}
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#1E293B] leading-none">{user.name}</p>
            <p className="text-[10px] text-[#94A3B8] leading-tight">{user.sellerId}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
        </div>
      </div>
    </header>
  );
}
