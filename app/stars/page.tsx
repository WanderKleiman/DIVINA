"use client";

import { useRouter } from "next/navigation";
import { CELEBRITIES } from "@/lib/celebrities-data";
import { calcCelebrityCompat } from "@/lib/celebrity-compat";
import { getUserData } from "@/lib/user-data";
import { useMemo } from "react";

export default function StarsPage() {
  const router = useRouter();

  const scores = useMemo(() => {
    const user = getUserData();
    if (!user.birthDate) return {};
    return Object.fromEntries(
      CELEBRITIES.map(c => [c.id, calcCelebrityCompat(user.birthDate!, c.birthDate).score])
    );
  }, []);

  return (
    <div className="min-h-screen pb-28" style={{ background: "#0a0618" }}>
      {/* Header */}
      <div
        className="px-5 pt-14 pb-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 56px)" }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/40 text-sm mb-5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Назад
        </button>
        <h1 className="text-2xl font-bold text-white mb-1">Разборы звёзд</h1>
        <p className="text-sm text-white/40">Натальные карты знаменитостей и совместимость с тобой</p>
      </div>

      {/* Grid */}
      <div className="px-5 grid grid-cols-2 gap-3">
        {CELEBRITIES.map(celeb => (
          <button
            key={celeb.id}
            onClick={() => router.push(`/stars/${celeb.id}`)}
            className="rounded-2xl overflow-hidden active:scale-[0.97] transition-transform text-left"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Photo or gradient */}
            <div
              className="relative overflow-hidden"
              style={{
                height: 180,
                background: `linear-gradient(160deg, ${celeb.gradientFrom} 0%, ${celeb.gradientTo} 100%)`,
              }}
            >
              {celeb.photo && (
                <img
                  src={celeb.photo}
                  alt={celeb.name}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
              )}
              {/* Gradient overlay for legibility */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }} />

              {/* Sign + compat badges */}
              <div className="absolute top-2 left-2 flex items-center justify-center rounded-full text-sm"
                style={{ width: 28, height: 28, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
                {celeb.signSymbol}
              </div>
              {scores[celeb.id] !== undefined && (
                <div
                  className="absolute top-2 right-2 text-[10px] font-bold rounded-full px-2 py-0.5"
                  style={{ background: "rgba(0,0,0,0.50)", color: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)" }}
                >
                  {scores[celeb.id]}%
                </div>
              )}

              {/* Name at bottom */}
              <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                <p className="text-sm font-semibold text-white leading-tight">{celeb.name}</p>
                <p className="text-[11px] text-white/50 mt-0.5">{celeb.tagline}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
