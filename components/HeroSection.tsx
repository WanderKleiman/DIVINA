import ZodiacIcon from "@/components/icons/ZodiacIcon";

interface HeroSectionProps {
  date: string;
  weekday: string;
  moonSign: string;
  moonSignSymbol: string;
  moonPhase: string;
  moonPercent: number;
}

export default function HeroSection({
  date,
  weekday,
  moonSign,
  moonSignSymbol,
  moonPhase,
  moonPercent,
}: HeroSectionProps) {
  return (
    <div className="px-5 pt-2 pb-1">
      <p className="text-white/50 text-sm tracking-wide">
        {weekday}, {date}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/50">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white/80 text-sm flex items-center gap-1.5">
            {moonPhase} · {moonSign}
            <ZodiacIcon sign={moonSignSymbol} size={14} className="text-white/60 inline-block" />
            · {moonPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
