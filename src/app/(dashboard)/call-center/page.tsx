"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Header from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import type { OrderStatus } from "@/lib/store";
import { MessageCircle, CheckCircle2, XCircle, Clock, ChevronRight, ChevronLeft, Phone } from "lucide-react";

const WA_MSG = (product: string, city: string) =>
  `السلام عليكم معك منصة WinWinCOD، بخصوص طلبك لمنتج ${product}، هل تؤكد لنا العنوان بالمدينة ${city}؟`;

export default function CallCenterPage() {
  const { getPendingConfirmOrders, updateOrderStatus } = useStore();
  const [idx, setIdx] = useState(0);
  const [loadAction, setLoadAction] = useState<string | null>(null);

  const queue   = getPendingConfirmOrders();
  const current = queue[Math.min(idx, queue.length - 1)];

  async function act(action: "CONFIRM" | "CANCEL" | "NO_ANSWER") {
    if (!current) return;
    setLoadAction(action);
    await new Promise((r) => setTimeout(r, 700));
    const map: Record<string, OrderStatus> = { CONFIRM: "READY_TO_SHIP", CANCEL: "CANCELLED", NO_ANSWER: "NO_ANSWER" };
    updateOrderStatus(current.orderId, map[action]);
    setLoadAction(null);
    const msgs = {
      CONFIRM:   `✅ تم تأكيد ${current.orderId} — جاهز للشحن`,
      CANCEL:    `❌ تم إلغاء ${current.orderId} — تم الاسترداد`,
      NO_ANSWER: `⏳ تم تسجيل عدم الرد على ${current.orderId}`,
    };
    action === "CONFIRM" ? toast.success(msgs[action]) : toast.error(msgs[action]);
    if (idx >= queue.length - 1) setIdx(Math.max(0, idx - 1));
  }

  function openWA() {
    if (!current) return;
    const text  = encodeURIComponent(WA_MSG(current.productTitle, current.city));
    const phone = current.customerPhone.replace(/^0/, "+212");
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  }

  const curIdx = Math.min(idx, queue.length - 1);

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]">
      <Header title="مركز الاتصال" />

      <div className="flex-1 p-6 space-y-5">
        {/* Status bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-sm">
            <Phone className="w-4 h-4 text-[#4361EE]" />
            <span className="text-[#64748B]">في الانتظار:</span>
            <span className="font-bold text-[#1E293B]">{queue.length} طلب</span>
          </div>
        </div>

        {queue.length === 0 ? (
          <Card className="py-20 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: "#16A34A" }} />
            <h3 className="text-xl font-bold text-[#1E293B] mb-2">قائمة الانتظار فارغة</h3>
            <p className="text-[#64748B]">تمت معالجة جميع الطلبات. أحسنت!</p>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Current order */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1E293B]">
                  الطلب الحالي
                  <span className="mr-2 text-sm text-[#94A3B8] font-normal">({curIdx + 1} / {queue.length})</span>
                </h3>
                <div className="flex gap-1">
                  {[{ icon: ChevronRight, fn: () => setIdx(Math.max(0, idx - 1)), dis: idx === 0 },
                    { icon: ChevronLeft,  fn: () => setIdx(Math.min(queue.length - 1, idx + 1)), dis: idx >= queue.length - 1 }].map(({ icon: Icon, fn, dis }, i) => (
                    <button key={i} onClick={fn} disabled={dis}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-30 hover:text-[#4361EE] hover:border-[#4361EE] transition-all">
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {current && (
                <Card className="space-y-5 animate-fadeIn">
                  {/* Order header */}
                  <div className="flex items-start justify-between pb-4 border-b border-[#F1F5F9]">
                    <div>
                      <span className="font-mono font-black text-xl" style={{ color: "#4361EE" }}>{current.orderId}</span>
                      <p className="text-[#94A3B8] text-xs mt-1">{current.createdAt}</p>
                    </div>
                    <span className="bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] text-xs font-semibold px-3 py-1 rounded-full">
                      في انتظار التأكيد
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div><p className="text-xs text-[#94A3B8] mb-1">اسم العميل</p><p className="text-xl font-bold text-[#1E293B]">{current.customerName}</p></div>
                    <div><p className="text-xs text-[#94A3B8] mb-1">رقم الهاتف</p><p className="text-xl font-bold text-[#1E293B] font-mono" dir="ltr">{current.customerPhone}</p></div>
                    <div><p className="text-xs text-[#94A3B8] mb-1">المدينة</p><p className="font-semibold text-[#1E293B]">{current.city}</p></div>
                    <div><p className="text-xs text-[#94A3B8] mb-1">الجهة</p><p className="font-semibold text-[#1E293B]">{current.region}</p></div>
                    {current.address && (
                      <div className="sm:col-span-2"><p className="text-xs text-[#94A3B8] mb-1">العنوان</p><p className="text-[#1E293B]">{current.address}</p></div>
                    )}
                  </div>

                  {/* Product */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0]"
                    style={{ background: "#EEF2FF" }}>
                    <div>
                      <p className="text-xs text-[#64748B] mb-0.5">المنتج</p>
                      <p className="font-bold text-[#1E293B]">{current.productTitle}</p>
                      <p className="text-[#64748B] text-sm">الكمية: {current.quantity}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[#64748B]">محاولات الاتصال</p>
                      <p className="text-3xl font-black text-[#4361EE]">{current.callAttempts}</p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <button onClick={openWA}
                    className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ borderColor: "#25D366", color: "#25D366", background: "#F0FFF4" }}>
                    <MessageCircle className="w-5 h-5" />
                    فتح واتساب — {current.customerPhone}
                  </button>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="success" size="lg" loading={loadAction === "CONFIRM"}
                      onClick={() => act("CONFIRM")} className="flex-col gap-1 h-16">
                      <CheckCircle2 className="w-5 h-5" />
                      تأكيد
                    </Button>
                    <Button variant="ghost" size="lg" loading={loadAction === "NO_ANSWER"}
                      onClick={() => act("NO_ANSWER")} className="flex-col gap-1 h-16 !text-[#F59E0B] !border-[#FDE68A] !bg-[#FFFBEB] hover:!bg-[#FEF3C7]">
                      <Clock className="w-5 h-5" />
                      لا يرد
                    </Button>
                    <Button variant="danger" size="lg" loading={loadAction === "CANCEL"}
                      onClick={() => act("CANCEL")} className="flex-col gap-1 h-16">
                      <XCircle className="w-5 h-5" />
                      إلغاء
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Queue list */}
            <Card noPad>
              <div className="p-4 border-b border-[#F1F5F9]">
                <CardTitle>قائمة الانتظار — {queue.length}</CardTitle>
              </div>
              <div className="p-2 space-y-1">
                {queue.map((o, i) => (
                  <button key={o.orderId} onClick={() => setIdx(i)}
                    className={`w-full text-right p-3 rounded-xl transition-all ${
                      i === curIdx
                        ? "border text-[#4361EE]"
                        : "hover:bg-[#F8FAFC] border border-transparent text-[#64748B]"
                    }`}
                    style={i === curIdx ? { background: "#EEF2FF", borderColor: "#C7D2FE" } : {}}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-mono text-xs font-bold">{o.orderId}</span>
                      <span className="text-xs">{o.callAttempts} محاولة</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1E293B]">{o.customerName}</p>
                    <p className="text-xs">{o.city} · {o.productTitle}</p>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
