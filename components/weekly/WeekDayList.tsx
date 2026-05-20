"use client";

import type { WeeklyDayHighlight } from "@/lib/types";
import WeekDayCard from "./WeekDayCard";
import { useT } from "@/lib/i18n";

interface WeekDayListProps {
  days: WeeklyDayHighlight[];
  bestDay: number;
  hardestDay: number;
}

export default function WeekDayList({ days, bestDay, hardestDay }: WeekDayListProps) {
  const { t } = useT();

  return (
    <div className="mx-5">
      <h2 className="text-lg font-medium tracking-wide text-white/90 mb-3">
        {t("week.byDays")}
      </h2>
      <div className="flex flex-col gap-2">
        {days.map((day) => (
          <WeekDayCard
            key={day.date}
            day={day}
            isBest={day.dayNumber === bestDay}
            isHardest={day.dayNumber === hardestDay}
          />
        ))}
      </div>
    </div>
  );
}
