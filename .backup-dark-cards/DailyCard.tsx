"use client";

import type { TarotCard, Rune } from "@/lib/types";
import { useT } from "@/lib/i18n";

interface DailyCardProps {
  tarotCard: TarotCard;
  rune: Rune;
}

export default function DailyCard({ tarotCard, rune }: DailyCardProps) {
  const { t } = useT();

  return (
    <div className="mx-5 grid grid-cols-2 gap-3">
      {/* Tarot */}
      <div className="glass-strong">
        <div className="relative z-10 p-4 text-center">
          <div className="mx-auto mb-3 flex h-16 w-12 items-center justify-center rounded-lg border border-white/15 bg-white/5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/60">
              <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 10c2.5 0 4.5 1.34 4.5 2s-2 2-4.5 2-4.5-1.34-4.5-2 2-2 4.5-2z" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
            </svg>
          </div>
          <p className="text-xs text-white/40 mb-0.5">{t("daily.tarot")}</p>
          <h3 className="font-medium text-white text-sm">
            {tarotCard.name} ({tarotCard.numeral})
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-white/60">
            {tarotCard.meaning}
          </p>
        </div>
      </div>

      {/* Rune */}
      <div className="glass-strong">
        <div className="relative z-10 p-4 text-center">
          <div className="mx-auto mb-3 flex h-16 w-12 items-center justify-center rounded-lg border border-white/15 bg-white/5">
            <span className="text-2xl text-white/60 font-bold">{rune.symbol}</span>
          </div>
          <p className="text-xs text-white/40 mb-0.5">{t("daily.rune")}</p>
          <h3 className="font-medium text-white text-sm">
            {rune.name}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-white/60">
            {rune.meaning}
          </p>
        </div>
      </div>
    </div>
  );
}
