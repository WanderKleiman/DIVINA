"use client";

import { useState } from "react";
import PaywallSheet from "./PaywallSheet";
import { getSubscriptionPrices } from "@/lib/pricing";

interface SubscriptionPaywallProps {
  open: boolean;
  onClose: () => void;
}

const perks = [
  "Детальный недельный прогноз каждую неделю",
  "3 проверки совместимости в месяц",
  "Расширенные транзиты и аспекты",
  "Без рекламы",
];

export default function SubscriptionPaywall({ open, onClose }: SubscriptionPaywallProps) {
  const [plan, setPlan] = useState<"year" | "month">("year");
  const prices = getSubscriptionPrices();

  return (
    <PaywallSheet
      open={open}
      onClose={onClose}
      cta={
        <button className="w-full rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm py-4 text-base font-semibold text-white active:bg-white/20 transition-colors">
          Подписаться — {plan === "year" ? prices.yearLabel : prices.monthLabel}
        </button>
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
        <p className="text-sm text-white/40">Раскройте полный потенциал прогноза</p>
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
            plan === "year"
              ? "border-white/30 bg-white/10"
              : "border-white/10 bg-white/[0.04]"
          }`}
        >
          <div className="absolute -top-2.5 right-4 rounded-full bg-white/20 border border-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/70 tracking-wider">
            ВЫГОДНО
          </div>
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-medium text-white">Годовая</p>
              <p className="text-xs text-white/30 mt-0.5">{prices.yearWeekly} / неделя</p>
            </div>
            <p className="text-lg font-semibold text-white">{prices.yearTotal}<span className="text-xs text-white/30 font-normal"> / год</span></p>
          </div>
        </button>

        <button
          onClick={() => setPlan("month")}
          className={`w-full rounded-2xl p-4 border transition-colors ${
            plan === "month"
              ? "border-white/30 bg-white/10"
              : "border-white/10 bg-white/[0.04]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-medium text-white">Месячная</p>
              <p className="text-xs text-white/30 mt-0.5">{prices.monthWeekly} / неделя</p>
            </div>
            <p className="text-lg font-semibold text-white">{prices.monthTotal}<span className="text-xs text-white/30 font-normal"> / мес</span></p>
          </div>
        </button>
      </div>

      <p className="text-center text-[11px] text-white/20 mt-4">
        Отмена в любое время
      </p>
    </PaywallSheet>
  );
}
