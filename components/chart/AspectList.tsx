"use client";

import type { Aspect } from "@/lib/types";
import { useT } from "@/lib/i18n";

interface AspectListProps {
  aspects: Aspect[];
}

// Prioritize: conjunctions and oppositions first (strongest), then squares, trines, sextiles
const ASPECT_PRIORITY: Record<string, number> = {
  "Соединение": 1,
  "Оппозиция": 2,
  "Квадратура": 3,
  "Тригон": 4,
  "Секстиль": 5,
};

// Personal planets are more important
const PLANET_PRIORITY: Record<string, number> = {
  "Солнце": 1, "Луна": 1, "Меркурий": 2, "Венера": 2, "Марс": 2,
  "Юпитер": 3, "Сатурн": 3, "Уран": 4, "Нептун": 4, "Плутон": 4,
};

function sortAndLimit(aspects: Aspect[], limit = 6): Aspect[] {
  return [...aspects]
    .sort((a, b) => {
      const aPri = (ASPECT_PRIORITY[a.aspect] ?? 5) + Math.min(PLANET_PRIORITY[a.planet1] ?? 5, PLANET_PRIORITY[a.planet2] ?? 5);
      const bPri = (ASPECT_PRIORITY[b.aspect] ?? 5) + Math.min(PLANET_PRIORITY[b.planet1] ?? 5, PLANET_PRIORITY[b.planet2] ?? 5);
      return aPri - bPri;
    })
    .slice(0, limit);
}

export default function AspectList({ aspects }: AspectListProps) {
  const { t } = useT();
  const topAspects = sortAndLimit(aspects, 6);

  return (
    <div className="glass mx-5">
      <div className="relative z-10 p-4">
        <h3 className="font-medium tracking-wide text-white mb-3">{t("chart.aspects")}</h3>
        <div className="space-y-3">
          {topAspects.map((a, i) => (
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
                  <span className="text-white/80 font-medium truncate">{a.planet1}</span>
                  <span className="text-white/30 text-base shrink-0">{a.aspectSymbol}</span>
                  <span className="text-white/80 font-medium truncate">{a.planet2}</span>
                </div>
                <span className="text-[10px] text-white/25 shrink-0 tabular-nums tracking-wide">{a.aspect.toUpperCase()}</span>
              </div>
              <p className="text-xs leading-relaxed text-white/50">{a.interpretation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
