"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserData } from "@/lib/user-data";
import { useT } from "@/lib/i18n";
import { isInFreeTrial } from "@/lib/trial";
import { useProStatus } from "@/lib/pro-status";
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
    high: { bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.20)", text: "#065f46" },
    medium: { bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.20)", text: "#78350f" },
    low: { bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.20)", text: "#7f1d1d" },
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
  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>
      <div className="flex items-center justify-between px-5 pt-14 pb-2 shrink-0">
        <div className="h-10 w-10 rounded-full bg-white/15 animate-pulse" />
        <div className="h-3 w-16 bg-white/20 rounded-full animate-pulse" />
        <div className="w-10" />
      </div>
      <div className="flex-1 min-h-0 px-4 pb-6 pt-2">
        <div className="h-full rounded-3xl animate-pulse" style={{ background: "rgba(255,255,255,0.12)" }} />
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
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (!proLoading && !isInFreeTrial() && !isPro) {
      setShowPaywall(true);
      setLoading(false);
      return;
    }
    if (proLoading) return;

    const user = getUserData();
    const cacheKey = `divina-year-forecast-v1_${user.birthDate}_${user.lang}`;

    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.months?.length) {
          setData(parsed);
          setLoading(false);
          return;
        }
      } catch {}
    }

    fetch("/api/year-forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
          sessionStorage.setItem(cacheKey, JSON.stringify(d));
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [isPro, proLoading]);

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
            onClick={() => { setError(false); setLoading(true); }}
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
      <div className="grid grid-cols-3 gap-2">
        {data.months.slice(0, 6).map(m => (
          <div
            key={m.month}
            className="rounded-xl p-2 text-center"
            style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}
          >
            <p className="text-[9px] text-black/40 mb-0.5">{m.monthName}</p>
            <div className={`h-1.5 rounded-full mx-auto ${m.energy === "high" ? "bg-emerald-400" : m.energy === "low" ? "bg-red-400" : "bg-amber-400"}`} style={{ width: "60%" }} />
          </div>
        ))}
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
