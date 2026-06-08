import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "WinWinCOD — منصة الكود الاحترافية",
  description: "منصة إدارة الطلبات والمحفظة للبائعين المغاربة بنظام الدفع عند الاستلام",
  keywords: ["COD", "dropshipping", "Maroc", "e-commerce", "كود"],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale   = await getLocale();
  const messages = await getMessages();
  const isRTL    = locale === "ar";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"} className="h-full">
      <body className="min-h-full antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background:  "#FFFFFF",
                color:       "#1E293B",
                border:      "1px solid #E2E8F0",
                fontFamily:  isRTL ? "Cairo, sans-serif" : "Inter, sans-serif",
                fontSize:    "14px",
                direction:   isRTL ? "rtl" : "ltr",
                boxShadow:   "0 4px 24px rgba(0,0,0,0.08)",
                borderRadius:"12px",
              },
              success: { iconTheme: { primary: "#16A34A", secondary: "#FFFFFF" } },
              error:   { iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" } },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
