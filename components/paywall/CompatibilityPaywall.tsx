"use client";

import PaywallSheet from "./PaywallSheet";
import { formatPrice } from "@/lib/pricing";

interface CompatibilityPaywallProps {
  open: boolean;
  onClose: () => void;
}

const perks = [
  "Общий процент совместимости",
  "Анализ по 5 сферам: любовь, эмоции, интеллект, ценности, страсть",
  "Ключевые аспекты вашей пары",
  "Рекомендации для укрепления отношений",
];

export default function CompatibilityPaywall({ open, onClose }: CompatibilityPaywallProps) {
  return (
    <PaywallSheet
      open={open}
      onClose={onClose}
      videoSrc="/moon2.mp4"
      cta={
        <button className="w-full rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm py-4 text-base font-semibold text-white active:bg-white/20 transition-colors">
          Разблокировать — {formatPrice(2)}
        </button>
      }
    >
      <div className="text-center mb-8 pt-2">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/10 mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Совместимость</h2>
        <p className="text-sm text-white/40">Узнайте, насколько вы совместимы</p>
      </div>

      <div className="space-y-3 mb-4">
        {perks.map((text, i) => (
          <div key={i} className="flex items-start gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-white/50">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm text-white/70">{text}</span>
          </div>
        ))}
      </div>
    </PaywallSheet>
  );
}
