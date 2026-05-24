"use client";

import { useState, useEffect } from "react";
import PaywallSheet from "./PaywallSheet";
import { getSubscriptionPrices } from "@/lib/pricing";
import { getOfferings, purchasePackage, restorePurchases, type RCPackage } from "@/lib/purchases-native";
import { useProStatus } from "@/lib/pro-status";
import { useT } from "@/lib/i18n";
import { getUserData } from "@/lib/user-data";

interface SubscriptionPaywallProps {
  open: boolean;
  onClose: () => void;
}

const PERKS = [
  { key: "paywall.sub.perk1", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
    </svg>
  )},
  { key: "paywall.sub.perk2", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>
    </svg>
  )},
  { key: "paywall.sub.perk3", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  )},
  { key: "paywall.sub.perk4", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )},
  { key: "paywall.sub.perk5", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  )},
] as const;

const YEAR_TOTAL = "$24.99";
const YEAR_WEEKLY = "$0.48";
const MONTH_TOTAL = "$4.99";
const MONTH_WEEKLY = "$1.2";

export default function SubscriptionPaywall({ open, onClose }: SubscriptionPaywallProps) {
  const [plan, setPlan] = useState<"year" | "month">("year");
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState("");
  const [monthlyPkg, setMonthlyPkg] = useState<RCPackage | null>(null);
  const [yearlyPkg, setYearlyPkg] = useState<RCPackage | null>(null);
  const { refresh } = useProStatus();
  const { t } = useT();
  const fallback = getSubscriptionPrices();

  useEffect(() => {
    if (!open) return;
    getOfferings().then(offering => {
      if (!offering) return;
      setMonthlyPkg(offering.monthly);
      setYearlyPkg(offering.annual);
    });
  }, [open]);

  const selectedPkg = plan === "year" ? yearlyPkg : monthlyPkg;

  async function handlePurchase() {
    if (!selectedPkg) { setError(t("paywall.noProducts")); return; }
    setPurchasing(true);
    setError("");
    try {
      await purchasePackage(selectedPkg);
      await refresh();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("cancel") && !msg.includes("Cancel")) {
        setError(t("paywall.purchaseError"));
      }
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    setError("");
    try {
      await restorePurchases();
      await refresh();
      onClose();
    } catch {
      setError(t("paywall.restoreError"));
    } finally {
      setRestoring(false);
    }
  }

  const userName = getUserData().name?.split(" ")[0] ?? "";

  return (
    <PaywallSheet open={open} onClose={onClose} videoSrc="/prodaction2.mp4" rotateVideo>
      {/* ── Headline ── */}
      <div className="pt-2 mb-5">
        {userName ? <p className="text-sm text-white/40 mb-1">{userName},</p> : null}
        <h2 className="text-[24px] font-bold text-white leading-tight mb-3">
          {t("paywall.sub.headline")}
        </h2>
        <p className="text-sm text-white/55 leading-relaxed">
          {t("paywall.sub.descBefore")}
          <span className="text-white/90 font-semibold">{t("paywall.sub.descBold")}</span>
          {t("paywall.sub.descAfter")}
        </p>
      </div>

      {/* ── Perks ── */}
      <div className="space-y-3 mb-6">
        {PERKS.map(({ key, icon }) => (
          <div key={key} className="flex items-start gap-3">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.2)", color: "rgba(167,139,250,0.9)" }}
            >
              {icon}
            </div>
            <span className="text-sm text-white/70 leading-snug pt-1">{t(key)}</span>
          </div>
        ))}
      </div>

      {/* ── Plan selector ── */}
      <div className="flex flex-col gap-2.5 mb-5" style={{ background: "rgba(0,0,0,0.30)", borderRadius: 20, padding: 12 }}>
        {/* Yearly */}
        <button
          onClick={() => setPlan("year")}
          className="relative w-full rounded-2xl p-4 text-left transition-all"
          style={{ border: plan === "year" ? "1px solid rgba(255,255,255,0.40)" : "1px solid rgba(255,255,255,0.10)", background: plan === "year" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)" }}
        >
          <div className="absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)" }}>
            {t("pro.badge")}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{t("pro.yearlySubscription")}</p>
              <p className="text-xs text-white/50 mt-0.5">{yearlyPkg?.product.priceString ? `${yearlyPkg.product.priceString}` : YEAR_TOTAL} · {YEAR_WEEKLY} {t("pro.perWeek")}</p>
            </div>
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ border: plan === "year" ? "none" : "1.5px solid rgba(255,255,255,0.25)", background: plan === "year" ? "white" : "transparent" }}>
              {plan === "year" && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
            </div>
          </div>
        </button>

        {/* Monthly */}
        <button
          onClick={() => setPlan("month")}
          className="w-full rounded-2xl p-4 text-left transition-all"
          style={{ border: plan === "month" ? "1px solid rgba(255,255,255,0.40)" : "1px solid rgba(255,255,255,0.10)", background: plan === "month" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{t("pro.monthlySubscription")}</p>
              <p className="text-xs text-white/50 mt-0.5">{monthlyPkg?.product.priceString ?? MONTH_TOTAL} · {MONTH_WEEKLY} {t("pro.perWeek")}</p>
            </div>
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ border: plan === "month" ? "none" : "1.5px solid rgba(255,255,255,0.25)", background: plan === "month" ? "white" : "transparent" }}>
              {plan === "month" && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
            </div>
          </div>
        </button>
      </div>

      {/* ── CTA ── */}
      <div className="flex flex-col gap-3">
        {error && <p className="text-center text-xs text-red-400">{error}</p>}

        <button
          onClick={handlePurchase}
          disabled={purchasing || restoring}
          className="w-full rounded-2xl py-4 text-base font-bold text-black/80 active:opacity-80 transition-opacity disabled:opacity-50"
          style={{ background: "rgba(255,255,255,0.92)", boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}
        >
          {purchasing ? t("paywall.processing") : t("paywall.trialCta")}
        </button>

        <p className="text-center text-[12px] text-white/35">
          {t("pro.then")} {plan === "year" ? `${YEAR_WEEKLY}/${t("pro.perWeek")}, billed ${YEAR_TOTAL}/yr` : `${MONTH_WEEKLY}/${t("pro.perWeek")}, billed ${MONTH_TOTAL}/mo`} · {t("paywall.cancelAnytime")}
        </p>

        <button
          onClick={handleRestore}
          disabled={purchasing || restoring}
          className="w-full py-1 text-xs text-white/20 disabled:opacity-50"
        >
          {restoring ? t("paywall.restoring") : t("paywall.restore")}
        </button>
      </div>
    </PaywallSheet>
  );
}
