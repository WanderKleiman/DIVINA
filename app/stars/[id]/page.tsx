"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { CELEBRITIES } from "@/lib/celebrities-data";
import { calcCelebrityCompat, type CompatResult } from "@/lib/celebrity-compat";
import { getUserData } from "@/lib/user-data";

// Pre-render all celebrity pages at build time → instant navigation
export function generateStaticParams() {
  return CELEBRITIES.map(c => ({ id: c.id }));
}

export default function StarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const celeb = CELEBRITIES.find(c => c.id === id);
  const [activeSection, setActiveSection] = useState(0);
  const [compat, setCompat] = useState<CompatResult | null>(null);

  useEffect(() => {
    const user = getUserData();
    if (user.birthDate && celeb) {
      setCompat(calcCelebrityCompat(user.birthDate, celeb.birthDate));
    }
  }, [celeb]);

  if (!celeb) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Звезда не найдена</p>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 38; // r=38
  const offset = compat
    ? circumference - (compat.score / 100) * circumference
    : circumference;

  return (
    <div className="min-h-screen pb-28" style={{ background: "#0a0618" }}>

      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${celeb.gradientFrom} 0%, ${celeb.gradientTo} 60%, #0a0618 100%)`,
          paddingTop: "env(safe-area-inset-top)",
          minHeight: 260,
        }}
      >
          {/* Photo */}
        {celeb.photo && (
          <img
            src={celeb.photo}
            alt={celeb.name}
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{ opacity: 0.45 }}
          />
        )}
        {/* Dark gradient over photo */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,4,24,0.4) 0%, rgba(8,4,24,0.7) 100%)" }} />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Big sign symbol */}
        <div className="relative z-10 flex flex-col items-center pt-14 pb-8 px-6 text-center">
          <div
            className="flex items-center justify-center mb-4"
            style={{
              width: 88, height: 88,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              fontSize: 42,
            }}
          >
            {celeb.signSymbol}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{celeb.name}</h1>
          <p className="text-sm text-white/50">{celeb.tagline}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-white/35">{celeb.signName}</span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/35">{celeb.birthPlace}</span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/35">
              {new Date(celeb.birthDate + "T12:00:00Z").toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5 space-y-4">

        {/* Compatibility card */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
        >
          <h2 className="text-xs font-semibold text-white/40 tracking-wider uppercase mb-4">Совместимость с тобой</h2>

          {compat ? (
            <div className="flex items-center gap-5">
              {/* Ring */}
              <div className="relative shrink-0" style={{ width: 92, height: 92 }}>
                <svg width="92" height="92" viewBox="0 0 92 92">
                  <circle cx="46" cy="46" r="38" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
                  <circle
                    cx="46" cy="46" r="38"
                    fill="none"
                    stroke={compat.score >= 74 ? "#a78bfa" : compat.score >= 62 ? "#60a5fa" : "#f59e0b"}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 46 46)"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                  <text x="46" y="51" textAnchor="middle" fill="white" fontSize="17" fontWeight="700">
                    {compat.score}%
                  </text>
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white mb-1">{compat.label}</p>
                <p className="text-xs text-white/50 leading-relaxed">{compat.description}</p>
                <p className="text-[11px] text-white/30 mt-2">Твой знак: {compat.userSign}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-[92px] h-[92px] rounded-full bg-white/5 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/10 rounded animate-pulse w-2/3" />
                <div className="h-2.5 bg-white/07 rounded animate-pulse w-full" />
                <div className="h-2.5 bg-white/07 rounded animate-pulse w-4/5" />
              </div>
            </div>
          )}
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {celeb.sections.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSection(i)}
              className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
              style={
                activeSection === i
                  ? { background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.4)", color: "rgb(196,181,253)" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }
              }
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Section content */}
        <div
          key={activeSection}
          className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", animation: "fadeInUp 0.25s ease" }}
        >
          <h3 className="text-base font-semibold text-white mb-4">
            {celeb.sections[activeSection].title}
          </h3>
          {celeb.sections[activeSection].content.split("\n\n").map((para, i) => (
            <p key={i} className="text-sm text-white/65 leading-relaxed mb-3 last:mb-0">
              {para}
            </p>
          ))}
        </div>

        {/* Section nav dots */}
        <div className="flex items-center justify-center gap-1.5 py-2">
          {celeb.sections.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSection(i)}
              className="rounded-full transition-all"
              style={{
                width: activeSection === i ? 20 : 6,
                height: 6,
                background: activeSection === i ? "rgba(167,139,250,0.8)" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
