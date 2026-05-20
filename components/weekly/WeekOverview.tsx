"use client";

import { useT } from "@/lib/i18n";

interface WeekOverviewProps {
  weekLabel: string;
  overview: string;
  bestDay: number;
  hardestDay: number;
  weeklyAdvice: string;
}

export default function WeekOverview({ weekLabel, overview, bestDay, hardestDay, weeklyAdvice }: WeekOverviewProps) {
  const { t } = useT();

  return (
    <div className="mx-5 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(28px) saturate(1.6)",
        WebkitBackdropFilter: "blur(28px) saturate(1.6)",
        border: "1px solid rgba(255,255,255,0.92)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.13), inset 0 1px 0 rgba(255,255,255,1)",
      }}
    >
      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.07)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-black/45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
            </svg>
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-black">{t("week.overview")}</h2>
            <p className="text-xs text-black/35">{weekLabel}</p>
          </div>
        </div>

        <p className="text-[15px] leading-[1.8] text-black/80 mb-5">{overview}</p>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}>
            <p className="text-[11px] text-emerald-700/70 mb-0.5">{t("week.bestDay")}</p>
            <p className="text-sm font-semibold text-emerald-700">{bestDay}</p>
          </div>
          <div className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)" }}>
            <p className="text-[11px] text-amber-700/70 mb-0.5">{t("week.hardestDay")}</p>
            <p className="text-sm font-semibold text-amber-700">{hardestDay}</p>
          </div>
        </div>

        <div className="rounded-xl px-4 py-3" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}>
          <p className="text-sm leading-relaxed text-black/60 italic">{weeklyAdvice}</p>
        </div>
      </div>
    </div>
  );
}
