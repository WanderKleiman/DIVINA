import type { CalendarDay } from "@/lib/types";
import MoonPhaseIcon from "./MoonPhaseIcon";

interface DayDetailProps {
  day: CalendarDay;
  onClose: () => void;
}

const energyLabels: Record<string, string> = {
  high: "Высокая энергия",
  medium: "Средняя энергия",
  low: "Низкая энергия",
};

const energyOpacity: Record<string, string> = {
  high: "text-white/70",
  medium: "text-white/50",
  low: "text-white/30",
};

export default function DayDetail({ day, onClose }: DayDetailProps) {
  return (
    <div className="glass-strong mx-5">
      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium tracking-wide text-white">
            {day.dayNumber} апреля 2026
          </h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/60 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-2">
            <MoonPhaseIcon phase={day.moonPhase} size={18} />
            <span className="text-sm text-white/60">Луна в {day.moonSign}</span>
          </div>
          <span className={`text-sm ${energyOpacity[day.energy]}`}>
            {energyLabels[day.energy]}
          </span>
        </div>

        {day.hasTransit && day.transitLabel && (
          <div className="rounded-xl bg-white/5 border border-white/15 p-3 mb-3">
            <p className="text-sm font-medium text-white/70">{day.transitLabel}</p>
            {day.brief && (
              <p className="text-xs text-white/60 mt-1">{day.brief}</p>
            )}
            {day.recommendation && (
              <p className="text-xs text-white/50 italic border-t border-white/10 pt-2 mt-2">
                {day.recommendation}
              </p>
            )}
          </div>
        )}

        {!day.hasTransit && (
          <p className="text-sm text-white/50">
            Обычный день без значимых транзитов. Хорошее время для повседневных дел.
          </p>
        )}
      </div>
    </div>
  );
}
