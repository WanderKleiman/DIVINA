import ZodiacIcon from "@/components/icons/ZodiacIcon";

interface DayInfoBarProps {
  date: string;
  weekday: string;
  moonSign: string;
  moonSignSymbol: string;
  moonPhase: string;
  moonPercent: number;
  personalDay: number;
}

export default function DayInfoBar({
  date,
  weekday,
  moonSign,
  moonSignSymbol,
  moonPhase,
  moonPercent,
  personalDay,
}: DayInfoBarProps) {
  return (
    <div className="glass mx-5 flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
      <div className="flex items-center gap-1.5 text-white/60">
        <span>📅</span>
        <span>
          {weekday}, {date}
        </span>
      </div>
      <div className="h-3 w-px bg-white/20" />
      <div className="flex items-center gap-1.5 text-white/60">
        <span>🌙</span>
        <span className="flex items-center gap-1">
          {moonSign}
          <ZodiacIcon sign={moonSignSymbol} size={13} className="text-white/50 inline-block" />
          · {moonPhase} {moonPercent}%
        </span>
      </div>
      <div className="h-3 w-px bg-white/20" />
      <div className="flex items-center gap-1.5 text-white/60">
        <span>🔢</span>
        <span>День: {personalDay}</span>
      </div>
    </div>
  );
}
