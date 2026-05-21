"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSubscriptionPrices } from "@/lib/pricing";
import { useT } from "@/lib/i18n";

export default function ProPage() {
  const router = useRouter();
  const { t } = useT();
  const [plan, setPlan] = useState<"year" | "month">("year");
  const prices = getSubscriptionPrices();
  const perks = [
    t("pro.perk1"),
    t("pro.perk2"),
    t("pro.perk3"),
    t("pro.perk4"),
    t("pro.perk5"),
  ];

  return (
    <div style={{ position: "relative", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Video background */}
      <video
        src="/cosmos-4.mp4"
        autoPlay loop muted playsInline
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, pointerEvents: "none" }}
      />
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.60)", zIndex: 1, pointerEvents: "none" }} />

      {/* Back button — explicit z-index to ensure it's above video */}
      <div style={{ position: "relative", zIndex: 50, padding: "env(safe-area-inset-top) 20px 0", marginTop: 16 }}>
        <button
          onClick={() => router.back()}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 40, width: 40, borderRadius: 20, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", marginTop: -40 }}>
        <div style={{ display: "inline-flex", height: 64, width: 64, alignItems: "center", justifyContent: "center", borderRadius: 18, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)", marginBottom: 20 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
          </svg>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 700, color: "white", marginBottom: 8, textAlign: "center" }}>{t("pro.title")}</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.40)", marginBottom: 28, textAlign: "center" }}>{t("pro.subtitle")}</p>

        {/* Perks — dark glass card */}
        <div style={{ width: "100%", maxWidth: 360, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 20, padding: 20, marginBottom: 8 }}>
          {perks.map((text, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: i < perks.length - 1 ? 14 : 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: plan selector + CTA */}
      <div style={{ position: "relative", zIndex: 10, padding: "0 24px", paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}>
        {/* Plan selector — dark glass card */}
        <div style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 24, padding: 16, marginBottom: 16, maxWidth: 360, margin: "0 auto 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => setPlan("year")}
              style={{ position: "relative", width: "100%", borderRadius: 16, padding: 16, border: plan === "year" ? "1px solid rgba(255,255,255,0.40)" : "1px solid rgba(255,255,255,0.10)", background: plan === "year" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)", cursor: "pointer" }}
            >
              <div style={{ position: "absolute", top: -10, right: 16, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 99, padding: "2px 10px", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "0.05em" }}>
                {t("pro.badge")}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "white", margin: 0 }}>{t("pro.yearlySubscription")}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: "4px 0 0" }} suppressHydrationWarning>{prices.yearWeekly} {t("pro.perWeek")}</p>
                </div>
                <p style={{ fontSize: 20, fontWeight: 700, color: "white", margin: 0 }} suppressHydrationWarning>{prices.yearTotal}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", fontWeight: 400 }}> {t("pro.perYear")}</span></p>
              </div>
            </button>

            <button
              onClick={() => setPlan("month")}
              style={{ width: "100%", borderRadius: 16, padding: 16, border: plan === "month" ? "1px solid rgba(255,255,255,0.40)" : "1px solid rgba(255,255,255,0.10)", background: plan === "month" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "white", margin: 0 }}>{t("pro.monthlySubscription")}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: "4px 0 0" }} suppressHydrationWarning>{prices.monthWeekly} {t("pro.perWeek")}</p>
                </div>
                <p style={{ fontSize: 20, fontWeight: 700, color: "white", margin: 0 }} suppressHydrationWarning>{prices.monthTotal}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", fontWeight: 400 }}> {t("pro.perMonth")}</span></p>
              </div>
            </button>
          </div>
        </div>

        {/* CTA */}
        <div style={{ maxWidth: 360, margin: "0 auto" }}>
          <button
            onClick={() => router.push("/pro/checkout")}
            style={{ width: "100%", borderRadius: 16, background: "white", padding: "16px 0", fontSize: 16, fontWeight: 700, color: "rgba(0,0,0,0.88)", border: "none", cursor: "pointer", boxShadow: "0 4px 32px rgba(0,0,0,0.6)" }}
          >
            {t("pro.trialCta")}
          </button>
          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 10 }} suppressHydrationWarning>
            {t("pro.then")} {plan === "year" ? prices.yearLabel : prices.monthLabel} · {t("pro.cancelAnytime")}
          </p>
        </div>
      </div>
    </div>
  );
}
