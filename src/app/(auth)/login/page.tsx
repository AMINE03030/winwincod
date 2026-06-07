"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({ email: "", password: "" });
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(form.email, form.password);
    setLoading(false);
    if (!result.success) { setError(result.error ?? "خطأ"); return; }
    if (result.role === "ADMIN")            router.push("/admin");
    else if (result.role === "CALL_CENTER") router.push("/call-center");
    else                                    router.push("/seller");
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#F8FAFC" }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12" style={{ background: "linear-gradient(160deg, #4361EE 0%, #3254D4 100%)" }}>
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

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-black" style={{ color: "#4361EE" }}>
              WinWin<span style={{ color: "#FB923C" }}>COD</span>
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-[#1E293B] mb-1">مرحباً بعودتك 👋</h2>
          <p className="text-[#64748B] text-sm mb-6">سجل دخولك للوصول إلى لوحة التحكم</p>

          {/* Demo hint */}
          <div className="mb-5 p-4 rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#64748B]">
            <p className="font-bold text-[#4361EE] mb-2">حسابات تجريبية</p>
            <div className="space-y-1">
              <p>بائع: <span className="font-mono text-[#1E293B]">seller@test.com</span></p>
              <p>وكيل: <span className="font-mono text-[#1E293B]">agent@test.com</span></p>
              <p>إدارة: <span className="font-mono text-[#1E293B]">admin@test.com</span></p>
              <p>كلمة المرور: <span className="font-mono text-[#1E293B]">password123</span></p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="email" type="email" label="البريد الإلكتروني" placeholder="example@gmail.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />

            <div className="relative">
              <Input id="password" type={showPass ? "text" : "password"} label="كلمة المرور" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-9 text-[#94A3B8] hover:text-[#4361EE] transition-colors">
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
