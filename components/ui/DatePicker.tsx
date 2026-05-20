"use client";

import { useState, useEffect, useCallback } from "react";
import WheelPicker from "./WheelPicker";
import { useT } from "@/lib/i18n";

interface DatePickerProps {
  value?: string;
  onChange: (iso: string) => void;
}

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const { t } = useT();
  const parsed = value ? new Date(value + "T00:00:00") : null;
  const [day, setDay] = useState(parsed ? parsed.getDate() : 1);
  const [month, setMonth] = useState(parsed ? parsed.getMonth() + 1 : 1);
  const [year, setYear] = useState(parsed ? parsed.getFullYear() : 2000);

  const maxDay = daysInMonth(month, year);

  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
  }, [month, year, day, maxDay]);

  const emitChange = useCallback((d: number, m: number, y: number) => {
    const max = daysInMonth(m, y);
    const safeDay = Math.min(d, max);
    const iso = `${y}-${String(m).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
    onChange(iso);
  }, [onChange]);

  const dayItems = Array.from({ length: maxDay }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }));

  const monthItems = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: t(`month.${i + 1}`),
  }));

  const yearItems: { value: number; label: string }[] = [];
  for (let y = 2012; y >= 1940; y--) {
    yearItems.push({ value: y, label: String(y) });
  }

  return (
    <div className="flex gap-1 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-2 overflow-hidden">
      <WheelPicker
        items={dayItems}
        value={day}
        onChange={(v) => { setDay(v as number); emitChange(v as number, month, year); }}
        width="25%"
      />
      <WheelPicker
        items={monthItems}
        value={month}
        onChange={(v) => { setMonth(v as number); emitChange(day, v as number, year); }}
        width="45%"
      />
      <WheelPicker
        items={yearItems}
        value={year}
        onChange={(v) => { setYear(v as number); emitChange(day, month, v as number); }}
        width="30%"
      />
    </div>
  );
}
