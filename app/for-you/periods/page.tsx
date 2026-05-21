"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { LifePeriod, LifePeriodsResult } from "@/lib/ai-interpret";
import { getUserData } from "@/lib/user-data";
import { useT } from "@/lib/i18n";

const GLASS_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.80)",
  backdropFilter: "blur(32px) saturate(1.8)",
  WebkitBackdropFilter: "blur(32px) saturate(1.8)",
  border: "1px solid rgba(255,255,255,0.90)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
};

function splitIntoChunks(text: string, maxChars = 560): string[] {
  if (!text?.trim()) return [];
  const paras = text.split("\n\n").filter(Boolean).map(p => p.trim());
  const merged: string[] = [];
  let cur = "";
  for (const p of paras) {
    if (cur && cur.length + 2 + p.length > maxChars) { merged.push(cur); cur = p; }
    else { cur = cur ? cur + "\n\n" + p : p; }
  }
  if (cur) merged.push(cur);
  const result: string[] = [];
  for (const chunk of merged) {
    if (chunk.length <= maxChars * 1.4) { result.push(chunk); continue; }
    const sentences = chunk.split(/(?<=[.!?…])\s+/);
    let s = "";
    for (const sent of sentences) {
      if (s && s.length + 1 + sent.length > maxChars) { result.push(s.trim()); s = sent; }
      else { s = s ? s + " " + sent : sent; }
    }
    if (s.trim()) result.push(s.trim());
  }
  return result.length ? result : [text.slice(0, maxChars)];
}

// Scrollable card — swipe through pages, no button
function ScrollScreen({
  pages,
  completionLabel,
  onBack,
  onComplete,
}: {
  pages: React.ReactNode[];
  completionLabel: string;
  onBack: () => void;
  onComplete: () => void;
}) {
  const { t } = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const activePageRef = useRef(0);
  const total = pages.length;

  const STAGGER_MS = 85;
  const ANIM_MS = 600;

  const triggerEnter = useCallback((inner: HTMLElement) => {
    const wrapper = inner.firstElementChild as HTMLElement | null;
    const targets = wrapper ? Array.from(wrapper.children) : Array.from(inner.children);
    targets.forEach((child, idx) => {
      const el = child as HTMLElement;
      el.style.opacity = '0';
      el.style.animationDelay = `${idx * STAGGER_MS}ms`;
    });
    inner.classList.remove("page-enter", "page-enter-flat");
    void inner.offsetHeight;
    inner.classList.add(wrapper ? "page-enter" : "page-enter-flat");
    const totalTime = ANIM_MS + (targets.length - 1) * STAGGER_MS;
    setTimeout(() => {
      targets.forEach(child => {
        (child as HTMLElement).style.opacity = '';
        (child as HTMLElement).style.animationDelay = '';
      });
    }, totalTime);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const rawPage = el.scrollTop / el.clientHeight;
    const rounded = Math.round(rawPage);

    if (rounded !== activePageRef.current) {
      activePageRef.current = rounded;
      setActivePage(rounded);
      const snap = el.querySelector(`[data-sp="${rounded}"]`);
      const inner = snap?.querySelector("[data-inner]") as HTMLElement | null;
      if (inner) triggerEnter(inner);
    }

    el.querySelectorAll("[data-sp]").forEach((node, i) => {
      const dist = Math.abs(rawPage - i);
      const opacity = Math.max(0, 1 - dist * 2.4);
      (node as HTMLElement).style.opacity = opacity.toFixed(3);
    });
  }, [triggerEnter]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const snap = el.querySelector('[data-sp="0"]');
    const inner = snap?.querySelector("[data-inner]") as HTMLElement | null;
    if (inner) triggerEnter(inner);
  }, [triggerEnter]);

  // #10: back button goes to previous page, or exits if on first page
  const handleBack = useCallback(() => {
    const el = scrollRef.current;
    const currentPage = activePageRef.current;
    if (currentPage > 0 && el) {
      const targetPage = currentPage - 1;
      activePageRef.current = targetPage;
      setActivePage(targetPage);
      el.scrollTo({ top: targetPage * el.clientHeight, behavior: "smooth" });
      const snap = el.querySelector(`[data-sp="${targetPage}"]`);
      const inner = snap?.querySelector("[data-inner]") as HTMLElement | null;
      if (inner) triggerEnter(inner);
    } else {
      onBack();
    }
  }, [onBack, triggerEnter]);

  const displayPage = Math.min(activePage + 1, total);

  return (
    // #9: clicking outside the card navigates back
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh" }}
      onClick={onBack}
    >
      {/* Top bar — stop propagation so clicks here don't close */}
      <div
        className="flex items-center justify-between px-5 pt-14 pb-2 shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        {total > 1 && (
          <span className="text-white/40 text-xs tabular-nums">{displayPage} / {total}</span>
        )}
        <div className="w-10" />
      </div>

      {/* Card container — stop propagation so taps on card don't close */}
      <div
        className="flex-1 min-h-0 px-4 pb-6 pt-2"
        onClick={e => e.stopPropagation()}
      >
        {/* #7: progress bar is INSIDE this relative wrapper, at bottom of card */}
        <div className="relative h-full">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full rounded-3xl scrollbar-hide"
            style={{
              ...GLASS_STYLE,
              overflowY: "scroll",
              scrollSnapType: "y mandatory",
            }}
          >
            {pages.map((page, i) => (
              <div
                key={i}
                data-sp={i}
                className="snap-start flex flex-col justify-center"
                style={{ minHeight: "100%", opacity: 1 }}
              >
                <div data-inner className="p-6">
                  {page}
                </div>
              </div>
            ))}

            {/* Completion snap page */}
            <div
              data-sp={total}
              className="snap-start flex flex-col items-center justify-center gap-4"
              style={{ minHeight: "100%", opacity: 1 }}
            >
              <div data-inner className="w-full flex flex-col items-center gap-4 p-6">
                <button
                  onClick={onComplete}
                  className="w-full h-14 rounded-2xl text-sm font-semibold text-black/75"
                  style={{ background: "rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.10)" }}
                >
                  {completionLabel}
                </button>
                <p className="text-xs text-black/25">{t("swipe.hint")}</p>
              </div>
            </div>
          </div>

          {/* #7: Progress bar — absolute overlay at bottom of card */}
          <div
            className="absolute bottom-0 left-0 right-0 px-6 pb-4 pt-10 rounded-b-3xl pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.65))" }}
          >
            <div className="h-[3px] rounded-full" style={{ background: "rgba(0,0,0,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  background: "rgba(0,0,0,0.28)",
                  width: `${((activePage + 1) / (total + 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getIntensityLabel(intensity: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    high: t("periods.active"),
    medium: t("periods.moderate"),
    low: t("periods.background"),
  };
  return map[intensity] ?? t("periods.period");
}

export default function PeriodsPage() {
  const router = useRouter();
  const { t } = useT();
  const [data, setData] = useState<LifePeriodsResult | null>(null);
  const [phase, setPhase] = useState<"intro" | "menu" | "period">("intro");
  const [periodIdx, setPeriodIdx] = useState(0);

  useEffect(() => {
    try {
      const lang = getUserData().lang ?? "ru";
      const raw = sessionStorage.getItem(`divina_life_periods_v3_${lang}`);
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  const openPeriod = useCallback((idx: number) => {
    setPeriodIdx(idx);
    setPhase("period");
  }, []);

  const goToMenu = useCallback(() => setPhase("menu"), []);

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-white/50 text-sm">{t("periods.noData")}</p>
        <p className="text-white/30 text-xs">{t("periods.noDataHint")}</p>
        <div className="flex gap-3 mt-2">
          <button onClick={() => router.back()} className="text-sm text-white/60 border border-white/15 rounded-xl px-5 py-2.5">
            {t("periods.backArrow")}
          </button>
          <button
            onClick={() => {
              router.replace("/for-you");
            }}
            className="text-sm text-white/80 bg-white/10 border border-white/20 rounded-xl px-5 py-2.5"
          >
            {t("periods.toMain")}
          </button>
        </div>
      </div>
    );
  }

  // ── PERIOD ────────────────────────────────────────────────────────────────
  if (phase === "period") {
    const period = data.periods[periodIdx];
    const storyChunks = splitIntoChunks(period?.story ?? "", 560);

    const periodPages: React.ReactNode[] = [
      // Story pages
      ...storyChunks.map((chunk, i) => (
        <div key={`s${i}`} className="flex flex-col">
          {i === 0 && (
            <>
              <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">
                {getIntensityLabel(period.intensity, t)}
              </p>
              <h2 className="text-[19px] font-bold text-black leading-tight mb-1">
                {period.planetTitle}
              </h2>
              {period.theme && (
                <p className="text-[12px] text-black/40 mb-4">{period.theme}</p>
              )}
            </>
          )}
          <p className="text-[15px] text-black leading-[1.85]">{chunk}</p>
        </div>
      )),
      // Practice page
      <div key="practice" className="flex flex-col">
        <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">{t("periods.practice")}</p>
        <h2 className="text-[19px] font-bold text-black leading-tight mb-5">
          {period.planetTitle}
        </h2>
        <div className="space-y-3">
          <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}>
            <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-2">{t("periods.focusOn")}</p>
            <p className="text-[15px] text-black/80 leading-relaxed">{period.whatToFocus}</p>
          </div>
          <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)" }}>
            <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-2">{t("periods.letGo")}</p>
            <p className="text-[15px] text-black/80 leading-relaxed">{period.whatToLetGo}</p>
          </div>
        </div>
      </div>,
    ];

    return (
      <ScrollScreen
        pages={periodPages}
        completionLabel={t("periods.backToPeriods")}
        onBack={goToMenu}
        onComplete={goToMenu}
      />
    );
  }

  // ── MENU ─────────────────────────────────────────────────────────────────
  if (phase === "menu") {
    return (
      <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
        <div className="flex items-center px-5 pt-14 pb-2 shrink-0">
          <button
            onClick={() => setPhase("intro")}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
        <div className="flex-1 min-h-0 px-4 py-2 pb-10">
          <div className="h-full rounded-3xl overflow-hidden" style={GLASS_STYLE}>
            <div className="h-full overflow-y-auto p-6">
              <p className="text-[10px] text-black/35 uppercase tracking-widest mb-1">{t("periods.yourPeriods")}</p>
              <h2 className="text-[20px] font-bold text-black mb-1">{t("periods.choose")}</h2>
              <p className="text-sm text-black/40 mb-5">{t("periods.detailSubtitle")}</p>
              <div className="space-y-2">
                {data.periods.map((p: LifePeriod, i: number) => (
                  <button
                    key={i}
                    onClick={() => openPeriod(i)}
                    className="w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3"
                    style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}
                  >
                    <span className="text-[15px] font-medium text-black flex-1 text-left">{p.planetTitle}</span>
                    <svg className="shrink-0 text-black/25" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── INTRO ─────────────────────────────────────────────────────────────────
  const introPages: React.ReactNode[] = [
    <div key="intro" className="flex flex-col">
      <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">{t("periods.yourLife")}</p>
      <h2 className="text-[21px] font-bold text-black leading-tight mb-4">
        {data.periods.length} {t("periods.active").toLowerCase()}
      </h2>
      <p className="text-[15px] text-black leading-[1.85]">
        {data.overallPhase}
      </p>
    </div>,
  ];

  return (
    <ScrollScreen
      pages={introPages}
      completionLabel={t("periods.backToPeriodsArrow")}
      onBack={() => router.back()}
      onComplete={goToMenu}
    />
  );
}
