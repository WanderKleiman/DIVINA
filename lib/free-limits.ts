/**
 * Free usage limits — what non-Pro users can access before hitting the paywall.
 *
 * weekly:       3 distinct weeks (same week re-opened = free, it's cached)
 * monthForecast: 1 generation
 * compatibility: 1 generation
 * personality:   1 open
 *
 * Year forecast and "others" natal chart are Pro-only (no free quota).
 */

export type FreeFeature = "weekly" | "monthForecast" | "compatibility" | "personality";

// ── Storage keys ──────────────────────────────────────────────────────────────
const KEY_WEEKLY_WEEKS  = "divina_free_weekly_weeks";   // JSON string[]
const KEY_MONTH_USED    = "divina_free_month_used";     // "1" | absent
const KEY_COMPAT_USED   = "divina_free_compat_used";    // "1" | absent
const KEY_PERSON_USED   = "divina_free_person_used";    // "1" | absent

// ── Weekly ────────────────────────────────────────────────────────────────────

function getUsedWeeks(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY_WEEKLY_WEEKS) ?? "[]"); }
  catch { return []; }
}

/** True if user can load this specific week (already loaded before OR under 3-week limit) */
export function canUseWeekly(weekStart: string): boolean {
  const weeks = getUsedWeeks();
  if (weeks.includes(weekStart)) return true;   // same week = free re-open
  return weeks.length < 3;
}

/** Call once after a NEW week's forecast is successfully fetched (not from cache) */
export function recordWeeklyUse(weekStart: string): void {
  if (typeof window === "undefined") return;
  const weeks = getUsedWeeks();
  if (!weeks.includes(weekStart)) {
    weeks.push(weekStart);
    localStorage.setItem(KEY_WEEKLY_WEEKS, JSON.stringify(weeks));
  }
}

export function weeklyUsedCount(): number {
  return getUsedWeeks().length;
}

// ── Single-use features ───────────────────────────────────────────────────────

function singleCanUse(storageKey: string): boolean {
  if (typeof window === "undefined") return true;
  return !localStorage.getItem(storageKey);
}

function singleRecord(storageKey: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey, "1");
}

export function canUseMonthForecastFree(): boolean  { return singleCanUse(KEY_MONTH_USED); }
export function recordMonthForecastUse(): void       { singleRecord(KEY_MONTH_USED); }

export function canUseCompatibilityFree(): boolean  { return singleCanUse(KEY_COMPAT_USED); }
export function recordCompatibilityUse(): void       { singleRecord(KEY_COMPAT_USED); }

export function canUsePersonalityFree(): boolean    { return singleCanUse(KEY_PERSON_USED); }
export function recordPersonalityUse(): void         { singleRecord(KEY_PERSON_USED); }
