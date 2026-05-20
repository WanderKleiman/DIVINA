// Client-side helper to get user birth data from localStorage

export interface UserBirthData {
  birthDate: string;
  birthTime: string;
  lat: number;
  lng: number;
  tzOffset: number;
  name: string;
  birthCity: string;
  tone: "direct" | "deep" | "friendly";
  lang: "ru" | "en";
}

// Default data (user's real natal data)
const DEFAULT_USER: UserBirthData = {
  birthDate: "1998-03-14",
  birthTime: "10:30",
  lat: 49.9,
  lng: 57.3,
  tzOffset: 5,
  name: "Александр",
  birthCity: "Алга, Актюбинская область",
  tone: "deep",
  lang: "ru",
};

export function getUserData(): UserBirthData {
  if (typeof window === "undefined") return DEFAULT_USER;
  try {
    const stored = localStorage.getItem("divina_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_USER, ...parsed };
    }
  } catch {}
  return DEFAULT_USER;
}

export function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  return monday.toISOString().slice(0, 10);
}
