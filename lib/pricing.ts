// Currency detection based on user's locale/timezone
// Prices are approximate conversions from USD base prices

interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number; // multiplier from USD
  position: "before" | "after";
}

const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", rate: 1, position: "before" },
  EUR: { code: "EUR", symbol: "\u20AC", rate: 0.92, position: "before" },
  GBP: { code: "GBP", symbol: "\u00A3", rate: 0.79, position: "before" },
  KZT: { code: "KZT", symbol: "\u20B8", rate: 450, position: "after" },
  RUB: { code: "RUB", symbol: "\u20BD", rate: 90, position: "after" },
  UAH: { code: "UAH", symbol: "\u20B4", rate: 41, position: "after" },
  TRY: { code: "TRY", symbol: "\u20BA", rate: 32, position: "after" },
  BRL: { code: "BRL", symbol: "R$", rate: 5, position: "before" },
  INR: { code: "INR", symbol: "\u20B9", rate: 83, position: "before" },
  PLN: { code: "PLN", symbol: "z\u0142", rate: 4, position: "after" },
  GEL: { code: "GEL", symbol: "\u20BE", rate: 2.7, position: "after" },
  UZS: { code: "UZS", symbol: "сум", rate: 12500, position: "after" },
  AZN: { code: "AZN", symbol: "\u20BC", rate: 1.7, position: "after" },
};

// Map timezone regions to currencies
const TZ_TO_CURRENCY: Record<string, string> = {
  "Europe/Moscow": "RUB",
  "Europe/Kiev": "UAH",
  "Europe/Kyiv": "UAH",
  "Asia/Almaty": "KZT",
  "Asia/Aqtau": "KZT",
  "Asia/Aqtobe": "KZT",
  "Asia/Atyrau": "KZT",
  "Asia/Oral": "KZT",
  "Asia/Qostanay": "KZT",
  "Asia/Qyzylorda": "KZT",
  "Europe/Istanbul": "TRY",
  "Europe/London": "GBP",
  "Asia/Kolkata": "INR",
  "Asia/Calcutta": "INR",
  "America/Sao_Paulo": "BRL",
  "Europe/Warsaw": "PLN",
  "Asia/Tbilisi": "GEL",
  "Asia/Tashkent": "UZS",
  "Asia/Samarkand": "UZS",
  "Asia/Baku": "AZN",
};

// Map locale language to currency as fallback
const LANG_TO_CURRENCY: Record<string, string> = {
  ru: "RUB",
  uk: "UAH",
  kk: "KZT",
  tr: "TRY",
  pl: "PLN",
  ka: "GEL",
  uz: "UZS",
  az: "AZN",
  pt: "BRL",
  hi: "INR",
};

function detectCurrency(): CurrencyConfig {
  if (typeof window === "undefined") return CURRENCIES.USD;

  try {
    // 1. Try timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TZ_TO_CURRENCY[tz]) {
      return CURRENCIES[TZ_TO_CURRENCY[tz]];
    }

    // 2. Check if timezone region matches known areas
    if (tz) {
      if (tz.startsWith("Europe/") && tz !== "Europe/London") {
        // Most European timezones → EUR, except specific ones already mapped
        const euroTzPrefixes = ["Europe/Paris", "Europe/Berlin", "Europe/Rome", "Europe/Madrid", "Europe/Amsterdam", "Europe/Vienna", "Europe/Brussels", "Europe/Helsinki", "Europe/Lisbon", "Europe/Athens", "Europe/Dublin"];
        if (euroTzPrefixes.some(p => tz.startsWith(p.split("/")[0] + "/" + p.split("/")[1])) ||
            (!TZ_TO_CURRENCY[tz] && tz.startsWith("Europe/"))) {
          return CURRENCIES.EUR;
        }
      }
    }

    // 3. Try language
    const lang = navigator.language?.split("-")[0];
    if (lang && LANG_TO_CURRENCY[lang]) {
      return CURRENCIES[LANG_TO_CURRENCY[lang]];
    }
  } catch {
    // fallback
  }

  return CURRENCIES.USD;
}

let cachedCurrency: CurrencyConfig | null = null;

export function getUserCurrency(): CurrencyConfig {
  if (!cachedCurrency) {
    cachedCurrency = detectCurrency();
  }
  return cachedCurrency;
}

function roundPrice(amount: number): number {
  if (amount >= 1000) return Math.round(amount / 100) * 100;
  if (amount >= 100) return Math.round(amount / 10) * 10;
  if (amount >= 10) return Math.round(amount);
  return Math.round(amount * 100) / 100;
}

export function formatPrice(usdAmount: number): string {
  const c = getUserCurrency();
  const converted = roundPrice(usdAmount * c.rate);

  if (c.position === "before") {
    return `${c.symbol}${converted}`;
  }
  return `${converted} ${c.symbol}`;
}

// Pre-formatted common prices
export function getSubscriptionPrices() {
  const c = getUserCurrency();
  const yearTotal = roundPrice(60 * c.rate);
  const yearWeekly = roundPrice(1.15 * c.rate);
  const monthTotal = roundPrice(7 * c.rate);
  const monthWeekly = roundPrice(1.75 * c.rate);

  const fmt = (v: number) => c.position === "before" ? `${c.symbol}${v}` : `${v} ${c.symbol}`;

  return {
    yearTotal: fmt(yearTotal),
    yearWeekly: fmt(yearWeekly),
    monthTotal: fmt(monthTotal),
    monthWeekly: fmt(monthWeekly),
    yearLabel: `${fmt(yearTotal)}/год`,
    monthLabel: `${fmt(monthTotal)}/мес`,
  };
}
