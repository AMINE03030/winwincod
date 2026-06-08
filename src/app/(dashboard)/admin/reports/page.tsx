"use client";

import { useTranslations } from "next-intl";
import { BarChart3 } from "lucide-react";

export default function AdminReportsPage() {
  const t = useTranslations("AdminReports");
  return (
    <div className="p-6 animate-fadeIn">
      <div className="card p-16 text-center">
        <BarChart3 className="w-14 h-14 mx-auto mb-4 opacity-20" style={{ color: "#4361EE" }} />
        <h2 className="text-xl font-bold text-[#1E293B] mb-2">{t("title")}</h2>
        <p className="text-[#64748B] text-sm">{t("underDev")}</p>
      </div>
    </div>
  );
}
