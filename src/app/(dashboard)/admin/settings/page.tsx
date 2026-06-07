"use client";

import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="p-6 animate-fadeIn">
      <div className="card p-16 text-center">
        <Settings className="w-14 h-14 mx-auto mb-4 opacity-20" style={{ color: "#4361EE" }} />
        <h2 className="text-xl font-bold text-[#1E293B] mb-2">إعدادات النظام</h2>
        <p className="text-[#64748B] text-sm">هذه الصفحة قيد التطوير</p>
      </div>
    </div>
  );
}
