import { NextRequest, NextResponse } from "next/server";
import {
  initEphemeris,
  julianDay,
  calcAllPlanets,
  calcHouseCusps,
  getSignIndex,
  getDegreeInSign,
  getHouseForPlanet,
  PLANET_NAMES_RU,
  PLANET_NAMES_EN,
  PLANET_SYMBOLS,
  SIGN_NAMES_RU,
  SIGN_NAMES_EN,
  SIGN_SYMBOLS,
} from "@/lib/ephemeris";
import { ASPECT_NAMES } from "@/lib/interpretations";
import type { NatalChart, Planet, Aspect } from "@/lib/types";

// Aspect definitions
const ASPECT_DEFS = [
  { name: "conjunction", angle: 0, orb: 8 },
  { name: "sextile", angle: 60, orb: 6 },
  { name: "square", angle: 90, orb: 7 },
  { name: "trine", angle: 120, orb: 8 },
  { name: "opposition", angle: 180, orb: 8 },
];

export async function POST(req: NextRequest) {
  try {
    const { birthDate, birthTime, lat, lng, tzOffset = 5, lang = "ru" } = await req.json();

    if (!birthDate || !birthTime || lat == null || lng == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sw = await initEphemeris();

    const [year, month, day] = birthDate.split("-").map(Number);
    const [hour, minute] = birthTime.split(":").map(Number);
    const jd = julianDay(sw, year, month, day, hour - tzOffset, minute);

    // Calculate planets
    const positions = calcAllPlanets(sw, jd);

    // Calculate houses
    const houses = calcHouseCusps(sw, jd, lat, lng);

    const PLANET_NAMES = lang === "en" ? PLANET_NAMES_EN : PLANET_NAMES_RU;
    const SIGN_NAMES = lang === "en" ? SIGN_NAMES_EN : SIGN_NAMES_RU;

    // Build Planet[]
    const planets: Planet[] = positions.map((p) => {
      const signIdx = getSignIndex(p.longitude);
      return {
        name: PLANET_NAMES[p.id],
        symbol: PLANET_SYMBOLS[p.id],
        sign: SIGN_NAMES[signIdx],
        signSymbol: SIGN_SYMBOLS[signIdx],
        degree: getDegreeInSign(p.longitude),
        house: getHouseForPlanet(p.longitude, houses.cusps),
        retrograde: p.speed < 0,
      };
    });

    // Calculate aspects between all pairs
    const aspects: Aspect[] = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const diff = Math.abs(positions[i].longitude - positions[j].longitude) % 360;
        const angle = diff > 180 ? 360 - diff : diff;

        for (const def of ASPECT_DEFS) {
          if (Math.abs(angle - def.angle) <= def.orb) {
            const info = ASPECT_NAMES[def.name];
            if (!info) continue;

            const aspectLabel = lang === "en" ? info.en : info.ru;
            aspects.push({
              planet1: PLANET_NAMES[positions[i].id],
              symbol1: PLANET_SYMBOLS[positions[i].id],
              aspect: aspectLabel,
              aspectSymbol: info.symbol,
              planet2: PLANET_NAMES[positions[j].id],
              symbol2: PLANET_SYMBOLS[positions[j].id],
              interpretation: generateAspectInterpretation(
                PLANET_NAMES[positions[i].id],
                aspectLabel,
                PLANET_NAMES[positions[j].id]
              ),
            });
            break; // only one aspect per pair
          }
        }
      }
    }

    // ASC sign
    const ascIdx = getSignIndex(houses.ascendant);

    // Sun and Moon signs
    const sunIdx = getSignIndex(positions[0].longitude);
    const moonIdx = getSignIndex(positions[1].longitude);

    // Interpretation
    const interpretation = buildChartInterpretation(
      SIGN_NAMES[sunIdx],
      SIGN_NAMES[ascIdx],
      SIGN_NAMES[moonIdx],
      planets,
      lang
    );

    const chart: NatalChart = {
      sunSign: SIGN_NAMES[sunIdx],
      sunSignSymbol: SIGN_SYMBOLS[sunIdx],
      ascendant: SIGN_NAMES[ascIdx],
      ascendantSymbol: SIGN_SYMBOLS[ascIdx],
      moonSign: SIGN_NAMES[moonIdx],
      moonSignSymbol: SIGN_SYMBOLS[moonIdx],
      planets,
      aspects,
      interpretation,
    };

    return NextResponse.json(chart);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function generateAspectInterpretation(p1: string, aspect: string, p2: string): string {
  const interpretations: Record<string, Record<string, string>> = {
    "Соединение": {
      default: `${p1} и ${p2} объединяют свои энергии, усиливая друг друга.`,
      "Солнце+Юпитер": "Природный оптимизм и широкий взгляд на мир. Удача приходит через щедрость и веру в лучшее.",
      "Меркурий+Марс": "Острый ум и быстрая реакция. Вы убедительны в спорах и решительны в мыслях.",
      "Венера+Нептун": "Идеализм в любви и тяга к возвышенному. Творческая чувствительность и романтичность натуры.",
      "Венера+Уран": "Нестандартный подход к отношениям и эстетике. Любовь к свободе и оригинальности.",
    },
    "Тригон": {
      default: `Гармоничная связь ${p1} и ${p2} даёт естественные таланты и лёгкость.`,
      "Луна+Венера": "Эмоциональная гармония и чувство прекрасного. Люди тянутся к вашему спокойствию и доброте.",
    },
    "Квадратура": {
      default: `Напряжение между ${p1} и ${p2} создаёт внутренний конфликт, но и мотивацию к росту.`,
      "Сатурн+Плутон": "Глубокая внутренняя сила, закалённая через преодоление. Способность выстоять там, где другие сдаются.",
    },
    "Секстиль": {
      default: `${p1} и ${p2} создают возможности, которые раскрываются через усилие.`,
    },
    "Оппозиция": {
      default: `${p1} и ${p2} требуют баланса — учитесь интегрировать обе стороны.`,
    },
  };

  const aspectMap = interpretations[aspect] ?? {};
  const key1 = `${p1}+${p2}`;
  const key2 = `${p2}+${p1}`;
  return aspectMap[key1] ?? aspectMap[key2] ?? aspectMap["default"] ?? `${aspect} ${p1} и ${p2}.`;
}

function buildChartInterpretation(sun: string, asc: string, moon: string, planets: Planet[], lang: string = "ru"): string {
  if (lang === "en") {
    const mercurySign = planets.find((p) => p.name === "Mercury")?.sign ?? "";
    const venusSign = planets.find((p) => p.name === "Venus")?.sign ?? "";
    const marsSign = planets.find((p) => p.name === "Mars")?.sign ?? "";
    return `Sun in ${sun} defines your essence and life energy, while the Ascendant in ${asc} shapes how others perceive you. Moon in ${moon} governs your emotional needs and inner world. ${mercurySign ? `Mercury in ${mercurySign} reflects your thinking and communication style.` : ""} ${venusSign ? `Venus in ${venusSign} influences your relationships and values.` : ""} ${marsSign ? `Mars in ${marsSign} drives your actions and motivation.` : ""}`.trim();
  }
  const mercurySign = planets.find((p) => p.name === "Меркурий")?.sign ?? "";
  const venusSign = planets.find((p) => p.name === "Венера")?.sign ?? "";
  const marsSign = planets.find((p) => p.name === "Марс")?.sign ?? "";
  return `Солнце в ${sun} определяет вашу сущность и жизненную энергию, а Асцендент в ${asc} формирует то, как вас воспринимают окружающие. Луна в ${moon} отвечает за эмоциональные потребности и внутренний мир. ${mercurySign ? `Меркурий в ${mercurySign} определяет стиль мышления и общения.` : ""} ${venusSign ? `Венера в ${venusSign} влияет на отношения и ценности.` : ""} ${marsSign ? `Марс в ${marsSign} задаёт стиль действий и мотивацию.` : ""}`.trim();
}
