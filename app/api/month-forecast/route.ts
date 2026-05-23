import { NextRequest, NextResponse } from "next/server";
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
import { interpretMonthForecast, type MonthForecastInput } from "@/lib/ai-interpret";

export const maxDuration = 60;

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

    // Current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12

    const MONTH_NAMES_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const MONTH_NAMES_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
    const monthName = (isEn ? MONTH_NAMES_EN : MONTH_NAMES_RU)[month - 1];

    // Aspect name translations for dominant transit labels
    const ASPECT_RU: Record<string, string> = {
      conjunction: "соединение", sextile: "секстиль", square: "квадрат",
      trine: "трин", opposition: "оппозиция",
    };
    const PLANET_NAMES_EN_FULL: Record<number, string> = {
      0: "Sun", 1: "Moon", 2: "Mercury", 3: "Venus", 4: "Mars",
      5: "Jupiter", 6: "Saturn", 7: "Uranus", 8: "Neptune", 9: "Pluto",
    };

    // Helper: compute aspects + retrogrades for a given date (day of month)
    function computeDay(day: number) {
      const jd = julianDay(sw, year, month, day, 12 - tzOffset, 0);
      const planets = calcAllPlanets(sw, jd);
      const aspects = findTransitAspects(planets, natalPlanets);
      const retros: string[] = [];
      if (planets[2].speed < 0) retros.push(PLANET_NAMES[2]);
      if (planets[3].speed < 0) retros.push(PLANET_NAMES[3]);
      if (planets[4].speed < 0) retros.push(PLANET_NAMES[4]);
      if (planets[5].speed < 0) retros.push(PLANET_NAMES[5]);
      if (planets[6].speed < 0) retros.push(PLANET_NAMES[6]);

      const positive = aspects.filter(a => a.aspectName === "trine" || a.aspectName === "sextile").length;
      const challenging = aspects.filter(a => a.aspectName === "square" || a.aspectName === "opposition").length;

      // Top 3 tightest aspects as readable labels
      const topAspects = aspects.slice(0, 3).map(a => {
        const tp = PLANET_NAMES_EN_FULL[a.transitPlanetId] ?? `P${a.transitPlanetId}`;
        const np = PLANET_NAMES_EN_FULL[a.natalPlanetId] ?? `P${a.natalPlanetId}`;
        return isEn
          ? `${tp} ${a.aspectName} natal ${np}`
          : `${tp} ${ASPECT_RU[a.aspectName] ?? a.aspectName} натальный(ая) ${np}`;
      });

      return { positive, challenging, retros, topAspects };
    }

    // Overall month snapshot (day 15)
    const overall = computeDay(15);

    let overallEnergy: "high" | "medium" | "low";
    if (overall.positive > overall.challenging + 2) overallEnergy = "high";
    else if (overall.challenging > overall.positive + 2) overallEnergy = "low";
    else overallEnergy = "medium";

    // Weekly snapshots (days 5, 12, 19, 26)
    const weekDays = [5, 12, 19, 26];
    const weeks = weekDays.map((day, i) => {
      const d = computeDay(day);
      let wEnergy: "high" | "medium" | "low";
      if (d.positive > d.challenging + 1) wEnergy = "high";
      else if (d.challenging > d.positive + 1) wEnergy = "low";
      else wEnergy = "medium";
      void wEnergy;
      return {
        weekNum: i + 1,
        positiveAspects: d.positive,
        challengingAspects: d.challenging,
        retrogrades: d.retros,
        keyTransits: d.topAspects,
      };
    });

    // Dominant transits for the month (day 15, top 5)
    const midJd = julianDay(sw, year, month, 15, 12 - tzOffset, 0);
    const midPlanets = calcAllPlanets(sw, midJd);
    const midAspects = findTransitAspects(midPlanets, natalPlanets);
    const dominantTransits = midAspects.slice(0, 5).map(a => {
      const tp = PLANET_NAMES_EN_FULL[a.transitPlanetId] ?? `P${a.transitPlanetId}`;
      const np = PLANET_NAMES_EN_FULL[a.natalPlanetId] ?? `P${a.natalPlanetId}`;
      return isEn
        ? `${tp} ${a.aspectName} natal ${np}`
        : `${tp} ${ASPECT_RU[a.aspectName] ?? a.aspectName} натальный(ая) ${np}`;
    });

    const input: MonthForecastInput = {
      sunSign,
      moonSign,
      ascendant,
      monthName,
      year,
      overallEnergy,
      positiveAspects: overall.positive,
      challengingAspects: overall.challenging,
      retrogrades: overall.retros,
      dominantTransits,
      weeks,
    };

    const result = await interpretMonthForecast(input, tone, lang);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Month forecast error:", err);
    return NextResponse.json({ error: "Failed to generate month forecast" }, { status: 500 });
  }
}
