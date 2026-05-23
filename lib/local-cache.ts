/**
 * localStorage cache with TTL.
 * Replaces sessionStorage for AI-generated content so data survives
 * app restarts. Each entry stores { data, expiresAt } as JSON.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number; // unix ms
}

export function lcGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function lcSet<T>(key: string, data: T, ttlMs: number): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage full — silently skip
  }
}

export function lcDel(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

// ── Common TTLs ───────────────────────────────────────────────────────────────

/** Expires at the end of today (local midnight) */
export function ttlUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

/** Expires at the end of the current ISO week (next Monday 00:00) */
export function ttlUntilNextMonday(): number {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday.getTime() - now.getTime();
}

export const TTL_DAY   = 24 * 60 * 60 * 1000;       // 24 h
export const TTL_WEEK  = 7  * 24 * 60 * 60 * 1000;  // 7 days
export const TTL_MONTH = 30 * 24 * 60 * 60 * 1000;  // 30 days
