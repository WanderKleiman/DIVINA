import type SwissEph from "swisseph-wasm";
import type {
  DailyForecast,
  WeeklyForecast,
  WeeklyDayHighlight,
  CategoryForecast,
  Transit,
  CalendarDay,
  DayTag,
} from "./types";
import {
  calcAllPlanets,
  calcHouseCusps,
  julianDay,
  PlanetPosition,
  getSignIndex,
  getHouseForPlanet,
  SIGN_NAMES_RU,
  SIGN_SYMBOLS,
} from "./ephemeris";
import { getMoonData } from "./moon-calc";
import { calcTransits, findTransitAspects, getActivatedCategories } from "./transit-calc";
import {
  CATEGORY_INFO,
  CATEGORY_TO_TAGS,
  MOON_IN_SIGN,
  MOON_IN_SIGN_EN,
  WEEKDAY_NAMES_RU,
  WEEKDAY_NAMES_EN,
  MONTH_NAMES_RU_GEN,
  MONTH_NAMES_EN,
  HOUSE_CATEGORY,
} from "./interpretations";
import type { LifeCategory } from "./types";

// ===== Helper: deterministic hash from date string =====
function dateHash(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = ((h << 5) - h + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ===== Helper: personal day number (numerology) =====
function personalDay(birthDate: string, targetDate: string): number {
  const sum = (s: string) => s.replace(/-/g, "").split("").reduce((a, c) => a + parseInt(c), 0);
  let n = sum(birthDate) + sum(targetDate);
  while (n > 9) n = n.toString().split("").reduce((a, c) => a + parseInt(c), 0);
  return n;
}

// ===== Build Category Forecasts from transit data =====
function buildCategories(
  transits: Transit[],
  natalPositions: PlanetPosition[],
  natalCusps: number[],
  transitPositions: PlanetPosition[],
  lang: string = "ru"
): CategoryForecast[] {
  const rawAspects = findTransitAspects(transitPositions, natalPositions);
  const activated = getActivatedCategories(rawAspects, natalCusps);

  const allCats: LifeCategory[] = ["love", "finance", "health", "career", "spiritual"];

  return allCats.map((cat) => {
    const info = CATEGORY_INFO[cat];
    const data = activated.get(cat) ?? { positive: 0, negative: 0 };
    const total = data.positive + data.negative;
    const rating = total === 0
      ? 3
      : Math.max(1, Math.min(5, Math.round(3 + (data.positive - data.negative) * 1.5)));

    // Find related transits for this category
    const relatedTransits = transits.filter((t) => {
      const np = natalPositions.find(
        (p) => SIGN_NAMES_RU[getSignIndex(p.longitude)] !== undefined
      );
      return np !== undefined; // simplified: just include all
    });

    const brief = relatedTransits.length > 0
      ? relatedTransits[0].brief.slice(0, 80) + (relatedTransits[0].brief.length > 80 ? "..." : "")
      : getMoodText(cat, rating, lang);

    return {
      category: cat,
      icon: info.icon,
      title: info.title[lang as "ru" | "en"] ?? info.title.ru,
      rating,
      brief,
      detailed: generateCategoryDetailed(cat, rating, transits, lang),
    };
  });
}

function getMoodText(cat: LifeCategory, rating: number, lang: string = "ru"): string {
  if (lang === "en") {
    if (rating >= 4) return "A favorable period. Use the energy of the day.";
    if (rating >= 3) return "A calm period. Act thoughtfully.";
    return "A challenging period. Show patience and caution.";
  }
  if (rating >= 4) return "Благоприятный период. Используйте энергию дня.";
  if (rating >= 3) return "Спокойный период. Действуйте обдуманно.";
  return "Непростой период. Проявите терпение и осторожность.";
}

function generateCategoryDetailed(cat: LifeCategory, rating: number, transits: Transit[], lang: string = "ru"): string {
  const catTitle = CATEGORY_INFO[cat].title[lang as "ru" | "en"] ?? CATEGORY_INFO[cat].title.ru;
  const transitInfo = transits.slice(0, 2).map((t) => `${t.transitPlanet} ${t.aspectSymbol} ${t.natalPlanet}`).join(", ");
  if (lang === "en") {
    const mood = rating >= 4 ? "positive" : rating >= 3 ? "neutral" : "tense";
    return `The overall energy in the "${catTitle}" area is ${mood} today. ${transitInfo ? `Active transits: ${transitInfo}.` : ""} ${rating >= 4 ? "Good time for active steps." : rating <= 2 ? "It is advisable to exercise caution." : "Follow your usual rhythm."}`;
  }
  const mood = rating >= 4 ? "позитивная" : rating >= 3 ? "нейтральная" : "напряжённая";
  return `Общая энергия в сфере "${catTitle}" сегодня ${mood}. ${transitInfo ? `Активные транзиты: ${transitInfo}.` : ""} ${rating >= 4 ? "Хорошее время для активных действий." : rating <= 2 ? "Рекомендуется проявить осторожность." : "Следуйте привычному ритму."}`;
}

// ===== Build do/don't lists from transits =====
function buildDoLists(transits: Transit[], lang: string = "ru"): { doList: string[]; dontList: string[] } {
  const doList: string[] = [];
  const dontList: string[] = [];

  for (const t of transits.slice(0, 5)) {
    if (t.impact === "positive") {
      doList.push(extractAction(t.brief, true));
    } else if (t.impact === "challenging") {
      dontList.push(extractAction(t.brief, false));
    }
  }

  if (lang === "en") {
    if (doList.length === 0) doList.push("Follow your usual rhythm and trust your intuition");
    if (dontList.length === 0) dontList.push("Don't overexert yourself and conserve energy");
  } else {
    if (doList.length === 0) doList.push("Следуйте привычному ритму и доверяйте интуиции");
    if (dontList.length === 0) dontList.push("Не перенапрягайтесь и берегите энергию");
  }

  return { doList: doList.slice(0, 3), dontList: dontList.slice(0, 3) };
}

function extractAction(brief: string, positive: boolean): string {
  // Take first sentence as action
  const first = brief.split(/[.!]/).filter(Boolean)[0]?.trim() ?? brief;
  return first.length > 60 ? first.slice(0, 57) + "..." : first;
}

// ===== Day energy assessment =====
function assessEnergy(transits: Transit[]): "high" | "medium" | "low" {
  let score = 0;
  for (const t of transits) {
    if (t.impact === "positive") score += 1;
    else if (t.impact === "challenging") score -= 1;
  }
  if (score >= 2) return "high";
  if (score <= -2) return "low";
  return "medium";
}

// ===== Get tags from transits =====
function getTagsFromTransits(
  transits: Transit[],
  natalPositions: PlanetPosition[],
  natalCusps: number[]
): DayTag[] {
  const tags = new Set<DayTag>();

  // Determine tags from dominant category — support both RU and EN planet names
  const catCounts = new Map<LifeCategory, number>();
  for (const t of transits) {
    const planetCats: Record<string, LifeCategory> = {
      // Russian
      "Венера": "love", "Юпитер": "finance", "Марс": "career",
      "Сатурн": "career", "Луна": "spiritual", "Нептун": "spiritual",
      "Плутон": "spiritual", "Уран": "career", "Солнце": "career",
      "Меркурий": "career",
      // English
      "Venus": "love", "Jupiter": "finance", "Mars": "career",
      "Saturn": "career", "Moon": "spiritual", "Neptune": "spiritual",
      "Pluto": "spiritual", "Uranus": "career", "Sun": "career",
      "Mercury": "career",
    };
    const cat = planetCats[t.natalPlanet] ?? "spiritual";
    catCounts.set(cat, (catCounts.get(cat) ?? 0) + 1);
  }

  // Top 2 categories → tags
  const sorted = [...catCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [cat] of sorted.slice(0, 2)) {
    for (const tag of CATEGORY_TO_TAGS[cat] ?? []) {
      tags.add(tag);
    }
  }

  // Add "осторожно" if there are challenging transits
  if (transits.some((t) => t.impact === "challenging")) {
    tags.add("осторожно");
  }

  return [...tags].slice(0, 4);
}

// ===== Generate Daily Forecast =====
export function generateDailyForecast(
  sw: InstanceType<typeof SwissEph>,
  birthDate: string,
  birthTime: string,
  lat: number,
  lng: number,
  targetDate: string,
  tzOffset: number = 5,
  lang: string = "ru"
): DailyForecast {
  // Parse birth data
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [bh, bmin] = birthTime.split(":").map(Number);
  const birthJd = julianDay(sw, by, bm, bd, bh - tzOffset, bmin);

  // Natal chart
  const natalPositions = calcAllPlanets(sw, birthJd);
  const houses = calcHouseCusps(sw, birthJd, lat, lng);

  // Parse target date
  const [ty, tm, td] = targetDate.split("-").map(Number);
  const targetJd = julianDay(sw, ty, tm, td, 12, 0); // noon UTC

  // Transit positions
  const transitPositions = calcAllPlanets(sw, targetJd);

  // Transit aspects
  const { transits } = calcTransits(sw, targetJd, natalPositions, houses.cusps, lang);

  // Moon data
  const moon = getMoonData(sw, targetJd, lang);

  // Categories
  const categories = buildCategories(transits, natalPositions, houses.cusps, transitPositions, lang);

  // Do/Don't lists
  const { doList, dontList } = buildDoLists(transits, lang);

  const hash = dateHash(targetDate);

  // Energy text
  const moonSignMap = lang === "en" ? MOON_IN_SIGN_EN : MOON_IN_SIGN;
  const moonDesc = moonSignMap[moon.sign] ?? "";
  const topTransit = transits[0];
  const energyText = `${moonDesc} ${topTransit ? `${topTransit.transitPlanet} ${topTransit.aspectSymbol} ${topTransit.natalPlanet}: ${topTransit.brief.slice(0, 100)}` : ""}`.trim();

  // Summary
  const dayObj = new Date(targetDate);
  const weekdayNames = lang === "en" ? WEEKDAY_NAMES_EN : WEEKDAY_NAMES_RU;
  const weekday = weekdayNames[dayObj.getUTCDay()];
  const monthNames = lang === "en" ? MONTH_NAMES_EN : MONTH_NAMES_RU_GEN;
  const dateFormatted = lang === "en"
    ? `${monthNames[tm]} ${td}, ${ty}`
    : `${td} ${monthNames[tm]} ${ty}`;

  // Personal day
  const pDay = personalDay(birthDate, targetDate);

  // Advice
  const posTransits = transits.filter((t) => t.impact === "positive");
  const negTransits = transits.filter((t) => t.impact === "challenging");
  const advice = lang === "en"
    ? (posTransits.length > negTransits.length
      ? "Use the positive energy of the day for important matters and new beginnings."
      : negTransits.length > posTransits.length
        ? "Show patience and caution. Don't force events."
        : "A balanced day. Act thoughtfully, trusting your intuition.")
    : (posTransits.length > negTransits.length
      ? "Используйте позитивную энергию дня для важных дел и новых начинаний."
      : negTransits.length > posTransits.length
        ? "Проявите терпение и осторожность. Не форсируйте события."
        : "Сбалансированный день. Действуйте обдуманно, доверяя интуиции.");

  // Affirmation (deterministic)
  const affirmations = lang === "en"
    ? [
        "I build my life consciously — step by step, with faith in my path",
        "I accept change with gratitude and an open heart",
        "My strength lies in calm and clarity of intention",
        "I trust the process and know that everything happens at the right time",
        "Each day I move closer to the best version of myself",
        "I am open to new opportunities and ready to act",
        "The universe supports my intentions and efforts",
      ]
    : [
        "Я строю свою жизнь осознанно — шаг за шагом, с верой в свой путь",
        "Я принимаю перемены с благодарностью и открытым сердцем",
        "Моя сила — в спокойствии и ясности намерений",
        "Я доверяю процессу и знаю, что всё происходит вовремя",
        "Каждый день я становлюсь ближе к лучшей версии себя",
        "Я открыт(а) новым возможностям и готов(а) действовать",
        "Вселенная поддерживает мои намерения и усилия",
      ];

  return {
    date: dateFormatted,
    weekday,
    moonSign: moon.sign,
    moonSignSymbol: moon.signSymbol,
    moonPhase: moon.phaseRu,
    moonPercent: moon.percent,
    personalDay: pDay,
    energy: energyText,
    summary: transits[0]?.brief.slice(0, 60) ?? (lang === "en" ? "A calm day" : "Спокойный день"),
    doList,
    dontList,
    transits: transits.slice(0, 6),
    categories,
    advice,
    affirmation: affirmations[hash % affirmations.length],
  };
}

// ===== Generate Weekly Forecast =====
export function generateWeeklyForecast(
  sw: InstanceType<typeof SwissEph>,
  birthDate: string,
  birthTime: string,
  lat: number,
  lng: number,
  weekStart: string,
  tzOffset: number = 5,
  lang: string = "ru"
): WeeklyForecast {
  // Parse birth data
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [bh, bmin] = birthTime.split(":").map(Number);
  const birthJd = julianDay(sw, by, bm, bd, bh - tzOffset, bmin);
  const natalPositions = calcAllPlanets(sw, birthJd);
  const houses = calcHouseCusps(sw, birthJd, lat, lng);

  const startDate = new Date(weekStart);
  const days: WeeklyDayHighlight[] = [];
  let bestScore = -Infinity;
  let worstScore = Infinity;
  let bestDayNum = 0;
  let worstDayNum = 0;

  // Track category scores per day for bestDayFor
  const dayCatScores: { weekday: string; love: number; career: number; finance: number; health: number; spiritual: number; overall: number }[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setUTCDate(d.getUTCDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const [dy, dm, dd] = dateStr.split("-").map(Number);
    const dayJd = julianDay(sw, dy, dm, dd, 12, 0);

    const transitPositions = calcAllPlanets(sw, dayJd);
    const { transits } = calcTransits(sw, dayJd, natalPositions, houses.cusps, lang);
    const moon = getMoonData(sw, dayJd, lang);
    const energy = assessEnergy(transits);
    const { doList, dontList } = buildDoLists(transits, lang);
    const tags = getTagsFromTransits(transits, natalPositions, houses.cusps);

    // Score for best/worst day
    let score = 0;
    for (const t of transits) {
      if (t.impact === "positive") score += 1;
      else if (t.impact === "challenging") score -= 1;
    }

    // Category scores for bestDayFor
    const rawAspects = findTransitAspects(transitPositions, natalPositions);
    const activated = getActivatedCategories(rawAspects, houses.cusps);
    const catScore = (cat: string) => {
      const data = activated.get(cat);
      return data ? data.positive - data.negative : 0;
    };

    const weekdayNames = lang === "en" ? WEEKDAY_NAMES_EN : WEEKDAY_NAMES_RU;
    const weekdayName = weekdayNames[d.getUTCDay()];
    dayCatScores.push({
      weekday: weekdayName,
      love: catScore("love"),
      career: catScore("career"),
      finance: catScore("finance"),
      health: catScore("health"),
      spiritual: catScore("spiritual"),
      overall: score,
    });

    const dayNumber = dd;
    if (score > bestScore) { bestScore = score; bestDayNum = dayNumber; }
    if (score < worstScore) { worstScore = score; worstDayNum = dayNumber; }

    // Check for key events
    const isKeyDay = moon.phase === "full" || moon.phase === "new";
    const moonInPrep = lang === "en" ? "in" : "в";
    const keyEvent = isKeyDay
      ? `${moon.phaseRu} ${moonInPrep} ${moon.sign}`
      : undefined;

    // Headline
    const headline = isKeyDay
      ? (lang === "en"
        ? `${keyEvent} — ${energy === "high" ? "powerful energy" : "stay attentive"}`
        : `${keyEvent} — ${energy === "high" ? "мощная энергия" : "будьте внимательны"}`)
      : transits[0]
        ? (lang === "en"
          ? `${transits[0].transitPlanet} ${transits[0].aspectSymbol} ${transits[0].natalPlanet} — ${energy === "high" ? "act boldly" : energy === "low" ? "conserve energy" : "act thoughtfully"}`
          : `${transits[0].transitPlanet} ${transits[0].aspectSymbol} ${transits[0].natalPlanet} — ${energy === "high" ? "действуйте смело" : energy === "low" ? "берегите силы" : "действуйте обдуманно"}`)
        : (lang === "en"
          ? `Moon in ${moon.sign} — ${energy === "high" ? "active day" : "calm day"}`
          : `Луна в ${moon.sign} — ${energy === "high" ? "активный день" : "спокойный день"}`);

    days.push({
      date: dateStr,
      weekday: weekdayName,
      dayNumber,
      energy,
      headline,
      tags,
      doList,
      dontList,
      isKeyDay: isKeyDay || undefined,
      keyEvent,
    });
  }

  // Week label
  const firstDay = days[0];
  const lastDay = days[6];
  const [, sm] = firstDay.date.split("-").map(Number);
  const [, em] = lastDay.date.split("-").map(Number);
  const wkMonths = lang === "en" ? MONTH_NAMES_EN : MONTH_NAMES_RU_GEN;
  const weekLabel = lang === "en"
    ? (sm === em
      ? `${wkMonths[sm]} ${firstDay.dayNumber}–${lastDay.dayNumber}, ${startDate.getUTCFullYear()}`
      : `${wkMonths[sm]} ${firstDay.dayNumber} – ${wkMonths[em]} ${lastDay.dayNumber}, ${startDate.getUTCFullYear()}`)
    : (sm === em
      ? `${firstDay.dayNumber}–${lastDay.dayNumber} ${wkMonths[sm]} ${startDate.getUTCFullYear()}`
      : `${firstDay.dayNumber} ${wkMonths[sm]} – ${lastDay.dayNumber} ${wkMonths[em]} ${startDate.getUTCFullYear()}`);

  // Overview
  const posCount = days.filter((d) => d.energy === "high").length;
  const negCount = days.filter((d) => d.energy === "low").length;
  const overview = lang === "en"
    ? (posCount > negCount
      ? "The week is generally favorable. Use high-energy days for important matters, and calm days for recovery."
      : negCount > posCount
        ? "A challenging week requiring patience and discipline. Don't force events — the best decisions will come with pause."
        : "A week of contrasts: there are both active and calm days. Follow the rhythm and don't resist the flow.")
    : (posCount > negCount
      ? "Неделя в целом благоприятна. Используйте энергичные дни для важных дел, а спокойные — для восстановления."
      : negCount > posCount
        ? "Непростая неделя, требующая терпения и дисциплины. Не форсируйте события — лучшие решения придут через паузу."
        : "Неделя контрастов: есть как активные, так и спокойные дни. Следуйте ритму и не сопротивляйтесь потоку.");

  const weeklyAdvice = lang === "en"
    ? (posCount >= 4
      ? "Take advantage of this favorable period — launch projects and build connections."
      : negCount >= 4
        ? "The main strategy is patience and self-care. Don't overexert yourself."
        : "The main strategy this week is flexibility. Alternate activity and rest.")
    : (posCount >= 4
      ? "Воспользуйтесь благоприятным периодом — запускайте проекты и налаживайте контакты."
      : negCount >= 4
        ? "Главная стратегия — терпение и забота о себе. Не перенапрягайтесь."
        : "Главная стратегия этой недели — гибкость. Чередуйте активность и отдых.");

  // Generate bestDayFor from category scores
  const pickBest = (key: keyof typeof dayCatScores[0]) => {
    let best = dayCatScores[0];
    for (const d of dayCatScores) {
      if ((d[key] as number) > (best[key] as number)) best = d;
    }
    return best.weekday;
  };

  // Pick best day for rest = day with lowest overall energy (most calm)
  const restDay = dayCatScores.reduce((a, b) => a.overall < b.overall ? a : b).weekday;

  const bestDayFor = lang === "en"
    ? {
        decisions: { day: pickBest("overall"), why: "Most favorable overall energy for making decisions" },
        love: { day: pickBest("love"), why: "Best energy for relationships and romance" },
        newProjects: { day: pickBest("career"), why: "Maximum support for career initiatives" },
        rest: { day: restDay, why: "Calm energy — perfect time for recovery" },
        finances: { day: pickBest("finance"), why: "A favorable day for financial matters" },
        health: { day: pickBest("health"), why: "Good energy for taking care of health" },
      }
    : {
        decisions: { day: pickBest("overall"), why: "Наиболее благоприятная общая энергия для принятия решений" },
        love: { day: pickBest("love"), why: "Лучшая энергия для отношений и романтики" },
        newProjects: { day: pickBest("career"), why: "Максимальная поддержка для карьерных инициатив" },
        rest: { day: restDay, why: "Спокойная энергия — идеальное время для восстановления" },
        finances: { day: pickBest("finance"), why: "Благоприятный день для финансовых вопросов" },
        health: { day: pickBest("health"), why: "Хорошая энергия для заботы о здоровье" },
      };

  return {
    weekLabel,
    overview,
    bestDay: bestDayNum,
    hardestDay: worstDayNum,
    days,
    weeklyAdvice,
    bestDayFor,
  };
}

// ===== Generate Calendar Days =====
export function generateCalendarDays(
  sw: InstanceType<typeof SwissEph>,
  year: number,
  month: number,
  natalPositions?: PlanetPosition[],
  natalCusps?: number[]
): CalendarDay[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const jd = julianDay(sw, year, month, d, 12, 0);
    const moon = getMoonData(sw, jd);

    // Check for major transits if natal data available
    let hasTransit = false;
    let transitLabel: string | undefined;
    let brief: string | undefined;
    let recommendation: string | undefined;

    // Key events: new moon, full moon
    if (moon.phase === "new" || moon.phase === "full") {
      hasTransit = true;
      transitLabel = `${moon.phaseRu} в ${moon.sign}`;
      brief = moon.phase === "new"
        ? "Новолуние — идеальный момент для намерений и новых начинаний."
        : "Полнолуние усиливает эмоции. Время отпускать старое и подводить итоги.";
      recommendation = moon.phase === "new"
        ? "Ставьте цели и намерения на новый лунный цикл"
        : "Отпустите то, что больше не служит вашему росту";
    }

    // Check for transits to natal planets (if available)
    if (natalPositions && !hasTransit) {
      const transitPositions = calcAllPlanets(sw, jd);
      // Check only slow planets (Jupiter 5, Saturn 6) for calendar-level events
      for (const tp of transitPositions.filter((p) => p.id >= 5 && p.id <= 6)) {
        for (const np of natalPositions) {
          const diff = Math.abs(tp.longitude - np.longitude) % 360;
          const angle = diff > 180 ? 360 - diff : diff;
          if (angle < 1) { // very tight orb for calendar
            hasTransit = true;
            const tName = tp.id === 5 ? "Юпитер" : "Сатурн";
            const nName = SIGN_NAMES_RU[getSignIndex(np.longitude)];
            transitLabel = `${tName} ☌ натальная позиция`;
            if (tp.id === 5) {
              brief = `Юпитер активирует натальную точку. Время возможностей и роста.`;
              recommendation = "Принимайте важные решения и начинайте новые проекты для карьерного роста";
            } else {
              brief = `Сатурн активирует натальную точку. Значимый период ответственности.`;
              recommendation = "Время для серьёзных решений, долгосрочных планов и карьерных изменений";
            }
            break;
          }
        }
        if (hasTransit) break;
      }
    }

    // Energy based on moon aspects
    const moonPos = sw.calc_ut(jd, 1, 2 | 256);
    const sunPos = sw.calc_ut(jd, 0, 2 | 256);
    const moonSunAngle = Math.abs(moonPos[0] - sunPos[0]) % 360;
    const normalizedAngle = moonSunAngle > 180 ? 360 - moonSunAngle : moonSunAngle;

    let energy: "high" | "medium" | "low" = "medium";
    // Full/new moon days are high energy, quarters are medium
    if (moon.phase === "full" || moon.phase === "new") energy = "high";
    else if (moon.phase === "first-quarter" || moon.phase === "last-quarter") energy = "medium";
    else energy = normalizedAngle > 90 ? "medium" : "low";

    days.push({
      date: dateStr,
      dayNumber: d,
      moonPhase: moon.phase,
      moonSign: moon.sign,
      energy,
      hasTransit,
      transitLabel,
      brief,
      recommendation,
    });
  }

  return days;
}
