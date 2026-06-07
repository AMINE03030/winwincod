"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import Sidebar from "./Sidebar";
import type { Role } from "@/lib/store";

const ROLE_MAP: Record<string, Role> = {
  admin:       "ADMIN",
  call_center: "CALL_CENTER",
  seller:      "SELLER",
};

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  // Reactively subscribe to whoever is currently logged in (mock or Supabase virtual user)
  const user = useStore((s) =>
    s.sellers.find((sel) => sel.sellerId === s.currentUserId) ?? null
  );
  const router  = useRouter();
  const [ready, setReady] = useState(!!user); // skip async check if mock user already present

  useEffect(() => {
    if (user) { setReady(true); return; }

    let cancelled = false;

    async function hydrate() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && !cancelled) {
          const [{ data: profile }, { data: wallet }] = await Promise.all([
            supabase
              .from("users")
              .select("name, role, status, phone")
              .eq("id", session.user.id)
              .single(),
            supabase
              .from("wallets")
              .select("balance")
              .eq("user_id", session.user.id)
              .single(),
          ]);

          if (!cancelled && profile?.status === "active") {
            useStore.getState().setSupabaseUser({
              id:            session.user.id,
              name:          profile.name,
              email:         session.user.email ?? "",
              role:          ROLE_MAP[profile.role] ?? "SELLER",
              walletBalance: wallet?.balance ?? 0,
              phone:         profile.phone ?? "",
            });
          }
        }
      } catch {
        // Supabase not configured or network error — fall through to the redirect below
      }

      if (!cancelled) setReady(true);
    }

    hydrate();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Once the async check is done, redirect if still no user
  useEffect(() => {
    if (ready && !useStore.getState().currentUserId) {
      router.replace("/login");
    }
  }, [ready, router]);

  if (!ready || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#4361EE", borderTopColor: "transparent" }}
        />
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
