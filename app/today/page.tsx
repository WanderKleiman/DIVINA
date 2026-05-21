"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import EnergyCard from "@/components/EnergyCard";
import TransitCard from "@/components/today/TransitCard";
import CategoryList from "@/components/today/CategoryList";
import NotableDates from "@/components/today/NotableDates";
import { getUserData, getToday } from "@/lib/user-data";
import { useT } from "@/lib/i18n";
import type { DailyForecast, NotableDate } from "@/lib/types";

const CACHE_KEY = "divina-today-cache";
const MAX_AUTO_RETRIES = 2;
const AUTO_RETRY_DELAY_MS = 2200;

// Weekday names for the skeleton header
const WEEKDAYS_RU = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_RU = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getTodayLabel() {
  const now = new Date();
  let lang = "ru";
  try { lang = localStorage.getItem("divina_lang") ?? "ru"; } catch {}
  if (lang === "en") {
    return `${WEEKDAYS_EN[now.getDay()]}, ${MONTHS_EN[now.getMonth()]} ${now.getDate()}`;
  }
  return `${WEEKDAYS_RU[now.getDay()]}, ${now.getDate()} ${MONTHS_RU[now.getMonth()]}`;
}

// Layout-matching skeleton — shows date + shimmer cards instead of just moon
function TodaySkeleton() {
  const dateLabel = getTodayLabel();
  return (
    <div className="flex flex-col gap-4">
      {/* Date line — we know this client-side */}
      <div className="px-5 pt-2 pb-1">
        <p className="text-white/50 text-sm tracking-wide">{dateLabel}</p>
        {/* Moon info shimmer */}
        <div className="mt-3 flex items-center gap-2">
          <div className="h-3.5 w-3.5 rounded-full bg-white/20 animate-pulse" />
          <div className="h-3 w-40 bg-white/[0.12] rounded-full animate-pulse" />
        </div>
      </div>

      {/* Transit card shimmer */}
      <div className="mx-5 glass-strong rounded-2xl p-4">
        <div className="h-3.5 w-24 bg-white/[0.12] rounded-full animate-pulse mb-3" />
        <div className="space-y-2.5">
          <div className="h-3 bg-white/[0.08] rounded-full animate-pulse w-full" />
          <div className="h-3 bg-white/[0.06] rounded-full animate-pulse w-4/5" />
        </div>
      </div>

      {/* Energy card shimmer */}
      <div className="mx-5 glass-strong rounded-2xl p-5">
        <div className="h-4 w-32 bg-white/[0.12] rounded-full animate-pulse mb-4" />
        <div className="space-y-2.5">
          <div className="h-3 bg-white/[0.08] rounded-full animate-pulse w-full" />
          <div className="h-3 bg-white/[0.06] rounded-full animate-pulse w-5/6" />
          <div className="h-3 bg-white/[0.06] rounded-full animate-pulse w-4/5" />
        </div>
        <div className="mt-4 flex gap-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-7 flex-1 bg-white/[0.07] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* Category pills shimmer */}
      <div className="mx-5">
        <div className="h-3.5 w-20 bg-white/[0.10] rounded-full animate-pulse mb-3" />
        <div className="flex gap-2 flex-wrap">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-8 w-20 bg-white/[0.07] rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const [forecast, setForecast] = useState<DailyForecast | null>(null);
  const [notableDates, setNotableDates] = useState<NotableDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const autoRetryRef = useRef(0);
  const { t } = useT();

  useEffect(() => {
    const today = getToday();
    const user = getUserData();
    const cacheKey = `${CACHE_KEY}_${user.birthDate}_${user.tone}_${user.lang}_${user.tzOffset}`;

    // Check session cache first
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed._date === today) {
          setForecast(parsed.forecast);
          setNotableDates(parsed.notableDates || []);
          setLoading(false);
          return;
        }
      } catch {}
    }

    let cancelled = false;

    async function load() {
      try {
        // Fetch forecast first — it's what the user needs most
        const forecastRes = await fetch("/api/forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            birthDate: user.birthDate,
            birthTime: user.birthTime,
            lat: user.lat,
            lng: user.lng,
            date: today,
            tzOffset: user.tzOffset,
            tone: user.tone,
            lang: user.lang,
          }),
        });

        const forecastData = await forecastRes.json();
        if (cancelled) return;

        if (forecastData && !forecastData.error) {
          setForecast(forecastData);
          setLoading(false);
          autoRetryRef.current = 0; // reset auto-retry counter on success

          // Cache partial result immediately — calendar loads separately below
          sessionStorage.setItem(cacheKey, JSON.stringify({
            _date: today,
            forecast: forecastData,
            notableDates: [],
          }));

          // Load calendar in background — doesn't block the page
          fetch(`/api/calendar?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}&birthDate=${user.birthDate}&birthTime=${user.birthTime}&lat=${user.lat}&lng=${user.lng}&tzOffset=${user.tzOffset}`)
            .then(r => r.json())
            .then(calendarData => {
              if (cancelled) return;
              if (calendarData?.days) {
                const todayNum = new Date().getDate();
                const notable = calendarData.days
                  .filter((d: { hasTransit: boolean; dayNumber: number }) => d.hasTransit && d.dayNumber > todayNum)
                  .slice(0, 3)
                  .map((d: { date: string; dayNumber: number; transitLabel?: string; brief?: string; recommendation?: string }) => ({
                    date: d.date,
                    dayNumber: d.dayNumber,
                    label: d.transitLabel ?? "",
                    brief: d.brief ?? "",
                    recommendation: d.recommendation ?? "",
                  }));
                setNotableDates(notable);
                // Update cache with calendar data
                sessionStorage.setItem(cacheKey, JSON.stringify({
                  _date: today,
                  forecast: forecastData,
                  notableDates: notable,
                }));
              }
            })
            .catch(() => {}); // calendar failure is silent — page still works
        } else {
          throw new Error("Forecast API returned error");
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load forecast:", err);

        // Auto-retry up to MAX_AUTO_RETRIES times before showing error UI
        if (autoRetryRef.current < MAX_AUTO_RETRIES) {
          autoRetryRef.current += 1;
          setTimeout(() => {
            if (!cancelled) load();
          }, AUTO_RETRY_DELAY_MS);
        } else {
          setLoadError(true);
          setLoading(false);
          autoRetryRef.current = 0;
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [retryCount]);

  if (loading) {
    return (
      <div>
        <Header />
        <TodaySkeleton />
      </div>
    );
  }

  if (loadError || !forecast) {
    return (
      <div>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60dvh] px-6 gap-4">
          <p className="text-sm text-white/50 text-center">{t("error.forecast")}</p>
          <button
            onClick={() => { setLoadError(false); setLoading(true); autoRetryRef.current = 0; setRetryCount(c => c + 1); }}
            className="rounded-xl bg-white/10 border border-white/15 px-5 py-2.5 text-sm text-white/70"
          >
            {t("action.retry")}
          </button>
        </div>
      </div>
    );
  }

  const f = forecast;

  return (
    <div className="stagger flex flex-col gap-4">
      <div className="animate-fade-in-up">
        <Header />
      </div>

      <div className="animate-fade-in-up">
        <HeroSection
          date={f.date}
          weekday={f.weekday}
          moonSign={f.moonSign}
          moonSignSymbol={f.moonSignSymbol}
          moonPhase={f.moonPhase}
          moonPercent={f.moonPercent}
        />
      </div>

      <div className="animate-fade-in-up">
        <TransitCard transits={f.transits} />
      </div>

      <div className="animate-fade-in-up">
        <EnergyCard
          text={f.energy}
          moonSign={f.moonSign}
          moonSignSymbol={f.moonSignSymbol}
          moonPhase={f.moonPhase}
          moonPercent={f.moonPercent}
          energy="medium"
          affirmation={f.affirmation}
          summary={f.summary}
          doList={f.doList}
          dontList={f.dontList}
        />
      </div>

      <div className="animate-fade-in-up">
        <CategoryList categories={f.categories} />
      </div>

      {notableDates.length > 0 && (
        <div className="animate-fade-in-up">
          <NotableDates dates={notableDates} />
        </div>
      )}
    </div>
  );
}
