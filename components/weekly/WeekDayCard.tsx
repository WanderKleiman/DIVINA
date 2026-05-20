"use client";

import { useState } from "react";
import type { WeeklyDayHighlight } from "@/lib/types";
import { useT } from "@/lib/i18n";

interface WeekDayCardProps {
  day: WeeklyDayHighlight;
  isBest: boolean;
  isHardest: boolean;
}

const energyColors: Record<string, string> = {
  high: "bg-white",
  medium: "bg-white/50",
  low: "bg-white/20",
};

export default function WeekDayCard({ day, isBest, isHardest }: WeekDayCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useT();

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="glass w-full text-left transition-all active:scale-[0.99]"
    >
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${energyColors[day.energy]}`} />
              <span className="text-sm font-medium text-white/80">{day.weekday}</span>
              <span className="text-xs text-white/30">{day.dayNumber}</span>
            </div>
            {isBest && (
              <span className="text-[10px] font-medium text-emerald-400/70 bg-emerald-500/10 border border-emerald-500/20 rounded-md px-1.5 py-0.5">{t("week.best")}</span>
            )}
            {isHardest && (
              <span className="text-[10px] font-medium text-amber-400/70 bg-amber-500/10 border border-amber-500/20 rounded-md px-1.5 py-0.5">{t("week.hardest")}</span>
            )}
            {day.isKeyDay && day.keyEvent && (
              <span className="text-[10px] font-medium text-purple-400/70 bg-purple-500/10 border border-purple-500/20 rounded-md px-1.5 py-0.5">{day.keyEvent}</span>
            )}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-white/30 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <p className="text-sm text-white/60">{day.headline}</p>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
            <div>
              <p className="text-xs font-medium text-emerald-400/70 mb-1.5 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t("energy.do")}
              </p>
              <ul className="space-y-1">
                {day.doList.map((item, i) => (
                  <li key={i} className="text-sm text-white/70 pl-4 relative">
                    <span className="absolute left-0 top-1.5 h-1 w-1 rounded-full bg-emerald-400/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-medium text-amber-400/70 mb-1.5 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                {t("energy.avoid")}
              </p>
              <ul className="space-y-1">
                {day.dontList.map((item, i) => (
                  <li key={i} className="text-sm text-white/70 pl-4 relative">
                    <span className="absolute left-0 top-1.5 h-1 w-1 rounded-full bg-amber-400/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
