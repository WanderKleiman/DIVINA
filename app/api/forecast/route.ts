export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { initEphemeris, getSignIndex, SIGN_NAMES_RU, SIGN_NAMES_EN, calcAllPlanets, calcHouseCusps, julianDay } from "@/lib/ephemeris";
import { generateDailyForecast } from "@/lib/forecast-engine";
import { interpretDaily } from "@/lib/ai-interpret";
import { CATEGORY_INFO } from "@/lib/interpretations";
import type { LifeCategory } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { birthDate, birthTime, lat, lng, date, tzOffset = 5, tone = "deep", lang = "ru" } = await req.json();

    if (!birthDate || !birthTime || lat == null || lng == null || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sw = await initEphemeris();

    // Generate base forecast with ephemeris data
    const forecast = generateDailyForecast(sw, birthDate, birthTime, lat, lng, date, tzOffset, lang);

    // Get natal info for AI context
    const [by, bm, bd] = birthDate.split("-").map(Number);
    const [bh, bmin] = birthTime.split(":").map(Number);
    const birthJd = julianDay(sw, by, bm, bd, bh - tzOffset, bmin);
    const natalPositions = calcAllPlanets(sw, birthJd);
    const houses = calcHouseCusps(sw, birthJd, lat, lng);
    const signNames = lang === "en" ? SIGN_NAMES_EN : SIGN_NAMES_RU;
    const sunSign = signNames[getSignIndex(natalPositions[0].longitude)];
    const ascSign = signNames[getSignIndex(houses.ascendant)];

    // AI interpretation (if API key is configured)
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("YOUR-KEY")) {
      try {
        const ai = await interpretDaily({
          date: forecast.date,
          weekday: forecast.weekday,
          moonSign: forecast.moonSign,
          moonPhase: forecast.moonPhase,
          moonPercent: forecast.moonPercent,
          transits: forecast.transits,
          sunSign,
          ascendant: ascSign,
        }, tone, lang);

        // Override forecast with AI-generated text
        forecast.energy = ai.energy;
        forecast.summary = ai.summary;
        forecast.doList = ai.doList;
        forecast.dontList = ai.dontList;
        forecast.advice = ai.advice;
        forecast.affirmation = ai.affirmation;

        // Override category texts
        const catKeys: LifeCategory[] = ["love", "finance", "health", "career", "spiritual"];
        for (const key of catKeys) {
          const cat = forecast.categories.find((c) => c.category === key);
          const aiCat = ai.categories[key];
          if (cat && aiCat) {
            cat.rating = aiCat.rating;
            cat.brief = aiCat.brief;
            cat.detailed = aiCat.detailed;
          }
        }

        // Override transit briefs
        if (ai.transitBriefs) {
          for (let i = 0; i < forecast.transits.length && i < ai.transitBriefs.length; i++) {
            if (ai.transitBriefs[i]) {
              forecast.transits[i].brief = ai.transitBriefs[i];
            }
          }
        }
      } catch (aiErr) {
        console.error("AI enhancement failed, using base forecast:", aiErr);
      }
    }

    return NextResponse.json(forecast);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
