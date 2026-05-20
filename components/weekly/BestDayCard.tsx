"use client";

import type { BestDayFor } from "@/lib/types";
import { useT } from "@/lib/i18n";

const KNOWN_ICONS: Record<string, string> = {
  decisions: "⏱",
  love: "❤️",
  newProjects: "✦",
  finances: "$",
  health: "💪",
  rest: "🌙",
  creativity: "🎨",
  selfCare: "🧘",
  communication: "💬",
  boundaries: "🛡",
  adventure: "🧭",
  learning: "📖",
};

export default function BestDayCard({ bestDayFor }: { bestDayFor: BestDayFor }) {
  const { t } = useT();
  const entries = Object.entries(bestDayFor);
  if (entries.length === 0) return null;

  function toLabel(key: string): string {
    const translated = t(`bestDay.${key}`);
    if (translated !== `bestDay.${key}`) return translated;
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");
  }

  return (
    <div className="glass-strong mx-5 rounded-2xl p-5">
      <h3 className="text-base font-medium text-white/90 mb-4">
        {t("week.bestDayFor")}
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {entries.map(([key, item]) => {
          if (!item) return null;
          return (
            <div key={key} className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 mt-0.5 text-sm">
                {KNOWN_ICONS[key] || "✦"}
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-white/80">{toLabel(key)}:</span>
                  <span className="text-sm font-semibold text-white/90">{item.day}</span>
                </div>
                <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{item.why}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
