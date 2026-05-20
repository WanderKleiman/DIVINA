"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type Locale = "ru" | "en";

// ===== Dictionary =====
const dict: Record<string, Record<Locale, string>> = {
  // ===== Bottom Nav =====
  "nav.today": { ru: "Сегодня", en: "Today" },
  "nav.week": { ru: "Неделя", en: "Week" },
  "nav.forYou": { ru: "Для тебя", en: "For you" },
  "nav.calendar": { ru: "Календарь", en: "Calendar" },
  "nav.profile": { ru: "Профиль", en: "Profile" },

  // ===== Energy Card =====
  "energy.title": { ru: "Энергия дня", en: "Energy of the day" },
  "energy.high": { ru: "Высокая", en: "High" },
  "energy.medium": { ru: "Средняя", en: "Medium" },
  "energy.low": { ru: "Низкая", en: "Low" },
  "energy.do": { ru: "Делай", en: "Do" },
  "energy.avoid": { ru: "Избегай", en: "Avoid" },
  "energy.moonIn": { ru: "Луна в", en: "Moon in" },

  // ===== Transits =====
  "transit.title": { ru: "Ваши транзиты сегодня", en: "Your transits today" },

  // ===== Categories =====
  "cat.title": { ru: "Сферы жизни", en: "Life areas" },

  // ===== Daily Card =====
  "daily.tarot": { ru: "Карта дня", en: "Card of the day" },
  "daily.rune": { ru: "Руна дня", en: "Rune of the day" },

  // ===== Notable Dates =====
  "notable.title": { ru: "Ближайшие события", en: "Upcoming events" },

  // ===== Header =====
  "header.settings": { ru: "Настройки", en: "Settings" },

  // ===== Profile =====
  "profile.personalityTitle": { ru: "Разбор личности", en: "Personality breakdown" },
  "profile.personalitySubtitle": { ru: "На основе натальной карты", en: "Based on your natal chart" },
  "profile.readMore": { ru: "Читать полностью", en: "Read more" },
  "profile.checkCompat": { ru: "Проверить совместимость", en: "Check compatibility" },
  "profile.checkCompatBtn": { ru: "Проверить", en: "Check" },
  "profile.birthData": { ru: "Данные рождения", en: "Birth data" },
  "profile.birthDate": { ru: "Дата рождения", en: "Date of birth" },
  "profile.birthTime": { ru: "Время рождения", en: "Time of birth" },
  "profile.birthCity": { ru: "Город рождения", en: "City of birth" },
  "profile.changeBirthData": { ru: "Изменить данные", en: "Change data" },
  "profile.changeBirthConfirm": { ru: "Изменение данных пересчитает натальную карту и все прогнозы. Продолжить?", en: "Changing data will recalculate your natal chart and all forecasts. Continue?" },
  "profile.cancel": { ru: "Отмена", en: "Cancel" },
  "profile.save": { ru: "Сохранить", en: "Save" },
  "profile.daysInRow": { ru: "дней подряд", en: "days in a row" },
  "profile.settings": { ru: "Настройки", en: "Settings" },
  "profile.toneDivina": { ru: "Тон Divina", en: "Divina's tone" },
  "profile.notifications": { ru: "Уведомления", en: "Notifications" },
  "profile.morningReminder": { ru: "Утреннее напоминание", en: "Morning reminder" },
  "profile.goPremium": { ru: "Перейти на Premium", en: "Go Premium" },
  "profile.stats": { ru: "Статистика", en: "Statistics" },
  "profile.currentStreak": { ru: "Текущий стрик", en: "Current streak" },
  "profile.bestStreak": { ru: "Лучший стрик", en: "Best streak" },
  "profile.totalForecasts": { ru: "Всего прогнозов", en: "Total forecasts" },
  "profile.withUsSince": { ru: "С нами с", en: "With us since" },
  "profile.days": { ru: "дней", en: "days" },
  "profile.language": { ru: "Язык", en: "Language" },

  // ===== Tones =====
  "tone.direct": { ru: "Прямой", en: "Direct" },
  "tone.direct.desc": { ru: "Говорит правду в лицо, без обёрток", en: "Tells truth straight, no sugarcoating" },
  "tone.deep": { ru: "Глубокий", en: "Deep" },
  "tone.deep.desc": { ru: "Мягкий, поддерживающий, как терапевт", en: "Soft, supportive, like a therapist" },
  "tone.friendly": { ru: "Дружеский", en: "Friendly" },
  "tone.friendly.desc": { ru: "Как близкий друг за чашкой кофе", en: "Like a close friend over coffee" },

  // ===== Chart =====
  "chart.personality": { ru: "Ваша личность", en: "Your personality" },
  "chart.sun": { ru: "Солнце", en: "Sun" },
  "chart.asc": { ru: "Асцендент", en: "Ascendant" },
  "chart.moon": { ru: "Луна", en: "Moon" },
  "chart.planets": { ru: "Позиции планет", en: "Planet positions" },
  "chart.house": { ru: "дом", en: "house" },
  "chart.aspects": { ru: "Ключевые аспекты", en: "Key aspects" },

  // ===== Zodiac Summary =====
  "zodiac.sunSign": { ru: "Знак Солнца", en: "Sun sign" },
  "zodiac.ascendant": { ru: "Асцендент", en: "Ascendant" },
  "zodiac.moonSign": { ru: "Знак Луны", en: "Moon sign" },

  // ===== Weekly =====
  "week.overview": { ru: "Обзор недели", en: "Week overview" },
  "week.bestDay": { ru: "Лучший день", en: "Best day" },
  "week.hardestDay": { ru: "Сложный день", en: "Hardest day" },
  "week.byDays": { ru: "По дням", en: "By days" },
  "week.best": { ru: "лучший", en: "best" },
  "week.hardest": { ru: "сложный", en: "hardest" },
  "week.bestDayFor": { ru: "Лучший день для...", en: "Best day for..." },

  // BestDayFor labels
  "bestDay.decisions": { ru: "Важные решения", en: "Important decisions" },
  "bestDay.love": { ru: "Любовь", en: "Love" },
  "bestDay.newProjects": { ru: "Новые начинания", en: "New beginnings" },
  "bestDay.finances": { ru: "Финансы", en: "Finances" },
  "bestDay.health": { ru: "Здоровье", en: "Health" },
  "bestDay.rest": { ru: "Отдых", en: "Rest" },
  "bestDay.creativity": { ru: "Творчество", en: "Creativity" },
  "bestDay.selfCare": { ru: "Забота о себе", en: "Self-care" },
  "bestDay.communication": { ru: "Общение", en: "Communication" },
  "bestDay.boundaries": { ru: "Границы", en: "Boundaries" },
  "bestDay.adventure": { ru: "Приключения", en: "Adventure" },
  "bestDay.learning": { ru: "Обучение", en: "Learning" },

  // ===== Calendar =====
  "cal.title": { ru: "Лунный календарь", en: "Lunar calendar" },
  "cal.subtitle": { ru: "Транзиты и фазы луны", en: "Transits and moon phases" },
  "cal.highEnergy": { ru: "Высокая энергия", en: "High energy" },
  "cal.medEnergy": { ru: "Средняя энергия", en: "Medium energy" },
  "cal.lowEnergy": { ru: "Низкая энергия", en: "Low energy" },
  "cal.defaultBrief": { ru: "Обычный день без значимых транзитов. Хорошее время для повседневных дел.", en: "A regular day without major transits. Good time for everyday tasks." },

  // ===== Skeleton loading labels =====
  "loading.today": { ru: "Составляем ваш прогноз на сегодня...", en: "Creating your forecast for today..." },
  "loading.weekly": { ru: "Составляем план недели...", en: "Creating weekly plan..." },
  "loading.calendar": { ru: "Загружаем лунный календарь...", en: "Loading lunar calendar..." },
  "loading.natal": { ru: "Рассчитываем натальную карту...", en: "Calculating natal chart..." },
  "loading.interpretation": { ru: "Генерируем расшифровку...", en: "Generating interpretation..." },
  "loading.compatibility": { ru: "Рассчитываем совместимость...", en: "Calculating compatibility..." },

  // ===== Onboarding =====
  "onboarding.slide1.title": { ru: "Divina помогает сделать ритм вашей жизни более предсказуемым.", en: "Divina helps make your life rhythm more predictable." },
  "onboarding.slide1.desc": { ru: "Персональные ориентиры на каждый день — основанные на вашей карте рождения.", en: "Personal guidance every day — based on your birth chart." },
  "onboarding.slide1.subtitle": { ru: "Что вы получите", en: "What you'll get" },
  "onboarding.slide1.b1.bold": { ru: "Ежедневный прогноз", en: "Daily forecast" },
  "onboarding.slide1.b1.text": { ru: "когда действовать, когда замедлиться, когда принимать важные решения", en: "when to act, when to slow down, when to make important decisions" },
  "onboarding.slide1.b2.bold": { ru: "Еженедельный план", en: "Weekly plan" },
  "onboarding.slide1.b2.text": { ru: "где показано, какие дни будут наиболее благоприятны для вас на этой неделе", en: "showing which days will be most favorable for you this week" },
  "onboarding.slide1.b3.bold": { ru: "Разбор натальной карты", en: "Natal chart analysis" },
  "onboarding.slide1.b3.text": { ru: "чтобы лучше понимать себя, свои решения, жизненные паттерны и сделать жизнь более предсказуемой, дать больше ясности", en: "to better understand yourself, your decisions, life patterns and bring more clarity" },
  "onboarding.slide2.title": { ru: "Ваш космический код", en: "Your cosmic blueprint" },
  "onboarding.slide2.desc": { ru: "Divina объединяет данные NASA о расположении планет, вашу натальную карту и алгоритм, который даёт наиболее точные персональные ориентиры для вас.\n\nДля прогноза нам нужна ваша дата рождения — она создаёт уникальную карту неба, которая была в момент вашего появления на свет.", en: "Divina combines NASA planetary data, your natal chart, and an algorithm that provides the most accurate personal guidance for you.\n\nFor your forecast, we need your date of birth — it creates a unique sky map from the moment you were born." },
  "onboarding.next": { ru: "Далее", en: "Next" },
  "onboarding.tellAboutYourself": { ru: "Расскажите о себе", en: "Tell us about yourself" },
  "onboarding.name": { ru: "Имя", en: "Name" },
  "onboarding.namePlaceholder": { ru: "Ваше имя", en: "Your name" },
  "onboarding.cityPlaceholder": { ru: "Начните вводить город...", en: "Start typing a city..." },
  "onboarding.start": { ru: "Начать", en: "Start" },

  // ===== Interpretation =====
  "interpretation.title": { ru: "Расшифровка натальной карты", en: "Natal chart interpretation" },
  "interpretation.subtitle": { ru: "7 ключевых тем вашей жизни", en: "7 key themes of your life" },
  "interpretation.unlockAll": { ru: "Разблокировать все разделы", en: "Unlock all sections" },
  "interpretation.error": { ru: "Не удалось загрузить расшифровку", en: "Failed to load interpretation" },
  "interpretation.back": { ru: "Назад", en: "Back" },

  // ===== Compatibility =====
  "compat.title": { ru: "Совместимость", en: "Compatibility" },
  "compat.desc": { ru: "Узнайте, насколько вы совместимы по натальным картам", en: "Discover how compatible you are based on natal charts" },
  "compat.partnerName": { ru: "Имя партнёра", en: "Partner's name" },
  "compat.namePlaceholder": { ru: "Имя", en: "Name" },
  "compat.check": { ru: "Проверить совместимость", en: "Check compatibility" },
  "compat.loading": { ru: "Загрузка...", en: "Loading..." },
  "compat.youAnd": { ru: "Вы и", en: "You and" },
  "compat.overall": { ru: "совместимость", en: "compatibility" },
  "compat.newCheck": { ru: "Новая проверка", en: "New check" },
  "compat.partnerNotFound": { ru: "Данные партнёра не найдены", en: "Partner data not found" },
  "compat.error": { ru: "Не удалось рассчитать совместимость", en: "Failed to calculate compatibility" },

  // ===== For You =====
  "forYou.title": { ru: "Для тебя", en: "For you" },
  "forYou.subtitle": { ru: "Персональные инструменты для роста", en: "Personal tools for growth" },
  "forYou.subscription": { ru: "ПОДПИСКА", en: "SUBSCRIPTION" },
  "forYou.proDesc": { ru: "Недельные прогнозы, совместимость и расширенные транзиты — всё в одной подписке", en: "Weekly forecasts, compatibility and extended transits — all in one subscription" },
  "forYou.fromPerWeek": { ru: "от", en: "from" },
  "forYou.perWeek": { ru: "/неделя", en: "/week" },
  "forYou.learnMore": { ru: "Подробнее", en: "Learn more" },
  "forYou.oneTime": { ru: "Разовые покупки", en: "One-time purchases" },
  "forYou.myPurchases": { ru: "Мои покупки", en: "My purchases" },
  "forYou.open": { ru: "Открыть", en: "Open" },

  // ===== Pro =====
  "pro.title": { ru: "Divina Pro", en: "Divina Pro" },
  "pro.subtitle": { ru: "Раскрой полный потенциал прогноза", en: "Unlock the full forecast potential" },
  "pro.best": { ru: "ВЫГОДНО", en: "BEST VALUE" },
  "pro.yearly": { ru: "Годовая", en: "Yearly" },
  "pro.monthly": { ru: "Месячная", en: "Monthly" },
  "pro.perWeek": { ru: "/ неделя", en: "/ week" },
  "pro.perYear": { ru: "/ год", en: "/ year" },
  "pro.perMonth": { ru: "/ мес", en: "/ mo" },
  "pro.subscribe": { ru: "Подписаться", en: "Subscribe" },
  "pro.cancelAnytime": { ru: "Отмена в любое время", en: "Cancel anytime" },

  // ===== Background =====
  "bg.animation": { ru: "Анимация", en: "Animation" },
  "bg.white": { ru: "Белый", en: "White" },
  "bg.change": { ru: "Сменить фон", en: "Change background" },

  // ===== Months (nominative) =====
  "month.1": { ru: "Январь", en: "January" },
  "month.2": { ru: "Февраль", en: "February" },
  "month.3": { ru: "Март", en: "March" },
  "month.4": { ru: "Апрель", en: "April" },
  "month.5": { ru: "Май", en: "May" },
  "month.6": { ru: "Июнь", en: "June" },
  "month.7": { ru: "Июль", en: "July" },
  "month.8": { ru: "Август", en: "August" },
  "month.9": { ru: "Сентябрь", en: "September" },
  "month.10": { ru: "Октябрь", en: "October" },
  "month.11": { ru: "Ноябрь", en: "November" },
  "month.12": { ru: "Декабрь", en: "December" },

  // Months genitive (for dates like "15 апреля")
  "monthGen.1": { ru: "января", en: "January" },
  "monthGen.2": { ru: "февраля", en: "February" },
  "monthGen.3": { ru: "марта", en: "March" },
  "monthGen.4": { ru: "апреля", en: "April" },
  "monthGen.5": { ru: "мая", en: "May" },
  "monthGen.6": { ru: "июня", en: "June" },
  "monthGen.7": { ru: "июля", en: "July" },
  "monthGen.8": { ru: "августа", en: "August" },
  "monthGen.9": { ru: "сентября", en: "September" },
  "monthGen.10": { ru: "октября", en: "October" },
  "monthGen.11": { ru: "ноября", en: "November" },
  "monthGen.12": { ru: "декабря", en: "December" },

  // Short weekdays
  "wd.mon": { ru: "Пн", en: "Mon" },
  "wd.tue": { ru: "Вт", en: "Tue" },
  "wd.wed": { ru: "Ср", en: "Wed" },
  "wd.thu": { ru: "Чт", en: "Thu" },
  "wd.fri": { ru: "Пт", en: "Fri" },
  "wd.sat": { ru: "Сб", en: "Sat" },
  "wd.sun": { ru: "Вс", en: "Sun" },

  // Generic
  "generic.error": { ru: "Ошибка", en: "Error" },
  "generic.back": { ru: "Назад", en: "Back" },
};

// ===== Context =====
interface I18nContextValue {
  lang: Locale;
  setLang: (lang: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "ru",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>("ru");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("divina_lang");
      if (stored === "en" || stored === "ru") {
        setLangState(stored);
      } else {
        // Check user data for lang
        const userData = localStorage.getItem("divina_user");
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed.lang === "en" || parsed.lang === "ru") {
            setLangState(parsed.lang);
          }
        }
      }
    } catch {}
  }, []);

  const setLang = useCallback((newLang: Locale) => {
    setLangState(newLang);
    try {
      localStorage.setItem("divina_lang", newLang);
      // Also update user data
      const stored = localStorage.getItem("divina_user");
      const data = stored ? JSON.parse(stored) : {};
      data.lang = newLang;
      localStorage.setItem("divina_user", JSON.stringify(data));
      // Update html lang attribute
      document.documentElement.lang = newLang;
    } catch {}
  }, []);

  const t = useCallback((key: string): string => {
    return dict[key]?.[lang] ?? key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  return useContext(I18nContext);
}

// Helper for formatting dates
export function formatDateLocalized(iso: string, lang: Locale): string {
  const parts = iso.split("-");
  const day = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10);
  if (lang === "en") {
    return `${dict[`monthGen.${month}`]?.en ?? ""} ${day}`;
  }
  return `${day} ${dict[`monthGen.${month}`]?.ru ?? ""}`;
}

// Short month+day for weekly cards
export function formatShortDate(dayNumber: number, month: number, lang: Locale): string {
  if (lang === "en") {
    const shortMonths = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${shortMonths[month]} ${dayNumber}`;
  }
  const shortMonths = ["", "янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  return `${dayNumber} ${shortMonths[month]}`;
}
