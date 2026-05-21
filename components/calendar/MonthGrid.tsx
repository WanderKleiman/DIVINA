"use client";

import { useState } from "react";
import type { CalendarDay } from "@/lib/types";
import DayCell from "./DayCell";
import DayDetail from "./DayDetail";
import { useT } from "@/lib/i18n";

interface MonthGridProps {
  days: CalendarDay[];
  year: number;
  month: number;
}

export default function MonthGrid({ days, year, month }: MonthGridProps) {
  const { t } = useT();
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [displayMonth, setDisplayMonth] = useState(month);

  const WEEKDAYS = [t("wd.mon"), t("wd.tue"), t("wd.wed"), t("wd.thu"), t("wd.fri"), t("wd.sat"), t("wd.sun")];
  const MONTHS = [
    t("month.1"), t("month.2"), t("month.3"), t("month.4"), t("month.5"), t("month.6"),
    t("month.7"), t("month.8"), t("month.9"), t("month.10"), t("month.11"), t("month.12"),
  ];

  const today = new Date().getDate();

  // Calculate the starting weekday offset (0 = Monday)
  const firstDay = new Date(year, displayMonth - 1, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday=0 to Monday-based

  const prevMonth = () => setDisplayMonth((m) => (m > 1 ? m - 1 : 12));
  const nextMonth = () => setDisplayMonth((m) => (m < 12 ? m + 1 : 1));

  return (
    <div className="mx-5 space-y-4">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="text-white/40 hover:text-white/60 p-2 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="font-medium tracking-wide text-lg text-white">
          {MONTHS[displayMonth - 1]} {year}
        </h2>
        <button onClick={nextMonth} className="text-white/40 hover:text-white/60 p-2 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-xs text-white/30 py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="glass">
        <div className="relative z-10 p-3">
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {/* Day cells - only render if we're showing April */}
            {displayMonth === month
              ? days.map((day) => (
                  <DayCell
                    key={day.date}
                    day={day}
                    isToday={day.dayNumber === today}
                    onSelect={setSelectedDay}
                  />
                ))
              : Array.from({ length: new Date(year, displayMonth, 0).getDate() }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center rounded-xl p-1.5">
                    <span className="text-sm text-white/30">{i + 1}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-white/40">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-white/70" />
          <span>{t("energy.high")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-white/40" />
          <span>{t("energy.medium")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-white/20" />
          <span>{t("energy.low")}</span>
        </div>
      </div>

      {/* Day detail */}
      {selectedDay && (
        <DayDetail day={selectedDay} onClose={() => setSelectedDay(null)} />
      )}
    </div>
  );
}
