/**
 * Trial / free-tier helpers.
 *
 * The old 14-day auto-trial is replaced with per-feature usage limits
 * (see lib/free-limits.ts). These stubs are kept so existing imports compile.
 */

export function ensureTrialStarted(): void {
  // No-op — trial concept removed, limits are feature-based
}

export function getTrialDaysLeft(): number {
  return 0;
}

export function isInFreeTrial(): boolean {
  return false;
}
