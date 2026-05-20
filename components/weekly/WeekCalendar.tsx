"use client";

import type { WeeklyDayHighlight, DayTag } from "@/lib/types";

interface WeekCalendarProps {
  days: WeeklyDayHighlight[];
  bestDay: number;
  hardestDay: number;
}

const TAG_TEXT: Record<DayTag, string> = {
  "деньги":     "финансовых решений",
  "решения":    "важных решений",
  "любовь":     "романтики",
  "действия":   "активных действий",
  "карьера":    "карьерных шагов",
  "отдых":      "отдыха",
  "интуиция":   "фокусирования",
  "творчество": "творчества",
  "здоровье":   "заботы о здоровье",
  "осторожно":  "осторожности",
};

const SHORT_WEEKDAYS: Record<string, string> = {
  "Понедельник": "ПН",
  "Вторник": "ВТ",
  "Среда": "СР",
  "Четверг": "ЧТ",
  "Пятница": "ПТ",
  "Суббота": "СБ",
  "Воскресенье": "ВС",
};

const SHORT_MONTHS = [
  "", "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

function formatDate(iso: string): string {
  const parts = iso.split("-");
  return `${parseInt(parts[2], 10)} ${SHORT_MONTHS[parseInt(parts[1], 10)]}`;
}

function buildDescription(tags: DayTag[]): string {
  const texts = tags.slice(0, 2).map((t) => TAG_TEXT[t]).filter(Boolean);
  if (texts.length === 0) return "";
  return `День для ${texts.join(" и ")}`;
}

export default function WeekCalendar({ days, bestDay, hardestDay }: WeekCalendarProps) {
  // Pairs: [0,1], [2,3], [4,5], [6]
  const pairs: WeeklyDayHighlight[][] = [];
  for (let i = 0; i < days.length; i += 2) {
    pairs.push(days.slice(i, i + 2));
  }

  return (
    <div className="mx-5">
      <div className="flex flex-col gap-2">
        {pairs.map((pair, pi) => (
          <div key={pi} className="grid grid-cols-2 gap-2">
            {pair.map((day) => {
              const isBest = day.dayNumber === bestDay;
              const isHardest = day.dayNumber === hardestDay;
              const desc = buildDescription(day.tags);

              return (
                <div
                  key={day.date}
                  className={`glass-strong ${
                    isBest
                      ? "ring-1 ring-emerald-500/30"
                      : isHardest
                        ? "ring-1 ring-amber-500/30"
                        : ""
                  } ${pair.length === 1 ? "col-span-1" : ""}`}
                >
                  <div className="relative z-10 px-3.5 py-3">
                    {/* Header */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-xs font-bold ${
                        isBest ? "text-emerald-400" : isHardest ? "text-amber-400" : "text-white/80"
                      }`}>
                        {SHORT_WEEKDAYS[day.weekday]}
                      </span>
                      <span className="text-xs text-white/40">
                        {formatDate(day.date)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-[13px] leading-snug text-white/60">
                      {desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
