"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Header from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStore } from "@/lib/store";
import { MOROCCAN_CITIES, MOROCCAN_REGIONS, formatMAD } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Package } from "lucide-react";

const SHIPPING_FEE = 30;

export default function NewOrderPage() {
  const router  = useRouter();
  const { getCurrentUser, products, addOrder } = useStore();
  const user    = getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    productId: "", customerName: "", customerPhone: "",
    city: "", region: "", address: "", quantity: 1, notes: "",
  });

  if (!user) return null;

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [k]: e.target.value });

  const active   = products.filter((p) => p.isActive);
  const selected = active.find((p) => p.productId === form.productId);
  const total    = selected ? (selected.sourcingPrice + SHIPPING_FEE) * form.quantity : 0;
  const hasFunds = user.walletBalance >= total;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const result = addOrder({ ...form, quantity: Number(form.quantity), notes: form.notes });
    setLoading(false);
    if (result.status === "PENDING_CONFIRM") toast.success(result.message);
    else toast.error(result.message, { duration: 4000 });
    router.push("/seller/orders");
  }

  const selectCls = "w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[#1E293B] text-sm outline-none focus:border-[#4361EE] focus:ring-2 focus:ring-[rgba(67,97,238,0.15)] transition-all";
  const labelCls  = "text-sm font-semibold text-[#1E293B] block mb-1.5";

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]">
      <Header title="إضافة طلب جديد" />

      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-5">
              {/* Product */}
              <Card>
                <CardHeader>
                  <CardTitle>اختيار المنتج</CardTitle>
                  <Package className="w-5 h-5 text-[#4361EE]" />
                </CardHeader>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>المنتج</label>
                    <select className={selectCls} value={form.productId} onChange={set("productId")} required>
                      <option value="">-- اختر منتجاً --</option>
                      {active.map((p) => (
                        <option key={p.productId} value={p.productId} disabled={p.stockQuantity === 0}>
                          {p.title} — {formatMAD(p.sellingPrice)}{p.stockQuantity === 0 ? " (نفد المخزون)" : ` (${p.stockQuantity} متبق)`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selected && (
                    <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div><p className="text-xs text-[#94A3B8]">تكلفة التوريد</p><p className="font-bold text-[#1E293B]">{formatMAD(selected.sourcingPrice)}</p></div>
                      <div><p className="text-xs text-[#94A3B8]">سعر البيع</p><p className="font-bold" style={{ color: "#FB923C" }}>{formatMAD(selected.sellingPrice)}</p></div>
                      <div><p className="text-xs text-[#94A3B8]">المخزون</p><p className="font-bold text-[#1E293B]">{selected.stockQuantity} قطعة</p></div>
                    </div>
                  )}

                  <Input id="qty" type="number" label="الكمية" value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    min={1} max={selected?.stockQuantity ?? 99} required />
                </div>
              </Card>

              {/* Customer */}
              <Card>
                <CardHeader><CardTitle>بيانات العميل</CardTitle></CardHeader>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input id="name" label="اسم العميل" placeholder="محمد العلوي" value={form.customerName} onChange={set("customerName")} required />
                  <Input id="phone" type="tel" label="رقم الهاتف" placeholder="0612345678" value={form.customerPhone} onChange={set("customerPhone")} maxLength={10} required />
                  <div>
                    <label className={labelCls}>المدينة</label>
                    <select className={selectCls} value={form.city} onChange={set("city")} required>
                      <option value="">-- اختر المدينة --</option>
                      {MOROCCAN_CITIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>الجهة</label>
                    <select className={selectCls} value={form.region} onChange={set("region")} required>
                      <option value="">-- اختر الجهة --</option>
                      {MOROCCAN_REGIONS.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>العنوان التفصيلي</label>
                    <textarea className={`${selectCls} resize-none h-20`} placeholder="الحي، الشارع، رقم الشقة..."
                      value={form.address} onChange={set("address")} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>ملاحظات (اختياري)</label>
                    <textarea className={`${selectCls} resize-none h-14`} placeholder="أي معلومات إضافية..."
                      value={form.notes} onChange={set("notes")} />
                  </div>
                </div>
              </Card>
            </div>

            {/* Summary */}
            <div>
              <Card variant="financial" className="sticky top-20">
                <CardHeader><CardTitle>ملخص الطلب</CardTitle></CardHeader>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#64748B]">
                    <span>تكلفة المنتج</span>
                    <span>{selected ? formatMAD(selected.sourcingPrice * form.quantity) : "—"}</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>رسوم الشحن</span>
                    <span>{selected ? formatMAD(SHIPPING_FEE) : "—"}</span>
                  </div>
                  <div className="border-t border-[#F1F5F9] pt-3 flex justify-between font-bold text-[#1E293B]">
                    <span>الإجمالي المخصوم</span>
                    <span style={{ color: "#FB923C" }}>{selected ? formatMAD(total) : "—"}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#64748B]">
                    <span>رصيد المحفظة</span>
                    <span className="font-semibold text-[#1E293B]">{formatMAD(user.walletBalance)}</span>
                  </div>

                  {selected && !hasFunds && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                      <AlertTriangle className="w-4 h-4 text-[#DC2626] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-[#991B1B]">رصيد غير كافٍ — ينقصك {formatMAD(total - user.walletBalance)}. سيُحفظ الطلب معلقاً.</p>
                    </div>
                  )}

                  {selected && hasFunds && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-[#166534]">الرصيد كافٍ — سيُخصم المبلغ فوراً ويُرسَل للاتصال.</p>
                    </div>
                  )}

                  <Button type="submit" variant={hasFunds && !!selected ? "primary" : "financial"}
                    size="lg" loading={loading} className="w-full mt-1"
                    disabled={!form.productId || !form.customerName || !form.customerPhone || !form.city}>
                    {hasFunds && selected ? "تأكيد وإرسال الطلب" : "حفظ كمعلق"}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
