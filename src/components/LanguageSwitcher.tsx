"use client";

import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const locale = useLocale();

  function switchTo(next: string) {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    try { localStorage.setItem("locale", next); } catch {}
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: "rgba(255,255,255,0.12)" }}>
      <button
        onClick={() => switchTo("ar")}
        className="px-3 py-1 rounded-md text-xs font-bold transition-all"
        style={
          locale === "ar"
            ? { background: "#fff", color: "#3254D4" }
            : { color: "rgba(255,255,255,0.7)" }
        }
      >
        AR
      </button>
      <button
        onClick={() => switchTo("fr")}
        className="px-3 py-1 rounded-md text-xs font-bold transition-all"
        style={
          locale === "fr"
            ? { background: "#fff", color: "#3254D4" }
            : { color: "rgba(255,255,255,0.7)" }
        }
      >
        FR
      </button>
    </div>
  );
}
