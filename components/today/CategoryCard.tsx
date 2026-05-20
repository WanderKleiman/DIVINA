"use client";

import type { CategoryForecast, LifeCategory } from "@/lib/types";

interface CategoryCardProps {
  forecast: CategoryForecast;
}

function CategoryIcon({ category }: { category: LifeCategory }) {
  const cls = "text-white/60";
  switch (category) {
    case "love":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={cls} strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "finance":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={cls} strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "health":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={cls} strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case "career":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={cls} strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      );
    case "spiritual":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={cls} strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3" />
          <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12" />
          <path d="M2 12h3M19 12h3" />
          <path d="M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
        </svg>
      );
    default:
      return null;
  }
}

export default function CategoryCard({ forecast }: CategoryCardProps) {
  return (
    <div className="glass w-full text-left">
      <div className="relative z-10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
            <CategoryIcon category={forecast.category} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">
                {forecast.title}
              </h3>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${
                      i < forecast.rating ? "bg-white" : "bg-white/15"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-white/60">
              {forecast.brief}
            </p>
            {forecast.detailed && (
              <p className="mt-1.5 text-xs leading-relaxed text-white/40">
                {forecast.detailed}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
