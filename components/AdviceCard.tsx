interface AdviceCardProps {
  advice: string;
  affirmation: string;
}

export default function AdviceCard({ advice, affirmation }: AdviceCardProps) {
  return (
    <div className="glass-strong mx-5">
      <div className="relative z-10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/60">
            <path d="M12 2L9 9H2l5.5 4.5L5 21l7-5 7 5-2.5-7.5L22 9h-7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3"/>
          </svg>
          <h2 className="text-lg font-medium tracking-wide text-white/60">
            Совет дня
          </h2>
        </div>
        <p className="text-[15px] leading-relaxed text-white/80">{advice}</p>
        <div className="mt-4 rounded-xl bg-white/5 px-4 py-3 border border-white/10">
          <p className="text-center text-sm italic text-white/50">
            &ldquo;{affirmation}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
