import { NextRequest, NextResponse } from "next/server";
import {
  initEphemeris,
  julianDay,
  calcAllPlanets,
  calcHouseCusps,
} from "@/lib/ephemeris";
import { generateCalendarDays } from "@/lib/forecast-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") ?? new Date().getFullYear().toString());
    const month = parseInt(searchParams.get("month") ?? (new Date().getMonth() + 1).toString());

    // Optional natal data for personal transits
    const birthDate = searchParams.get("birthDate");
    const birthTime = searchParams.get("birthTime");
    const lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
    const lng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : null;
    const tzOffset = parseInt(searchParams.get("tzOffset") ?? "5");

    const sw = await initEphemeris();

    let natalPositions;
    let natalCusps;

    if (birthDate && birthTime && lat != null && lng != null) {
      const [by, bm, bd] = birthDate.split("-").map(Number);
      const [bh, bmin] = birthTime.split(":").map(Number);
      const birthJd = julianDay(sw, by, bm, bd, bh - tzOffset, bmin);
      natalPositions = calcAllPlanets(sw, birthJd);
      const houses = calcHouseCusps(sw, birthJd, lat, lng);
      natalCusps = houses.cusps;
    }

    const days = generateCalendarDays(sw, year, month, natalPositions, natalCusps);

    return NextResponse.json({ year, month, days });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
