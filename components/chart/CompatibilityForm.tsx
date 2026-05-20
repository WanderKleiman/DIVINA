"use client";

import { useState } from "react";
import type { CompatibilityResult } from "@/lib/types";
import { mockCompatibility } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";

export default function CompatibilityForm() {
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const { t } = useT();

  const handleCheck = () => {
    if (birthDate) {
      setResult(mockCompatibility);
    }
  };

  return (
    <div className="mx-5 space-y-4">
      <div className="glass">
        <div className="relative z-10 p-4">
          <h3 className="font-medium tracking-wide text-white mb-3">{t("profile.checkCompat")}</h3>
          <div className="flex gap-2">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white/80 outline-none focus:border-white/30"
            />
            <button
              onClick={handleCheck}
              className="rounded-xl bg-white/10 border border-white/15 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/15 transition-colors"
            >
              {t("profile.checkCompatBtn")}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <>
          <div className="glass-strong">
            <div className="relative z-10 p-5 text-center">
              <p className="text-xs text-white/40 mb-1">{t("compat.overall")}</p>
              <p className="text-4xl font-medium tracking-wide text-white/90">{result.overallPercent}%</p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{result.summary}</p>
            </div>
          </div>

          <div className="glass">
            <div className="relative z-10 p-4 space-y-3">
              {result.categories.map((cat, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white/70">{cat.name}</span>
                    <span className="text-sm text-white/60 font-medium">{cat.percent}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-white/40" style={{ width: `${cat.percent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-white/40">{cat.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass">
            <div className="relative z-10 p-4">
              <h3 className="font-medium tracking-wide text-white mb-3">{t("chart.aspects")}</h3>
              <div className="space-y-2">
                {result.keyAspects.map((a, i) => (
                  <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="flex items-center gap-1.5 text-sm mb-1">
                      <span className="text-white/60">{a.symbol1} {a.planet1}</span>
                      <span className="text-white/40">{a.aspectSymbol}</span>
                      <span className="text-white/60">{a.symbol2} {a.planet2}</span>
                    </div>
                    <p className="text-xs text-white/50">{a.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
