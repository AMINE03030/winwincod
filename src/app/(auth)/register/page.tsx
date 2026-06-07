"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router    = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  });

  const field = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }
    if (!/^(06|07)\d{8}$/.test(form.phone)) {
      setError("رقم الهاتف يجب أن يبدأ بـ 06 أو 07 ويتكون من 10 أرقام");
      return;
    }

    setLoading(true);

    // 1 — Create auth user in Supabase
    console.log("[Register] anon key prefix:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20));
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
    });

    if (authError || !authData.user) {
      setLoading(false);
      console.error("[Register] signUp error:", authError);
      if (authError?.message?.includes("already registered")) {
        setError("البريد الإلكتروني مستخدم بالفعل");
      } else {
        setError(authError?.message ?? "حدث خطأ أثناء إنشاء الحساب");
      }
      return;
    }

    // 2 — Insert profile into the users table
    const { error: insertError } = await supabase.from("users").insert({
      id:            authData.user.id,
      email:         form.email,
      password_hash: "managed_by_supabase_auth",
      name:          form.name,
      phone:         form.phone,
      role:          "seller",
      status:        "active",
    });

    if (insertError) {
      setLoading(false);
      if (insertError.code === "23505") {
        setError("البريد الإلكتروني مستخدم بالفعل");
      } else {
        setError("حدث خطأ أثناء حفظ بيانات الحساب");
      }
      return;
    }

    // 3 — Create an empty wallet for the new seller
    await supabase.from("wallets").insert({
      user_id:     authData.user.id,
      balance:     0,
      total_earned: 0,
    });

    setLoading(false);
    router.push("/seller");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#F8FAFC" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black mb-1">
            <span style={{ color: "#4361EE" }}>WinWin</span>
            <span style={{ color: "#FB923C" }}>COD</span>
          </h1>
          <p className="text-[#64748B] text-sm">انضم إلى آلاف البائعين المغاربة</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#1E293B] mb-1">إنشاء حساب جديد</h2>
          <p className="text-[#64748B] text-sm mb-6">أدخل بياناتك للبدء في المبيعات — مجاناً</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="الاسم الكامل"
              placeholder="محمد العلوي"
              value={form.name}
              onChange={field("name")}
              required
            />
            <Input
              id="email"
              type="email"
              label="البريد الإلكتروني"
              placeholder="example@gmail.com"
              value={form.email}
              onChange={field("email")}
              required
            />
            <Input
              id="phone"
              type="tel"
              label="رقم الهاتف"
              placeholder="0612345678"
              value={form.phone}
              onChange={field("phone")}
              maxLength={10}
              required
            />

            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                label="كلمة المرور"
                placeholder="••••••••"
                value={form.password}
                onChange={field("password")}
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-9 text-[#94A3B8] hover:text-[#4361EE]"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Input
              id="confirm"
              type="password"
              label="تأكيد كلمة المرور"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={field("confirmPassword")}
              required
            />

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-1">
              إنشاء الحساب
            </Button>
          </form>

          <p className="text-center mt-5 text-sm text-[#64748B]">
            لديك حساب؟{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "#4361EE" }}>
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
