"use client";

import { useTranslations } from "next-intl";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import { formatMAD } from "@/lib/utils";
import { Package } from "lucide-react";

export default function ProductsPage() {
  const t = useTranslations("SellerProducts");
  const { products } = useStore();
  const active = products.filter((p) => p.isActive);

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]">
      <Header title={t("headerTitle")} />

      <div className="flex-1 p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B]">{t("catalogTitle")}</h2>
          <p className="text-[#64748B] text-sm">{active.length} {t("available")}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {active.map((p) => (
            <Card key={p.productId} className="flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="w-full h-36 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center">
                <Package className="w-12 h-12 text-[#CBD5E1]" />
              </div>

              <div>
                <p className="font-mono text-xs font-semibold mb-1" style={{ color: "#4361EE" }}>{p.productId}</p>
                <h3 className="font-bold text-[#1E293B]">{p.title}</h3>
                {p.description && <p className="text-[#64748B] text-xs mt-1">{p.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div>
                  <p className="text-xs text-[#94A3B8]">{t("sourcingCost")}</p>
                  <p className="font-bold text-[#1E293B]">{formatMAD(p.sourcingPrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8]">{t("sellingPrice")}</p>
                  <p className="font-bold" style={{ color: "#FB923C" }}>{formatMAD(p.sellingPrice)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  p.stockQuantity === 0
                    ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                    : p.stockQuantity < 10
                    ? "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]"
                    : "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]"
                }`}>
                  {p.stockQuantity === 0 ? t("outOfStock") : `${p.stockQuantity} ${t("pieces")}`}
                </span>
                <span className="text-xs text-[#64748B]">
                  {t("profit")}: <span className="font-bold text-[#16A34A]">{formatMAD(p.sellingPrice - p.sourcingPrice)}</span>
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
