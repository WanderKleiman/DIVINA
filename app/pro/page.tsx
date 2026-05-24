"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";

const YEAR_TOTAL = "$24.99";
const YEAR_WEEKLY = "$0.48";
const MONTH_TOTAL = "$4.99";
const MONTH_WEEKLY = "$1.2";

export default function ProPage() {
  const router = useRouter();
  const { t } = useT();
  const [plan, setPlan] = useState<"year" | "month">("year");
  const perks = [
    t("pro.perk1"),
    t("pro.perk2"),
    t("pro.perk3"),
    t("pro.perk4"),
    t("pro.perk5"),
  ];

  return (
    <div style={{ position: "relative", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Video background — same as paywall */}
      <video
        src="/prodaction2.mp4"
        autoPlay loop muted playsInline
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%) rotate(90deg)",
          minWidth: "100vh", minHeight: "100vw",
          width: "auto", height: "auto",
          zIndex: 0, pointerEvents: "none",
        }}
      />
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1, pointerEvents: "none" }} />

      {/* Back button */}
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
      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", marginTop: -20 }}>
        <div style={{ display: "inline-flex", height: 64, width: 64, alignItems: "center", justifyContent: "center", borderRadius: 18, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)", marginBottom: 20 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
          </svg>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: "white", marginBottom: 10, textAlign: "center", lineHeight: 1.2 }}>
          {t("paywall.sub.headline")}
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 24, textAlign: "center", lineHeight: 1.6, maxWidth: 320 }}>
          {t("paywall.sub.descBefore")}
          <span style={{ color: "rgba(255,255,255,0.90)", fontWeight: 600 }}>{t("paywall.sub.descBold")}</span>
          {t("paywall.sub.descAfter")}
        </p>

        {/* Perks */}
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
        {/* Plan selector */}
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
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: "4px 0 0" }}>{YEAR_WEEKLY} {t("pro.perWeek")}</p>
                </div>
                <p style={{ fontSize: 20, fontWeight: 700, color: "white", margin: 0 }}>{YEAR_TOTAL}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", fontWeight: 400 }}> {t("pro.perYear")}</span></p>
              </div>
            </button>

            <button
              onClick={() => setPlan("month")}
              style={{ width: "100%", borderRadius: 16, padding: 16, border: plan === "month" ? "1px solid rgba(255,255,255,0.40)" : "1px solid rgba(255,255,255,0.10)", background: plan === "month" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "white", margin: 0 }}>{t("pro.monthlySubscription")}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: "4px 0 0" }}>{MONTH_WEEKLY} {t("pro.perWeek")}</p>
                </div>
                <p style={{ fontSize: 20, fontWeight: 700, color: "white", margin: 0 }}>{MONTH_TOTAL}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", fontWeight: 400 }}> {t("pro.perMonth")}</span></p>
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
          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 10 }}>
            {t("pro.then")} {plan === "year" ? `${YEAR_WEEKLY}/week, billed ${YEAR_TOTAL}/yr` : `${MONTH_WEEKLY}/week, billed ${MONTH_TOTAL}/mo`} · {t("pro.cancelAnytime")}
          </p>
        </div>
      </div>
    </div>
  );
}
