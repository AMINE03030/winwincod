"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, Bell } from "lucide-react";
import type { MockSeller } from "@/lib/store";
import Link from "next/link";

interface Props { user: MockSeller }

const BREADCRUMB_KEYS: Record<string, { labelKey: string; parentKey?: string; parentHref?: string }> = {
  "/admin":          { labelKey: "dashboard" },
  "/admin/sellers":  { labelKey: "sellers",  parentKey: "dashboard", parentHref: "/admin" },
  "/admin/finance":  { labelKey: "finance",  parentKey: "dashboard", parentHref: "/admin" },
  "/admin/orders":   { labelKey: "orders",   parentKey: "dashboard", parentHref: "/admin" },
  "/admin/products": { labelKey: "products", parentKey: "dashboard", parentHref: "/admin" },
  "/admin/reports":  { labelKey: "reports",  parentKey: "dashboard", parentHref: "/admin" },
  "/admin/settings": { labelKey: "settings", parentKey: "dashboard", parentHref: "/admin" },
};

export default function AdminHeader({ user }: Props) {
  const pathname = usePathname();
  const t = useTranslations("AdminHeader");
  const meta = BREADCRUMB_KEYS[pathname] ?? { labelKey: "admin" };

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-[#E2E8F0]"
      style={{ background: "#FFFFFF" }}>
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        {meta.parentKey && (
          <>
            <Link href={meta.parentHref!} className="text-[#64748B] hover:text-[#4361EE] transition-colors">
              {t(meta.parentKey as Parameters<typeof t>[0])}
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-[#CBD5E1]" />
          </>
        )}
        <span className="font-semibold text-[#1E293B]">{t(meta.labelKey as Parameters<typeof t>[0])}</span>
      </div>

      {/* Right: notification + user */}
      <div className="flex items-center gap-3">
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC] transition-colors">
          <Bell className="w-4 h-4 text-[#64748B]" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#FB923C" }} />
        </button>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#E2E8F0]"
          style={{ background: "#F8FAFC" }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: "#4361EE", color: "#fff" }}>
            {user.name.charAt(0)}
          </div>
          <span className="text-sm font-semibold text-[#1E293B]">{user.name}</span>
        </div>
      </div>
    </header>
  );
}
