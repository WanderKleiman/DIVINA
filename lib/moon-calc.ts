import type SwissEph from "swisseph-wasm";
import type { MoonPhaseName } from "./types";
import { calcPlanetPosition, getSignIndex, SIGN_NAMES_RU, SIGN_NAMES_EN, SIGN_SYMBOLS } from "./ephemeris";

/**
 * Get moon phase name from Sun-Moon angle difference
 */
export function getMoonPhase(sunLon: number, moonLon: number): MoonPhaseName {
  let diff = ((moonLon - sunLon) % 360 + 360) % 360;
  if (diff < 22.5) return "new";
  if (diff < 67.5) return "waxing-crescent";
  if (diff < 112.5) return "first-quarter";
  if (diff < 157.5) return "waxing-gibbous";
  if (diff < 202.5) return "full";
  if (diff < 247.5) return "waning-gibbous";
  if (diff < 292.5) return "last-quarter";
  if (diff < 337.5) return "waning-crescent";
  return "new";
}

/**
 * Get moon illumination percentage (approximate)
 */
export function getMoonPercent(sunLon: number, moonLon: number): number {
  const diff = ((moonLon - sunLon) % 360 + 360) % 360;
  // 0° = new (0%), 180° = full (100%)
  return Math.round((1 - Math.cos(diff * Math.PI / 180)) / 2 * 100);
}

/**
 * Get moon phase display name in Russian
 */
export function getMoonPhaseRu(phase: MoonPhaseName): string {
  const names: Record<MoonPhaseName, string> = {
    "new": "Новолуние",
    "waxing-crescent": "Растущий серп",
    "first-quarter": "Первая четверть",
    "waxing-gibbous": "Растущая",
    "full": "Полнолуние",
    "waning-gibbous": "Убывающая",
    "last-quarter": "Последняя четверть",
    "waning-crescent": "Убывающий серп",
  };
  return names[phase];
}

/**
 * Get moon phase display name in English
 */
export function getMoonPhaseEn(phase: MoonPhaseName): string {
  const names: Record<MoonPhaseName, string> = {
    "new": "New Moon",
    "waxing-crescent": "Waxing Crescent",
    "first-quarter": "First Quarter",
    "waxing-gibbous": "Waxing Gibbous",
    "full": "Full Moon",
    "waning-gibbous": "Waning Gibbous",
    "last-quarter": "Last Quarter",
    "waning-crescent": "Waning Crescent",
  };
  return names[phase];
}

/**
 * Get moon sign name and symbol for a given Julian Day
 */
export function getMoonSign(
  sw: InstanceType<typeof SwissEph>,
  jd: number
): { sign: string; signSymbol: string } {
  const moon = calcPlanetPosition(sw, jd, 1); // SE_MOON
  const idx = getSignIndex(moon.longitude);
  return { sign: SIGN_NAMES_RU[idx], signSymbol: SIGN_SYMBOLS[idx] };
}

/**
 * Full moon data for a given JD
 */
export function getMoonData(
  sw: InstanceType<typeof SwissEph>,
  jd: number,
  lang: string = "ru"
): {
  phase: MoonPhaseName;
  phaseRu: string;
  percent: number;
  sign: string;
  signSymbol: string;
} {
  const sun = calcPlanetPosition(sw, jd, 0);
  const moon = calcPlanetPosition(sw, jd, 1);
  const phase = getMoonPhase(sun.longitude, moon.longitude);
  const idx = getSignIndex(moon.longitude);
  return {
    phase,
    phaseRu: lang === "en" ? getMoonPhaseEn(phase) : getMoonPhaseRu(phase),
    percent: getMoonPercent(sun.longitude, moon.longitude),
    sign: lang === "en" ? SIGN_NAMES_EN[idx] : SIGN_NAMES_RU[idx],
    signSymbol: SIGN_SYMBOLS[idx],
  };
}
