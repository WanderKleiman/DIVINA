import type SwissEph from "swisseph-wasm";
import type { Transit } from "./types";
import {
  calcAllPlanets,
  PlanetPosition,
  PLANET_NAMES_RU,
  PLANET_NAMES_EN,
  PLANET_SYMBOLS,
  SIGN_NAMES_RU,
  getSignIndex,
  getHouseForPlanet,
} from "./ephemeris";
import { TRANSIT_ASPECTS, ASPECT_NAMES, HOUSE_CATEGORY } from "./interpretations";

// Aspect definitions: angle and orb
const ASPECT_DEFS = [
  { name: "conjunction", angle: 0, orb: 8 },
  { name: "sextile", angle: 60, orb: 6 },
  { name: "square", angle: 90, orb: 7 },
  { name: "trine", angle: 120, orb: 8 },
  { name: "opposition", angle: 180, orb: 8 },
] as const;

interface TransitAspect {
  transitPlanetId: number;
  natalPlanetId: number;
  aspectName: string;
  orb: number; // exact orb in degrees
  transitLon: number;
  natalLon: number;
}

/**
 * Find all aspects between transit planets and natal planets
 */
export function findTransitAspects(
  transitPositions: PlanetPosition[],
  natalPositions: PlanetPosition[]
): TransitAspect[] {
  const aspects: TransitAspect[] = [];

  for (const tp of transitPositions) {
    for (const np of natalPositions) {
      const diff = Math.abs(tp.longitude - np.longitude) % 360;
      const angle = diff > 180 ? 360 - diff : diff;

      for (const def of ASPECT_DEFS) {
        const orbDiff = Math.abs(angle - def.angle);
        if (orbDiff <= def.orb) {
          aspects.push({
            transitPlanetId: tp.id,
            natalPlanetId: np.id,
            aspectName: def.name,
            orb: orbDiff,
            transitLon: tp.longitude,
            natalLon: np.longitude,
          });
        }
      }
    }
  }

  // Sort by orb (tighter aspects first)
  aspects.sort((a, b) => a.orb - b.orb);
  return aspects;
}

/**
 * Convert raw transit aspects to Transit[] with interpretations
 */
export function buildTransits(
  transitAspects: TransitAspect[],
  natalCusps?: number[],
  lang: string = "ru"
): Transit[] {
  const transits: Transit[] = [];
  const seen = new Set<string>();
  const planetNames = lang === "en" ? PLANET_NAMES_EN : PLANET_NAMES_RU;

  for (const ta of transitAspects) {
    const key = `${ta.transitPlanetId}_${ta.aspectName}_${ta.natalPlanetId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const aspectInfo = ASPECT_NAMES[ta.aspectName];
    if (!aspectInfo) continue;

    // Look up interpretation
    const interp = TRANSIT_ASPECTS[key];

    // Generate a generic interpretation if not in lookup table
    const brief = interp?.brief ?? generateGenericBrief(ta, lang);
    const impact = interp?.impact ?? guessImpact(ta.aspectName);

    transits.push({
      transitPlanet: planetNames[ta.transitPlanetId],
      transitSymbol: PLANET_SYMBOLS[ta.transitPlanetId],
      aspect: lang === "en" ? aspectInfo.en : aspectInfo.ru,
      aspectSymbol: aspectInfo.symbol,
      natalPlanet: planetNames[ta.natalPlanetId],
      natalSymbol: PLANET_SYMBOLS[ta.natalPlanetId],
      brief,
      impact,
    });
  }

  return transits;
}

function guessImpact(aspectName: string): "positive" | "neutral" | "challenging" {
  switch (aspectName) {
    case "trine":
    case "sextile":
      return "positive";
    case "square":
    case "opposition":
      return "challenging";
    default:
      return "neutral";
  }
}

function generateGenericBrief(ta: TransitAspect, lang: string = "ru"): string {
  const planetNames = lang === "en" ? PLANET_NAMES_EN : PLANET_NAMES_RU;
  const tp = planetNames[ta.transitPlanetId];
  const np = planetNames[ta.natalPlanetId];
  const impact = guessImpact(ta.aspectName);

  const hash = Math.abs(ta.transitPlanetId * 13 + ta.natalPlanetId * 7) % 3;

  if (lang === "en") {
    const positiveTemplates = [
      `The energy of ${tp} supports your natal position of ${np}. A good time for active steps.`,
      `${tp} harmonizes with ${np} — make the most of this day.`,
      `A favorable connection between ${tp} and ${np}. Trust your decisions.`,
    ];
    const challengingTemplates = [
      `${tp} creates tension with ${np}. Show patience and caution.`,
      `The influence of ${tp} on ${np} requires attentiveness. Don't rush events.`,
      `The energy of ${tp} tests your natal position of ${np}. A time for discipline.`,
    ];
    const neutralTemplates = [
      `${tp} activates the energy of ${np}. Pay attention to your reactions.`,
      `The influence of ${tp} amplifies the theme of ${np}. Observe and adapt.`,
    ];
    if (impact === "positive") return positiveTemplates[hash % positiveTemplates.length];
    if (impact === "challenging") return challengingTemplates[hash % challengingTemplates.length];
    return neutralTemplates[hash % neutralTemplates.length];
  }

  // Russian (default)
  const positiveTemplates = [
    `Энергия ${tp} поддерживает вашу натальную позицию ${np}. Хорошее время для активных действий.`,
    `${tp} гармонирует с ${np} — используйте этот день с пользой.`,
    `Благоприятная связь ${tp} и ${np}. Доверяйте своим решениям.`,
  ];
  const challengingTemplates = [
    `${tp} создаёт напряжение с ${np}. Проявите терпение и осторожность.`,
    `Влияние ${tp} на ${np} требует внимательности. Не торопите события.`,
    `Энергия ${tp} проверяет вашу натальную позицию ${np}. Время для дисциплины.`,
  ];
  const neutralTemplates = [
    `${tp} активирует энергию ${np}. Будьте внимательны к своим реакциям.`,
    `Влияние ${tp} усиливает тему ${np}. Наблюдайте и адаптируйтесь.`,
  ];

  if (impact === "positive") return positiveTemplates[hash % positiveTemplates.length];
  if (impact === "challenging") return challengingTemplates[hash % challengingTemplates.length];
  return neutralTemplates[hash % neutralTemplates.length];
}

/**
 * Determine which life categories are activated by transits
 */
export function getActivatedCategories(
  transitAspects: TransitAspect[],
  natalCusps: number[]
): Map<string, { positive: number; negative: number }> {
  const cats = new Map<string, { positive: number; negative: number }>();

  for (const ta of transitAspects) {
    // Determine category by natal planet's house
    const house = getHouseForPlanet(ta.natalLon, natalCusps);
    const category = HOUSE_CATEGORY[house] ?? "spiritual";

    if (!cats.has(category)) {
      cats.set(category, { positive: 0, negative: 0 });
    }

    const entry = cats.get(category)!;
    const impact = guessImpact(ta.aspectName);
    if (impact === "positive") entry.positive++;
    else if (impact === "challenging") entry.negative++;
    else { entry.positive += 0.5; entry.negative += 0.5; }
  }

  return cats;
}

/**
 * Full transit calculation: compute transit positions, find aspects, build Transit[]
 */
export function calcTransits(
  sw: InstanceType<typeof SwissEph>,
  transitJd: number,
  natalPositions: PlanetPosition[],
  natalCusps?: number[],
  lang: string = "ru"
): { transits: Transit[]; rawAspects: TransitAspect[] } {
  const transitPositions = calcAllPlanets(sw, transitJd);
  const rawAspects = findTransitAspects(transitPositions, natalPositions);
  const transits = buildTransits(rawAspects, natalCusps, lang);
  return { transits, rawAspects };
}
