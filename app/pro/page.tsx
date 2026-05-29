"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useT, APP_LANG } from "@/lib/i18n";
import { getOfferings, purchasePackage, purchaseProduct, type RCPackage } from "@/lib/purchases-native";
import { useProStatus } from "@/lib/pro-status";
import { setRuProInStorage } from "@/lib/pro-status";

const YEAR_TOTAL = "$24.99";
const YEAR_WEEKLY = "$0.48";
const MONTH_TOTAL = "$4.99";
const MONTH_WEEKLY = "$1.2";

const TG_BOT = process.env.NEXT_PUBLIC_TG_BOT ?? "";

// ─── RU version ───────────────────────────────────────────────────────────────

function ProPageRu() {
  const router = useRouter();
  const { t } = useT();
  const { refresh } = useProStatus();
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const perks = [
    t("pro.perk1"),
    t("pro.perk2"),
    t("pro.perk3"),
    t("pro.perk4"),
    t("pro.perk5"),
  ];

  async function handleActivate() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ru/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Неверный код");
        return;
      }
      const expiresAt = new Date(
        Date.now() + data.durationDays * 24 * 60 * 60 * 1000
      ).toISOString();
      setRuProInStorage({ isPro: true, expiresAt, code: trimmed });
      await refresh();
      setSuccess(true);
      setTimeout(() => router.back(), 1500);
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "relative", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Video background */}
      <video
        src="/prodaction2.mp4"
        autoPlay loop muted playsInline
        style={{
          position: "fixed", top: "50%", left: "50%",
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
        <div style={{ width: "100%", maxWidth: 360, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 20, padding: 20 }}>
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

      {/* Bottom CTA */}
      <div style={{ position: "relative", zIndex: 10, padding: "0 24px", paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}>
        <div style={{ maxWidth: 360, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Telegram button */}
          <a
            href={TG_BOT ? `https://t.me/${TG_BOT.replace("@", "")}` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", borderRadius: 16,
              background: "white", padding: "16px 0",
              fontSize: 16, fontWeight: 700, color: "rgba(0,0,0,0.88)",
              textDecoration: "none",
              boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
            }}
          >
            {/* Telegram icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#29B6F6" />
              <path d="M17.5 7L5.5 11.5l3.5 1.5 1.5 4.5 2-2.5 3 2.5 2-10z" fill="white" />
            </svg>
            Перейти в Telegram бот
          </a>

          {/* Activation code toggle */}
          {!showCode && !success && (
            <button
              onClick={() => setShowCode(true)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 13, cursor: "pointer", padding: "4px 0", textAlign: "center", textDecoration: "underline", textDecorationColor: "rgba(255,255,255,0.2)" }}
            >
              Уже есть код активации?
            </button>
          )}

          {/* Code input */}
          {showCode && !success && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="Введите код"
                maxLength={20}
                style={{
                  width: "100%", borderRadius: 14,
                  background: "rgba(255,255,255,0.10)",
                  border: error ? "1px solid rgba(248,113,113,0.6)" : "1px solid rgba(255,255,255,0.15)",
                  color: "white", fontSize: 18, fontWeight: 600,
                  padding: "14px 16px", textAlign: "center",
                  letterSpacing: "0.1em", outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {error && <p style={{ textAlign: "center", fontSize: 12, color: "#f87171", margin: 0 }}>{error}</p>}
              <button
                onClick={handleActivate}
                disabled={loading || !code.trim()}
                style={{
                  width: "100%", borderRadius: 14,
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "white", fontSize: 15, fontWeight: 600,
                  padding: "14px 0", cursor: "pointer",
                  opacity: loading || !code.trim() ? 0.5 : 1,
                }}
              >
                {loading ? "Проверяем..." : "Активировать"}
              </button>
            </div>
          )}

          {/* Success state */}
          {success && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <p style={{ fontSize: 22, margin: "0 0 6px" }}>✓</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "white", margin: 0 }}>Pro активирован!</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── EN version (unchanged) ───────────────────────────────────────────────────

function ProPageEn() {
  const router = useRouter();
  const { t } = useT();
  const { refresh } = useProStatus();
  const [plan, setPlan] = useState<"year" | "month">("year");
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState("");
  const [monthlyPkg, setMonthlyPkg] = useState<RCPackage | null>(null);
  const [yearlyPkg, setYearlyPkg] = useState<RCPackage | null>(null);

  useEffect(() => {
    getOfferings().then(offering => {
      if (!offering) return;
      const pkgs = offering.availablePackages ?? [];
      const monthly = offering.monthly ?? pkgs.find((p: RCPackage) => p.identifier === "$rc_monthly") ?? null;
      const annual = offering.annual ?? pkgs.find((p: RCPackage) => p.identifier === "$rc_annual") ?? null;
      setMonthlyPkg(monthly);
      setYearlyPkg(annual);
    }).catch(() => {});
  }, []);

  async function handlePurchase() {
    setPurchasing(true);
    setError("");
    try {
      const pkg = plan === "year" ? yearlyPkg : monthlyPkg;
      const fallbackId = plan === "year" ? "app_divina_pro_yearly" : "app_divina_pro_monthly";
      if (pkg) {
        await purchasePackage(pkg);
      } else {
        await purchaseProduct(fallbackId);
      }
      await refresh();
      router.back();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.toLowerCase().includes("cancel")) {
        setError(t("paywall.purchaseError") || "Purchase failed. Please try again.");
      }
    } finally {
      setPurchasing(false);
    }
  }

  const perks = [
    t("pro.perk1"),
    t("pro.perk2"),
    t("pro.perk3"),
    t("pro.perk4"),
    t("pro.perk5"),
  ];

  return (
    <div style={{ position: "relative", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <video
        src="/prodaction2.mp4"
        autoPlay loop muted playsInline
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(90deg)", minWidth: "100vh", minHeight: "100vw", width: "auto", height: "auto", zIndex: 0, pointerEvents: "none" }}
      />
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 50, padding: "env(safe-area-inset-top) 20px 0", marginTop: 16 }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 40, width: 40, borderRadius: 20, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
      </div>

      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", marginTop: -20 }}>
        <div style={{ display: "inline-flex", height: 64, width: 64, alignItems: "center", justifyContent: "center", borderRadius: 18, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)", marginBottom: 20 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" /></svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "white", marginBottom: 10, textAlign: "center", lineHeight: 1.2 }}>{t("paywall.sub.headline")}</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 24, textAlign: "center", lineHeight: 1.6, maxWidth: 320 }}>
          {t("paywall.sub.descBefore")}
          <span style={{ color: "rgba(255,255,255,0.90)", fontWeight: 600 }}>{t("paywall.sub.descBold")}</span>
          {t("paywall.sub.descAfter")}
        </p>
        <div style={{ width: "100%", maxWidth: 360, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 20, padding: 20, marginBottom: 8 }}>
          {perks.map((text, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: i < perks.length - 1 ? 14 : 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 10, padding: "0 24px", paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}>
        <div style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 24, padding: 16, marginBottom: 16, maxWidth: 360, margin: "0 auto 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => setPlan("year")} style={{ position: "relative", width: "100%", borderRadius: 16, padding: 16, border: plan === "year" ? "1px solid rgba(255,255,255,0.40)" : "1px solid rgba(255,255,255,0.10)", background: plan === "year" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)", cursor: "pointer" }}>
              <div style={{ position: "absolute", top: -10, right: 16, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 99, padding: "2px 10px", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "0.05em" }}>{t("pro.badge")}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "white", margin: 0 }}>{t("pro.yearlySubscription")}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: "4px 0 0" }}>{YEAR_WEEKLY} {t("pro.perWeek")}</p>
                </div>
                <p style={{ fontSize: 20, fontWeight: 700, color: "white", margin: 0 }}>{YEAR_TOTAL}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", fontWeight: 400 }}> {t("pro.perYear")}</span></p>
              </div>
            </button>
            <button onClick={() => setPlan("month")} style={{ width: "100%", borderRadius: 16, padding: 16, border: plan === "month" ? "1px solid rgba(255,255,255,0.40)" : "1px solid rgba(255,255,255,0.10)", background: plan === "month" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)", cursor: "pointer" }}>
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
        <div style={{ maxWidth: 360, margin: "0 auto" }}>
          {error && <p style={{ textAlign: "center", fontSize: 12, color: "#f87171", marginBottom: 8 }}>{error}</p>}
          <button onClick={handlePurchase} disabled={purchasing} style={{ width: "100%", borderRadius: 16, background: "white", padding: "16px 0", fontSize: 16, fontWeight: 700, color: "rgba(0,0,0,0.88)", border: "none", cursor: "pointer", boxShadow: "0 4px 32px rgba(0,0,0,0.6)", opacity: purchasing ? 0.6 : 1 }}>
            {purchasing ? t("paywall.processing") : t("pro.trialCta")}
          </button>
          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 10 }}>
            {t("pro.then")} {plan === "year" ? `${YEAR_WEEKLY}/week, billed ${YEAR_TOTAL}/yr` : `${MONTH_WEEKLY}/week, billed ${MONTH_TOTAL}/mo`} · {t("pro.cancelAnytime")}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function ProPage() {
  return APP_LANG === "ru" ? <ProPageRu /> : <ProPageEn />;
}
