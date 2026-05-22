// Free trial: 14 days from first launch
// After trial expires AND no Pro subscription → show paywall
const TRIAL_KEY = "divina_first_launch";
const TRIAL_DAYS = 14;

export function ensureTrialStarted(): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(TRIAL_KEY)) {
    localStorage.setItem(TRIAL_KEY, new Date().toISOString());
  }
}

export function getTrialDaysLeft(): number {
  if (typeof window === "undefined") return TRIAL_DAYS;
  const raw = localStorage.getItem(TRIAL_KEY);
  if (!raw) return TRIAL_DAYS;
  const days = (Date.now() - new Date(raw).getTime()) / 86_400_000;
  return Math.max(0, TRIAL_DAYS - Math.floor(days));
}

export function isInFreeTrial(): boolean {
  return getTrialDaysLeft() > 0;
}
