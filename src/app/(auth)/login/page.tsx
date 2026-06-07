"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";

const ROLE_ROUTES: Record<string, string> = {
  admin:        "/admin",
  call_center:  "/call-center",
  agent:        "/call-center",
  seller:       "/seller",
};

function deriveRole(email: string): string {
  if (email === "admin@test.com")  return "admin";
  if (email === "agent@test.com")  return "agent";
  return "seller";
}

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({ email: "", password: "" });
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1 — Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email:    form.email,
      password: form.password,
    });

    if (authError || !authData.user) {
      setLoading(false);
      console.error("[Login] Supabase auth error:", authError);
      // Show specific message based on error type
      if (authError?.message?.toLowerCase().includes("email not confirmed")) {
        setError("البريد الإلكتروني غير مؤكد — يرجى التحقق من بريدك الإلكتروني أو تواصل مع الإدارة.");
      } else if (authError?.message?.toLowerCase().includes("invalid login credentials")) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      } else {
        setError(authError?.message ?? "خطأ في تسجيل الدخول — حاول مرة أخرى.");
      }
      return;
    }

    // 2 — Fetch profile; auto-create it if missing (user exists in auth but not in public.users)
    let { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role, status")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      console.warn("[Login] Profile missing — creating automatically for:", authData.user.email);
      const email     = authData.user.email ?? "";
      const role      = deriveRole(email);
      const name      = email.split("@")[0];

      const { data: inserted, error: insertError } = await supabase
        .from("users")
        .insert({
          id:            authData.user.id,
          email,
          password_hash: "managed_by_supabase_auth",
          name,
          phone:         "",
          role,
          status:        "active",
        })
        .select("role, status")
        .single();

      if (insertError || !inserted) {
        setLoading(false);
        console.error("[Login] Auto-create profile failed:", insertError);
        setError("خطأ في إنشاء بيانات المستخدم — تواصل مع الإدارة.");
        return;
      }

      // Create an empty wallet for sellers
      if (role === "seller") {
        await supabase.from("wallets").insert({
          user_id:      authData.user.id,
          balance:      0,
          total_earned: 0,
        });
      }

      profile = inserted;
    }

    setLoading(false);

    if (profile.status !== "active") {
      await supabase.auth.signOut();
      setError("هذا الحساب موقوف. تواصل مع الإدارة.");
      return;
    }

    // 3 — Redirect based on role
    const route = ROLE_ROUTES[profile.role] ?? "/seller";
    router.push(route);
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#F8FAFC" }}>
      {/* ── Left decorative panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-2/5 p-12"
        style={{ background: "linear-gradient(160deg, #4361EE 0%, #3254D4 100%)" }}
      >
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide">
            WinWin<span style={{ color: "#FB923C" }}>COD</span>
          </h1>
          <p className="text-white/60 mt-2 text-sm">منصة الكود الاحترافية</p>
        </div>
        <div className="space-y-6">
          {[
            { title: "إدارة الطلبات", desc: "تتبع كل طلباتك بمعرفات فريدة ORD-XXXX" },
            { title: "محفظة ذكية",   desc: "نظام خصم تلقائي عند تأكيد كل طلب" },
            { title: "مركز اتصال",   desc: "تأكيد مباشر مع العملاء عبر واتساب" },
          ].map((f) => (
            <div key={f.title} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "#FB923C" }} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{f.title}</p>
                <p className="text-white/50 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-white/30 text-xs">&copy; {new Date().getFullYear()} WinWinCOD</p>
      </div>

      {/* ── Right: login form ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-black" style={{ color: "#4361EE" }}>
              WinWin<span style={{ color: "#FB923C" }}>COD</span>
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-[#1E293B] mb-1">مرحباً بعودتك 👋</h2>
          <p className="text-[#64748B] text-sm mb-6">سجل دخولك للوصول إلى لوحة التحكم</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="البريد الإلكتروني"
              placeholder="example@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                label="كلمة المرور"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-9 text-[#94A3B8] hover:text-[#4361EE] transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-1">
              تسجيل الدخول
            </Button>
          </form>

          <p className="text-center mt-5 text-sm text-[#64748B]">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="font-semibold hover:underline" style={{ color: "#4361EE" }}>
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
