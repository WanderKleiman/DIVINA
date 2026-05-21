"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import MonthGrid from "@/components/calendar/MonthGrid";
import ForecastSkeleton from "@/components/ForecastSkeleton";
import { getUserData } from "@/lib/user-data";
import { useT } from "@/lib/i18n";
import type { CalendarDay } from "@/lib/types";

const CACHE_PREFIX = "divina-calendar-v2-";

const FILTER_CHIPS = [
  { id: "all", label: "Все" },
  { id: "decisions", label: "Решения" },
  { id: "love", label: "Любовь" },
  { id: "rest", label: "Отдых" },
  { id: "career", label: "Карьера" },
  { id: "health", label: "Здоровье" },
] as const;

type FilterId = (typeof FILTER_CHIPS)[number]["id"];

function matchesFilter(day: CalendarDay, filter: FilterId): boolean {
  if (filter === "all") return true;
  const text = [day.brief ?? "", day.recommendation ?? "", day.transitLabel ?? ""]
    .join(" ")
    .toLowerCase();
  switch (filter) {
    case "decisions": return /решени|выбор|намерени|цел|начинани|планир/.test(text);
    case "love":      return /любов|отношени|чувств|эмоц|сердц|нежн/.test(text);
    case "rest":      return /отдых|восстановлени|покой|отпусти|отпускай|итог|расслаб/.test(text);
    case "career":    return /работ|карьер|проект|бизнес|финанс|деньг|дохо|рост/.test(text);
    case "health":    return /здоровь|тел|энерги|сил|витальн/.test(text);
    default:          return true;
  }
}

const MONTH_NAMES_RU = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];
const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDateLocalized(dateStr: string, lang: string): string {
  const parts = dateStr.split("-");
  const month = parseInt(parts[1] ?? "1", 10);
  const day = parseInt(parts[2] ?? "1", 10);
  if (lang === "en") return `${MONTH_NAMES_EN[month - 1] ?? ""} ${day}`;
  return `${day} ${MONTH_NAMES_RU[month - 1] ?? ""}`;
}

const CARD_GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(255,255,255,0.92)",
  backdropFilter: "blur(28px) saturate(1.6)",
  WebkitBackdropFilter: "blur(28px) saturate(1.6)",
};

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [days, setDays] = useState<CalendarDay[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notableFilter, setNotableFilter] = useState<FilterId>("all");
  const { t, lang } = useT();

  useEffect(() => {
    setNotableFilter("all");
    const cacheKey = `${CACHE_PREFIX}${year}-${month}`;

    // Check session cache
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        setDays(JSON.parse(cached));
        setLoading(false);
        return;
      } catch {}
    }

    const user = getUserData();

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/calendar?year=${year}&month=${month}&birthDate=${user.birthDate}&birthTime=${user.birthTime}&lat=${user.lat}&lng=${user.lng}&tzOffset=${user.tzOffset}`
        );
        const data = await res.json();
        if (data?.days) {
          setDays(data.days);
          sessionStorage.setItem(cacheKey, JSON.stringify(data.days));
        }
      } catch (err) {
        console.error("Failed to load calendar:", err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [year, month]);

  const todayNum = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const notableDays = days
    ? days.filter(d => d.hasTransit === true && (!isCurrentMonth || d.dayNumber >= todayNum))
    : [];

  const filteredNotable = notableDays.filter(d => matchesFilter(d, notableFilter));

  return (
    <div className="stagger flex flex-col gap-4 pb-28">
      <div className="animate-fade-in-up">
        <Header />
      </div>

      <div className="animate-fade-in-up px-5">
        <h2 className="text-xl font-medium tracking-wide text-white/90">{t("cal.title")}</h2>
        <p className="text-sm text-white/40 mt-1">{t("cal.subtitle")}</p>
      </div>

      {loading ? (
        <ForecastSkeleton label={t("loading.calendar")} />
      ) : loadError || !days ? (
        <div className="flex flex-col items-center justify-center min-h-[50dvh] px-6 gap-4">
          <p className="text-sm text-white/50 text-center">{t("error.calendar")}</p>
          <button
            onClick={() => { setLoadError(false); setLoading(true); setDays(null); }}
            className="rounded-xl bg-white/10 border border-white/15 px-5 py-2.5 text-sm text-white/70"
          >
            {t("action.retry")}
          </button>
        </div>
      ) : (
        <>
          <div className="animate-fade-in-up">
            <MonthGrid days={days} year={year} month={month} />
          </div>

          {/* Notable dates section */}
          {notableDays.length > 0 && (
            <div className="animate-fade-in-up px-5 flex flex-col gap-3">
              <h3 className="text-base font-semibold text-white/80">{t("section.notableDates")}</h3>

              {/* Filter chips */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
                {FILTER_CHIPS.map(chip => (
                  <button
                    key={chip.id}
                    onClick={() => setNotableFilter(chip.id)}
                    className="shrink-0 rounded-full transition-all"
                    style={
                      notableFilter === chip.id
                        ? { background: "white", border: "1px solid white", color: "rgba(0,0,0,0.82)", padding: "7px 16px", fontSize: 13, fontWeight: 600 }
                        : { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.80)", padding: "7px 16px", fontSize: 13, fontWeight: 500 }
                    }
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Cards */}
              {filteredNotable.length === 0 ? (
                <p className="text-sm text-white/30 py-2">Нет дат по этому фильтру</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredNotable.map((day, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-4"
                      style={CARD_GLASS}
                    >
                      {/* Date + badge row */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-black">{formatDateLocalized(day.date, lang)}</span>
                        {day.transitLabel && (
                          <span
                            className="text-[11px] font-medium text-black/60 px-2.5 py-0.5 rounded-full"
                            style={{ background: "rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.08)" }}
                          >
                            {day.transitLabel}
                          </span>
                        )}
                      </div>
                      {day.brief && (
                        <p className="text-[13px] font-medium text-black mb-1 leading-snug">{day.brief}</p>
                      )}
                      {day.recommendation && (
                        <p className="text-[13px] text-black/60 leading-relaxed">{day.recommendation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
