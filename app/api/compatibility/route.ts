import { NextRequest, NextResponse } from "next/server";
import {
  initEphemeris,
  julianDay,
  calcAllPlanets,
  calcHouseCusps,
  getSignIndex,
  PLANET_NAMES_RU,
  SIGN_NAMES_RU,
} from "@/lib/ephemeris";
import { ASPECT_NAMES } from "@/lib/interpretations";
import { interpretCompatibility } from "@/lib/ai-interpret";

const ASPECT_DEFS = [
  { name: "conjunction", angle: 0, orb: 8 },
  { name: "sextile", angle: 60, orb: 6 },
  { name: "square", angle: 90, orb: 7 },
  { name: "trine", angle: 120, orb: 8 },
  { name: "opposition", angle: 180, orb: 8 },
];

function calcNatal(sw: Awaited<ReturnType<typeof initEphemeris>>, birthDate: string, birthTime: string, lat: number, lng: number, tzOffset: number) {
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);
  const jd = julianDay(sw, year, month, day, hour - tzOffset, minute);

  const positions = calcAllPlanets(sw, jd);
  const houses = calcHouseCusps(sw, jd, lat, lng);

  const planets = positions.map((p) => ({
    name: PLANET_NAMES_RU[p.id],
    sign: SIGN_NAMES_RU[getSignIndex(p.longitude)],
    longitude: p.longitude,
  }));

  const sunIdx = getSignIndex(positions[0].longitude);
  const moonIdx = getSignIndex(positions[1].longitude);

  return { planets, positions, sunSign: SIGN_NAMES_RU[sunIdx], moonSign: SIGN_NAMES_RU[moonIdx], houses };
}

export async function POST(req: NextRequest) {
  try {
    const { user, partner, tone = "deep", lang = "ru" } = await req.json();

    if (!user?.birthDate || !user?.birthTime || user?.lat == null || user?.lng == null) {
      return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }
    if (!partner?.birthDate || !partner?.birthTime || partner?.lat == null || partner?.lng == null) {
      return NextResponse.json({ error: "Missing partner data" }, { status: 400 });
    }

    const sw = await initEphemeris();

    const userData = calcNatal(sw, user.birthDate, user.birthTime, user.lat, user.lng, user.tzOffset || 5);
    const partnerData = calcNatal(sw, partner.birthDate, partner.birthTime, partner.lat, partner.lng, partner.tzOffset || 5);

    // Calculate synastry aspects (cross-chart aspects)
    const synastryAspects: { planet1: string; planet2: string; aspect: string }[] = [];
    for (const up of userData.positions) {
      for (const pp of partnerData.positions) {
        const diff = Math.abs(up.longitude - pp.longitude) % 360;
        const angle = diff > 180 ? 360 - diff : diff;
        for (const def of ASPECT_DEFS) {
          if (Math.abs(angle - def.angle) <= def.orb) {
            const info = ASPECT_NAMES[def.name];
            if (info) {
              synastryAspects.push({
                planet1: PLANET_NAMES_RU[up.id],
                aspect: info.ru,
                planet2: PLANET_NAMES_RU[pp.id],
              });
            }
            break;
          }
        }
      }
    }

    const result = await interpretCompatibility({

      user: {
        sunSign: userData.sunSign,
        moonSign: userData.moonSign,
        planets: userData.planets.map(p => ({ name: p.name, sign: p.sign })),
      },
      partner: {
        sunSign: partnerData.sunSign,
        moonSign: partnerData.moonSign,
        planets: partnerData.planets.map(p => ({ name: p.name, sign: p.sign })),
      },
      synastryAspects,
    }, tone, lang);

    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
