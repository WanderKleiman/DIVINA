import { NextRequest, NextResponse } from "next/server";
import { initEphemeris, getSignIndex, SIGN_NAMES_RU, SIGN_NAMES_EN, calcAllPlanets, calcHouseCusps, julianDay } from "@/lib/ephemeris";
import { generateWeeklyForecast } from "@/lib/forecast-engine";
import { interpretWeekly } from "@/lib/ai-interpret";
import { calcTransits } from "@/lib/transit-calc";
import { getMoonData } from "@/lib/moon-calc";
import type { Transit, DayTag } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { birthDate, birthTime, lat, lng, weekStart, tzOffset = 5, tone = "deep", lang = "ru" } = await req.json();

    if (!birthDate || !birthTime || lat == null || lng == null || !weekStart) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sw = await initEphemeris();

    // Generate base forecast
    const forecast = generateWeeklyForecast(sw, birthDate, birthTime, lat, lng, weekStart, tzOffset, lang);

    // Get natal info
    const [by, bm, bd] = birthDate.split("-").map(Number);
    const [bh, bmin] = birthTime.split(":").map(Number);
    const birthJd = julianDay(sw, by, bm, bd, bh - tzOffset, bmin);
    const natalPositions = calcAllPlanets(sw, birthJd);
    const houses = calcHouseCusps(sw, birthJd, lat, lng);
    const signNames = lang === "en" ? SIGN_NAMES_EN : SIGN_NAMES_RU;
    const sunSign = signNames[getSignIndex(natalPositions[0].longitude)];
    const ascSign = signNames[getSignIndex(houses.ascendant)];

    // AI interpretation
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("YOUR-KEY")) {
      try {
        // Build per-day transit data for AI
        const startDate = new Date(weekStart);
        const daysData = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(startDate);
          d.setUTCDate(d.getUTCDate() + i);
          const dateStr = d.toISOString().slice(0, 10);
          const [dy, dm, dd] = dateStr.split("-").map(Number);
          const dayJd = julianDay(sw, dy, dm, dd, 12, 0);
          const moon = getMoonData(sw, dayJd, lang);
          const { transits } = calcTransits(sw, dayJd, natalPositions, houses.cusps);

          daysData.push({
            date: dateStr,
            weekday: forecast.days[i]?.weekday ?? "",
            moonSign: moon.sign,
            moonPhase: moon.phaseRu,
            energy: forecast.days[i]?.energy ?? "medium" as const,
            transits,
          });
        }

        const ai = await interpretWeekly({
          weekLabel: forecast.weekLabel,
          days: daysData,
          sunSign,
          ascendant: ascSign,
        }, tone, lang);

        // Override with AI text
        forecast.overview = ai.overview;
        forecast.weeklyAdvice = ai.weeklyAdvice;

        // Override per-day data
        for (let i = 0; i < 7 && i < ai.days.length; i++) {
          const aiDay = ai.days[i];
          if (aiDay && forecast.days[i]) {
            forecast.days[i].headline = aiDay.headline;
            forecast.days[i].doList = aiDay.doList;
            forecast.days[i].dontList = aiDay.dontList;
            if (aiDay.tags && aiDay.tags.length > 0) {
              forecast.days[i].tags = aiDay.tags as DayTag[];
            }
          }
        }

        // Add bestDayFor to response
        forecast.bestDayFor = ai.bestDayFor;
      } catch (aiErr) {
        console.error("AI weekly enhancement failed:", aiErr);
      }
    }

    return NextResponse.json(forecast);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
