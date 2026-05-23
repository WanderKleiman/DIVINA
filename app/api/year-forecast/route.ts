import { NextRequest, NextResponse } from "next/server";

// Allow up to 60 seconds for the AI call (Vercel Pro / Hobby max)
export const maxDuration = 60;

import {
  initEphemeris,
  julianDay,
  calcAllPlanets,
  calcHouseCusps,
  getSignIndex,
  SIGN_NAMES_RU,
  SIGN_NAMES_EN,
  PLANET_NAMES_RU,
  PLANET_NAMES_EN,
} from "@/lib/ephemeris";
import { findTransitAspects } from "@/lib/transit-calc";
import { interpretYearForecast, type YearMonth } from "@/lib/ai-interpret";

export async function POST(req: NextRequest) {
  try {
    const {
      birthDate,
      birthTime,
      lat,
      lng,
      tzOffset = 0,
      lang = "ru",
      tone = "deep",
    } = await req.json();

    if (!birthDate || !birthTime || lat == null || lng == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sw = await initEphemeris();
    const isEn = lang === "en";
    const SIGN_NAMES = isEn ? SIGN_NAMES_EN : SIGN_NAMES_RU;
    const PLANET_NAMES = isEn ? PLANET_NAMES_EN : PLANET_NAMES_RU;

    // Calculate natal chart
    const [by, bm, bd] = birthDate.split("-").map(Number);
    const [bh, bmin] = birthTime.split(":").map(Number);
    const natalJd = julianDay(sw, by, bm, bd, bh - tzOffset, bmin);
    const natalPlanets = calcAllPlanets(sw, natalJd);
    const natalHouses = calcHouseCusps(sw, natalJd, lat, lng);

    const sunSign = SIGN_NAMES[getSignIndex(natalPlanets[0].longitude)];
    const moonSign = SIGN_NAMES[getSignIndex(natalPlanets[1].longitude)];
    const ascendant = SIGN_NAMES[getSignIndex(natalHouses.ascendant)];

    // Build 12 months of data starting from current month
    const now = new Date();
    const startYear = now.getFullYear();
    const startMonth = now.getMonth() + 1; // 1-12

    const MONTH_NAMES_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const MONTH_NAMES_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
    const MONTH_NAMES = isEn ? MONTH_NAMES_EN : MONTH_NAMES_RU;

    const monthlyData: YearMonth[] = [];

    for (let i = 0; i < 12; i++) {
      let month = startMonth + i;
      let year = startYear;
      if (month > 12) {
        month -= 12;
        year += 1;
      }

      // Calculate at the 15th of the month, noon UTC
      const jd = julianDay(sw, year, month, 15, 12 - tzOffset, 0);
      const planets = calcAllPlanets(sw, jd);

      // Planet sign positions
      // Jupiter = id 5, Saturn = id 6, Mars = id 4, Mercury = id 2, Venus = id 3
      const jupiterSign = SIGN_NAMES_EN[getSignIndex(planets[5].longitude)];
      const saturnSign = SIGN_NAMES_EN[getSignIndex(planets[6].longitude)];
      const marsSign = SIGN_NAMES_EN[getSignIndex(planets[4].longitude)];

      // Retrograde detection
      const retrogrades: string[] = [];
      if (planets[2].speed < 0) retrogrades.push(PLANET_NAMES[2]); // Mercury
      if (planets[3].speed < 0) retrogrades.push(PLANET_NAMES[3]); // Venus
      if (planets[4].speed < 0) retrogrades.push(PLANET_NAMES[4]); // Mars

      // Personal transit aspects
      const aspects = findTransitAspects(planets, natalPlanets);
      const positiveAspects = aspects.filter(a =>
        a.aspectName === "trine" || a.aspectName === "sextile"
      ).length;
      const challengingAspects = aspects.filter(a =>
        a.aspectName === "square" || a.aspectName === "opposition"
      ).length;

      // Energy based on aspect balance
      let energy: "high" | "medium" | "low";
      if (positiveAspects > challengingAspects + 2) {
        energy = "high";
      } else if (challengingAspects > positiveAspects + 2) {
        energy = "low";
      } else {
        energy = "medium";
      }

      monthlyData.push({
        month,
        monthName: MONTH_NAMES[month - 1],
        year,
        energy,
        retrogrades,
        jupiterSign,
        saturnSign,
        marsSign,
        positiveAspects,
        challengingAspects,
      });
    }

    const result = await interpretYearForecast(
      { sunSign, moonSign, ascendant, months: monthlyData },
      tone,
      lang
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("Year forecast error:", err);
    return NextResponse.json({ error: "Failed to generate year forecast" }, { status: 500 });
  }
}
