"use client";

import type { Planet } from "@/lib/types";
import ZodiacIcon from "@/components/icons/ZodiacIcon";
import { useT } from "@/lib/i18n";

interface PlanetTableProps {
  planets: Planet[];
}

export default function PlanetTable({ planets }: PlanetTableProps) {
  const { t } = useT();

  return (
    <div className="glass mx-5">
      <div className="relative z-10 p-4">
        <h3 className="font-medium tracking-wide text-white mb-3">{t("chart.planets")}</h3>
        <div className="space-y-2">
          {planets.map((p, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-white/60 w-5 text-center">{p.symbol}</span>
                <span className="text-white/80">{p.name}</span>
                {p.retrograde && (
                  <span className="text-[10px] text-white/40 font-bold">R</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ZodiacIcon sign={p.signSymbol} size={14} className="text-white/50" />
                <span className="text-white/70">{p.sign}</span>
                <span className="text-white/40 text-xs">{p.degree}°</span>
                {p.house && (
                  <span className="text-white/30 text-xs">{t("chart.house")} {p.house}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
