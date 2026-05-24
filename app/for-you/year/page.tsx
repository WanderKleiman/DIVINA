"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserData } from "@/lib/user-data";
import { useT } from "@/lib/i18n";
import { useProStatus } from "@/lib/pro-status";
import { lcGet, lcSet, TTL_MONTH } from "@/lib/local-cache";
import SubscriptionPaywall from "@/components/paywall/SubscriptionPaywall";
import type { YearForecastResult } from "@/lib/ai-interpret";

const GLASS_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.80)",
  backdropFilter: "blur(32px) saturate(1.8)",
  WebkitBackdropFilter: "blur(32px) saturate(1.8)",
  border: "1px solid rgba(255,255,255,0.90)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
};

function EnergyBadge({ energy }: { energy: "high" | "medium" | "low" }) {
  const { t } = useT();
  const colors = {
    high:   { bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.25)",  text: "#5b21b6" },
    medium: { bg: "rgba(99,179,237,0.12)",  border: "rgba(99,179,237,0.25)",  text: "#1e4e7a" },
    low:    { bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.25)", text: "#475569" },
  };
  const c = colors[energy];
  const label = t(`yearForecast.energy.${energy}`);
  return (
    <span
      className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
    >
      {label}
    </span>
  );
}

function YearSkeleton() {
  const { t } = useT();
  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>
      <div className="flex items-center justify-between px-5 pb-2 shrink-0" style={{ paddingTop: "max(3.5rem, env(safe-area-inset-top))" }}>
        <div className="h-10 w-10 rounded-full bg-white/20 animate-pulse" />
        <div className="h-3 w-24 bg-white/25 rounded-full animate-pulse" />
        <div className="w-10" />
      </div>
      <div className="flex-1 min-h-0 px-4 pb-6 pt-2 flex flex-col gap-3">
        <div className="h-full rounded-3xl animate-pulse" style={{ background: "rgba(255,255,255,0.18)" }} />
      </div>
      <div className="text-center pb-8 flex flex-col gap-1">
        <p className="text-white/50 text-xs">{t("yearForecast.loading")}</p>
        <p className="text-white/25 text-[10px]">{t("yearForecast.loadingHint")}</p>
      </div>
    </div>
  );
}

function ScrollScreen({
  pages,
  onBack,
  onComplete,
  completionLabel,
}: {
  pages: React.ReactNode[];
  onBack: () => void;
  onComplete: () => void;
  completionLabel: string;
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
      el.style.opacity = "0";
      el.style.animationDelay = `${idx * STAGGER_MS}ms`;
    });
    inner.classList.remove("page-enter", "page-enter-flat");
    void inner.offsetHeight;
    inner.classList.add(wrapper ? "page-enter" : "page-enter-flat");
    const totalTime = ANIM_MS + (targets.length - 1) * STAGGER_MS;
    setTimeout(() => {
      targets.forEach(child => {
        (child as HTMLElement).style.opacity = "";
        (child as HTMLElement).style.animationDelay = "";
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
      <div className="flex items-center justify-between px-5 pb-2 shrink-0" style={{ paddingTop: "max(3.5rem, env(safe-area-inset-top))" }} onClick={e => e.stopPropagation()}>
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
                <p className="text-xs text-black/25">{t("swipe.hint")}</p>
              </div>
            </div>
          </div>
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

export default function YearForecastPage() {
  const router = useRouter();
  const { t } = useT();
  const { isPro, isLoading: proLoading } = useProStatus();
  const [data, setData] = useState<YearForecastResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (proLoading) return;
    if (!isPro) {
      setShowPaywall(true);
      setLoading(false);
      return;
    }

    const user = getUserData();
    const cacheKey = `divina-year-forecast-v2_${user.birthDate}_${user.lang}`;

    if (retryCount === 0) {
      const cached = lcGet<YearForecastResult>(cacheKey);
      if (cached?.months?.length) {
        setData(cached);
        setLoading(false);
        return;
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000);

    fetch("/api/year-forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        lat: user.lat,
        lng: user.lng,
        tzOffset: user.tzOffset,
        tone: user.tone,
        lang: user.lang,
      }),
    })
      .then(r => r.json())
      .then(d => {
        if (d?.months?.length) {
          setData(d);
          lcSet(cacheKey, d, TTL_MONTH);
        } else {
          console.error("Year forecast: bad response", d);
          setError(true);
        }
      })
      .catch(err => {
        console.error("Year forecast fetch error:", err);
        setError(true);
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, [isPro, proLoading, retryCount]);

  // While RevenueCat is checking Pro status — show nothing (no skeleton)
  // to avoid implying content is loading before we know the user's tier
  if (proLoading) return null;

  if (showPaywall) {
    return (
      <SubscriptionPaywall
        open={true}
        onClose={() => router.back()}
      />
    );
  }

  if (loading) return <YearSkeleton />;

  if (error || !data) {
    return (
      <div className="flex flex-col min-h-dvh">
        <div className="flex items-center gap-3 px-5 pt-14 pb-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 px-6 gap-4">
          <p className="text-sm text-white/50 text-center">{t("yearForecast.error")}</p>
          <button
            onClick={() => { setError(false); setLoading(true); setRetryCount(c => c + 1); }}
            className="rounded-xl bg-white/10 border border-white/15 px-5 py-2.5 text-sm text-white/70"
          >
            {t("action.retry")}
          </button>
        </div>
      </div>
    );
  }

  // Build pages
  const pages: React.ReactNode[] = [];

  // Page 0: Overall theme
  pages.push(
    <div key="overview" className="flex flex-col gap-5">
      <div>
        <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">{t("yearForecast.title")}</p>
        <h2 className="text-[22px] font-bold text-black leading-tight mb-3">{t("yearForecast.subtitle")}</h2>
      </div>
      <div className="rounded-2xl p-4" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}>
        <p className="text-[10px] text-black/40 uppercase tracking-widest mb-2">{t("yearForecast.overallTheme")}</p>
        <p className="text-[15px] text-black/80 leading-relaxed font-medium">{data.overallTheme}</p>
      </div>
      <div>
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {data.months.map(m => (
            <div
              key={m.month}
              className="rounded-xl p-2 text-center"
              style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <p className="text-[9px] text-black/40 mb-1 truncate">{m.monthName.slice(0, 3)}</p>
              <div className="h-1.5 rounded-full mx-auto" style={{ width: "70%", background: m.energy === "high" ? "rgba(139,92,246,0.7)" : m.energy === "low" ? "rgba(148,163,184,0.6)" : "rgba(99,179,237,0.65)" }} />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 justify-center">
          <div className="flex items-center gap-1"><div className="h-1.5 w-3 rounded-full" style={{ background: "rgba(139,92,246,0.7)" }} /><span className="text-[9px] text-black/35">{t("yearForecast.energy.high")}</span></div>
          <div className="flex items-center gap-1"><div className="h-1.5 w-3 rounded-full" style={{ background: "rgba(99,179,237,0.65)" }} /><span className="text-[9px] text-black/35">{t("yearForecast.energy.medium")}</span></div>
          <div className="flex items-center gap-1"><div className="h-1.5 w-3 rounded-full" style={{ background: "rgba(148,163,184,0.6)" }} /><span className="text-[9px] text-black/35">{t("yearForecast.energy.low")}</span></div>
        </div>
      </div>
    </div>
  );

  // One page per month
  for (const m of data.months) {
    pages.push(
      <div key={`month-${m.month}`} className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div>
            <h3 className="text-[20px] font-bold text-black leading-tight">{m.monthName} {m.year}</h3>
            <p className="text-[13px] text-black/50 mt-0.5 font-medium">{m.theme}</p>
          </div>
          <div className="ml-auto">
            <EnergyBadge energy={m.energy} />
          </div>
        </div>

        {m.retrogrades.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-black/40">{t("yearForecast.retrogrades")}:</span>
            {m.retrogrades.map(r => (
              <span key={r} className="text-[10px] text-black/60 bg-black/[0.05] rounded-full px-2 py-0.5">{r}</span>
            ))}
          </div>
        )}

        <p className="text-[14px] text-black/75 leading-[1.8] whitespace-pre-line">{m.story}</p>

        <div className="flex flex-col gap-2 mt-1">
          <div className="rounded-xl p-3" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <p className="text-[9px] text-emerald-700/70 uppercase tracking-widest mb-1">{t("yearForecast.keyFocus")}</p>
            <p className="text-[12px] text-emerald-900/70 leading-relaxed">{m.keyFocus}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <p className="text-[9px] text-amber-700/70 uppercase tracking-widest mb-1">{t("yearForecast.watchOut")}</p>
            <p className="text-[12px] text-amber-900/70 leading-relaxed">{m.watchOut}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollScreen
      pages={pages}
      onBack={() => router.back()}
      onComplete={() => router.back()}
      completionLabel={t("yearForecast.done")}
    />
  );
}
