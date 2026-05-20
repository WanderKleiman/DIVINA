import { NextRequest, NextResponse } from "next/server";
import {
  initEphemeris, getSignIndex, SIGN_NAMES_RU, SIGN_NAMES_RU_PREP, PLANET_NAMES_RU,
  calcAllPlanets, calcHouseCusps, julianDay, calcPlanetPosition,
  findSignTransitDates,
} from "@/lib/ephemeris";
import { getMoonData } from "@/lib/moon-calc";
import { findTransitAspects } from "@/lib/transit-calc";
import { interpretLifePeriods } from "@/lib/ai-interpret";
import { ASPECT_NAMES } from "@/lib/interpretations";

// Only Jupiter and Saturn — Uranus periods (7 yr) are too long to be actionable
const SLOW_PLANETS = [
  { id: 5, step: 30 },  // Jupiter ~1 yr/sign
  { id: 6, step: 60 },  // Saturn ~2.5 yr/sign
];

function guessImpact(aspect: string): string {
  if (aspect === "trine" || aspect === "sextile") return "positive";
  if (aspect === "square" || aspect === "opposition") return "challenging";
  return "neutral";
}

export async function POST(req: NextRequest) {
  try {
    const { birthDate, birthTime, lat, lng, tzOffset = 5, tone = "deep", lang = "ru" } = await req.json();

    if (!birthDate || !birthTime || lat == null || lng == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sw = await initEphemeris();

    const [by, bm, bd] = birthDate.split("-").map(Number);
    const [bh, bmin] = birthTime.split(":").map(Number);
    const birthJd = julianDay(sw, by, bm, bd, bh - tzOffset, bmin);
    const natalPositions = calcAllPlanets(sw, birthJd);
    const houses = calcHouseCusps(sw, birthJd, lat, lng);

    const sunSign = SIGN_NAMES_RU[getSignIndex(natalPositions[0].longitude)];
    const ascSign = SIGN_NAMES_RU[getSignIndex(houses.ascendant)];

    const now = new Date();
    const todayJd = julianDay(sw, now.getFullYear(), now.getMonth() + 1, now.getDate(), 12, 0);
    const moon = getMoonData(sw, todayJd);

    // Current transit positions → natal aspects
    const transitPositions = calcAllPlanets(sw, todayJd);
    const rawAspects = findTransitAspects(transitPositions, natalPositions);

    // Build slow planet periods with real sign-entry/exit dates
    const slowPlanetPeriods: {
      planetName: string;
      sign: string;
      signPrep: string;
      startDate: string;
      endDate: string;
      natalAspects: { planet: string; aspect: string; impact: string; orb: number }[];
    }[] = [];

    for (const { id, step } of SLOW_PLANETS) {
      const pos = calcPlanetPosition(sw, todayJd, id);
      const signIdx = getSignIndex(pos.longitude);
      const sign = SIGN_NAMES_RU[signIdx];
      const signPrep = SIGN_NAMES_RU_PREP[signIdx]; // "Раке", "Стрельце", etc.
      const { startDate, endDate } = findSignTransitDates(sw, todayJd, id, step);

      const planetAspects = rawAspects
        .filter(a => a.transitPlanetId === id)
        .slice(0, 3)
        .map(a => ({
          planet: PLANET_NAMES_RU[a.natalPlanetId],
          aspect: ASPECT_NAMES[a.aspectName]?.ru ?? a.aspectName,
          impact: guessImpact(a.aspectName),
          orb: +a.orb.toFixed(1),
        }));

      slowPlanetPeriods.push({
        planetName: PLANET_NAMES_RU[id],
        sign,
        signPrep,
        startDate,
        endDate,
        natalAspects: planetAspects,
      });
    }

    const result = await interpretLifePeriods({
      sunSign,
      moonSign: moon.sign,
      ascendant: ascSign,
      slowPlanetPeriods,
    }, tone, lang);

    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
