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
  "paywall.sub.perk1",
  "paywall.sub.perk2",
  "paywall.sub.perk3",
  "paywall.sub.perk4",
  "paywall.sub.perk5",
] as const;

const PERK_ICONS = [
  // Sun / day
  <svg key="p1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
    <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
  </svg>,
  // Calendar / week
  <svg key="p2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" />
  </svg>,
  // Layers / forecast
  <svg key="p3" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>,
  // Heart / compatibility
  <svg key="p4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
  </svg>,
  // Star / personality
  <svg key="p5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
  </svg>,
];

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

  // Always show trial CTA — App Store handles eligibility natively
  const hasTrial = true;

  useEffect(() => {
    if (!open) return;
    getOfferings().then(offering => {
      if (!offering) return;
      setMonthlyPkg(offering.monthly);
      setYearlyPkg(offering.annual);
    });
  }, [open]);

  const yearPrice  = yearlyPkg?.product.priceString  ?? fallback.yearTotal;
  const monthPrice = monthlyPkg?.product.priceString ?? fallback.monthTotal;
  const yearWeekly  = fallback.yearWeekly;
  const monthWeekly = fallback.monthWeekly;

  // Show "then X/period" hint below the CTA
  const trialHintPrice = plan === "year"
    ? `${yearPrice} / ${t("paywall.year")}`
    : `${monthPrice} / ${t("paywall.month")}`;

  async function handlePurchase() {
    const pkg = plan === "year" ? yearlyPkg : monthlyPkg;
    if (!pkg) { setError(t("paywall.noProducts")); return; }
    setPurchasing(true);
    setError("");
    try {
      await purchasePackage(pkg);
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

  // Get user's first name if available
  const userName = getUserData().name?.split(" ")[0] ?? "";

  return (
    <PaywallSheet
      open={open}
      onClose={onClose}
      cta={
        <div className="space-y-2">
          {error && <p className="text-center text-xs text-red-400">{error}</p>}

          {/* Primary CTA — white button */}
          <button
            onClick={handlePurchase}
            disabled={purchasing || restoring}
            className="w-full rounded-2xl py-4 text-base font-bold text-black/80 active:opacity-80 transition-opacity disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
            }}
          >
            {purchasing ? t("paywall.processing") : t("paywall.trialCta")}
          </button>

          {/* "$1.2 a week" hint */}
          {!purchasing && (
            <p className="text-center text-[12px] text-white/40">
              {t("paywall.trialWeeklyPrice")}
            </p>
          )}

          {/* Restore */}
          <button
            onClick={handleRestore}
            disabled={purchasing || restoring}
            className="w-full py-1 text-xs text-white/20 disabled:opacity-50"
          >
            {restoring ? t("paywall.restoring") : t("paywall.restore")}
          </button>
        </div>
      }
    >
      {/* ── Headline ── */}
      <div className="pt-2 mb-7">
        {userName ? (
          <p className="text-sm text-white/40 mb-1">{userName},</p>
        ) : null}
        <h2 className="text-[26px] font-bold text-white leading-tight mb-3">
          {t("paywall.sub.headline")}
        </h2>
        {/* Description with bold middle part */}
        <p className="text-sm text-white/55 leading-relaxed">
          {t("paywall.sub.descBefore")}
          <span className="text-white/90 font-semibold">{t("paywall.sub.descBold")}</span>
          {t("paywall.sub.descAfter")}
        </p>
      </div>

      {/* ── Perks ── */}
      <div className="space-y-3.5 mb-8">
        {PERKS.map((key, i) => (
          <div key={key} className="flex items-start gap-3">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.2)", color: "rgba(167,139,250,0.9)" }}
            >
              {PERK_ICONS[i]}
            </div>
            <span className="text-sm text-white/70 leading-snug pt-0.5">{t(key)}</span>
          </div>
        ))}
      </div>

      {/* ── Plan selector ── */}
      <div className="space-y-2.5 mb-2">
        {/* Yearly */}
        <button
          onClick={() => setPlan("year")}
          className={`w-full relative rounded-2xl p-4 border transition-all ${
            plan === "year"
              ? "border-violet-400/40 bg-violet-500/10"
              : "border-white/10 bg-white/[0.04]"
          }`}
        >
          <div className="absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider"
            style={{ background: "rgba(139,92,246,0.25)", border: "1px solid rgba(139,92,246,0.35)", color: "rgba(196,181,253,1)" }}>
            {t("paywall.bestValue")}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-semibold text-white">{t("paywall.yearly")}</p>
              <p className="text-xs text-white/30 mt-0.5">{yearWeekly} / {t("paywall.week")}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white">{yearPrice}</p>
              <p className="text-[10px] text-white/30">/ {t("paywall.year")}</p>
            </div>
          </div>
        </button>

        {/* Monthly */}
        <button
          onClick={() => setPlan("month")}
          className={`w-full rounded-2xl p-4 border transition-all ${
            plan === "month"
              ? "border-violet-400/40 bg-violet-500/10"
              : "border-white/10 bg-white/[0.04]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-semibold text-white">{t("paywall.monthly")}</p>
              <p className="text-xs text-white/30 mt-0.5">{monthWeekly} / {t("paywall.week")}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white">{monthPrice}</p>
              <p className="text-[10px] text-white/30">/ {t("paywall.month")}</p>
            </div>
          </div>
        </button>
      </div>
    </PaywallSheet>
  );
}
