"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import WeekDayList from "@/components/weekly/WeekDayList";
import BestDayCard from "@/components/weekly/BestDayCard";
import { getUserData, getWeekStart } from "@/lib/user-data";
import { useT } from "@/lib/i18n";
import type { WeeklyForecast } from "@/lib/types";

const CACHE_KEY = "divina-weekly-cache";

// ── Helpers ───────────────────────────────────────────────────────────────
function splitIntoChunks(text: string, maxChars = 400): string[] {
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

const GLASS_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.80)",
  backdropFilter: "blur(32px) saturate(1.8)",
  WebkitBackdropFilter: "blur(32px) saturate(1.8)",
  border: "1px solid rgba(255,255,255,0.90)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
};

// ── Weekly Skeleton ────────────────────────────────────────────────────────
function WeeklySkeleton() {
  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Overview card shimmer */}
      <div className="mx-5 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(255,255,255,0.92)" }}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-9 w-9 rounded-xl bg-black/[0.06] animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 bg-black/[0.08] rounded-full animate-pulse" />
            <div className="h-2.5 w-20 bg-black/[0.05] rounded-full animate-pulse" />
          </div>
        </div>
        <div className="space-y-2 mb-5">
          <div className="h-3 bg-black/[0.06] rounded-full animate-pulse w-full" />
          <div className="h-3 bg-black/[0.05] rounded-full animate-pulse w-5/6" />
          <div className="h-3 bg-black/[0.05] rounded-full animate-pulse w-4/5" />
          <div className="h-3 bg-black/[0.04] rounded-full animate-pulse w-2/3" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-12 rounded-xl bg-black/[0.04] animate-pulse" />
          <div className="flex-1 h-12 rounded-xl bg-black/[0.04] animate-pulse" />
        </div>
      </div>

      {/* Day rows shimmer */}
      <div className="mx-5">
        <div className="h-3.5 w-20 bg-white/[0.12] rounded-full animate-pulse mb-3" />
        <div className="flex flex-col gap-2">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="rounded-2xl p-3.5" style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(255,255,255,0.92)" }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="h-3 w-20 bg-black/[0.08] rounded-full animate-pulse" />
                <div className="h-5 w-12 rounded-full bg-black/[0.05] animate-pulse" />
              </div>
              <div className="h-2.5 bg-black/[0.05] rounded-full animate-pulse w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ScrollScreen (story mode) ──────────────────────────────────────────────
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
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }} onClick={onBack}>
      <div className="flex items-center justify-between px-5 pt-14 pb-2 shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        {total > 1 && <span className="text-white/40 text-xs tabular-nums">{displayPage} / {total}</span>}
        <div className="w-10" />
      </div>

      <div className="flex-1 min-h-0 px-4 pb-6 pt-2" onClick={e => e.stopPropagation()}>
        <div className="relative h-full">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full rounded-3xl scrollbar-hide"
            style={{ ...GLASS_STYLE, overflowY: "scroll", scrollSnapType: "y mandatory" }}
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
              <p className="text-xs text-black/25">свайп вниз для перехода</p>
              </div>
            </div>
          </div>
          {/* Progress bar inside card */}
          <div
            className="absolute bottom-0 left-0 right-0 px-6 pb-4 pt-10 rounded-b-3xl pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.65))" }}
          >
            <div className="h-[3px] rounded-full" style={{ background: "rgba(0,0,0,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ background: "rgba(0,0,0,0.28)", width: `${((activePage + 1) / (total + 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function WeeklyPage() {
  const router = useRouter();
  const [forecast, setForecast] = useState<WeeklyForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [phase, setPhase] = useState<"story" | "days">("story");
  const { t } = useT();

  useEffect(() => {
    const user = getUserData();
    const weekStart = getWeekStart();
    const cacheKey = `${CACHE_KEY}_${user.birthDate}_${user.tone}_${user.lang}`;

    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed._weekStart === weekStart) {
          setForecast(parsed.data);
          setLoading(false);
          return;
        }
      } catch {}
    }

    async function load() {
      try {
        const res = await fetch("/api/weekly", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            birthDate: user.birthDate,
            birthTime: user.birthTime,
            lat: user.lat,
            lng: user.lng,
            weekStart,
            tzOffset: user.tzOffset,
            tone: user.tone,
            lang: user.lang,
          }),
        });
        const data = await res.json();
        if (data && !data.error) {
          setForecast(data);
          sessionStorage.setItem(cacheKey, JSON.stringify({ _weekStart: weekStart, data }));
        }
      } catch (err) {
        console.error("Failed to load weekly forecast:", err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [retryCount]);

  if (loading) {
    return (
      <div>
        <Header />
        <WeeklySkeleton />
      </div>
    );
  }

  if (loadError || !forecast) {
    return (
      <div>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60dvh] px-6 gap-4">
          <p className="text-sm text-white/50 text-center">Не удалось загрузить прогноз на неделю.</p>
          <button
            onClick={() => { setLoadError(false); setLoading(true); setRetryCount(c => c + 1); }}
            className="rounded-xl bg-white/10 border border-white/15 px-5 py-2.5 text-sm text-white/70"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  const w = forecast;

  // ── STORY PHASE ─────────────────────────────────────────────────────────
  if (phase === "story") {
    const overviewChunks = splitIntoChunks(w.overview, 400);

    const storyPages: React.ReactNode[] = [
      // Title page
      <div key="title" className="flex flex-col">
        <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">Твоя неделя</p>
        <h2 className="text-[22px] font-bold text-black leading-tight mb-3">{w.weekLabel}</h2>
        <div className="flex gap-3 mb-5">
          <div className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}>
            <p className="text-[10px] text-emerald-700/70 mb-0.5">{t("week.bestDay")}</p>
            <p className="text-sm font-bold text-emerald-700">{w.bestDay}</p>
          </div>
          <div className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)" }}>
            <p className="text-[10px] text-amber-700/70 mb-0.5">{t("week.hardestDay")}</p>
            <p className="text-sm font-bold text-amber-700">{w.hardestDay}</p>
          </div>
        </div>
        <p className="text-[15px] text-black leading-[1.85]">{overviewChunks[0] ?? ""}</p>
      </div>,
      // Remaining overview chunks
      ...overviewChunks.slice(1).map((chunk, i) => (
        <div key={`ov${i}`} className="flex flex-col">
          <p className="text-[15px] text-black leading-[1.85]">{chunk}</p>
        </div>
      )),
      // Advice page
      <div key="advice" className="flex flex-col">
        <p className="text-[10px] text-black/35 uppercase tracking-widest mb-3">Совет недели</p>
        <p className="text-[18px] font-semibold text-black leading-snug italic">&ldquo;{w.weeklyAdvice}&rdquo;</p>
      </div>,
    ];

    return (
      <ScrollScreen
        pages={storyPages}
        completionLabel="По дням →"
        onBack={() => router.back()}
        onComplete={() => setPhase("days")}
      />
    );
  }

  // ── DAYS PHASE ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 pb-28">
      <div className="flex items-center gap-3 px-5 pt-4">
        <button
          onClick={() => setPhase("story")}
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-white/90">{w.weekLabel}</h2>
      </div>

      {w.bestDayFor && (
        <BestDayCard bestDayFor={w.bestDayFor} />
      )}

      <WeekDayList
        days={w.days}
        bestDay={w.bestDay}
        hardestDay={w.hardestDay}
      />
    </div>
  );
}
