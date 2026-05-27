export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import {
  initEphemeris,
  julianDay,
  calcAllPlanets,
  calcHouseCusps,
  PlanetPosition,
} from "@/lib/ephemeris";
import { calcTransits } from "@/lib/transit-calc";

export async function POST(req: NextRequest) {
  try {
    const { date, birthDate, birthTime, lat, lng, tzOffset = 5 } = await req.json();

    if (!date || !birthDate || !birthTime || lat == null || lng == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sw = await initEphemeris();

    // Calculate natal positions
    const [by, bm, bd] = birthDate.split("-").map(Number);
    const [bh, bmin] = birthTime.split(":").map(Number);
    const birthJd = julianDay(sw, by, bm, bd, bh - tzOffset, bmin);
    const natalPositions = calcAllPlanets(sw, birthJd);
    const houses = calcHouseCusps(sw, birthJd, lat, lng);

    // Calculate transit positions for the given date
    const [ty, tm, td] = date.split("-").map(Number);
    const transitJd = julianDay(sw, ty, tm, td, 12, 0);

    const { transits } = calcTransits(sw, transitJd, natalPositions, houses.cusps);

    return NextResponse.json({ transits });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
