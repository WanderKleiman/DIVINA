"use client";

import { useEffect } from "react";
import type { LifePeriod } from "@/lib/ai-interpret";
import { useT } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  overallPhase: string;
  periods: LifePeriod[];
}

const intensityColors: Record<string, string> = {
  high:   "text-rose-300   bg-rose-500/10   border-rose-500/20",
  medium: "text-amber-300  bg-amber-500/10  border-amber-500/20",
  low:    "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
};

export default function LifePeriodsSheet({ open, onClose, overallPhase, periods }: Props) {
  const { t, lang } = useT();

  const intensityLabels: Record<string, string> = {
    high: t("periods.intensityHigh"),
    medium: t("periods.intensityMedium"),
    low: t("periods.intensityLow"),
  };

  function formatDateRange(start: string, end: string) {
    const [sy, sm, sd] = start.split("-").map(Number);
    const [ey, em, ed] = end.split("-").map(Number);
    if (lang === "en") {
      return `${t(`month.${sm}`)} ${sd}, ${sy} – ${t(`month.${em}`)} ${ed}, ${ey}`;
    }
    return `с ${sd} ${t(`monthGen.${sm}`)} ${sy} по ${ed} ${t(`monthGen.${em}`)} ${ey}`;
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/75 animate-fade-in" onClick={onClose} />

      <div className="absolute bottom-0 left-0 right-0 max-h-[92dvh] flex flex-col rounded-t-3xl overflow-hidden animate-slide-up bg-[rgba(8,8,20,0.97)] border-t border-white/10">

        {/* Handle + close */}
        <div className="relative flex items-center justify-center pt-3 pb-1 shrink-0">
          <div className="h-1 w-10 rounded-full bg-white/20" />
          <button
            onClick={onClose}
            className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Header */}
        <div className="px-6 pt-3 pb-4 shrink-0 border-b border-white/[0.06]">
          <p className="text-[11px] text-white/40 tracking-wider uppercase mb-1">{t("periods.yourPeriodsNow")}</p>
          <p className="text-sm text-white leading-relaxed">{overallPhase}</p>
        </div>

        {/* Scrollable periods list */}
        <div className="flex-1 overflow-y-auto">
          {periods.map((p, idx) => (
            <div
              key={idx}
              className={`px-6 py-6 ${idx < periods.length - 1 ? "border-b border-white/[0.06]" : ""}`}
            >
              {/* Title row */}
              <div className="flex items-start gap-3 mb-1.5">
                <span className="text-2xl mt-0.5 shrink-0">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white leading-tight">{p.planetTitle}</h3>
                  <p className="text-xs text-white/40 mt-0.5">{formatDateRange(p.startDate, p.endDate)}</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-4 ml-9">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${intensityColors[p.intensity]}`}>
                  {intensityLabels[p.intensity]}
                </span>
                {p.theme && (
                  <span className="text-[10px] text-white/35 bg-white/[0.05] border border-white/10 rounded-md px-2 py-0.5">
                    {p.theme}
                  </span>
                )}
              </div>

              {/* Story — split by \n\n into paragraphs */}
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-4 mb-3">
                {p.story.split("\n\n").filter(Boolean).map((para, i) => (
                  <p key={i} className={`text-[15px] text-white leading-[1.75] ${i > 0 ? "mt-3" : ""}`}>
                    {para.trim()}
                  </p>
                ))}
              </div>

              {/* Focus / Let go */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 p-3">
                  <p className="text-[10px] font-medium text-emerald-400/80 uppercase tracking-wider mb-1">{t("periods.focusOn")}</p>
                  <p className="text-xs text-white leading-relaxed">{p.whatToFocus}</p>
                </div>
                <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/15 p-3">
                  <p className="text-[10px] font-medium text-amber-400/80 uppercase tracking-wider mb-1">{t("periods.letGo")}</p>
                  <p className="text-xs text-white leading-relaxed">{p.whatToLetGo}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Bottom safe area padding */}
          <div className="h-[calc(env(safe-area-inset-bottom)+5rem)]" />
        </div>
      </div>
    </div>
  );
}
