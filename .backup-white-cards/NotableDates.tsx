"use client";

import { useRouter } from "next/navigation";
import type { NotableDate } from "@/lib/types";
import { useT, formatDateLocalized } from "@/lib/i18n";

interface NotableDatesProps {
  dates: NotableDate[];
}

export default function NotableDates({ dates }: NotableDatesProps) {
  const router = useRouter();
  const { t, lang } = useT();

  if (dates.length === 0) return null;

  function handleClick(date: string) {
    const [year, month] = date.split("-");
    router.push(`/calendar?year=${year}&month=${parseInt(month, 10)}&highlight=${date}`);
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-3 px-5">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/50" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <circle cx="12" cy="16" r="2" fill="currentColor" opacity="0.3" />
        </svg>
        <h2 className="text-lg font-medium tracking-wide text-white/90">
          {t("notable.title")}
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pl-5 scroll-pl-5 pb-2 snap-x snap-mandatory scrollbar-hide">
        {dates.slice(0, 5).map((nd) => (
          <button
            key={nd.date}
            onClick={() => handleClick(nd.date)}
            className="glass-strong shrink-0 w-[260px] snap-start text-left"
          >
            <div className="relative z-10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-black/40 bg-black/[0.05] rounded-lg px-2 py-0.5 border border-black/[0.06]">
                  {formatDateLocalized(nd.date, lang)}
                </span>
                <span className="text-sm font-medium text-black/80 truncate">{nd.label}</span>
              </div>
              <p className="text-sm text-black/60 mb-2">{nd.brief}</p>
              <div className="flex items-center justify-between border-t border-black/[0.07] pt-2">
                <p className="text-xs text-black/45 italic flex-1">
                  {nd.recommendation}
                </p>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-black/25 shrink-0 ml-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
