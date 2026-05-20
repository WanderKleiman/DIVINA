"use client";

import ZodiacIcon from "@/components/icons/ZodiacIcon";
import { useT } from "@/lib/i18n";

interface ChartInterpretationProps {
  interpretation: string;
  sunSign: string;
  sunSignSymbol: string;
  ascendant: string;
  ascendantSymbol: string;
  moonSign: string;
  moonSignSymbol: string;
}

export default function ChartInterpretation({
  interpretation,
  sunSign,
  sunSignSymbol,
  ascendant,
  ascendantSymbol,
  moonSign,
  moonSignSymbol,
}: ChartInterpretationProps) {
  const { t } = useT();

  return (
    <div className="glass-strong mx-5">
      <div className="relative z-10 p-5">
        <h3 className="text-lg font-medium tracking-wide text-white/90 mb-3">{t("chart.personality")}</h3>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col items-center">
            <p className="text-xs text-white/40 mb-1">{t("chart.sun")}</p>
            <ZodiacIcon sign={sunSignSymbol} size={28} className="text-white/80 mb-1" />
            <p className="text-sm text-white/70">{sunSign}</p>
          </div>
          <div className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col items-center">
            <p className="text-xs text-white/40 mb-1">{t("chart.asc")}</p>
            <ZodiacIcon sign={ascendantSymbol} size={28} className="text-white/80 mb-1" />
            <p className="text-sm text-white/70">{ascendant}</p>
          </div>
          <div className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col items-center">
            <p className="text-xs text-white/40 mb-1">{t("chart.moon")}</p>
            <ZodiacIcon sign={moonSignSymbol} size={28} className="text-white/80 mb-1" />
            <p className="text-sm text-white/70">{moonSign}</p>
          </div>
        </div>

        <p className="text-[15px] leading-relaxed text-white/80">{interpretation}</p>
      </div>
    </div>
  );
}
