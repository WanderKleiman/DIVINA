"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import UserCard from "@/components/profile/UserCard";
import ZodiacSummary from "@/components/profile/ZodiacSummary";
import NatalChartWheel from "@/components/chart/NatalChartWheel";
import ChartInterpretation from "@/components/chart/ChartInterpretation";
import PlanetTable from "@/components/chart/PlanetTable";
import AspectList from "@/components/chart/AspectList";
import CompatibilityForm from "@/components/chart/CompatibilityForm";
import ForecastSkeleton from "@/components/ForecastSkeleton";
import PersonalityBreakdown from "@/components/profile/PersonalityBreakdown";
import { getUserData } from "@/lib/user-data";
import { useT } from "@/lib/i18n";
import type { NatalChart, User } from "@/lib/types";
import type { PersonalityBreakdown as PersonalityBreakdownType } from "@/lib/ai-interpret";
import { lcGet, lcSet, TTL_DAY, TTL_MONTH } from "@/lib/local-cache";

const CACHE_KEY = "divina-natal-v3";

export default function ProfilePage() {
  const router = useRouter();
  const [chart, setChart] = useState<NatalChart | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [personality, setPersonality] = useState<PersonalityBreakdownType | null>(null);
  const [personalityLoading, setPersonalityLoading] = useState(true);
  const { t } = useT();

  useEffect(() => {
    const userData = getUserData();
    const personalityCacheKey = `divina-personality-v5_${userData.lang}_${userData.tone}`;

    setUser({
      name: userData.name,
      streak: 12,
      birthDate: userData.birthDate,
      birthTime: userData.birthTime,
      birthCity: userData.birthCity,
      subscription: "free",
    });

    const body = {
      birthDate: userData.birthDate,
      birthTime: userData.birthTime,
      lat: userData.lat,
      lng: userData.lng,
      tzOffset: userData.tzOffset,
      lang: userData.lang,
    };

    // Load personality in background — never blocks page render
    async function loadPersonality() {
      try {
        const res = await fetch("/api/personality", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (data && !data.error) {
          setPersonality(data);
          lcSet(personalityCacheKey, data, TTL_MONTH);
        }
      } catch {}
      finally { setPersonalityLoading(false); }
    }

    // Restore personality from cache (30 days)
    const cachedPersonality = lcGet<PersonalityBreakdownType>(personalityCacheKey);
    if (cachedPersonality) {
      setPersonality(cachedPersonality);
      setPersonalityLoading(false);
    } else {
      loadPersonality();
    }

    const natalCacheKey = `${CACHE_KEY}_${userData.lang}`;

    // Load natal chart — fast (~70ms), unlocks the page
    async function loadNatal() {
      const cached = lcGet<NatalChart>(natalCacheKey);
      if (cached) {
        setChart(cached);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/natal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (data && !data.error) {
          setChart(data);
          lcSet(natalCacheKey, data, TTL_DAY); // natal chart changes very rarely
        }
      } catch (err) {
        console.error("Failed to load natal:", err);
      } finally {
        setLoading(false);
      }
    }

    loadNatal();
  }, []);

  if (loading || !chart || !user) {
    return (
      <div>
        <Header settingsHref="/profile/settings" />
        <ForecastSkeleton label={t("loading.natal")} />
      </div>
    );
  }

  const c = chart;

  return (
    <div className="stagger flex flex-col gap-4">
      <div className="animate-fade-in-up">
        <Header settingsHref="/profile/settings" />
      </div>

      <div className="animate-fade-in-up">
        <UserCard
          user={user}
          sunSign={c.sunSign}
          sunSignSymbol={c.sunSignSymbol}
        />
      </div>

      {/* Personality Breakdown card — tap to open full reading */}
      <div className="animate-fade-in-up px-5">
        <button
          onClick={() => router.push("/profile/personality")}
          className="w-full text-left relative overflow-hidden rounded-2xl active:scale-[0.98] transition-transform"
          style={{ minHeight: 72 }}
        >
          <video src="/cosmos-5.mp4" autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover" style={{ pointerEvents: "none" }} />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative z-10 p-4 flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 border border-white/15 text-white/70">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white mb-0.5">{t("profile.personalityTitle")}</h3>
              {personality ? (
                <p className="text-xs text-white/50 line-clamp-1">{personality.essence}</p>
              ) : (
                <p className="text-xs text-white/35">{t("profile.personalitySubtitle")}</p>
              )}
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-white/25">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>
      </div>

      <div className="animate-fade-in-up">
        <NatalChartWheel planets={c.planets} ascendantSymbol={c.ascendantSymbol} />
      </div>

      <div className="animate-fade-in-up">
        {personality ? (
          <PersonalityBreakdown data={personality} />
        ) : (
          <div className="mx-5">
            <div className="px-1 mb-3">
              <h2 className="text-lg font-semibold text-white/90">{t("profile.personalityTitle")}</h2>
              <p className="text-xs text-white/40 mt-0.5">{t("profile.personalitySubtitle")}</p>
            </div>
            <div className="glass-strong rounded-2xl p-5 space-y-3">
              <div className={`h-5 bg-white/10 rounded-lg w-2/3 ${personalityLoading ? "animate-pulse" : ""}`} />
              <div className="flex gap-1.5">
                {[1,2,3].map(i => <div key={i} className={`h-5 w-16 bg-white/[0.07] rounded-full ${personalityLoading ? "animate-pulse" : ""}`} />)}
              </div>
              <div className="space-y-2 pt-1">
                <div className={`h-3 bg-white/[0.07] rounded w-full ${personalityLoading ? "animate-pulse" : ""}`} />
                <div className={`h-3 bg-white/[0.07] rounded w-5/6 ${personalityLoading ? "animate-pulse" : ""}`} />
                <div className={`h-3 bg-white/[0.07] rounded w-4/5 ${personalityLoading ? "animate-pulse" : ""}`} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="animate-fade-in-up">
        <ChartInterpretation
          interpretation={c.interpretation}
          sunSign={c.sunSign}
          sunSignSymbol={c.sunSignSymbol}
          ascendant={c.ascendant}
          ascendantSymbol={c.ascendantSymbol}
          moonSign={c.moonSign}
          moonSignSymbol={c.moonSignSymbol}
        />
      </div>

      <div className="animate-fade-in-up">
        <ZodiacSummary chart={c} />
      </div>

      <div className="animate-fade-in-up">
        <PlanetTable planets={c.planets} />
      </div>

      <div className="animate-fade-in-up">
        <AspectList aspects={c.aspects} />
      </div>

      <div className="animate-fade-in-up">
        <CompatibilityForm />
      </div>
    </div>
  );
}
