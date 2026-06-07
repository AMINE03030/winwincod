"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import Sidebar from "./Sidebar";

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const { getCurrentUser } = useStore();
  const router = useRouter();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#d0c194] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.role} />
      <main className="flex-1 mr-60 flex flex-col min-h-screen">{children}</main>
    </div>
  );
}
