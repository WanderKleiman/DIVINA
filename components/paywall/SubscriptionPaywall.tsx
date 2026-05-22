"use client";

import { useState, useEffect } from "react";
import PaywallSheet from "./PaywallSheet";
import { getSubscriptionPrices } from "@/lib/pricing";
import { getOfferings, purchasePackage, restorePurchases, type RCPackage } from "@/lib/purchases-native";
import { useProStatus } from "@/lib/pro-status";
import { useT } from "@/lib/i18n";

interface SubscriptionPaywallProps {
  open: boolean;
  onClose: () => void;
}

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

  // Load real prices from App Store via RevenueCat
  useEffect(() => {
    if (!open) return;
    getOfferings().then(offering => {
      if (!offering) return;
      setMonthlyPkg(offering.monthly);
      setYearlyPkg(offering.annual);
    });
  }, [open]);

  // Display prices: use App Store price if available, else fallback to our estimates
  const yearPrice = yearlyPkg?.product.priceString ?? fallback.yearTotal;
  const monthPrice = monthlyPkg?.product.priceString ?? fallback.monthTotal;
  const yearWeekly = fallback.yearWeekly;
  const monthWeekly = fallback.monthWeekly;

  async function handlePurchase() {
    const pkg = plan === "year" ? yearlyPkg : monthlyPkg;
    if (!pkg) {
      setError(t("paywall.noProducts"));
      return;
    }
    setPurchasing(true);
    setError("");
    try {
      await purchasePackage(pkg);
      await refresh();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      // User cancellation is not an error worth showing
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

  const perks = [
    t("paywall.sub.perk1"),
    t("paywall.sub.perk2"),
    t("paywall.sub.perk3"),
    t("paywall.sub.perk4"),
  ];

  return (
    <PaywallSheet
      open={open}
      onClose={onClose}
      cta={
        <div className="space-y-2">
          {error ? <p className="text-center text-xs text-red-400">{error}</p> : null}
          <button
            onClick={handlePurchase}
            disabled={purchasing || restoring}
            className="w-full rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm py-4 text-base font-semibold text-white active:bg-white/20 transition-colors disabled:opacity-50"
          >
            {purchasing
              ? t("paywall.processing")
              : `${t("paywall.subscribe")} — ${plan === "year" ? yearPrice : monthPrice}`}
          </button>
          <button
            onClick={handleRestore}
            disabled={purchasing || restoring}
            className="w-full py-2 text-xs text-white/30 disabled:opacity-50"
          >
            {restoring ? t("paywall.restoring") : t("paywall.restore")}
          </button>
        </div>
      }
    >
      {/* Header */}
      <div className="text-center mb-8 pt-2">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/10 mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Divina Pro</h2>
        <p className="text-sm text-white/40">{t("paywall.sub.subtitle")}</p>
      </div>

      {/* Perks */}
      <div className="space-y-3 mb-8">
        {perks.map((text, i) => (
          <div key={i} className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/50">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm text-white/70">{text}</span>
          </div>
        ))}
      </div>

      {/* Plan selector */}
      <div className="space-y-2.5">
        <button
          onClick={() => setPlan("year")}
          className={`w-full relative rounded-2xl p-4 border transition-colors ${
            plan === "year" ? "border-white/30 bg-white/10" : "border-white/10 bg-white/[0.04]"
          }`}
        >
          <div className="absolute -top-2.5 right-4 rounded-full bg-white/20 border border-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/70 tracking-wider">
            {t("paywall.bestValue")}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-medium text-white">{t("paywall.yearly")}</p>
              <p className="text-xs text-white/30 mt-0.5">{yearWeekly} / {t("paywall.week")}</p>
            </div>
            <p className="text-lg font-semibold text-white">{yearPrice}<span className="text-xs text-white/30 font-normal"> / {t("paywall.year")}</span></p>
          </div>
        </button>

        <button
          onClick={() => setPlan("month")}
          className={`w-full rounded-2xl p-4 border transition-colors ${
            plan === "month" ? "border-white/30 bg-white/10" : "border-white/10 bg-white/[0.04]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-medium text-white">{t("paywall.monthly")}</p>
              <p className="text-xs text-white/30 mt-0.5">{monthWeekly} / {t("paywall.week")}</p>
            </div>
            <p className="text-lg font-semibold text-white">{monthPrice}<span className="text-xs text-white/30 font-normal"> / {t("paywall.month")}</span></p>
          </div>
        </button>
      </div>

      <p className="text-center text-[11px] text-white/20 mt-4">
        {t("paywall.cancelAnytime")}
      </p>
    </PaywallSheet>
  );
}
