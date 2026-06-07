import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "WinWinCOD — منصة الكود الاحترافية",
  description: "منصة إدارة الطلبات والمحفظة للبائعين المغاربة بنظام الدفع عند الاستلام",
  keywords: ["COD", "dropshipping", "Maroc", "e-commerce", "كود"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className="min-h-full antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#1E293B",
              border: "1px solid #E2E8F0",
              fontFamily: "Cairo, sans-serif",
              fontSize: "14px",
              direction: "rtl",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              borderRadius: "12px",
            },
            success: { iconTheme: { primary: "#16A34A", secondary: "#FFFFFF" } },
            error:   { iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" } },
          }}
        />
      </body>
    </html>
  );
}
