// ===== Core User Types =====

export interface User {
  name: string;
  streak: number;
  birthDate: string;     // ISO: "1998-03-14"
  birthTime?: string;    // "14:30"
  birthCity?: string;    // "Москва"
  avatarUrl?: string;
  subscription: "free" | "pro";
}

// ===== Astrology Types =====

export interface Planet {
  name: string;        // "Солнце"
  symbol: string;      // "☉"
  sign: string;        // "Рыбы"
  signSymbol: string;  // "♓"
  degree: number;      // 22
  house?: number;      // 1-12
  retrograde?: boolean;
}

export interface Aspect {
  planet1: string;     // "Солнце"
  symbol1: string;     // "☉"
  aspect: string;      // "Тригон"
  aspectSymbol: string; // "△"
  planet2: string;     // "Венера"
  symbol2: string;     // "♀"
  interpretation: string;
}

export interface NatalChart {
  sunSign: string;
  sunSignSymbol: string;
  ascendant: string;
  ascendantSymbol: string;
  moonSign: string;
  moonSignSymbol: string;
  planets: Planet[];
  aspects: Aspect[];
  interpretation: string;
}

// ===== Transit Types =====

export interface Transit {
  transitPlanet: string;      // "Марс"
  transitSymbol: string;      // "♂"
  aspect: string;             // "Тригон"
  aspectSymbol: string;       // "△"
  natalPlanet: string;        // "Венера"
  natalSymbol: string;        // "♀"
  brief: string;              // Short interpretation
  impact: "positive" | "neutral" | "challenging";
}

// ===== Forecast Types =====

export type LifeCategory = "love" | "finance" | "health" | "career" | "spiritual";

export interface CategoryForecast {
  category: LifeCategory;
  icon: string;          // emoji
  title: string;         // "Любовь"
  rating: number;        // 1-5
  brief: string;         // Short text
  detailed: string;      // Full text
}

export interface TarotCard {
  name: string;          // "Маг"
  numeral: string;       // "I"
  meaning: string;       // Brief meaning
  image?: string;        // URL or path
}

export interface Rune {
  name: string;          // "Ансуз"
  symbol: string;        // "ᚨ"
  meaning: string;
}

export interface DailyForecast {
  date: string;
  weekday: string;
  moonSign: string;
  moonSignSymbol: string;
  moonPhase: string;
  moonPercent: number;
  personalDay: number;
  energy: string;
  summary: string;
  doList: string[];
  dontList: string[];
  transits: Transit[];
  categories: CategoryForecast[];
  tarotCard?: TarotCard;
  rune?: Rune;
  advice: string;
  affirmation: string;
}

// ===== Compatibility =====

export interface CompatibilityResult {
  overallPercent: number;
  categories: {
    name: string;
    percent: number;
    description: string;
  }[];
  keyAspects: Aspect[];
  summary: string;
}

// ===== Calendar =====

export type MoonPhaseName =
  | "new"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

export interface CalendarDay {
  date: string;          // ISO "2026-04-14"
  dayNumber: number;
  moonPhase: MoonPhaseName;
  moonSign: string;
  energy: "high" | "medium" | "low";
  hasTransit: boolean;
  transitLabel?: string; // e.g. "Ретроград Меркурия"
  brief?: string;
  recommendation?: string;
}

export interface NotableDate {
  date: string;
  dayNumber: number;
  label: string;
  brief: string;
  recommendation: string;
}

// ===== Weekly Forecast =====

export type DayTag =
  | "деньги"
  | "решения"
  | "любовь"
  | "действия"
  | "карьера"
  | "отдых"
  | "интуиция"
  | "творчество"
  | "здоровье"
  | "осторожно";

export interface WeeklyDayHighlight {
  date: string;           // ISO
  weekday: string;        // "Понедельник"
  dayNumber: number;
  energy: "high" | "medium" | "low";
  headline: string;       // Одна строка — суть дня
  tags: DayTag[];         // Теги — на что день хорош (по транзитам)
  doList: string[];       // Что делать
  dontList: string[];     // Чего избегать
  isKeyDay?: boolean;     // Знаковый день
  keyEvent?: string;      // "Полнолуние в Весах"
}

export type BestDayFor = Record<string, { day: string; why: string }>;

export interface WeeklyForecast {
  weekLabel: string;      // "14–20 апреля 2026"
  overview: string;       // Общий обзор недели
  bestDay: number;        // dayNumber лучшего дня
  hardestDay: number;     // dayNumber сложного дня
  days: WeeklyDayHighlight[];
  weeklyAdvice: string;   // Итоговая рекомендация
  bestDayFor?: BestDayFor; // AI-generated best day recommendations
}

// ===== Navigation =====

export interface NavTab {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}
