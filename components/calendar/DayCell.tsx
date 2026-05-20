import type { CalendarDay } from "@/lib/types";
import MoonPhaseIcon from "./MoonPhaseIcon";

interface DayCellProps {
  day: CalendarDay;
  isToday: boolean;
  onSelect: (day: CalendarDay) => void;
}

const energyColors: Record<string, string> = {
  high: "bg-white",
  medium: "bg-white/50",
  low: "bg-white/20",
};

export default function DayCell({ day, isToday, onSelect }: DayCellProps) {
  return (
    <button
      onClick={() => onSelect(day)}
      className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl p-1.5 transition-colors hover:bg-white/5 ${
        isToday ? "bg-white/10 border border-white/20" : ""
      } ${day.hasTransit ? "ring-1 ring-white/20" : ""}`}
    >
      <span className={`text-sm ${isToday ? "text-white font-bold" : "text-white/70"}`}>
        {day.dayNumber}
      </span>
      <MoonPhaseIcon phase={day.moonPhase} size={10} />
      <div className={`h-1 w-1 rounded-full ${energyColors[day.energy]}`} />
    </button>
  );
}
