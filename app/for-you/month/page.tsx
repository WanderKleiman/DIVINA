"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserData } from "@/lib/user-data";
import { useT } from "@/lib/i18n";
import { isInFreeTrial } from "@/lib/trial";
import { useProStatus } from "@/lib/pro-status";
import SubscriptionPaywall from "@/components/paywall/SubscriptionPaywall";
import type { MonthForecastResult } from "@/lib/ai-interpret";

const GLASS_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.80)",
  backdropFilter: "blur(32px) saturate(1.8)",
  WebkitBackdropFilter: "blur(32px) saturate(1.8)",
  border: "1px solid rgba(255,255,255,0.90)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
};

const ENERGY_COLORS = {
  high:   { bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.25)",  text: "#5b21b6" },
  medium: { bg: "rgba(99,179,237,0.12)",  border: "rgba(99,179,237,0.25)",  text: "#1e4e7a" },
  low:    { bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.25)", text: "#475569" },
};

function EnergyBadge({ energy }: { energy: "high" | "medium" | "low" }) {
  const { t } = useT();
  const c = ENERGY_COLORS[energy];
  return (
    <span
      className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
    >
      {t(`monthForecast.energy.${energy}`)}
    </span>
  );
}

function AreaIcon({ area }: { area: string }) {
  const icons: Record<string, React.ReactNode> = {
    love: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    work: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    health: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    money: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v2m0 8v2M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2-1 1.8-2.5 2-2.5.9-2.5 2 .9 2 2.5 2 2.5-.9 2.5-2" />
      </svg>
    ),
    growth: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 6v6l4 2" />
        <path d="M22 2L16 8m6 0V2h-6" />
      </svg>
    ),
  };
  return <span className="text-black/40">{icons[area] ?? null}</span>;
}

function MonthSkeleton() {
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
        <p className="text-white/50 text-xs">{t("monthForecast.loading")}</p>
        <p className="text-white/25 text-[10px]">{t("monthForecast.loadingHint")}</p>
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

export default function MonthForecastPage() {
  const router = useRouter();
  const { t } = useT();
  const { isPro, isLoading: proLoading } = useProStatus();
  const [data, setData] = useState<MonthForecastResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (!proLoading && !isInFreeTrial() && !isPro) {
      setShowPaywall(true);
      setLoading(false);
      return;
    }
    if (proLoading) return;

    const user = getUserData();
    const now = new Date();
    const cacheKey = `divina-month-forecast-v1_${user.birthDate}_${now.getFullYear()}_${now.getMonth()}_${user.lang}`;

    if (retryCount === 0) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed?.weeks?.length) {
            setData(parsed);
            setLoading(false);
            return;
          }
        } catch {}
      }
    } else {
      sessionStorage.removeItem(cacheKey);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000);

    fetch("/api/month-forecast", {
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
        if (d?.weeks?.length) {
          setData(d);
          sessionStorage.setItem(cacheKey, JSON.stringify(d));
        } else {
          console.error("Month forecast: bad response", d);
          setError(true);
        }
      })
      .catch(err => {
        console.error("Month forecast fetch error:", err);
        setError(true);
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, [isPro, proLoading, retryCount]);

  if (showPaywall) {
    return <SubscriptionPaywall open={true} onClose={() => router.back()} />;
  }

  if (loading) return <MonthSkeleton />;

  if (error || !data) {
    return (
      <div className="flex flex-col min-h-dvh">
        <div className="flex items-center gap-3 px-5 pb-4" style={{ paddingTop: "max(3.5rem, env(safe-area-inset-top))" }}>
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
          <p className="text-sm text-white/50 text-center">{t("monthForecast.error")}</p>
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

  // Page 0: Overview
  pages.push(
    <div key="overview" className="flex flex-col gap-5">
      <div>
        <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">{t("monthForecast.title")}</p>
        <h2 className="text-[22px] font-bold text-black leading-tight mb-1">
          {data.monthName} {data.year}
        </h2>
        <div className="mb-3">
          <EnergyBadge energy={data.overallEnergy} />
        </div>
      </div>

      {/* Overall theme */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}>
        <p className="text-[10px] text-black/40 uppercase tracking-widest mb-2">{t("monthForecast.overallTheme")}</p>
        <p className="text-[15px] text-black/80 leading-relaxed font-medium">{data.overallTheme}</p>
      </div>

      {/* Weekly energy strip */}
      <div>
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {data.weeks.map(w => (
            <div
              key={w.weekNum}
              className="rounded-xl p-2.5 text-center"
              style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <p className="text-[9px] text-black/40 mb-1.5">{t("monthForecast.week")} {w.weekNum}</p>
              <p className="text-[11px] font-medium text-black/70 leading-tight line-clamp-2">{w.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Life areas preview */}
      <div className="flex flex-wrap gap-2">
        {data.areas.map(a => (
          <div
            key={a.area}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}
          >
            <AreaIcon area={a.area} />
            <span className="text-[10px] text-black/55 font-medium">{a.title}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Pages 1-4: Weeks
  for (const w of data.weeks) {
    pages.push(
      <div key={`week-${w.weekNum}`} className="flex flex-col gap-4">
        <div>
          <p className="text-[10px] text-black/35 uppercase tracking-widest mb-1">
            {t("monthForecast.week")} {w.weekNum}
          </p>
          <h3 className="text-[20px] font-bold text-black leading-tight">{w.title}</h3>
        </div>
        <p className="text-[14px] text-black/75 leading-[1.8] whitespace-pre-line">{w.story}</p>
        <div className="rounded-xl p-3" style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <p className="text-[9px] text-purple-700/70 uppercase tracking-widest mb-1">{t("monthForecast.focus")}</p>
          <p className="text-[12px] text-purple-900/70 leading-relaxed">{w.focus}</p>
        </div>
      </div>
    );
  }

  // Pages 5-9: Life areas
  const areaColors: Record<string, { bg: string; border: string; label: string; icon: string }> = {
    love:   { bg: "rgba(236,72,153,0.07)",  border: "rgba(236,72,153,0.15)",  label: "text-pink-800/70",   icon: "text-pink-600/40" },
    work:   { bg: "rgba(59,130,246,0.07)",  border: "rgba(59,130,246,0.15)",  label: "text-blue-800/70",   icon: "text-blue-600/40" },
    health: { bg: "rgba(16,185,129,0.07)",  border: "rgba(16,185,129,0.15)",  label: "text-emerald-800/70",icon: "text-emerald-600/40" },
    money:  { bg: "rgba(245,158,11,0.07)",  border: "rgba(245,158,11,0.15)",  label: "text-amber-800/70",  icon: "text-amber-600/40" },
    growth: { bg: "rgba(139,92,246,0.07)",  border: "rgba(139,92,246,0.15)",  label: "text-purple-800/70", icon: "text-purple-600/40" },
  };

  for (const area of data.areas) {
    const ac = areaColors[area.area] ?? areaColors.growth;
    pages.push(
      <div key={`area-${area.area}`} className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: ac.bg, border: `1px solid ${ac.border}` }}
          >
            <span className={ac.icon}><AreaIcon area={area.area} /></span>
          </div>
          <h3 className="text-[20px] font-bold text-black leading-tight">{area.title}</h3>
        </div>
        <p className="text-[14px] text-black/75 leading-[1.8] whitespace-pre-line">{area.story}</p>
        <div className="rounded-xl p-3" style={{ background: ac.bg, border: `1px solid ${ac.border}` }}>
          <p className={`text-[9px] uppercase tracking-widest mb-1 ${ac.label}`}>{t("monthForecast.tip")}</p>
          <p className={`text-[12px] leading-relaxed ${ac.label}`}>{area.tip}</p>
        </div>
      </div>
    );
  }

  // Page 10: Key moments
  if (data.keyMoments?.length > 0) {
    pages.push(
      <div key="keymoments" className="flex flex-col gap-4">
        <div>
          <p className="text-[10px] text-black/35 uppercase tracking-widest mb-1">{t("monthForecast.title")}</p>
          <h3 className="text-[20px] font-bold text-black leading-tight">{t("monthForecast.keyMoments")}</h3>
        </div>
        <div className="flex flex-col gap-3">
          {data.keyMoments.map((km, i) => (
            <div
              key={i}
              className="rounded-2xl p-4"
              style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.07)" }}
            >
              <p className="text-[12px] font-semibold text-black/70 mb-1">{km.period}</p>
              <p className="text-[13px] text-black/60 leading-relaxed">{km.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Page 11: Closing advice
  pages.push(
    <div key="advice" className="flex flex-col gap-5">
      <div>
        <p className="text-[10px] text-black/35 uppercase tracking-widest mb-1">{t("monthForecast.title")}</p>
        <h3 className="text-[20px] font-bold text-black leading-tight">{t("monthForecast.advice")}</h3>
      </div>
      <p className="text-[15px] text-black/75 leading-[1.85] whitespace-pre-line">{data.advice}</p>
    </div>
  );

  return (
    <ScrollScreen
      pages={pages}
      onBack={() => router.back()}
      onComplete={() => router.back()}
      completionLabel={t("monthForecast.done")}
    />
  );
}
