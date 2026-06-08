"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

// ── Fade-in wrapper ───────────────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const spanRef = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          let i = 0;
          const timer = setInterval(() => {
            i++;
            setCount(Math.round(target * Math.min(i / steps, 1)));
            if (i >= steps) clearInterval(timer);
          }, 30);
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return (
    <span ref={spanRef}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ── Dashboard mockup card ─────────────────────────────────────────────────────
function DashboardMockup() {
  const t = useTranslations("Landing");

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "1.5rem",
        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
        width: "340px",
        fontFamily: "Cairo, sans-serif",
        direction: "rtl",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.1rem",
        }}
      >
        <span style={{ fontWeight: 800, color: "#1E293B", fontSize: "0.9rem" }}>
          {t("mockupTitle")}
        </span>
        <span
          style={{
            background: "#F0FDF4",
            color: "#16A34A",
            fontSize: "0.72rem",
            padding: "2px 10px",
            borderRadius: "20px",
            fontWeight: 700,
          }}
        >
          {t("mockupActive")}
        </span>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "0.5rem",
          marginBottom: "1.1rem",
        }}
      >
        {[
          { label: t("mockupOrders"),   val: "142",   color: "#4361EE", bg: "#EEF2FF" },
          { label: t("mockupDelivered"),val: "121",   color: "#16A34A", bg: "#F0FDF4" },
          { label: t("mockupEarnings"), val: "8,540", color: "#FB923C", bg: "#FFF7ED" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: s.bg,
              borderRadius: "10px",
              padding: "0.6rem 0.4rem",
              textAlign: "center",
            }}
          >
            <p style={{ color: s.color, fontWeight: 900, fontSize: "0.95rem" }}>
              {s.val}
            </p>
            <p style={{ color: "#64748B", fontSize: "0.62rem", marginTop: "1px" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <p
        style={{
          fontSize: "0.72rem",
          color: "#94A3B8",
          marginBottom: "0.5rem",
          fontWeight: 600,
        }}
      >
        {t("mockupRecentOrders")}
      </p>
      {[
        { id: "ORD-0341", city: "الدار البيضاء", status: t("mockupStatusDelivered"), color: "#16A34A", bg: "#F0FDF4" },
        { id: "ORD-0340", city: "الرباط",        status: t("mockupStatusPending"),   color: "#C2410C", bg: "#FFF7ED" },
        { id: "ORD-0339", city: "فاس",            status: t("mockupStatusShipping"),  color: "#1D4ED8", bg: "#EFF6FF" },
      ].map((o) => (
        <div
          key={o.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.45rem 0",
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "#1E293B" }}>
              {o.id}
            </p>
            <p style={{ fontSize: "0.68rem", color: "#94A3B8" }}>{o.city}</p>
          </div>
          <span
            style={{
              background: o.bg,
              color: o.color,
              fontSize: "0.68rem",
              padding: "2px 8px",
              borderRadius: "20px",
              fontWeight: 700,
            }}
          >
            {o.status}
          </span>
        </div>
      ))}

      {/* Wallet */}
      <div
        style={{
          marginTop: "0.85rem",
          background: "linear-gradient(135deg, #4361EE 0%, #3254D4 100%)",
          borderRadius: "12px",
          padding: "0.85rem 1rem",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.68rem" }}>
          {t("mockupBalance")}
        </p>
        <p style={{ color: "#fff", fontWeight: 900, fontSize: "1.3rem" }}>
          8,540{" "}
          <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{t("mockupMAD")}</span>
        </p>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontFamily = locale === "ar" ? "Cairo, sans-serif" : "Inter, sans-serif";

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: t("navHome"),         href: "#hero" },
    { label: t("navHow"),          href: "#how" },
    { label: t("navWhy"),          href: "#why" },
    { label: t("navTestimonials"), href: "#testimonials" },
  ];

  const textColor = scrolled ? "#1E293B" : "rgba(255,255,255,0.9)";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        insetInline: 0,
        zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(226,232,240,0.9)" : "none",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.07)" : "none",
        transition: "all 0.3s ease",
        direction: dir,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <span
            style={{
              fontSize: "1.55rem",
              fontWeight: 900,
              color: scrolled ? "#4361EE" : "#fff",
              letterSpacing: "0.04em",
              fontFamily,
              transition: "color 0.3s",
            }}
          >
            WinWin<span style={{ color: "#FB923C" }}>COD</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "2rem" }}
          className="hidden md:flex"
        >
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                color: textColor,
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: 500,
                fontFamily,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FB923C")}
              onMouseLeave={(e) => (e.currentTarget.style.color = textColor)}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          className="hidden md:flex"
        >
          <Link
            href="/login"
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "10px",
              border: `2px solid ${scrolled ? "#4361EE" : "rgba(255,255,255,0.65)"}`,
              color: scrolled ? "#4361EE" : "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
              textDecoration: "none",
              fontFamily,
              transition: "all 0.2s",
            }}
          >
            {t("navLogin")}
          </Link>
          <Link
            href="/register"
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "10px",
              background: "#FB923C",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
              fontFamily,
              boxShadow: "0 4px 14px rgba(251,146,60,0.4)",
              transition: "all 0.2s",
            }}
          >
            {t("navStartFree")}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex md:hidden"
          onClick={() => setOpen((o) => !o)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.4rem",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
          aria-label="Menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: "24px",
                height: "2px",
                background: scrolled ? "#1E293B" : "#fff",
                borderRadius: "2px",
                transition: "all 0.25s",
                opacity: i === 1 && open ? 0 : 1,
                transform:
                  open && i === 0
                    ? "rotate(45deg) translate(5px, 5px)"
                    : open && i === 2
                    ? "rotate(-45deg) translate(5px, -5px)"
                    : "none",
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          style={{
            background: "#fff",
            borderTop: "1px solid #E2E8F0",
            padding: "1rem 1.5rem 1.5rem",
          }}
        >
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "0.8rem 0",
                color: "#1E293B",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: 600,
                borderBottom: "1px solid #F1F5F9",
                fontFamily,
              }}
            >
              {l.label}
            </a>
          ))}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
              marginTop: "1rem",
            }}
          >
            <Link
              href="/login"
              style={{
                textAlign: "center",
                padding: "0.65rem",
                border: "2px solid #4361EE",
                borderRadius: "10px",
                color: "#4361EE",
                fontWeight: 700,
                textDecoration: "none",
                fontFamily,
                fontSize: "0.9rem",
              }}
            >
              {t("navLogin")}
            </Link>
            <Link
              href="/register"
              style={{
                textAlign: "center",
                padding: "0.65rem",
                background: "#FB923C",
                borderRadius: "10px",
                color: "#fff",
                fontWeight: 700,
                textDecoration: "none",
                fontFamily,
                fontSize: "0.9rem",
              }}
            >
              {t("navStartFree")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontFamily = locale === "ar" ? "Cairo, sans-serif" : "Inter, sans-serif";

  return (
    <div dir={dir} style={{ fontFamily, overflowX: "hidden" }}>
      <Navbar />

      {/* ════════════════════════════ HERO ════════════════════════════════════ */}
      <section
        id="hero"
        style={{
          background: "linear-gradient(135deg, #4361EE 0%, #2D4FCC 100%)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "6rem 1.5rem 5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: "absolute", top: "-20%", left: "-8%",
            width: "650px", height: "650px", borderRadius: "50%",
            background: "rgba(255,255,255,0.04)", pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: "-30%", right: "-5%",
            width: "520px", height: "520px", borderRadius: "50%",
            background: "rgba(255,255,255,0.03)", pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "1200px", margin: "0 auto", width: "100%",
            display: "flex", alignItems: "center", gap: "3rem", flexWrap: "wrap",
          }}
        >
          {/* ── Text column ── */}
          <div style={{ flex: "1 1 400px", minWidth: 0 }}>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.22)",
                borderRadius: "100px", padding: "0.35rem 1.1rem",
                marginBottom: "1.5rem", backdropFilter: "blur(8px)",
              }}
            >
              <span style={{ color: "#FB923C", fontWeight: 800, fontSize: "0.82rem" }}>
                {t("heroBadge")}
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(2rem, 5.5vw, 3.6rem)", fontWeight: 900,
                color: "#fff", lineHeight: 1.28, marginBottom: "1.25rem",
              }}
            >
              {t("heroHeadline1")}
              <br />
              <span style={{ color: "#FB923C" }}>{t("heroHeadline2")}</span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "1.1rem", color: "rgba(255,255,255,0.82)",
                lineHeight: 1.85, marginBottom: "2rem", maxWidth: "530px",
              }}
            >
              {t("heroSubtitle")}
            </p>

            {/* CTA buttons */}
            <div
              style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}
            >
              <Link
                href="/register"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  background: "#FB923C", color: "#fff",
                  padding: "0.9rem 2.1rem", borderRadius: "12px",
                  fontWeight: 800, fontSize: "1rem", textDecoration: "none",
                  boxShadow: "0 8px 28px rgba(251,146,60,0.5)", fontFamily,
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 12px 36px rgba(251,146,60,0.65)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 28px rgba(251,146,60,0.5)";
                }}
              >
                {t("heroCTA1")}
              </Link>
              <a
                href="#how"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  background: "transparent", color: "#fff",
                  padding: "0.9rem 2.1rem", borderRadius: "12px",
                  fontWeight: 600, fontSize: "1rem", textDecoration: "none",
                  border: "2px solid rgba(255,255,255,0.5)", fontFamily,
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.8)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.5)";
                }}
              >
                {t("heroCTA2")}
              </a>
            </div>

            {/* Stats grid */}
            <div
              style={{
                display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem", marginTop: "3rem",
              }}
            >
              {[
                { prefix: "",  target: 500,   suffix: "+", label: t("statActiveSellers") },
                { prefix: "+", target: 10000, suffix: "",  label: t("statMonthlyOrders") },
                { prefix: "",  target: 85,    suffix: "%", label: t("statDeliveryRate") },
                { prefix: "",  target: 48,    suffix: "h", label: t("statProfitTransfer") },
              ].map(({ prefix, target, suffix, label }) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "14px", padding: "1rem 1.25rem",
                  }}
                >
                  <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                    {prefix}
                    <Counter target={target} suffix={suffix} />
                  </p>
                  <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.68)", marginTop: "0.3rem" }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Dashboard mockup column ── */}
          <div
            style={{
              flex: "0 1 360px", display: "flex",
              justifyContent: "center", alignItems: "center",
            }}
          >
            <div style={{ animation: "float 4s ease-in-out infinite" }}>
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════════════════ */}
      <section id="how" style={{ background: "#fff", padding: "5.5rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <span
                style={{
                  background: "#EEF2FF", color: "#4361EE",
                  padding: "0.3rem 1.1rem", borderRadius: "100px",
                  fontSize: "0.82rem", fontWeight: 700,
                }}
              >
                {t("howBadge")}
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900,
                  color: "#1E293B", marginTop: "0.85rem",
                }}
              >
                {t("howTitle")}
              </h2>
              <p style={{ color: "#64748B", fontSize: "1rem", marginTop: "0.5rem" }}>
                {t("howSubtitle")}
              </p>
            </div>
          </FadeIn>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {[
              { step: 1, icon: t("step1Icon"), title: t("step1Title"), desc: t("step1Desc"), color: "#4361EE", bg: "#EEF2FF" },
              { step: 2, icon: t("step2Icon"), title: t("step2Title"), desc: t("step2Desc"), color: "#7C3AED", bg: "#F5F3FF" },
              { step: 3, icon: t("step3Icon"), title: t("step3Title"), desc: t("step3Desc"), color: "#0891B2", bg: "#ECFEFF" },
              { step: 4, icon: t("step4Icon"), title: t("step4Title"), desc: t("step4Desc"), color: "#FB923C", bg: "#FFF7ED" },
            ].map(({ step, icon, title, desc, color, bg }, i) => (
              <FadeIn key={step} delay={i * 100}>
                <div
                  style={{
                    background: "#FAFBFF", border: "1px solid #E2E8F0",
                    borderRadius: "18px", padding: "1.75rem",
                    position: "relative", height: "100%",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = "translateY(-5px)";
                    el.style.boxShadow = "0 14px 36px rgba(67,97,238,0.13)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "none";
                  }}
                >
                  {/* Step badge */}
                  <div
                    style={{
                      position: "absolute", top: "1rem", left: "1rem",
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: color, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.78rem", fontWeight: 800,
                    }}
                  >
                    {step}
                  </div>
                  {/* Icon */}
                  <div
                    style={{
                      width: "58px", height: "58px", borderRadius: "15px",
                      background: bg, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "1.8rem",
                      marginBottom: "1.1rem",
                    }}
                  >
                    {icon}
                  </div>
                  <h3
                    style={{
                      fontWeight: 800, color: "#1E293B",
                      fontSize: "1.1rem", marginBottom: "0.5rem",
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ color: "#64748B", fontSize: "0.9rem", lineHeight: 1.65 }}>
                    {desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ WHY WINWINCOD ═══════════════════════════════════ */}
      <section id="why" style={{ background: "#F8FAFC", padding: "5.5rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <span
                style={{
                  background: "#FFF7ED", color: "#FB923C",
                  padding: "0.3rem 1.1rem", borderRadius: "100px",
                  fontSize: "0.82rem", fontWeight: 700,
                }}
              >
                {t("whyBadge")}
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900,
                  color: "#1E293B", marginTop: "0.85rem",
                }}
              >
                {t("whyTitle")}
              </h2>
              <p style={{ color: "#64748B", fontSize: "1rem", marginTop: "0.5rem" }}>
                {t("whySubtitle")}
              </p>
            </div>
          </FadeIn>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {[
              { icon: t("card1Icon"), feature: t("card1Feature"), us: t("card1Us"), them: t("card1Them"), color: "#16A34A" },
              { icon: t("card2Icon"), feature: t("card2Feature"), us: t("card2Us"), them: t("card2Them"), color: "#4361EE" },
              { icon: t("card3Icon"), feature: t("card3Feature"), us: t("card3Us"), them: t("card3Them"), color: "#FB923C" },
            ].map(({ icon, feature, us, them, color }, i) => (
              <FadeIn key={feature} delay={i * 100}>
                <div
                  style={{
                    background: "#fff", border: "1px solid #E2E8F0",
                    borderRadius: "20px", padding: "2rem",
                    borderTop: `4px solid ${color}`, height: "100%",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = "translateY(-5px)";
                    el.style.boxShadow = `0 14px 36px ${color}25`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "none";
                  }}
                >
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{icon}</div>
                  <h3
                    style={{
                      fontWeight: 900, color: "#1E293B",
                      fontSize: "1.2rem", marginBottom: "1.4rem",
                    }}
                  >
                    {feature}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    {/* Our offer */}
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <span style={{ color: "#16A34A", fontSize: "1.15rem", flexShrink: 0, marginTop: "0.05rem" }}>
                        ✓
                      </span>
                      <div>
                        <p
                          style={{
                            fontSize: "0.68rem", color: "#16A34A", fontWeight: 800,
                            marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.04em",
                          }}
                        >
                          {t("whyUs")}
                        </p>
                        <p style={{ fontSize: "0.9rem", color: "#1E293B", lineHeight: 1.55 }}>
                          {us}
                        </p>
                      </div>
                    </div>

                    <div style={{ height: "1px", background: "#F1F5F9" }} />

                    {/* Competition */}
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <span style={{ color: "#DC2626", fontSize: "1.15rem", flexShrink: 0, marginTop: "0.05rem" }}>
                        ✗
                      </span>
                      <div>
                        <p
                          style={{
                            fontSize: "0.68rem", color: "#DC2626", fontWeight: 800,
                            marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.04em",
                          }}
                        >
                          {t("whyThem")}
                        </p>
                        <p style={{ fontSize: "0.9rem", color: "#64748B", lineHeight: 1.55 }}>
                          {them}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ TESTIMONIALS ══════════════════════════════════ */}
      <section id="testimonials" style={{ background: "#fff", padding: "5.5rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <span
                style={{
                  background: "#EEF2FF", color: "#4361EE",
                  padding: "0.3rem 1.1rem", borderRadius: "100px",
                  fontSize: "0.82rem", fontWeight: 700,
                }}
              >
                {t("testimonialsBadge")}
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900,
                  color: "#1E293B", marginTop: "0.85rem",
                }}
              >
                {t("testimonialsTitle")}
              </h2>
              <p style={{ color: "#64748B", fontSize: "1rem", marginTop: "0.5rem" }}>
                {t("testimonialsSubtitle")}
              </p>
            </div>
          </FadeIn>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {[
              { name: t("t1Name"), city: t("t1City"), role: t("t1Role"), quote: t("t1Quote"), initials: t("t1Initials"), color: "#4361EE", bg: "#EEF2FF" },
              { name: t("t2Name"), city: t("t2City"), role: t("t2Role"), quote: t("t2Quote"), initials: t("t2Initials"), color: "#7C3AED", bg: "#F5F3FF" },
              { name: t("t3Name"), city: t("t3City"), role: t("t3Role"), quote: t("t3Quote"), initials: t("t3Initials"), color: "#0891B2", bg: "#ECFEFF" },
            ].map(({ name, city, role, quote, initials, color, bg }, i) => (
              <FadeIn key={name} delay={i * 100}>
                <div
                  style={{
                    background: "#FAFBFF", border: "1px solid #E2E8F0",
                    borderRadius: "20px", padding: "1.85rem", height: "100%",
                    display: "flex", flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = "translateY(-4px)";
                    el.style.boxShadow = "0 12px 32px rgba(67,97,238,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "none";
                  }}
                >
                  {/* Stars */}
                  <div style={{ marginBottom: "1rem" }}>
                    {"★★★★★".split("").map((s, j) => (
                      <span key={j} style={{ color: "#F59E0B", fontSize: "1.05rem" }}>{s}</span>
                    ))}
                  </div>
                  {/* Quote */}
                  <p
                    style={{
                      color: "#475569", fontSize: "0.95rem",
                      lineHeight: 1.85, flex: 1, marginBottom: "1.4rem",
                    }}
                  >
                    &ldquo;{quote}&rdquo;
                  </p>
                  {/* Author */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                    <div
                      style={{
                        width: "46px", height: "46px", borderRadius: "50%",
                        background: bg, color: color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 900, fontSize: "1rem", flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: "#1E293B", fontSize: "0.95rem" }}>{name}</p>
                      <p style={{ color: "#94A3B8", fontSize: "0.78rem" }}>
                        {role} &middot; {city}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ FINAL CTA ═══════════════════════════════════ */}
      <section
        style={{
          background: "linear-gradient(135deg, #4361EE 0%, #2D4FCC 100%)",
          padding: "6rem 1.5rem", textAlign: "center",
          position: "relative", overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", top: "-50%", left: "50%",
            transform: "translateX(-50%)",
            width: "900px", height: "900px", borderRadius: "50%",
            background: "rgba(255,255,255,0.04)", pointerEvents: "none",
          }}
        />
        <FadeIn>
          <div style={{ position: "relative", zIndex: 1, maxWidth: "620px", margin: "0 auto" }}>
            <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.95rem", marginBottom: "0.65rem" }}>
              {t("ctaEyebrow")}
            </p>
            <h2
              style={{
                fontSize: "clamp(1.9rem, 4.5vw, 3rem)", fontWeight: 900,
                color: "#fff", marginBottom: "1.1rem", lineHeight: 1.3,
              }}
            >
              {t("ctaTitle")}{" "}
              <span style={{ color: "#FB923C" }}>{t("ctaCount")}</span>
              {t("ctaTitleEnd")}
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.75)", fontSize: "1rem",
                marginBottom: "2.25rem", lineHeight: 1.7,
              }}
            >
              {t("ctaSubtitle")}
            </p>
            <Link
              href="/register"
              style={{
                display: "inline-block", background: "#FB923C", color: "#fff",
                padding: "1.05rem 2.75rem", borderRadius: "14px",
                fontWeight: 900, fontSize: "1.1rem", textDecoration: "none",
                boxShadow: "0 10px 36px rgba(251,146,60,0.55)", fontFamily,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 16px 48px rgba(251,146,60,0.7)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 10px 36px rgba(251,146,60,0.55)";
              }}
            >
              {t("ctaButton")}
            </Link>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", marginTop: "1.1rem" }}>
              {t("ctaNote")}
            </p>
          </div>
        </FadeIn>
      </section>

      {/* ══════════════════════════ FOOTER ════════════════════════════════════ */}
      <footer
        id="contact"
        style={{ background: "#1a1a2e", padding: "3.5rem 1.5rem 2rem", direction: dir }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "2rem", marginBottom: "2.5rem",
            }}
          >
            {/* Brand column */}
            <div>
              <h3
                style={{
                  color: "#fff", fontWeight: 900, fontSize: "1.55rem",
                  marginBottom: "0.65rem", fontFamily,
                }}
              >
                WinWin<span style={{ color: "#FB923C" }}>COD</span>
              </h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", lineHeight: 1.75 }}>
                {t("footerBrand")}
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4
                style={{
                  color: "#fff", fontWeight: 700, marginBottom: "1rem",
                  fontSize: "0.95rem", fontFamily,
                }}
              >
                {t("footerQuickLinks")}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {[
                  { label: t("navHome"),         href: "#hero" },
                  { label: t("navHow"),           href: "#how" },
                  { label: t("navWhy"),           href: "#why" },
                  { label: t("navTestimonials"),  href: "#testimonials" },
                ].map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    style={{
                      color: "rgba(255,255,255,0.48)", textDecoration: "none",
                      fontSize: "0.9rem", fontFamily, transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#FB923C")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.48)")}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Account */}
            <div>
              <h4
                style={{
                  color: "#fff", fontWeight: 700, marginBottom: "1rem",
                  fontSize: "0.95rem", fontFamily,
                }}
              >
                {t("footerAccount")}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {[
                  { label: t("footerLogin"),    href: "/login" },
                  { label: t("footerRegister"), href: "/register" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    style={{
                      color: "rgba(255,255,255,0.48)", textDecoration: "none",
                      fontSize: "0.9rem", fontFamily, transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#FB923C")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.48)")}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4
                style={{
                  color: "#fff", fontWeight: 700, marginBottom: "1rem",
                  fontSize: "0.95rem", fontFamily,
                }}
              >
                {t("footerContact")}
              </h4>
              <div
                style={{
                  display: "flex", flexDirection: "column", gap: "0.55rem",
                  color: "rgba(255,255,255,0.48)", fontSize: "0.88rem",
                  fontFamily, lineHeight: 1.6,
                }}
              >
                <p>{t("footerEmail")}</p>
                <p>{t("footerWhatsapp")}</p>
                <p>{t("footerHours")}</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem",
              textAlign: "center", color: "rgba(255,255,255,0.32)",
              fontSize: "0.85rem", fontFamily,
            }}
          >
            {t("footerCopyright")}
          </div>
        </div>
      </footer>
    </div>
  );
}
