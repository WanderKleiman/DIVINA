import SwissEph from "swisseph-wasm";

// Singleton instance
let swe: InstanceType<typeof SwissEph> | null = null;
let initPromise: Promise<void> | null = null;

export async function initEphemeris(): Promise<InstanceType<typeof SwissEph>> {
  if (swe) return swe;
  if (!initPromise) {
    initPromise = (async () => {
      swe = new SwissEph();
      await swe.initSwissEph();
    })();
  }
  await initPromise;
  return swe!;
}

// Planet IDs matching Swiss Ephemeris
export const PLANETS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const; // Sun..Pluto

export const PLANET_NAMES_RU: Record<number, string> = {
  0: "Солнце", 1: "Луна", 2: "Меркурий", 3: "Венера", 4: "Марс",
  5: "Юпитер", 6: "Сатурн", 7: "Уран", 8: "Нептун", 9: "Плутон",
};

export const PLANET_SYMBOLS: Record<number, string> = {
  0: "☉", 1: "☽", 2: "☿", 3: "♀", 4: "♂",
  5: "♃", 6: "♄", 7: "♅", 8: "♆", 9: "♇",
};

export const SIGN_NAMES_RU = [
  "Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
  "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы",
];

// Prepositional case — "Юпитер в Раке", "Сатурн в Стрельце"
export const SIGN_NAMES_RU_PREP = [
  "Овне", "Тельце", "Близнецах", "Раке", "Льве", "Деве",
  "Весах", "Скорпионе", "Стрельце", "Козероге", "Водолее", "Рыбах",
];

export const SIGN_NAMES_EN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export const PLANET_NAMES_EN: Record<number, string> = {
  0: "Sun", 1: "Moon", 2: "Mercury", 3: "Venus", 4: "Mars",
  5: "Jupiter", 6: "Saturn", 7: "Uranus", 8: "Neptune", 9: "Pluto",
};

export const SIGN_SYMBOLS = [
  "♈", "♉", "♊", "♋", "♌", "♍",
  "♎", "♏", "♐", "♑", "♒", "♓",
];

export interface PlanetPosition {
  id: number;
  longitude: number;
  latitude: number;
  distance: number;
  speed: number; // negative = retrograde
}

export interface HouseData {
  cusps: number[]; // 12 cusps (index 0 = house 1)
  ascendant: number;
  mc: number;
}

/**
 * Convert date + time (UTC) to Julian Day
 */
export function julianDay(
  sw: InstanceType<typeof SwissEph>,
  year: number, month: number, day: number,
  hour: number, minute: number
): number {
  const decimalHour = hour + minute / 60;
  return sw.julday(year, month, day, decimalHour);
}

/**
 * Calculate single planet position
 */
export function calcPlanetPosition(
  sw: InstanceType<typeof SwissEph>,
  jd: number,
  planetId: number
): PlanetPosition {
  const flags = 2 | 256; // SEFLG_SWIEPH | SEFLG_SPEED
  const result = sw.calc_ut(jd, planetId, flags);
  return {
    id: planetId,
    longitude: result[0],
    latitude: result[1],
    distance: result[2],
    speed: result[3],
  };
}

/**
 * Calculate all 10 planet positions
 */
export function calcAllPlanets(
  sw: InstanceType<typeof SwissEph>,
  jd: number
): PlanetPosition[] {
  return PLANETS.map((id) => calcPlanetPosition(sw, jd, id));
}

/**
 * Calculate house cusps (Placidus)
 */
export function calcHouseCusps(
  sw: InstanceType<typeof SwissEph>,
  jd: number,
  lat: number,
  lng: number,
  system: string = "P"
): HouseData {
  const result = sw.houses(jd, lat, lng, system) as unknown as {
    cusps: Float64Array;
    ascmc: Float64Array;
  };
  // cusps[0] unused, cusps[1..12] = house cusps
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    cusps.push(result.cusps[i]);
  }
  return {
    cusps,
    ascendant: result.ascmc[0],
    mc: result.ascmc[1],
  };
}

/**
 * Get zodiac sign index (0-11) from longitude
 */
export function getSignIndex(longitude: number): number {
  return Math.floor(((longitude % 360) + 360) % 360 / 30);
}

/**
 * Get degree within sign (0-29)
 */
export function getDegreeInSign(longitude: number): number {
  return Math.floor(((longitude % 360) + 360) % 360 % 30);
}

/**
 * Determine which house a planet falls in (1-12)
 */
export function getHouseForPlanet(longitude: number, cusps: number[]): number {
  const lon = ((longitude % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const cusp = ((cusps[i] % 360) + 360) % 360;
    const nextCusp = ((cusps[(i + 1) % 12] % 360) + 360) % 360;
    if (nextCusp > cusp) {
      if (lon >= cusp && lon < nextCusp) return i + 1;
    } else {
      // wraps around 0°
      if (lon >= cusp || lon < nextCusp) return i + 1;
    }
  }
  return 1; // fallback
}

// Timezone offset for Alga, Kazakhstan (UTC+5)
export const ALGA_TZ_OFFSET = 5;

/** Convert Julian Day number to ISO date string YYYY-MM-DD (UTC). */
export function jdToDate(jd: number): string {
  const date = new Date((jd - 2440587.5) * 86400000);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Find the ISO dates when a planet entered its current sign and when it will leave.
 * stepDays controls the coarse search granularity (smaller = more precise but slower).
 */
export function findSignTransitDates(
  sw: InstanceType<typeof SwissEph>,
  jd: number,
  planetId: number,
  stepDays = 60,
): { startDate: string; endDate: string } {
  const currentSign = getSignIndex(calcPlanetPosition(sw, jd, planetId).longitude);
  const maxSteps = 60;

  // --- backward: find when planet entered currentSign ---
  let startJd = jd;
  {
    let lo = jd - stepDays * maxSteps;
    let hi = jd;
    let t = jd;
    while (t > lo) {
      t -= stepDays;
      if (getSignIndex(calcPlanetPosition(sw, t, planetId).longitude) !== currentSign) {
        lo = t;
        hi = t + stepDays;
        break;
      }
    }
    while (hi - lo > 1) {
      const mid = (lo + hi) / 2;
      if (getSignIndex(calcPlanetPosition(sw, mid, planetId).longitude) === currentSign) hi = mid;
      else lo = mid;
    }
    startJd = Math.round(hi);
  }

  // --- forward: find when planet will leave currentSign ---
  let endJd = jd;
  {
    let lo = jd;
    let hi = jd + stepDays * maxSteps;
    let t = jd;
    while (t < hi) {
      t += stepDays;
      if (getSignIndex(calcPlanetPosition(sw, t, planetId).longitude) !== currentSign) {
        lo = t - stepDays;
        hi = t;
        break;
      }
    }
    while (hi - lo > 1) {
      const mid = (lo + hi) / 2;
      if (getSignIndex(calcPlanetPosition(sw, mid, planetId).longitude) === currentSign) lo = mid;
      else hi = mid;
    }
    endJd = Math.round(hi);
  }

  return { startDate: jdToDate(startJd), endDate: jdToDate(endJd) };
}
