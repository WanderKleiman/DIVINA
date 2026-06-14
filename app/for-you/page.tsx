"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getSubscriptionPrices } from "@/lib/pricing";
import InterpretationPaywall from "@/components/paywall/InterpretationPaywall";
import WeeklyPaywall from "@/components/paywall/WeeklyPaywall";
import CompatibilityPaywall from "@/components/paywall/CompatibilityPaywall";
import SubscriptionPaywall from "@/components/paywall/SubscriptionPaywall";
import { getPurchases, type Purchase } from "@/lib/purchases";
import { getUserData } from "@/lib/user-data";
import { useT, APP_LANG, formatShortDate } from "@/lib/i18n";
import { CELEBRITIES } from "@/lib/celebrities-data";
import Link from "next/link";
import type { LifePeriod, LifePeriodsResult } from "@/lib/ai-interpret";
import { ensureTrialStarted } from "@/lib/trial";
import { canUseCompatibilityFree, recordCompatibilityUse } from "@/lib/free-limits";
import { lcGet, lcSet, TTL_WEEK } from "@/lib/local-cache";
import { useProStatus } from "@/lib/pro-status";

type PaywallType = "interpretation" | "weekly" | "compatibility" | null;

function getOneTimePurchases(t: (key: string) => string) {
  return [
    {
      id: "interpretation" as const,
      videoSrc: "/cosmos-7.mp4",
      image: "/photos/cosmos.jpg",
      href: "/interpretation",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="5" opacity="0.5" />
          <line x1="12" y1="19" x2="12" y2="22" opacity="0.5" />
          <line x1="2" y1="12" x2="5" y2="12" opacity="0.5" />
          <line x1="19" y1="12" x2="22" y2="12" opacity="0.5" />
        </svg>
      ),
      title: t("forYou.interpretationTitle"),
      description: t("forYou.interpretationDesc"),
    },
    {
      id: "weekly" as const,
      videoSrc: "/cosmos-10.mp4",
      image: "/photos/nebula.jpg",
      href: "/weekly",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="16" y1="2" x2="16" y2="6" />
        </svg>
      ),
      title: t("forYou.weeklyTitle"),
      description: t("forYou.weeklyDesc"),
    },
    {
      id: "compatibility" as const,
      videoSrc: "/moon2.mp4",
      image: "/photos/stars.jpg",
      href: "/compatibility",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      title: t("forYou.compatTitle"),
      description: t("forYou.compatDesc"),
    },
  ];
}

function formatPeriodDateShort(startIso: string, endIso: string): string {
  const [sy, sm, sd] = startIso.split("-").map(Number);
  const [ey, em, ed] = endIso.split("-").map(Number);
  return `${formatShortDate(sd, sm, APP_LANG)} ${sy} — ${formatShortDate(ed, em, APP_LANG)} ${ey}`;
}

function formatPurchaseDate(iso: string) {
  const d = new Date(iso);
  const locale = APP_LANG === "en" ? "en-US" : "ru-RU";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

export default function ForYouPage() {
  const router = useRouter();
  const [openPaywall, setOpenPaywall] = useState<PaywallType>(null);
  const [openSubPaywall, setOpenSubPaywall] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [periodsData, setPeriodsData] = useState<LifePeriodsResult | null>(null);
  const [periodsLoading, setPeriodsLoading] = useState(true);
  const [periodsError, setPeriodsError] = useState(false);
  const [savedMonthPeriod, setSavedMonthPeriod] = useState<string | null>(null);
  const [savedCompatPartners, setSavedCompatPartners] = useState<string[]>([]);
  const [savedWeeklyStart, setSavedWeeklyStart] = useState<string | null>(null);
  const prices = getSubscriptionPrices();
  const { t } = useT();
  const { isPro } = useProStatus();
  const oneTimePurchases = getOneTimePurchases(t);
  const PURCHASE_LABELS: Record<string, string> = {
    interpretation: t("forYou.purchaseLabelInterpretation"),
    compatibility: t("forYou.purchaseLabelCompatibility"),
    weekly: t("forYou.purchaseLabelWeekly"),
  };

  function loadPeriods() {
    const user = getUserData();
    const periodsCacheKey = `divina_life_periods_v5_${user.lang}`;
    const cached = lcGet<LifePeriodsResult>(periodsCacheKey);
    if (cached) {
      setPeriodsData(cached);
      setPeriodsLoading(false);
      return;
    }
    setPeriodsLoading(true);
    setPeriodsError(false);
    fetch("/api/life-period", {
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
      .then(data => {
        if (!data.error) {
          setPeriodsData(data);
          lcSet(periodsCacheKey, data, TTL_WEEK);
        } else {
          setPeriodsError(true);
        }
      })
      .catch(() => setPeriodsError(true))
      .finally(() => setPeriodsLoading(false));
  }

  useEffect(() => {
    ensureTrialStarted();
    setPurchases(getPurchases());
    loadPeriods();
    // Collect history from localStorage
    try {
      // Month forecast
      const monthRaw = localStorage.getItem("divina_month_history_v1");
      if (monthRaw) setSavedMonthPeriod(JSON.parse(monthRaw).period ?? "");

      // Compatibility — scan for all saved partner results
      const user2 = getUserData();
      const compatPrefix = `divina-compat-local-v2_`;
      const partners: string[] = [];
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith(compatPrefix) && key.includes(`_${user2.birthDate}_`)) {
          const name = key.replace(compatPrefix, "").replace(`_${user2.birthDate}_${user2.lang}`, "");
          if (name) partners.push(name);
        }
      }
      setSavedCompatPartners(partners);

      // Weekly forecast
      const weeklyKey = `divina-weekly-cache_${user2.birthDate}_${user2.tone}_${user2.lang}`;
      const weeklyRaw = lcGet<{ _weekStart: string }>(weeklyKey);
      if (weeklyRaw?._weekStart) setSavedWeeklyStart(weeklyRaw._weekStart);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleItemClick(item: typeof oneTimePurchases[0]) {
    if (item.id === "compatibility") {
      if (!isPro && !canUseCompatibilityFree()) {
        setOpenSubPaywall(true);
        return;
      }
      if (!isPro) recordCompatibilityUse();
    }
    if (item.href) {
      router.push(item.href);
    } else {
      setOpenPaywall(item.id);
    }
  }

  return (
    <>
      <div className="stagger flex flex-col gap-7">
        <div className="animate-fade-in-up">
          <Header />
        </div>

        {/* Life Periods — transit-style section */}
        {(periodsLoading || periodsError || (periodsData && periodsData.periods.length > 0)) && (
          <div className="animate-fade-in-up">
            {/* Section header */}
            <div className="flex items-center justify-between px-5 mb-3">
              <h2 className="text-base font-semibold text-white">{t("section.yourPeriods")}</h2>
              {periodsData && !periodsLoading && (
                <button
                  onClick={() => router.push("/for-you/periods")}
                  className="text-xs text-white/40 flex items-center gap-1"
                >
                  {t("section.all")}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )}
            </div>

            {/* Period cards — horizontal scroll like transits */}
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide pl-5 scroll-pl-5">
              {periodsLoading ? (
                <>
                  {[0, 1].map(i => (
                    <div key={i} className="shrink-0 w-[270px] snap-start rounded-2xl p-4"
                      style={{ background: "rgba(255,255,255,0.82)", border: "1px solid rgba(255,255,255,0.92)", backdropFilter: "blur(28px) saturate(1.6)", WebkitBackdropFilter: "blur(28px) saturate(1.6)" }}>
                      <div className="h-3 bg-black/10 rounded animate-pulse w-2/3 mb-2" />
                      <div className="h-2.5 bg-black/[0.07] rounded animate-pulse w-1/2 mb-3" />
                      <div className="h-2 bg-black/[0.05] rounded animate-pulse w-full mb-1.5" />
                      <div className="h-2 bg-black/[0.05] rounded animate-pulse w-4/5" />
                    </div>
                  ))}
                </>
              ) : periodsError ? (
                <div className="shrink-0 w-[270px] snap-start rounded-2xl p-4 flex flex-col gap-2"
                  style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <p className="text-xs text-white/50">{t("error.periods")}</p>
                  <button
                    onClick={() => loadPeriods()}
                    className="text-xs text-white/70 border border-white/20 rounded-xl px-3 py-1.5 self-start hover:bg-white/10 transition-colors"
                  >
                    {t("action.retry")}
                  </button>
                </div>
              ) : periodsData?.periods.map((p: LifePeriod, i: number) => {
                const teaser = p.story?.split("\n\n")[0]?.slice(0, 130).trimEnd();
                const teaserText = teaser && teaser.length === 130 ? teaser + "…" : teaser;
                return (
                  <button
                    key={i}
                    onClick={() => router.push("/for-you/periods")}
                    className="shrink-0 w-[270px] snap-start rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
                    style={{ background: "rgba(255,255,255,0.82)", border: "1px solid rgba(255,255,255,0.92)", backdropFilter: "blur(28px) saturate(1.6)", WebkitBackdropFilter: "blur(28px) saturate(1.6)", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
                  >
                    <div className="flex items-center gap-2 mb-2.5">
                      <p className="text-sm font-semibold text-black/80 leading-tight">{p.planetTitle}</p>
                    </div>
                    <p className="text-[11px] text-black/40 mb-2.5">{formatPeriodDateShort(p.startDate, p.endDate)}</p>
                    {teaserText && (
                      <p className="text-[12px] text-black/60 leading-relaxed line-clamp-3">{teaserText}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Divina Pro banner with video background */}
        <div className="animate-fade-in-up mx-5">
          <button
            onClick={() => router.push("/pro")}
            className="w-full text-left relative overflow-hidden rounded-2xl active:scale-[0.98] transition-transform"
          >
            <video
              src="/cosmos-4.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
              style={{ pointerEvents: "none" }}
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 border border-white/15">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{t("pro.title")}</h2>
                  <p className="text-[11px] text-white/40 tracking-wider">{t("forYou.subscription")}</p>
                </div>
              </div>
              <p className="text-sm text-white/70 mb-4">
                {t("forYou.proDesc")}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40" suppressHydrationWarning>{t("forYou.fromPerWeek")} {prices.yearWeekly}{t("forYou.perWeek")}</span>
                <span className="text-xs text-white/30 flex items-center gap-1">
                  {t("forYou.learnMore")}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* One-time purchases */}
        <div className="animate-fade-in-up px-5 pt-2">
          <h3 className="text-xs font-medium text-white/70 tracking-wider uppercase mb-3">{t("forYou.forYouHeader")}</h3>
          <div className="space-y-2.5">
            {oneTimePurchases.map((f) => (
              <button
                key={f.id}
                onClick={() => handleItemClick(f)}
                className="w-full text-left rounded-2xl group active:scale-[0.98] transition-transform overflow-hidden relative"
                style={{ border: "1px solid rgba(255,255,255,0.09)", minHeight: 72 }}
              >
                <img src={f.image} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(8,4,24,0.88) 0%, rgba(8,4,24,0.55) 100%)" }} />
                <div className="relative z-10 p-4 flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-white/60">
                    {f.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white mb-0.5">{f.title}</h3>
                    <p className="text-xs text-white/45 line-clamp-1">{f.description}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-white/25">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pro subscription features */}
        <div className="animate-fade-in-up px-5 pt-2">
          <h3 className="text-xs font-medium text-white/70 tracking-wider uppercase mb-3">{t("forYou.subscription")}</h3>
          <div className="space-y-2.5">
            {/* Month Forecast */}
            <button
              onClick={() => router.push("/for-you/month")}
              className="w-full text-left rounded-2xl group active:scale-[0.98] transition-transform overflow-hidden relative"
              style={{ border: "1px solid rgba(255,255,255,0.14)", minHeight: 88 }}
            >
              <img src="/photos/cosmos.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(10,6,30,0.82) 0%, rgba(10,6,30,0.45) 100%)" }} />
              <div className="relative z-10 p-4 flex items-center gap-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-white">{t("forYou.monthTitle")}</h3>
                    <span className="text-[9px] font-semibold text-black/50 bg-white/70 rounded-full px-1.5 py-0.5 tracking-wider">PRO</span>
                  </div>
                  <p className="text-xs text-white/55 line-clamp-1">{t("forYou.monthDesc")}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-white/40">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>

            {/* Year Forecast */}
            <button
              onClick={() => router.push("/for-you/year")}
              className="w-full text-left rounded-2xl group active:scale-[0.98] transition-transform overflow-hidden relative"
              style={{ border: "1px solid rgba(255,255,255,0.14)", minHeight: 88 }}
            >
              <img src="/photos/nebula.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(10,6,30,0.82) 0%, rgba(10,6,30,0.45) 100%)" }} />
              <div className="relative z-10 p-4 flex items-center gap-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-white">{t("forYou.yearTitle")}</h3>
                    <span className="text-[9px] font-semibold text-black/50 bg-white/70 rounded-full px-1.5 py-0.5 tracking-wider">PRO</span>
                  </div>
                  <p className="text-xs text-white/55 line-clamp-1">{t("forYou.yearDesc")}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-white/40">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>

            {/* Natal Chart for Others */}
            <button
              onClick={() => router.push("/for-you/others")}
              className="w-full text-left rounded-2xl group active:scale-[0.98] transition-transform overflow-hidden relative"
              style={{ border: "1px solid rgba(255,255,255,0.14)", minHeight: 88 }}
            >
              <img src="/photos/stars.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(10,6,30,0.82) 0%, rgba(10,6,30,0.45) 100%)" }} />
              <div className="relative z-10 p-4 flex items-center gap-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-white">{t("forYou.othersTitle")}</h3>
                    <span className="text-[9px] font-semibold text-black/50 bg-white/70 rounded-full px-1.5 py-0.5 tracking-wider">PRO</span>
                  </div>
                  <p className="text-xs text-white/55 line-clamp-1">{t("forYou.othersDesc")}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-white/40">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Звёзды — RU only */}
        {APP_LANG === "ru" && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between px-5 mb-3">
              <h2 className="text-base font-semibold text-white">Разборы звёзд</h2>
              <button
                onClick={() => router.push("/stars")}
                className="text-xs text-white/40 flex items-center gap-1"
              >
                Все
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide pl-5 scroll-pl-5">
              {CELEBRITIES.slice(0, 8).map(celeb => (
                <Link
                  key={celeb.id}
                  href={`/stars/${celeb.id}`}
                  prefetch
                  className="shrink-0 w-[140px] snap-start rounded-2xl overflow-hidden active:scale-[0.97] transition-transform text-left block"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {/* Photo or gradient background */}
                  <div
                    className="relative overflow-hidden"
                    style={{ height: 160, background: `linear-gradient(160deg, ${celeb.gradientFrom} 0%, ${celeb.gradientTo} 100%)` }}
                  >
                    {celeb.photo && (
                      <img
                        src={celeb.photo}
                        alt={celeb.name}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                      />
                    )}
                    {/* Bottom gradient for text legibility */}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)" }} />
                    {/* Sign badge */}
                    <div
                      className="absolute top-2 right-2 flex items-center justify-center rounded-full text-sm"
                      style={{ width: 28, height: 28, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
                    >
                      {celeb.signSymbol}
                    </div>
                    {/* Name at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5">
                      <p className="text-xs font-semibold text-white leading-tight">{celeb.name}</p>
                      <p className="text-[10px] text-white/50 mt-0.5">{celeb.signName}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* History — shows only items the user actually generated */}
        {(savedMonthPeriod !== null || savedCompatPartners.length > 0 || savedWeeklyStart !== null) && (
          <div className="animate-fade-in-up px-5 pt-2">
            <h3 className="text-xs font-medium text-white/70 tracking-wider uppercase mb-3">{t("forYou.history")}</h3>
            <div className="space-y-2.5">

              {/* Saved month forecast */}
              {savedMonthPeriod !== null && (
                <button
                  onClick={() => router.push("/for-you/month")}
                  className="w-full text-left relative overflow-hidden rounded-2xl group active:scale-[0.98] transition-transform"
                  style={{ background: "linear-gradient(135deg, rgba(17,94,89,0.55), rgba(30,58,138,0.55))", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="relative z-10 p-4 flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 border border-white/15 text-white/70">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><circle cx="12" cy="16" r="2"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white mb-0.5">{t("forYou.savedMonthTitle")}</h3>
                      <p className="text-xs text-white/50 line-clamp-1">{savedMonthPeriod || t("forYou.monthDesc")}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-white/25"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </button>
              )}

              {/* Saved weekly forecast */}
              {savedWeeklyStart !== null && (
                <button
                  onClick={() => router.push("/weekly")}
                  className="w-full text-left relative overflow-hidden rounded-2xl group active:scale-[0.98] transition-transform"
                  style={{ background: "linear-gradient(135deg, rgba(30,58,138,0.55), rgba(17,24,39,0.75))", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="relative z-10 p-4 flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 border border-white/15 text-white/70">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white mb-0.5">{t("forYou.savedWeeklyTitle")}</h3>
                      <p className="text-xs text-white/50">{
                        (() => {
                          const [, sm, sd] = savedWeeklyStart.split("-").map(Number);
                          return APP_LANG === "en"
                            ? `Week of ${formatShortDate(sd, sm, "en")}`
                            : `Неделя ${formatShortDate(sd, sm, "ru")}`;
                        })()
                      }</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-white/25"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </button>
              )}

              {/* Saved compatibility results */}
              {savedCompatPartners.map((partnerName) => (
                <button
                  key={partnerName}
                  onClick={() => {
                    const savedPartner = localStorage.getItem(`divina-compat-partner-local-v1_${partnerName}`);
                    if (savedPartner) {
                      sessionStorage.setItem("divina_compat_partner", savedPartner);
                    } else {
                      sessionStorage.setItem("divina_compat_partner", JSON.stringify({ name: partnerName }));
                    }
                    router.push("/compatibility/result");
                  }}
                  className="w-full text-left relative overflow-hidden rounded-2xl group active:scale-[0.98] transition-transform"
                  style={{ background: "linear-gradient(135deg, rgba(131,24,67,0.55), rgba(88,28,135,0.55))", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="relative z-10 p-4 flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 border border-white/15 text-white/70">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white mb-0.5">{t("forYou.savedCompatTitle")}</h3>
                      <p className="text-xs text-white/50">{t("forYou.withPartner")} {partnerName}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-white/25"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </button>
              ))}

            </div>
          </div>
        )}

      </div>

      <InterpretationPaywall open={openPaywall === "interpretation"} onClose={() => setOpenPaywall(null)} />
      <WeeklyPaywall open={openPaywall === "weekly"} onClose={() => setOpenPaywall(null)} />
      <CompatibilityPaywall open={openPaywall === "compatibility"} onClose={() => setOpenPaywall(null)} />
      <SubscriptionPaywall open={openSubPaywall} onClose={() => setOpenSubPaywall(false)} />

    </>
  );
}
