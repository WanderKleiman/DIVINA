import type { Planet } from "./types";

// J2000.0 epoch: January 1, 2000 12:00 TT
const J2000 = new Date("2000-01-01T12:00:00Z").getTime();

// Mean longitudes at J2000 (degrees) and mean daily motion (degrees/day)
const PLANET_DATA: {
  name: string;
  symbol: string;
  lon0: number;   // longitude at J2000
  speed: number;  // degrees per day
}[] = [
  { name: "Солнце",   symbol: "☉", lon0: 280.46,  speed: 0.9856 },
  { name: "Луна",     symbol: "☽", lon0: 218.32,  speed: 13.1764 },
  { name: "Меркурий", symbol: "☿", lon0: 252.25,  speed: 4.0923 },
  { name: "Венера",   symbol: "♀", lon0: 181.98,  speed: 1.6021 },
  { name: "Марс",     symbol: "♂", lon0: 355.43,  speed: 0.5240 },
  { name: "Юпитер",   symbol: "♃", lon0: 34.35,   speed: 0.0831 },
  { name: "Сатурн",   symbol: "♄", lon0: 49.94,   speed: 0.0335 },
  { name: "Уран",     symbol: "♅", lon0: 313.23,  speed: 0.0117 },
  { name: "Нептун",   symbol: "♆", lon0: 304.88,  speed: 0.0060 },
  { name: "Плутон",   symbol: "♇", lon0: 238.93,  speed: 0.0040 },
];

const SIGNS = [
  { name: "Овен",      symbol: "♈" },
  { name: "Телец",     symbol: "♉" },
  { name: "Близнецы",  symbol: "♊" },
  { name: "Рак",       symbol: "♋" },
  { name: "Лев",       symbol: "♌" },
  { name: "Дева",      symbol: "♍" },
  { name: "Весы",      symbol: "♎" },
  { name: "Скорпион",  symbol: "♏" },
  { name: "Стрелец",   symbol: "♐" },
  { name: "Козерог",   symbol: "♑" },
  { name: "Водолей",   symbol: "♒" },
  { name: "Рыбы",      symbol: "♓" },
];

function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Approximate planet positions for a given date.
 * Uses mean orbital speeds — accuracy ~5-10 degrees.
 * Good enough for onboarding visual preview.
 */
export function approximatePlanets(date: Date): Planet[] {
  const daysSinceJ2000 = (date.getTime() - J2000) / 86400000;

  return PLANET_DATA.map((p) => {
    const lon = normalizeDeg(p.lon0 + p.speed * daysSinceJ2000);
    const signIndex = Math.floor(lon / 30);
    const degree = Math.floor(lon % 30);
    const sign = SIGNS[signIndex];

    return {
      name: p.name,
      symbol: p.symbol,
      sign: sign.name,
      signSymbol: sign.symbol,
      degree,
    };
  });
}

/**
 * Approximate ascendant based on birth time.
 * Very rough: ascendant advances ~1 sign per 2 hours from sunrise.
 * Sun sign at sunrise → adds ~15 deg/hour based on local time.
 */
export function approximateAscendant(date: Date, hour: number): { name: string; symbol: string } {
  const daysSinceJ2000 = (date.getTime() - J2000) / 86400000;
  const sunLon = normalizeDeg(280.46 + 0.9856 * daysSinceJ2000);
  // Ascendant ≈ sun longitude + (hour - 6) * 15 degrees
  // (sunrise ~ 6:00, ascendant = sun sign at sunrise)
  const ascLon = normalizeDeg(sunLon + (hour - 6) * 15);
  const signIndex = Math.floor(ascLon / 30);
  return SIGNS[signIndex];
}
