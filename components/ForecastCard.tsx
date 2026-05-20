interface ForecastCardProps {
  icon: string;
  title: string;
  subtitle: string;
  brief: string;
  liquidClass: string;
}

const iconMap: Record<string, React.ReactNode> = {
  // Numerology — sacred geometry / infinity
  "🔢": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-400">
      <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-5.095-8 0-8zM5.822 8c5.096 0 5.096 8 0 8-5.095 0-5.095-8 0-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  // Astrology — zodiac circle with Pisces sign
  "♓": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-400">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <g transform="translate(5,5)" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M2 1C2 1 5 4 5 7C5 10 2 13 2 13"/>
        <path d="M12 1C12 1 9 4 9 7C9 10 12 13 12 13"/>
        <line x1="1" y1="7" x2="13" y2="7"/>
      </g>
    </svg>
  ),
  // Tarot — card with eye
  "🃏": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-400">
      <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 10c2.5 0 4.5 1.34 4.5 2s-2 2-4.5 2-4.5-1.34-4.5-2 2-2 4.5-2z" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
      <path d="M12 5v1M12 18v1" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
    </svg>
  ),
  // Runes — rune stone
  "ᚱ": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
      <path d="M7 22l5-20 5 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 18h8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
    </svg>
  ),
  // Chinese astrology — yin-yang
  "🐯": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-400">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 3a9 9 0 0 1 0 18c0-3 1.5-4.5 0-9s0-6 0-9z" fill="currentColor" opacity="0.15"/>
      <circle cx="12" cy="8" r="1.2" fill="currentColor" opacity="0.6"/>
      <circle cx="12" cy="16" r="1.2" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
    </svg>
  ),
};

export default function ForecastCard({
  icon,
  title,
  subtitle,
  brief,
}: ForecastCardProps) {
  const svgIcon = iconMap[icon];

  return (
    <button className="glass mx-5 w-[calc(100%-2.5rem)] text-left transition-all active:scale-[0.99]">
      <div className="relative z-10 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/[0.05] border border-black/[0.07]">
            {svgIcon || <span className="text-xl">{icon}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h3 className="font-heading font-semibold text-black">
                {title}
              </h3>
              <span className="text-xs text-black/35">{subtitle}</span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-black/60">
              {brief}
            </p>
            <span className="mt-2 inline-block text-xs font-medium text-violet-600">
              Подробнее →
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
