export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import {
  initEphemeris,
  julianDay,
  calcAllPlanets,
  calcHouseCusps,
  getSignIndex,
  getHouseForPlanet,
  PLANET_NAMES_RU,
  PLANET_NAMES_EN,
  SIGN_NAMES_RU,
  SIGN_NAMES_EN,
} from "@/lib/ephemeris";
import { ASPECT_NAMES } from "@/lib/interpretations";
import { interpretNatalDeep } from "@/lib/ai-interpret";

const ASPECT_DEFS = [
  { name: "conjunction", angle: 0, orb: 8 },
  { name: "sextile", angle: 60, orb: 6 },
  { name: "square", angle: 90, orb: 7 },
  { name: "trine", angle: 120, orb: 8 },
  { name: "opposition", angle: 180, orb: 8 },
];

export async function POST(req: NextRequest) {
  try {
    const { birthDate, birthTime, lat, lng, tzOffset = 5, tone = "deep", lang = "ru" } = await req.json();

    if (!birthDate || !birthTime || lat == null || lng == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sw = await initEphemeris();

    const [year, month, day] = birthDate.split("-").map(Number);
    const [hour, minute] = birthTime.split(":").map(Number);
    const jd = julianDay(sw, year, month, day, hour - tzOffset, minute);

    const positions = calcAllPlanets(sw, jd);
    const houses = calcHouseCusps(sw, jd, lat, lng);

    const PLANET_NAMES = lang === "en" ? PLANET_NAMES_EN : PLANET_NAMES_RU;
    const SIGN_NAMES   = lang === "en" ? SIGN_NAMES_EN   : SIGN_NAMES_RU;

    const planets = positions.map((p) => {
      const signIdx = getSignIndex(p.longitude);
      return {
        name: PLANET_NAMES[p.id],
        sign: SIGN_NAMES[signIdx],
        house: getHouseForPlanet(p.longitude, houses.cusps),
      };
    });

    // Calculate aspects
    const aspects: { planet1: string; aspect: string; planet2: string }[] = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const diff = Math.abs(positions[i].longitude - positions[j].longitude) % 360;
        const angle = diff > 180 ? 360 - diff : diff;
        for (const def of ASPECT_DEFS) {
          if (Math.abs(angle - def.angle) <= def.orb) {
            const info = ASPECT_NAMES[def.name];
            if (info) {
              aspects.push({
                planet1: PLANET_NAMES[positions[i].id],
                aspect: lang === "en" ? info.en : info.ru,
                planet2: PLANET_NAMES[positions[j].id],
              });
            }
            break;
          }
        }
      }
    }

    const sunIdx = getSignIndex(positions[0].longitude);
    const moonIdx = getSignIndex(positions[1].longitude);
    const ascIdx = getSignIndex(houses.ascendant);

    const sections = await interpretNatalDeep({
      planets,
      aspects,
      sunSign: SIGN_NAMES[sunIdx],
      moonSign: SIGN_NAMES[moonIdx],
      ascendant: SIGN_NAMES[ascIdx],
    }, tone, lang);

    return NextResponse.json({ sections });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
