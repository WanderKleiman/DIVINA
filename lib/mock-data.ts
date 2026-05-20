import type {
  User,
  NatalChart,
  Transit,
  CategoryForecast,
  TarotCard,
  Rune,
  DailyForecast,
  CompatibilityResult,
  CalendarDay,
  MoonPhaseName,
  NotableDate,
  WeeklyForecast,
} from "./types";

// ===== User =====

export const mockUser: User = {
  name: "Александр",
  streak: 12,
  birthDate: "1998-03-14",
  birthTime: "10:30",
  birthCity: "Алга, Актюбинская область",
  subscription: "free",
};

// ===== Natal Chart =====
// Реальные эфемеридные данные: 14 марта 1998, 10:30, Алга (49.9°N, 57.3°E)
// Источник: Swiss Ephemeris / findyourfate.com ephemeris 1998

export const mockNatalChart: NatalChart = {
  sunSign: "Рыбы",
  sunSignSymbol: "♓",
  ascendant: "Близнецы",
  ascendantSymbol: "♊",
  moonSign: "Весы",
  moonSignSymbol: "♎",
  planets: [
    { name: "Солнце", symbol: "☉", sign: "Рыбы", signSymbol: "♓", degree: 23, house: 10 },
    { name: "Луна", symbol: "☽", sign: "Весы", signSymbol: "♎", degree: 5, house: 5 },
    { name: "Меркурий", symbol: "☿", sign: "Овен", signSymbol: "♈", degree: 10, house: 11 },
    { name: "Венера", symbol: "♀", sign: "Водолей", signSymbol: "♒", degree: 8, house: 9 },
    { name: "Марс", symbol: "♂", sign: "Овен", signSymbol: "♈", degree: 7, house: 11 },
    { name: "Юпитер", symbol: "♃", sign: "Рыбы", signSymbol: "♓", degree: 9, house: 10 },
    { name: "Сатурн", symbol: "♄", sign: "Овен", signSymbol: "♈", degree: 20, house: 11 },
    { name: "Уран", symbol: "♅", sign: "Водолей", signSymbol: "♒", degree: 11, house: 9 },
    { name: "Нептун", symbol: "♆", sign: "Водолей", signSymbol: "♒", degree: 1, house: 9 },
    { name: "Плутон", symbol: "♇", sign: "Стрелец", signSymbol: "♐", degree: 8, house: 7 },
  ],
  aspects: [
    {
      planet1: "Солнце", symbol1: "☉",
      aspect: "Соединение", aspectSymbol: "☌",
      planet2: "Юпитер", symbol2: "♃",
      interpretation: "Природный оптимизм и широкий взгляд на мир. Удача приходит через щедрость и веру в лучшее.",
    },
    {
      planet1: "Луна", symbol1: "☽",
      aspect: "Тригон", aspectSymbol: "△",
      planet2: "Венера", symbol2: "♀",
      interpretation: "Эмоциональная гармония и чувство прекрасного. Люди тянутся к вашему спокойствию и доброте.",
    },
    {
      planet1: "Меркурий", symbol1: "☿",
      aspect: "Соединение", aspectSymbol: "☌",
      planet2: "Марс", symbol2: "♂",
      interpretation: "Острый ум и быстрая реакция. Вы убедительны в спорах и решительны в мыслях.",
    },
    {
      planet1: "Венера", symbol1: "♀",
      aspect: "Соединение", aspectSymbol: "☌",
      planet2: "Нептун", symbol2: "♆",
      interpretation: "Идеализм в любви и тяга к возвышенному. Творческая чувствительность и романтичность натуры.",
    },
    {
      planet1: "Сатурн", symbol1: "♄",
      aspect: "Квадратура", aspectSymbol: "□",
      planet2: "Плутон", symbol2: "♇",
      interpretation: "Глубокая внутренняя сила, закалённая через преодоление. Способность выстоять там, где другие сдаются.",
    },
  ],
  interpretation:
    "Солнце в Рыбах даёт глубокую интуицию и богатое воображение, а Асцендент в Близнецах добавляет общительность и интеллектуальное любопытство. Луна в Весах стремится к гармонии в отношениях и справедливости. Соединение Меркурия и Марса в Овне даёт острый, решительный ум — вы быстро думаете и не боитесь отстаивать свою позицию. Венера с Нептуном в Водолее — идеализм и нестандартный подход к любви и творчеству.",
};

// ===== Transits for April 15, 2026 =====
// Реальные позиции планет 15.04.2026 vs натальная карта
// Транзитные: ☉25°♈, ☽21°♓, ☿0°♈, ♀15°♉, ♂3°♈, ♃18°♋, ♄7°♈, ♅26°♉, ♆2°♈, ♇8°♒

export const mockTransits: Transit[] = [
  {
    transitPlanet: "Сатурн", transitSymbol: "♄",
    aspect: "Соединение", aspectSymbol: "☌",
    natalPlanet: "Марс", natalSymbol: "♂",
    brief: "Дела идут медленнее обычного — это нормально. Не торопите процессы, а выстраивайте систему. Методичный подход сегодня даст лучший результат, чем рывок.",
    impact: "challenging",
  },
  {
    transitPlanet: "Нептун", transitSymbol: "♆",
    aspect: "Соединение", aspectSymbol: "☌",
    natalPlanet: "Нептун", natalSymbol: "♆",
    brief: "Период переосмысления: то, что раньше казалось важным, может потерять значение — и это нормально. Хорошее время задать себе вопрос «чего я на самом деле хочу?»",
    impact: "neutral",
  },
  {
    transitPlanet: "Юпитер", transitSymbol: "♃",
    aspect: "Тригон", aspectSymbol: "△",
    natalPlanet: "Солнце", natalSymbol: "☉",
    brief: "Двери открываются легче обычного. Подавайте заявки, выходите на связь, предлагайте идеи — сейчас ваши инициативы встречают поддержку.",
    impact: "positive",
  },
  {
    transitPlanet: "Плутон", transitSymbol: "♇",
    aspect: "Соединение", aspectSymbol: "☌",
    natalPlanet: "Венера", natalSymbol: "♀",
    brief: "Отношения проходят через обновление. Поверхностное отпадает, настоящее углубляется. Не бойтесь честных разговоров — они сейчас целительны.",
    impact: "challenging",
  },
  {
    transitPlanet: "Луна", transitSymbol: "☽",
    aspect: "Соединение", aspectSymbol: "☌",
    natalPlanet: "Юпитер", natalSymbol: "♃",
    brief: "Сегодня интуиция работает на вас — доверяйте ей при выборе. Хорошее настроение и ощущение, что вы на правильном пути.",
    impact: "positive",
  },
];

// ===== Category Forecasts (based on real transits) =====

export const mockCategories: CategoryForecast[] = [
  {
    category: "love",
    icon: "",
    title: "Любовь",
    rating: 3,
    brief: "Плутон на Венере — глубокие трансформации в чувствах.",
    detailed: "Транзит Плутона через вашу натальную Венеру — это время глубокой перестройки в сфере отношений. Поверхностные связи могут распасться, а настоящие — стать интенсивнее. Не пытайтесь контролировать чувства — позвольте процессу идти. Сегодня возможны откровенные разговоры, которые изменят динамику отношений.",
  },
  {
    category: "finance",
    icon: "",
    title: "Финансы",
    rating: 4,
    brief: "Юпитер в тригоне к Солнцу — благоприятный период для роста.",
    detailed: "Тригон Юпитера к вашему Солнцу открывает двери для финансовых возможностей. Это хорошее время для переговоров, подачи заявок и расширения дела. Однако Сатурн на Марсе требует осторожности — не бросайтесь в авантюры, действуйте методично и с расчётом.",
  },
  {
    category: "health",
    icon: "",
    title: "Здоровье",
    rating: 3,
    brief: "Сатурн на Марсе — контролируйте нагрузки.",
    detailed: "Соединение Сатурна с вашим натальным Марсом может ощущаться как физическая тяжесть или снижение энергии. Не перенапрягайтесь — выбирайте умеренные нагрузки: йога, прогулки, растяжка. Обратите внимание на суставы и зубы — зоны Сатурна. Хороший день для визита к врачу.",
  },
  {
    category: "career",
    icon: "",
    title: "Карьера",
    rating: 4,
    brief: "Юпитер поддерживает — двигайтесь к целям планомерно.",
    detailed: "Тригон Юпитера к Солнцу даёт попутный ветер в карьере — ваши усилия замечают, авторитет растёт. Но Сатурн на Марсе напоминает: результат придёт через системную работу, а не через рывок. Сегодня хорошо строить стратегию, вести переговоры, закреплять достигнутое.",
  },
  {
    category: "spiritual",
    icon: "",
    title: "Духовность",
    rating: 5,
    brief: "Нептун возвращается — время духовного обновления.",
    detailed: "Возвращение Нептуна на натальную позицию — уникальный транзит. Ваша интуиция и связь с тонким миром сейчас особенно сильны. Луна в Рыбах усиливает эмпатию и способность считывать настроения. Медитация, творчество, работа со снами — всё это принесёт глубокие инсайты.",
  },
];

// ===== Tarot & Rune =====

export const mockTarotCard: TarotCard = {
  name: "Луна",
  numeral: "XVIII",
  meaning: "Интуиция, подсознание, иллюзии. Доверяйте внутреннему голосу, но проверяйте факты — не всё то, чем кажется.",
};

export const mockRune: Rune = {
  name: "Лагуз",
  symbol: "ᛚ",
  meaning: "Руна воды и интуиции. Следуйте потоку, не сопротивляйтесь переменам — вода найдёт путь.",
};

// ===== Daily Forecast (combined) — 15 апреля 2026 =====

export const mockDailyForecast: DailyForecast = {
  date: "15 апреля 2026",
  weekday: "Среда",
  moonSign: "Рыбы",
  moonSignSymbol: "♓",
  moonPhase: "Убывающая",
  moonPercent: 42,
  personalDay: 3,
  energy:
    "Луна в Рыбах усиливает интуицию и чувствительность. Юпитер в тригоне к вашему Солнцу открывает возможности для роста, но Сатурн на Марсе требует дисциплины. Действуйте обдуманно — сегодня выигрывает тот, кто сочетает вдохновение с системным подходом.",
  summary: "", // filled below from weekly
  doList: [], // filled below from weekly
  dontList: [], // filled below from weekly
  transits: mockTransits,
  categories: mockCategories,
  tarotCard: mockTarotCard,
  rune: mockRune,
  advice:
    "Не торопите события. Юпитер даёт рост, но Сатурн требует терпения. Лучшая стратегия — действовать методично, доверяя интуиции в выборе направления.",
  affirmation: "Я строю свою жизнь осознанно — шаг за шагом, с верой в свой путь",
};

// ===== Legacy exports =====

export const mockDayInfo = {
  date: mockDailyForecast.date,
  weekday: mockDailyForecast.weekday,
  moonSign: mockDailyForecast.moonSign,
  moonSignSymbol: mockDailyForecast.moonSignSymbol,
  moonPhase: mockDailyForecast.moonPhase,
  moonPercent: mockDailyForecast.moonPercent,
  personalDay: mockDailyForecast.personalDay,
};

export const mockForecasts = {
  energy: mockDailyForecast.energy,
  numerology: {
    icon: "",
    title: "Нумерология",
    subtitle: "Персональный день: 3",
    brief: "Число 3 — день общения, творчества и самовыражения. Делитесь идеями, пишите, говорите — слова сегодня имеют силу.",
    liquidClass: "liquid-purple",
  },
  astrology: {
    icon: "♓",
    title: "Астрология",
    subtitle: "Луна в Рыбах · Юпитер △ Солнце",
    brief: "Тригон Юпитера к Солнцу открывает двери. Луна в вашем солнечном знаке усиливает интуицию и эмпатию.",
    liquidClass: "liquid-blue",
  },
  tarot: {
    icon: "",
    title: "Таро",
    subtitle: "Луна (XVIII)",
    brief: "Карта Луны — доверяйте подсознанию, но не принимайте решений на эмоциях. Ответы придут через сны и образы.",
    liquidClass: "liquid-amber",
  },
  runes: {
    icon: "ᛚ",
    title: "Руны",
    subtitle: "ᛚ Лагуз",
    brief: "Руна потока и интуиции. Не боритесь с течением — адаптируйтесь и двигайтесь вместе с ним.",
    liquidClass: "liquid-emerald",
  },
  chinese: {
    icon: "",
    title: "Китайская астрология",
    subtitle: "Стихия дня: Вода",
    brief: "Энергия Воды усиливает гибкость и интуицию. Хороший день для переговоров, дипломатии и адаптации к обстоятельствам.",
    liquidClass: "liquid-red",
  },
};

export const mockAdvice = {
  advice: mockDailyForecast.advice,
  affirmation: mockDailyForecast.affirmation,
};

// ===== Compatibility =====

export const mockCompatibility: CompatibilityResult = {
  overallPercent: 78,
  categories: [
    { name: "Эмоциональная связь", percent: 85, description: "Глубокое взаимопонимание на уровне чувств." },
    { name: "Интеллектуальная совместимость", percent: 72, description: "Разный подход к анализу, но это обогащает." },
    { name: "Физическое влечение", percent: 88, description: "Сильная взаимная притягательность." },
    { name: "Ценности и цели", percent: 65, description: "Есть различия, которые потребуют компромиссов." },
  ],
  keyAspects: [
    {
      planet1: "Солнце", symbol1: "☉",
      aspect: "Тригон", aspectSymbol: "△",
      planet2: "Луна", symbol2: "☽",
      interpretation: "Естественная гармония между сознательным и эмоциональным.",
    },
    {
      planet1: "Венера", symbol1: "♀",
      aspect: "Соединение", aspectSymbol: "☌",
      planet2: "Марс", symbol2: "♂",
      interpretation: "Мощное взаимное притяжение и страсть.",
    },
  ],
  summary:
    "Ваша пара обладает сильной эмоциональной и физической связью. Основная зона роста — выравнивание долгосрочных целей и ценностей. При взаимном уважении это союз с большим потенциалом.",
};

// ===== Calendar — April 2026 =====

function generateCalendarDays(year: number, month: number): CalendarDay[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const phases: MoonPhaseName[] = [
    "new", "waxing-crescent", "first-quarter", "waxing-gibbous",
    "full", "waning-gibbous", "last-quarter", "waning-crescent",
  ];
  const signs = ["Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева", "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы"];
  const energyLevels: ("high" | "medium" | "low")[] = ["high", "medium", "low"];

  const days: CalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const phase = phases[Math.floor(((d - 1) / daysInMonth) * 8) % 8];
    const sign = signs[Math.floor(((d - 1) / 2.5)) % 12];
    const hasTransit = d === 8 || d === 15 || d === 22;

    const recommendation = hasTransit
      ? d === 8
        ? "Хороший день для завершения дел и отпускания привязанностей"
        : d === 15
          ? "Не подписывайте договоры и не начинайте новые проекты"
          : "Идеальный момент для постановки намерений и планирования покупок"
      : undefined;

    days.push({
      date: dateStr,
      dayNumber: d,
      moonPhase: phase,
      moonSign: sign,
      energy: energyLevels[d % 3],
      hasTransit,
      transitLabel: hasTransit
        ? d === 8 ? "Полнолуние в Весах" : d === 15 ? "Ретроград Меркурия" : "Новолуние в Тельце"
        : undefined,
      brief: hasTransit
        ? d === 8
          ? "Полнолуние усиливает эмоции. Время отпускать старое."
          : d === 15
            ? "Меркурий входит в ретроград. Проверяйте детали."
            : "Новолуние — идеальный момент для намерений."
        : undefined,
      recommendation,
    });
  }
  return days;
}

export const mockCalendarDays: CalendarDay[] = generateCalendarDays(2026, 4);

export const mockNotableDates: NotableDate[] = mockCalendarDays
  .filter((d) => d.hasTransit && d.dayNumber > 14)
  .map((d) => ({
    date: d.date,
    dayNumber: d.dayNumber,
    label: d.transitLabel!,
    brief: d.brief!,
    recommendation: d.recommendation!,
  }));

// ===== Weekly Forecast (Premium) — 14–20 апреля 2026 =====

export const mockWeeklyForecast: WeeklyForecast = {
  weekLabel: "14–20 апреля 2026",
  overview:
    "Неделя контрастов: начало проходит под знаком Юпитера — двери открываются, возможности приходят. Но к среде подключается Сатурн на вашем Марсе — темп замедляется, требуется дисциплина. Ретроград Меркурия во вторник просит внимательности к деталям и коммуникациям. Финал недели мягкий — Луна в Тельце даёт отдых и заземление.",
  bestDay: 14,
  hardestDay: 16,
  days: [
    {
      date: "2026-04-14",
      weekday: "Понедельник",
      dayNumber: 14,
      energy: "high",
      headline: "Лучший день недели — действуйте смело",
      tags: ["решения", "карьера", "действия", "деньги"],
      doList: [
        "Запускайте проекты и подавайте заявки",
        "Назначайте важные встречи и переговоры",
        "Принимайте решения — интуиция работает",
      ],
      dontList: [
        "Не откладывайте на потом то, что можно сделать сейчас",
      ],
    },
    {
      date: "2026-04-15",
      weekday: "Вторник",
      dayNumber: 15,
      energy: "medium",
      headline: "Меркурий входит в ретроград — внимание к деталям",
      tags: ["осторожно", "интуиция"],
      isKeyDay: true,
      keyEvent: "Ретроград Меркурия",
      doList: [
        "Перепроверяйте письма и документы перед отправкой",
        "Создавайте резервные копии важных файлов",
        "Возвращайтесь к незавершённым делам",
      ],
      dontList: [
        "Не подписывайте новые договоры",
        "Не покупайте технику и гаджеты",
        "Не начинайте принципиально новые проекты",
      ],
    },
    {
      date: "2026-04-16",
      weekday: "Среда",
      dayNumber: 16,
      energy: "low",
      headline: "Самый тяжёлый день — берегите силы",
      tags: ["осторожно", "здоровье"],
      doList: [
        "Занимайтесь рутиной и доработками",
        "Уделите время отдыху и восстановлению",
        "Практикуйте терпение в общении",
      ],
      dontList: [
        "Не форсируйте события и не давите на людей",
        "Не принимайте импульсивных решений",
        "Избегайте конфликтов — они затянутся",
      ],
    },
    {
      date: "2026-04-17",
      weekday: "Четверг",
      dayNumber: 17,
      energy: "medium",
      headline: "Энергия возвращается — стройте систему",
      tags: ["карьера", "действия", "здоровье"],
      doList: [
        "Планируйте и структурируйте задачи",
        "Ведите переговоры — Юпитер поддерживает",
        "Занимайтесь физической активностью",
      ],
      dontList: [
        "Не разбрасывайтесь — фокусируйтесь на главном",
      ],
    },
    {
      date: "2026-04-18",
      weekday: "Пятница",
      dayNumber: 18,
      energy: "medium",
      headline: "Хороший день для отношений и творчества",
      tags: ["любовь", "творчество", "интуиция"],
      doList: [
        "Проведите время с близкими",
        "Займитесь творчеством и хобби",
        "Откройтесь честному разговору",
      ],
      dontList: [
        "Не избегайте чувств — Плутон на Венере просит глубины",
      ],
    },
    {
      date: "2026-04-19",
      weekday: "Суббота",
      dayNumber: 19,
      energy: "high",
      headline: "Луна в Тельце — заземление и удовольствие",
      tags: ["отдых", "деньги"],
      doList: [
        "Отдыхайте и наслаждайтесь жизнью",
        "Вкусная еда, природа, прогулки",
        "Подводите итоги недели",
      ],
      dontList: [
        "Не перерабатывайте — дайте себе восстановиться",
      ],
    },
    {
      date: "2026-04-20",
      weekday: "Воскресенье",
      dayNumber: 20,
      energy: "medium",
      headline: "Мягкий день для планирования следующей недели",
      tags: ["отдых", "интуиция"],
      doList: [
        "Ставьте намерения на новую неделю",
        "Медитация и рефлексия",
        "Лёгкие домашние дела и уют",
      ],
      dontList: [
        "Не нагружайте себя сложными задачами",
      ],
    },
  ],
  weeklyAdvice:
    "Главная стратегия этой недели — не сопротивляться ритму. Понедельник — рывок, среда — пауза, выходные — восстановление. Если следовать этому потоку, неделя пройдёт продуктивно и без выгорания.",
};

// ===== Sync daily ↔ weekly: doList/dontList always match =====
{
  const todayNum = 15; // matches mockDailyForecast date (15 апреля)
  const weekDay = mockWeeklyForecast.days.find((d) => d.dayNumber === todayNum);
  if (weekDay) {
    mockDailyForecast.summary = weekDay.headline;
    mockDailyForecast.doList = weekDay.doList.slice(0, 2);
    mockDailyForecast.dontList = weekDay.dontList.slice(0, 2);
  }
}
