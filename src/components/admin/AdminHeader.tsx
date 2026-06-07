"use client";

import { usePathname } from "next/navigation";
import { ChevronLeft, Bell } from "lucide-react";
import type { MockSeller } from "@/lib/store";
import Link from "next/link";

interface Props { user: MockSeller }

const BREADCRUMBS: Record<string, { label: string; parent?: string; parentHref?: string }> = {
  "/admin":          { label: "لوحة القيادة" },
  "/admin/sellers":  { label: "البائعون",      parent: "لوحة القيادة", parentHref: "/admin" },
  "/admin/finance":  { label: "الماليات",       parent: "لوحة القيادة", parentHref: "/admin" },
  "/admin/orders":   { label: "الطلبات",        parent: "لوحة القيادة", parentHref: "/admin" },
  "/admin/products": { label: "المنتجات",       parent: "لوحة القيادة", parentHref: "/admin" },
  "/admin/reports":  { label: "التقارير",       parent: "لوحة القيادة", parentHref: "/admin" },
  "/admin/settings": { label: "الإعدادات",      parent: "لوحة القيادة", parentHref: "/admin" },
};

export default function AdminHeader({ user }: Props) {
  const pathname = usePathname();
  const meta = BREADCRUMBS[pathname] ?? { label: "الإدارة" };

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-[#E2E8F0]"
      style={{ background: "#FFFFFF" }}>
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        {meta.parent && (
          <>
            <Link href={meta.parentHref!} className="text-[#64748B] hover:text-[#4361EE] transition-colors">
              {meta.parent}
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-[#CBD5E1]" />
          </>
        )}
        <span className="font-semibold text-[#1E293B]">{meta.label}</span>
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
