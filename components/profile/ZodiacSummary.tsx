"use client";

import type { NatalChart } from "@/lib/types";
import ZodiacIcon from "@/components/icons/ZodiacIcon";
import { useT } from "@/lib/i18n";

interface ZodiacSummaryProps {
  chart: NatalChart;
}

export default function ZodiacSummary({ chart }: ZodiacSummaryProps) {
  const { t } = useT();

  const items = [
    { label: t("zodiac.sunSign"), symbol: chart.sunSignSymbol, name: chart.sunSign },
    { label: t("zodiac.ascendant"), symbol: chart.ascendantSymbol, name: chart.ascendant },
    { label: t("zodiac.moonSign"), symbol: chart.moonSignSymbol, name: chart.moonSign },
  ];

  return (
    <div className="mx-5 grid grid-cols-3 gap-3">
      {items.map((item, i) => (
        <div key={i} className="glass">
          <div className="relative z-10 p-3 flex flex-col items-center">
            <p className="text-xs text-white/40 mb-1">{item.label}</p>
            <ZodiacIcon sign={item.symbol} size={26} className="text-white/80 mb-0.5" />
            <p className="text-sm text-white/70">{item.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
