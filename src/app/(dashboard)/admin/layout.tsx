"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { getCurrentUser } = useStore();
  const router = useRouter();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (user.role !== "ADMIN") router.replace("/seller");
  }, [user, router]);

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#4361EE", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-[#F8FAFC]">
      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminHeader user={user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
