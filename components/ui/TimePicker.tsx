"use client";

import { useState, useCallback } from "react";
import WheelPicker from "./WheelPicker";

interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
}

const hourItems = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: String(i).padStart(2, "0"),
}));

const minuteItems = Array.from({ length: 60 }, (_, i) => ({
  value: i,
  label: String(i).padStart(2, "0"),
}));

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const parts = value ? value.split(":") : null;
  const [hour, setHour] = useState(parts ? parseInt(parts[0], 10) : 12);
  const [minute, setMinute] = useState(parts ? parseInt(parts[1], 10) : 30);

  const emitChange = useCallback((h: number, m: number) => {
    onChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }, [onChange]);

  return (
    <div className="flex gap-1 items-center rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-2 overflow-hidden">
      <WheelPicker
        items={hourItems}
        value={hour}
        onChange={(v) => { setHour(v as number); emitChange(v as number, minute); }}
        width="45%"
        visibleCount={3}
      />
      <span className="text-white/40 text-xl font-light">:</span>
      <WheelPicker
        items={minuteItems}
        value={minute}
        onChange={(v) => { setMinute(v as number); emitChange(hour, v as number); }}
        width="45%"
        visibleCount={3}
      />
    </div>
  );
}
