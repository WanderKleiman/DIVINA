"use client";

import type { Transit } from "@/lib/types";
import { useT } from "@/lib/i18n";

interface TransitCardProps {
  transits: Transit[];
}

export default function TransitCard({ transits }: TransitCardProps) {
  const { t } = useT();

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-5">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/50">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <h2 className="text-lg font-medium tracking-wide text-white/90">
          {t("transit.title")}
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide pl-5 scroll-pl-5">
        {transits.map((tr, i) => (
          <div
            key={i}
            className="glass-strong shrink-0 w-[280px] snap-start"
          >
            <div className="relative z-10 p-4">
              <p className="text-sm font-medium text-black/40 mb-2">
                {tr.transitSymbol} {tr.transitPlanet} {tr.aspectSymbol} {tr.natalSymbol} {tr.natalPlanet}
              </p>
              <p className="text-sm leading-relaxed text-black/75">
                {tr.brief}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
