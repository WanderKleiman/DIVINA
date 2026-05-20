"use client";

import ZodiacIcon from "@/components/icons/ZodiacIcon";
import { useT, formatDateLocalized } from "@/lib/i18n";

interface EnergyCardProps {
  text: string;
  moonSign: string;
  moonSignSymbol: string;
  moonPhase: string;
  moonPercent: number;
  energy: "high" | "medium" | "low";
  affirmation: string;
  summary: string;
  doList: string[];
  dontList: string[];
}

const energyDots: Record<string, number> = { high: 3, medium: 2, low: 1 };

export default function EnergyCard({
  text, moonSign, moonSignSymbol, moonPhase, moonPercent,
  energy, affirmation, summary, doList, dontList,
}: EnergyCardProps) {
  const { t, lang } = useT();
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayLabel = formatDateLocalized(todayIso, lang);
  const energyLabels: Record<string, string> = {
    high: t("energy.high"), medium: t("energy.medium"), low: t("energy.low"),
  };

  return (
    <div className="flex flex-col gap-3 mx-5">
      {/* ── Карточка 1: белое стекло — энергия + советы ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(28px) saturate(1.6)",
          WebkitBackdropFilter: "blur(28px) saturate(1.6)",
          border: "1px solid rgba(255,255,255,0.92)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.13), inset 0 1px 0 rgba(255,255,255,1)",
        }}
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.08)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-black/50">
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                </svg>
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-black">{t("energy.title")}</h2>
                <p className="text-xs text-black/35 mt-0.5">{todayLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-black/40 mr-1">{energyLabels[energy]}</span>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`h-2 w-2 rounded-full ${i < energyDots[energy] ? "bg-black/65" : "bg-black/10"}`} />
              ))}
            </div>
          </div>

          <p className="text-[14px] leading-relaxed text-black/80 mb-4">{summary}</p>

          <div className="space-y-3">
            {doList.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-700 mb-1.5 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t("energy.do")}
                </p>
                <ul className="space-y-1">
                  {doList.map((item, i) => (
                    <li key={i} className="text-sm text-black/65 pl-4 relative">
                      <span className="absolute left-0 top-[7px] h-1 w-1 rounded-full bg-emerald-500/70" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {dontList.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  {t("energy.avoid")}
                </p>
                <ul className="space-y-1">
                  {dontList.map((item, i) => (
                    <li key={i} className="text-sm text-black/65 pl-4 relative">
                      <span className="absolute left-0 top-[7px] h-1 w-1 rounded-full bg-amber-500/70" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Карточка 2: тёмное стекло — луна + аффирмация ── */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.10]">
        <div className="absolute inset-0 bg-[rgba(8,8,20,0.70)] backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent" />
        <div className="relative z-10 p-5">
          <div className="flex items-center gap-1.5 mb-2 text-xs text-white/45">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white/30">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t("energy.moonIn")} {moonSign}</span>
            <ZodiacIcon sign={moonSignSymbol} size={11} className="text-white/30" />
            <span>· {moonPhase} {moonPercent}%</span>
          </div>
          <p className="text-sm leading-relaxed text-white/60 mb-4">{text}</p>
          <div className="rounded-xl bg-white/[0.06] px-4 py-3 border border-white/[0.08]">
            <p className="text-center text-sm italic text-white/55">&ldquo;{affirmation}&rdquo;</p>
          </div>
        </div>
      </div>
    </div>
  );
}
