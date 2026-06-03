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
            <div
              className="relative flex flex-col items-center justify-center pt-6 pb-4"
              style={{
                background: `linear-gradient(160deg, ${celeb.gradientFrom} 0%, ${celeb.gradientTo} 100%)`,
                minHeight: 130,
              }}
            >
              <div
                className="flex items-center justify-center mb-3"
                style={{
                  width: 60, height: 60, borderRadius: "50%",
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  fontSize: 30,
                }}
              >
                {celeb.signSymbol}
              </div>
              <p className="text-sm font-semibold text-white px-3 text-center leading-tight">{celeb.name}</p>
              <p className="text-[11px] text-white/45 mt-1">{celeb.signName}</p>

              {/* Compatibility badge */}
              {scores[celeb.id] !== undefined && (
                <div
                  className="absolute top-2.5 right-2.5 text-[10px] font-bold rounded-full px-2 py-0.5"
                  style={{ background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)" }}
                >
                  {scores[celeb.id]}%
                </div>
              )}
            </div>
            <div className="px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-[11px] text-white/40 line-clamp-1">{celeb.tagline}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
