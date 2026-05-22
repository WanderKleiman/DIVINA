"use client";

import { useState, useEffect } from "react";
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

const CACHE_KEY = "divina-natal-cache-v2";

export default function ProfilePage() {
  const [chart, setChart] = useState<NatalChart | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [personality, setPersonality] = useState<PersonalityBreakdownType | null>(null);
  const [personalityLoading, setPersonalityLoading] = useState(true);
  const { t } = useT();

  useEffect(() => {
    const userData = getUserData();
    const personalityCacheKey = `divina-personality-cache-v4_${userData.lang}_${userData.tone}`;

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
          sessionStorage.setItem(personalityCacheKey, JSON.stringify({ _birthDate: userData.birthDate, data }));
        }
      } catch {}
      finally { setPersonalityLoading(false); }
    }

    // Restore personality from cache if available
    const cachedPersonality = sessionStorage.getItem(personalityCacheKey);
    if (cachedPersonality) {
      try {
        const parsed = JSON.parse(cachedPersonality);
        if (parsed._birthDate === userData.birthDate) {
          setPersonality(parsed.data);
          setPersonalityLoading(false);
        } else {
          loadPersonality();
        }
      } catch { loadPersonality(); }
    } else {
      loadPersonality();
    }

    const natalCacheKey = `${CACHE_KEY}_${userData.lang}`;

    // Load natal chart — fast (~70ms), unlocks the page
    async function loadNatal() {
      const cached = sessionStorage.getItem(natalCacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed._birthDate === userData.birthDate) {
            setChart(parsed.data);
            setLoading(false);
            return;
          }
        } catch {}
      }

      try {
        const res = await fetch("/api/natal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (data && !data.error) {
          setChart(data);
          sessionStorage.setItem(natalCacheKey, JSON.stringify({ _birthDate: userData.birthDate, data }));
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
