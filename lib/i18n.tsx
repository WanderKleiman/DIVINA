"use client";

import type { ReactNode } from "react";

export type Locale = "ru" | "en";

// Language is determined at BUILD TIME via NEXT_PUBLIC_APP_LANG env var.
// RU project: NEXT_PUBLIC_APP_LANG=ru  → divina-app.vercel.app
// EN project: NEXT_PUBLIC_APP_LANG=en  → divina-en.vercel.app
// No runtime switching — language is fixed per deployment.
export const APP_LANG: Locale =
  process.env.NEXT_PUBLIC_APP_LANG === "en" ? "en" : "ru";

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

  // ===== Tones =====
  "tone.direct": { ru: "Прямой", en: "Direct" },
  "tone.direct.desc": { ru: "Говорит правду в лицо, без обёрток", en: "Tells truth straight, no sugarcoating" },
  "tone.deep": { ru: "Глубокий", en: "Deep" },
  "tone.deep.desc": { ru: "Мягкий, поддерживающий, как терапевт", en: "Soft, supportive, like a therapist" },
  "tone.friendly": { ru: "Дружеский", en: "Friendly" },
  "tone.friendly.desc": { ru: "Как близкий друг за чашкой кофе", en: "Like a close friend over coffee" },
  "tone.changesLeft": { ru: "Осталось {n} смены", en: "{n} changes left" },
  "tone.proOnly": { ru: "Только Pro", en: "Pro only" },

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
  "week.yourWeek": { ru: "Твоя неделя", en: "Your week" },
  "week.advice": { ru: "Совет недели", en: "Weekly advice" },
  "week.byDaysArrow": { ru: "По дням →", en: "By days →" },
  "week.backToPeriods": { ru: "К периодам →", en: "Back to periods →" },

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
  "onboarding.toneTitle": { ru: "Как Дивина общается?", en: "How should Divina speak?" },
  "onboarding.toneDesc": { ru: "Выберите тон — он определит стиль всех прогнозов", en: "Choose a tone — it shapes the style of all your readings" },
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
  "compat.analyzing": { ru: "Анализируем вашу совместимость...", en: "Analyzing your compatibility..." },

  // ===== For You =====
  "forYou.title": { ru: "Для тебя", en: "For you" },
  "forYou.subtitle": { ru: "Персональные инструменты для роста", en: "Personal tools for growth" },
  "forYou.history": { ru: "ИСТОРИЯ", en: "HISTORY" },
  "forYou.subscription": { ru: "ПОДПИСКА", en: "SUBSCRIPTION" },
  "forYou.proDesc": { ru: "Недельные прогнозы, совместимость и расширенные транзиты — всё в одной подписке", en: "Weekly forecasts, compatibility and extended transits — all in one subscription" },
  "forYou.fromPerWeek": { ru: "от", en: "from" },
  "forYou.perWeek": { ru: "/неделя", en: "/week" },
  "forYou.learnMore": { ru: "Подробнее", en: "Learn more" },
  "forYou.oneTime": { ru: "Разовые покупки", en: "One-time purchases" },
  "forYou.myPurchases": { ru: "История запросов", en: "Request history" },
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

  // ===== Personality =====
  "personality.breakdown": { ru: "Разбор", en: "Reading" },
  "personality.backToSections": { ru: "К разделам", en: "Back to sections" },
  "personality.backToSectionsArrow": { ru: "К разделам →", en: "Back to sections →" },
  "personality.personalBreakdown": { ru: "Персональный разбор", en: "Personal breakdown" },
  "personality.chooseTopic": { ru: "Выбери тему", en: "Choose a topic" },
  "personality.deepBreakdown": { ru: "Глубокий разбор каждой сферы жизни", en: "Deep breakdown of each life area" },
  "personality.lifePathNumber": { ru: "Число жизненного пути", en: "Life path number" },
  "personality.yourEssence": { ru: "Твоя суть", en: "Your essence" },

  // ===== Compatibility result =====
  "compat.section": { ru: "Совместимость", en: "Compatibility" },
  "compat.sections": { ru: "Разделы совместимости", en: "Compatibility sections" },
  "compat.chooseTopic": { ru: "Выбери тему для детального разбора", en: "Choose a topic for detailed analysis" },
  "compat.overallScore": { ru: "Общая совместимость", en: "Overall compatibility" },
  "compat.youAndLabel": { ru: "Ты и", en: "You and" },
  "compat.partner": { ru: "Партнёр", en: "Partner" },
  "compat.allSections": { ru: "Все разделы →", en: "All sections →" },
  "compat.backToSections": { ru: "К разделам", en: "Back to sections" },

  // ===== Calendar detail =====
  "cal.moonIn": { ru: "Луна в", en: "Moon in" },
  "cal.regularDay": { ru: "Обычный день без значимых транзитов. Хорошее время для повседневных дел.", en: "A regular day without major transits. Good time for everyday tasks." },

  // Generic
  "generic.error": { ru: "Ошибка", en: "Error" },
  "generic.back": { ru: "Назад", en: "Back" },
  "generic.error_occurred": { ru: "Произошла ошибка", en: "An error occurred" },

  // ===== Errors & Actions =====
  "error.forecast": { ru: "Не удалось загрузить прогноз. Проверьте соединение и попробуйте снова.", en: "Failed to load forecast. Check your connection and try again." },
  "error.calendar": { ru: "Не удалось загрузить календарь. Проверьте соединение и попробуйте снова.", en: "Failed to load calendar. Check your connection and try again." },
  "error.weekly": { ru: "Не удалось загрузить прогноз на неделю.", en: "Failed to load weekly forecast." },
  "error.periods": { ru: "Не удалось загрузить периоды", en: "Failed to load periods" },
  "error.data": { ru: "Не удалось загрузить данные.", en: "Failed to load data." },
  "error.compat_result": { ru: "Не удалось загрузить результат", en: "Failed to load result" },
  "action.retry": { ru: "Повторить", en: "Retry" },
  "section.yourPeriods": { ru: "Твои периоды", en: "Your periods" },
  "section.all": { ru: "Все", en: "All" },
  "section.notableDates": { ru: "Знаковые даты", en: "Notable dates" },
  "swipe.hint": { ru: "свайп вниз для перехода", en: "swipe down to continue" },

  // ===== Periods =====
  "periods.yourLife": { ru: "Твоя жизнь сейчас", en: "Your life now" },
  "periods.choose": { ru: "Выбери период", en: "Choose a period" },
  "periods.yourPeriods": { ru: "Твои периоды", en: "Your periods" },
  "periods.detailSubtitle": { ru: "Детальный разбор каждого планетарного влияния", en: "Detailed breakdown of each planetary influence" },
  "periods.backToPeriods": { ru: "К периодам", en: "Back to periods" },
  "periods.backToPeriodsArrow": { ru: "К периодам →", en: "Back to periods →" },
  "periods.practice": { ru: "Практика", en: "Practice" },
  "periods.focusOn": { ru: "Направь силы", en: "Focus on" },
  "periods.letGo": { ru: "Отпусти", en: "Let go" },
  "periods.active": { ru: "Активный период", en: "Active period" },
  "periods.moderate": { ru: "Умеренный период", en: "Moderate period" },
  "periods.background": { ru: "Фоновый период", en: "Background period" },
  "periods.period": { ru: "Период", en: "Period" },
  "periods.noData": { ru: "Данные не загружены.", en: "Data not loaded." },
  "periods.noDataHint": { ru: "Вернись на страницу «Для тебя» и подожди загрузки.", en: "Return to the For You page and wait for the data to load." },
  "periods.backArrow": { ru: "← Назад", en: "← Back" },
  "periods.toMain": { ru: "На главную", en: "To main" },
  "periods.yourPeriodsNow": { ru: "Твои периоды сейчас", en: "Your periods now" },
  "periods.intensityHigh": { ru: "Активный", en: "Active" },
  "periods.intensityMedium": { ru: "Средний", en: "Moderate" },
  "periods.intensityLow": { ru: "Фоновый", en: "Background" },

  // ===== For You page =====
  "forYou.forYouHeader": { ru: "Для тебя", en: "For you" },
  "forYou.interpretationTitle": { ru: "Расшифровка натальной карты", en: "Natal chart interpretation" },
  "forYou.interpretationDesc": { ru: "Полный разбор карты рождения с интерпретацией", en: "Full birth chart breakdown with interpretation" },
  "forYou.weeklyTitle": { ru: "Расклад на 1 неделю", en: "1-week spread" },
  "forYou.weeklyDesc": { ru: "Детальный прогноз на каждый день недели", en: "Detailed forecast for each day of the week" },
  "forYou.compatTitle": { ru: "Совместимость", en: "Compatibility" },
  "forYou.compatDesc": { ru: "Совместимость с партнёром по натальным картам", en: "Compatibility with a partner based on natal charts" },
  "forYou.purchaseLabelInterpretation": { ru: "Расшифровка натальной карты", en: "Natal chart interpretation" },
  "forYou.purchaseLabelCompatibility": { ru: "Совместимость", en: "Compatibility" },
  "forYou.purchaseLabelWeekly": { ru: "Расклад на неделю", en: "Weekly spread" },
  "forYou.withPartner": { ru: "с", en: "with" },
  "forYou.periodDateSep": { ru: "—", en: "—" },

  // ===== Pro page =====
  "pro.perk1": { ru: "Предсказуемые дни — знай, когда действовать, а когда ждать", en: "Predictable days — know when to act and when to wait" },
  "pro.perk2": { ru: "План недели — конкретные вызовы на каждый день", en: "Weekly plan — specific challenges for each day" },
  "pro.perk3": { ru: "5 проверок совместимости в месяц", en: "5 compatibility checks per month" },
  "pro.perk4": { ru: "Расшифровка натальной карты", en: "Natal chart interpretation" },
  "pro.perk5": { ru: "Без рекламы", en: "No ads" },
  "pro.trialCta": { ru: "Попробовать бесплатно 14 дней", en: "Try free for 14 days" },
  "pro.then": { ru: "Затем", en: "Then" },
  "pro.yearlySubscription": { ru: "Годовая подписка", en: "Yearly subscription" },
  "pro.monthlySubscription": { ru: "Месячная подписка", en: "Monthly subscription" },
  "pro.badge": { ru: "ВЫГОДНО −40%", en: "BEST VALUE −40%" },

  // ===== Paywalls =====
  "paywall.weekly.title": { ru: "Недельный расклад", en: "Weekly spread" },
  "paywall.weekly.subtitle": { ru: "Детальный прогноз на каждый день", en: "Detailed forecast for each day" },
  "paywall.weekly.perk1": { ru: "Энергия и рекомендации на каждый день недели", en: "Energy and recommendations for each day of the week" },
  "paywall.weekly.perk2": { ru: "Списки «делать» и «избегать» по дням", en: "Do and avoid lists by day" },
  "paywall.weekly.perk3": { ru: "Лучший и самый сложный день недели", en: "Best and hardest day of the week" },
  "paywall.weekly.perk4": { ru: "Общая стратегия на неделю", en: "Overall weekly strategy" },
  "paywall.interp.title": { ru: "Расшифровка карты", en: "Chart interpretation" },
  "paywall.interp.subtitle": { ru: "Полный разбор натальной карты рождения", en: "Full birth natal chart breakdown" },
  "paywall.interp.perk1": { ru: "Детальный анализ Солнца, Луны и Асцендента", en: "Detailed Sun, Moon, and Ascendant analysis" },
  "paywall.interp.perk2": { ru: "Интерпретация всех 10 планет в знаках и домах", en: "Interpretation of all 10 planets in signs and houses" },
  "paywall.interp.perk3": { ru: "Ключевые аспекты и их влияние на вашу жизнь", en: "Key aspects and their influence on your life" },
  "paywall.interp.perk4": { ru: "Персональные таланты и зоны роста", en: "Personal talents and growth areas" },
  "paywall.interp.perk5": { ru: "Кармические уроки и жизненная миссия", en: "Karmic lessons and life mission" },
  "paywall.compat.title": { ru: "Совместимость", en: "Compatibility" },
  "paywall.compat.subtitle": { ru: "Узнайте, насколько вы совместимы", en: "Discover how compatible you are" },
  "paywall.compat.perk1": { ru: "Общий процент совместимости", en: "Overall compatibility percentage" },
  "paywall.compat.perk2": { ru: "Анализ по 5 сферам: любовь, эмоции, интеллект, ценности, страсть", en: "Analysis across 5 areas: love, emotions, intellect, values, passion" },
  "paywall.compat.perk3": { ru: "Ключевые аспекты вашей пары", en: "Key aspects of your couple" },
  "paywall.compat.perk4": { ru: "Рекомендации для укрепления отношений", en: "Recommendations for strengthening the relationship" },
  "paywall.unlock": { ru: "Разблокировать", en: "Unlock" },
  "paywall.processing": { ru: "Обработка...", en: "Processing..." },
  "paywall.subscribe": { ru: "Подписаться", en: "Subscribe" },
  "paywall.restore": { ru: "Восстановить покупки", en: "Restore purchases" },
  "paywall.restoring": { ru: "Восстановление...", en: "Restoring..." },
  "paywall.cancelAnytime": { ru: "Отмена в любое время", en: "Cancel anytime" },
  "paywall.bestValue": { ru: "ВЫГОДНО", en: "BEST VALUE" },
  "paywall.yearly": { ru: "Годовая", en: "Yearly" },
  "paywall.monthly": { ru: "Месячная", en: "Monthly" },
  "paywall.week": { ru: "неделя", en: "week" },
  "paywall.year": { ru: "год", en: "year" },
  "paywall.month": { ru: "мес", en: "mo" },
  "paywall.sub.headline": { ru: "Дивина делает ритм жизни более предсказуемым.", en: "Divina makes your life rhythm more predictable." },
  "paywall.sub.descBefore": { ru: "Каждый день несёт свою энергию — спокойную, активную или требующую твоего внимания. Divina показывает ", en: "Every day carries its own energy — calm, active, or demanding your attention. Divina shows you " },
  "paywall.sub.descBold": { ru: "твой личный ритм на день, неделю и месяц", en: "your personal rhythm for day, week and month" },
  "paywall.sub.descAfter": { ru: " — чтобы ты был спокоен, знал заранее и мог планировать в соответствии с энергией своего дня.", en: " — so you stay calm, know what's ahead, and plan in line with your energy." },
  "paywall.sub.subtitle": { ru: "Раскройте полный потенциал прогноза", en: "Unlock your full forecast potential" },
  "paywall.sub.perk1": { ru: "Предсказуемые дни — знай, когда действовать, а когда ждать", en: "Predictable days — know when to act and when to wait" },
  "paywall.sub.perk2": { ru: "Еженедельный план — конкретные задачи на каждый день", en: "Weekly plan — specific focus for each day" },
  "paywall.sub.perk3": { ru: "Расклад на месяц и год — видь что впереди", en: "Month & year forecast — see what's ahead" },
  "paywall.sub.perk4": { ru: "Совместимость и натальные карты — без ограничений", en: "Compatibility & natal charts — unlimited" },
  "paywall.sub.perk5": { ru: "Разбор личности на основе натальной карты", en: "Personality breakdown from your natal chart" },
  "paywall.trialCta": { ru: "Начать бесплатно — 7 дней", en: "Claim my free week" },
  "paywall.trialHint": { ru: "Затем", en: "Then" },
  "paywall.trialWeeklyPrice": { ru: "$1.2 в неделю", en: "$1.2 a week" },
  "paywall.cancelAnytime2": { ru: "Отмена в любой момент до конца пробного периода", en: "Cancel any time before the trial ends" },
  "paywall.noProducts": { ru: "Продукты не найдены. Попробуйте позже.", en: "Products not found. Please try again later." },
  "paywall.purchaseError": { ru: "Не удалось совершить покупку. Попробуйте снова.", en: "Purchase failed. Please try again." },
  "paywall.restoreError": { ru: "Не удалось восстановить покупки.", en: "Could not restore purchases." },

  // ===== Year Forecast =====
  "yearForecast.title": { ru: "Расклад на год", en: "Year Forecast" },
  "yearForecast.subtitle": { ru: "Персональный прогноз на 12 месяцев", en: "Personal 12-month forecast" },
  "yearForecast.overallTheme": { ru: "Тема года", en: "Year theme" },
  "yearForecast.loading": { ru: "Составляем расклад на год...", en: "Generating your year forecast..." },
  "yearForecast.loadingHint": { ru: "Это займёт около минуты", en: "This takes about a minute" },
  "yearForecast.error": { ru: "Не удалось загрузить расклад на год", en: "Failed to load year forecast" },
  "yearForecast.keyFocus": { ru: "Фокус месяца", en: "Monthly focus" },
  "yearForecast.watchOut": { ru: "Обрати внимание", en: "Watch out" },
  "yearForecast.retrogrades": { ru: "Ретрограды", en: "Retrogrades" },
  "yearForecast.energy.high": { ru: "Повышенная", en: "Elevated" },
  "yearForecast.energy.medium": { ru: "Оптимальная", en: "Optimal" },
  "yearForecast.energy.low": { ru: "Пониженная", en: "Reduced" },
  "yearForecast.done": { ru: "Закрыть", en: "Done" },

  // ===== Month Forecast =====
  "monthForecast.title": { ru: "Расклад на месяц", en: "Month Forecast" },
  "monthForecast.subtitle": { ru: "Персональный прогноз на ближайший месяц", en: "Your personal forecast for the coming month" },
  "monthForecast.overallTheme": { ru: "Тема месяца", en: "Month theme" },
  "monthForecast.loading": { ru: "Составляем расклад на месяц...", en: "Generating your month forecast..." },
  "monthForecast.loadingHint": { ru: "Это займёт около минуты", en: "This takes about a minute" },
  "monthForecast.error": { ru: "Не удалось загрузить расклад на месяц", en: "Failed to load month forecast" },
  "monthForecast.done": { ru: "Закрыть", en: "Done" },
  "monthForecast.week": { ru: "Неделя", en: "Week" },
  "monthForecast.focus": { ru: "Фокус недели", en: "Weekly focus" },
  "monthForecast.tip": { ru: "Совет", en: "Tip" },
  "monthForecast.keyMoments": { ru: "Ключевые периоды", en: "Key moments" },
  "monthForecast.advice": { ru: "Главное на месяц", en: "Key advice" },
  "monthForecast.energy.high": { ru: "Повышенная", en: "Elevated" },
  "monthForecast.energy.medium": { ru: "Оптимальная", en: "Optimal" },
  "monthForecast.energy.low": { ru: "Пониженная", en: "Reduced" },

  // for-you card
  "forYou.monthTitle": { ru: "Расклад на месяц", en: "Month Forecast" },
  "forYou.monthDesc": { ru: "12 страниц о твоём ближайшем месяце: недели, сферы жизни, ключевые моменты", en: "12 pages about your coming month: weeks, life areas, key moments" },
  "forYou.savedMonthTitle": { ru: "Расклад месяца", en: "Month Reading" },
  "forYou.savedWeeklyTitle": { ru: "Недельный расклад", en: "Weekly Reading" },
  "forYou.savedCompatTitle": { ru: "Совместимость", en: "Compatibility" },
  "forYou.savedBadge": { ru: "Сохранено", en: "Saved" },

  // ===== Others (Natal for others) =====
  "others.title": { ru: "Натальная карта другого человека", en: "Chart for someone else" },
  "others.subtitle": { ru: "Введи данные рождения, чтобы узнать человека глубже", en: "Enter birth data to understand someone more deeply" },
  "others.name": { ru: "Имя", en: "Name" },
  "others.namePlaceholder": { ru: "Имя человека", en: "Person's name" },
  "others.analyze": { ru: "Анализировать", en: "Analyze" },
  "others.analyzing": { ru: "Анализируем...", en: "Analyzing..." },
  "others.history": { ru: "Последние анализы", en: "Recent analyses" },
  "others.error": { ru: "Не удалось загрузить анализ", en: "Failed to load analysis" },
  "others.back": { ru: "Назад", en: "Back" },
  "others.newAnalysis": { ru: "Новый анализ", en: "New analysis" },

  // ===== Pro upsell =====
  "upsell.title": { ru: "✦ Divina Pro", en: "✦ Divina Pro" },
  "upsell.text": { ru: "Расклад на год, совместимость и многое другое", en: "Get year forecast, compatibility, and more" },
  "upsell.cta": { ru: "Узнать о Pro", en: "Explore Pro" },

  // ===== For You — new cards =====
  "forYou.yearTitle": { ru: "Расклад на год", en: "Year Forecast" },
  "forYou.yearDesc": { ru: "Персональный прогноз на каждый из 12 месяцев", en: "Personal forecast for each of the 12 months" },
  "forYou.othersTitle": { ru: "Натальная карта другого человека", en: "Chart for Someone Else" },
  "forYou.othersDesc": { ru: "Разбор личности любого человека по дате рождения", en: "Personality breakdown for anyone by birth date" },

  // ===== CityAutocomplete =====
  "city.placeholder": { ru: "Москва", en: "New York" },

  // ===== Interpretation page (additional) =====
  "interpretation.chartBreakdown": { ru: "Разбор карты", en: "Chart breakdown" },
  "interpretation.backToSections": { ru: "К разделам", en: "Back to sections" },
  "interpretation.pageTitle": { ru: "Расшифровка карты", en: "Chart interpretation" },
  "interpretation.pageSubtitle": { ru: "Глубокий анализ каждой сферы жизни", en: "Deep analysis of each life area" },
};

// ===== Static t() function — reads APP_LANG at module load time =====
export function t(key: string): string {
  return dict[key]?.[APP_LANG] ?? key;
}

// ===== useT() hook — returns static values, no state =====
// setLang is a no-op: language is fixed per deployment
export function useT() {
  return {
    t,
    lang: APP_LANG,
    setLang: (_: Locale) => {
      console.warn("setLang is disabled — language is fixed per Vercel deployment.");
    },
  };
}

// ===== LanguageProvider — pass-through, kept for layout compat =====
export function LanguageProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Helper for formatting dates
export function formatDateLocalized(iso: string, lang: Locale = APP_LANG): string {
  const parts = iso.split("-");
  const day = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10);
  if (lang === "en") {
    return `${dict[`monthGen.${month}`]?.en ?? ""} ${day}`;
  }
  return `${day} ${dict[`monthGen.${month}`]?.ru ?? ""}`;
}

// Short month+day for weekly cards
export function formatShortDate(dayNumber: number, month: number, lang: Locale = APP_LANG): string {
  if (lang === "en") {
    const shortMonths = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${shortMonths[month]} ${dayNumber}`;
  }
  const shortMonths = ["", "янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  return `${dayNumber} ${shortMonths[month]}`;
}
