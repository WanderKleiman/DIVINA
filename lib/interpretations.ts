import type { LifeCategory, DayTag } from "./types";

// ===== Transit Aspect Interpretations =====
// Key: `${transitPlanetId}_${aspectName}_${natalPlanetId}`
// Only most impactful transits (outer planets + Mars to natal planets)

interface TransitText {
  brief: string;
  impact: "positive" | "neutral" | "challenging";
}

export const TRANSIT_ASPECTS: Record<string, TransitText> = {
  // === Юпитер transits ===
  "5_conjunction_0": { brief: "Период везения и роста. Ваша уверенность на пике — беритесь за большие дела.", impact: "positive" },
  "5_trine_0": { brief: "Двери открываются легче обычного. Подавайте заявки, выходите на связь — инициативы встречают поддержку.", impact: "positive" },
  "5_sextile_0": { brief: "Удачный момент для расширения горизонтов. Учёба, путешествия, новые контакты.", impact: "positive" },
  "5_square_0": { brief: "Чрезмерный оптимизм может подвести. Проверяйте обещания и не берите на себя слишком много.", impact: "challenging" },
  "5_opposition_0": { brief: "Возможности приходят через других людей. Будьте открыты к сотрудничеству.", impact: "neutral" },

  "5_conjunction_1": { brief: "Эмоциональный подъём и чувство благодарности. Хороший день для семейных дел.", impact: "positive" },
  "5_trine_1": { brief: "Интуиция работает превосходно. Доверяйте внутреннему голосу.", impact: "positive" },
  "5_square_1": { brief: "Перепады настроения и склонность к избыточности. Умеренность — ваш друг.", impact: "challenging" },

  "5_conjunction_2": { brief: "Ясность мышления и удачные переговоры. Подписывайте договоры.", impact: "positive" },
  "5_trine_2": { brief: "Отличный день для обучения и важных разговоров.", impact: "positive" },
  "5_conjunction_3": { brief: "Любовь расцветает. Период романтики и финансовой удачи.", impact: "positive" },
  "5_trine_3": { brief: "Гармония в отношениях. Хорошее время для свиданий и покупок.", impact: "positive" },
  "5_conjunction_4": { brief: "Энергия бьёт ключом. Спорт, активные проекты, конкуренция — всё в вашу пользу.", impact: "positive" },
  "5_trine_4": { brief: "Действия приносят результат. Смело двигайтесь вперёд.", impact: "positive" },

  // === Сатурн transits ===
  "6_conjunction_0": { brief: "Время ответственности и зрелости. Результаты прошлых усилий проявляются.", impact: "challenging" },
  "6_square_0": { brief: "Давление и ограничения. Не сдавайтесь — это проверка на прочность.", impact: "challenging" },
  "6_opposition_0": { brief: "Конфликт между долгом и желаниями. Ищите баланс.", impact: "challenging" },
  "6_trine_0": { brief: "Стабильность и структура. Хорошее время для долгосрочных планов.", impact: "positive" },
  "6_sextile_0": { brief: "Дисциплина даёт плоды. Методичный подход к делам.", impact: "positive" },

  "6_conjunction_1": { brief: "Эмоциональная серьёзность. Не подавляйте чувства, а структурируйте их.", impact: "challenging" },
  "6_square_1": { brief: "Чувство одиночества или тяжести. Это временно — заботьтесь о себе.", impact: "challenging" },
  "6_conjunction_2": { brief: "Ум работает чётко и логично. Хорошо для серьёзных документов.", impact: "neutral" },
  "6_conjunction_3": { brief: "Отношения проходят проверку на прочность. Оставайтесь честны.", impact: "challenging" },
  "6_conjunction_4": { brief: "Дела идут медленнее — это нормально. Методичный подход даст лучший результат.", impact: "challenging" },
  "6_square_4": { brief: "Фрустрация от задержек. Терпение — ваше оружие.", impact: "challenging" },
  "6_trine_4": { brief: "Действия подкреплены дисциплиной. Строите надёжный фундамент.", impact: "positive" },
  "6_sextile_3": { brief: "Стабильность в отношениях. Хорошее время для серьёзных разговоров о будущем.", impact: "positive" },
  "6_trine_3": { brief: "Зрелый подход к любви. Отношения приобретают глубину и надёжность.", impact: "positive" },
  "6_sextile_9": { brief: "Дисциплина помогает трансформации. Структурируйте внутренние перемены.", impact: "positive" },
  "6_trine_9": { brief: "Сатурн поддерживает глубокие перемены. Трансформация идёт уверенно.", impact: "positive" },

  // === Марс transits ===
  "4_conjunction_0": { brief: "Прилив энергии и решимости. Действуйте, но не агрессивно.", impact: "positive" },
  "4_square_0": { brief: "Раздражительность и конфликты. Канализируйте энергию в спорт.", impact: "challenging" },
  "4_trine_0": { brief: "Энергия и воля в гармонии. Отличный день для активных дел.", impact: "positive" },
  "4_conjunction_1": { brief: "Эмоции накаляются. Будьте внимательны к импульсивным реакциям.", impact: "challenging" },
  "4_trine_1": { brief: "Эмоциональная энергия направлена продуктивно.", impact: "positive" },
  "4_conjunction_2": { brief: "Острый ум и решительная речь. Хорошо для дебатов, осторожно со словами.", impact: "neutral" },
  "4_conjunction_3": { brief: "Страсть в отношениях. Импульсивные покупки — стоп.", impact: "neutral" },
  "4_square_3": { brief: "Напряжение в отношениях. Не провоцируйте партнёра.", impact: "challenging" },
  "4_trine_3": { brief: "Романтическая энергия и привлекательность на высоте.", impact: "positive" },
  "4_sextile_3": { brief: "Лёгкость в общении и привлекательность. Хороший день для свиданий.", impact: "positive" },
  "4_conjunction_4": { brief: "Мощный приток энергии. Осторожно с травмами при физических нагрузках.", impact: "neutral" },
  "4_sextile_0": { brief: "Энергия поддерживает вашу волю. Действуйте уверенно, но без спешки.", impact: "positive" },

  // === Уран transits ===
  "7_conjunction_0": { brief: "Неожиданные перемены. Жизнь меняет курс — доверяйте процессу.", impact: "neutral" },
  "7_square_0": { brief: "Внезапные разрывы с привычным. Будьте гибкими.", impact: "challenging" },
  "7_trine_0": { brief: "Позитивные сюрпризы и интересные возможности.", impact: "positive" },
  "7_conjunction_1": { brief: "Эмоциональная нестабильность. Дышите и адаптируйтесь.", impact: "challenging" },
  "7_conjunction_3": { brief: "Неожиданные повороты в любви. Свобода vs привязанность.", impact: "neutral" },

  // === Нептун transits ===
  "8_conjunction_0": { brief: "Размывание границ. Мечтательность и вдохновение, но фильтруйте иллюзии.", impact: "neutral" },
  "8_square_0": { brief: "Трудно отличить реальность от иллюзий. Не принимайте важных решений.", impact: "challenging" },
  "8_trine_0": { brief: "Творческое вдохновение и духовный рост.", impact: "positive" },
  "8_conjunction_1": { brief: "Усиленная интуиция и эмпатия. Медитируйте.", impact: "positive" },
  "8_conjunction_3": { brief: "Идеализация в любви. Красиво, но проверяйте реальность.", impact: "neutral" },
  "8_conjunction_8": { brief: "Период переосмысления: то, что казалось важным, может потерять значение — это нормально.", impact: "neutral" },

  // === Плутон transits ===
  "9_conjunction_0": { brief: "Глубокая трансформация личности. Старое уходит, новое рождается.", impact: "challenging" },
  "9_square_0": { brief: "Борьба за контроль. Отпустите то, что не можете изменить.", impact: "challenging" },
  "9_trine_0": { brief: "Внутренняя сила и способность к глубоким переменам.", impact: "positive" },
  "9_conjunction_1": { brief: "Интенсивные эмоции. Трансформация на глубинном уровне.", impact: "challenging" },
  "9_conjunction_3": { brief: "Отношения проходят через обновление. Поверхностное отпадает, настоящее углубляется.", impact: "challenging" },
  "9_square_3": { brief: "Власть и контроль в отношениях. Учитесь отпускать.", impact: "challenging" },
  "9_trine_3": { brief: "Глубокие, трансформирующие связи. Отношения выходят на новый уровень.", impact: "positive" },

  // === Луна transits (daily) ===
  "1_conjunction_0": { brief: "Эмоциональный фокус на себе. Прислушайтесь к своим потребностям.", impact: "positive" },
  "1_conjunction_1": { brief: "Эмоциональное обновление. Хороший день для самоанализа.", impact: "positive" },
  "1_conjunction_5": { brief: "Интуиция работает на вас — доверяйте ей при выборе.", impact: "positive" },
  "1_trine_0": { brief: "Гармоничный день. Эмоции и воля в согласии.", impact: "positive" },
  "1_square_0": { brief: "Внутреннее напряжение. Не принимайте решений на эмоциях.", impact: "challenging" },
  "1_opposition_0": { brief: "Баланс между чувствами и разумом. Слушайте обе стороны.", impact: "neutral" },
  "1_conjunction_4": { brief: "Эмоции толкают к действию. Канализируйте энергию продуктивно.", impact: "neutral" },
  "1_conjunction_3": { brief: "Чувственный день. Хорошо для романтики и творчества.", impact: "positive" },
};

// ===== House → Life Category mapping =====
export const HOUSE_CATEGORY: Record<number, LifeCategory> = {
  1: "health",
  2: "finance",
  3: "career", // communication/learning
  4: "spiritual", // home/roots
  5: "love", // romance/creativity
  6: "health",
  7: "love", // partnerships
  8: "finance", // shared resources
  9: "spiritual", // philosophy/travel
  10: "career",
  11: "career", // community/goals
  12: "spiritual", // subconscious
};

// ===== Category display info =====
export const CATEGORY_INFO: Record<LifeCategory, { icon: string; title: { ru: string; en: string } }> = {
  love: { icon: "", title: { ru: "Любовь", en: "Love" } },
  finance: { icon: "", title: { ru: "Финансы", en: "Finances" } },
  health: { icon: "", title: { ru: "Здоровье", en: "Health" } },
  career: { icon: "", title: { ru: "Карьера", en: "Career" } },
  spiritual: { icon: "", title: { ru: "Духовность", en: "Spirituality" } },
};

// ===== Moon in Sign descriptions =====
export const MOON_IN_SIGN: Record<string, string> = {
  "Овен": "Энергичный и импульсивный день. Хорош для начинаний и решительных действий.",
  "Телец": "День стабильности и удовольствий. Хорошо для финансов, еды, природы.",
  "Близнецы": "День общения и информации. Много контактов и разговоров.",
  "Рак": "Эмоциональный день. Фокус на доме, семье, заботе о себе.",
  "Лев": "Творческий и яркий день. Самовыражение и развлечения.",
  "Дева": "День порядка и деталей. Хорош для планирования и здоровья.",
  "Весы": "День гармонии и партнёрства. Хорошо для отношений и переговоров.",
  "Скорпион": "Интенсивный день. Глубокие эмоции и трансформация.",
  "Стрелец": "Оптимистичный день. Путешествия, учёба, расширение горизонтов.",
  "Козерог": "Серьёзный и деловой день. Хорош для карьеры и долгосрочных планов.",
  "Водолей": "День инноваций и свободы. Нестандартные решения и дружба.",
  "Рыбы": "Интуитивный и мечтательный день. Медитация, творчество, духовные практики.",
};

export const MOON_IN_SIGN_EN: Record<string, string> = {
  "Aries": "An energetic and impulsive day. Great for new beginnings and decisive action.",
  "Taurus": "A day of stability and pleasure. Good for finances, food, and nature.",
  "Gemini": "A day of communication and information. Lots of contacts and conversations.",
  "Cancer": "An emotional day. Focus on home, family, and self-care.",
  "Leo": "A creative and vibrant day. Self-expression and entertainment.",
  "Virgo": "A day of order and detail. Good for planning and health.",
  "Libra": "A day of harmony and partnership. Good for relationships and negotiations.",
  "Scorpio": "An intense day. Deep emotions and transformation.",
  "Sagittarius": "An optimistic day. Travel, learning, expanding horizons.",
  "Capricorn": "A serious and business-like day. Good for career and long-term plans.",
  "Aquarius": "A day of innovation and freedom. Unconventional solutions and friendship.",
  "Pisces": "An intuitive and dreamy day. Meditation, creativity, spiritual practices.",
};

// ===== Aspect names =====
export const ASPECT_NAMES: Record<string, { ru: string; en: string; symbol: string }> = {
  conjunction: { ru: "Соединение", en: "Conjunction", symbol: "☌" },
  sextile: { ru: "Секстиль", en: "Sextile", symbol: "⚹" },
  square: { ru: "Квадратура", en: "Square", symbol: "□" },
  trine: { ru: "Тригон", en: "Trine", symbol: "△" },
  opposition: { ru: "Оппозиция", en: "Opposition", symbol: "☍" },
};

// ===== Day tags based on dominant categories =====
export const CATEGORY_TO_TAGS: Record<LifeCategory, DayTag[]> = {
  love: ["любовь", "творчество"],
  finance: ["деньги", "решения"],
  health: ["здоровье", "отдых"],
  career: ["карьера", "действия"],
  spiritual: ["интуиция", "отдых"],
};

// ===== Weekday names =====
export const WEEKDAY_NAMES_RU = [
  "Воскресенье", "Понедельник", "Вторник", "Среда",
  "Четверг", "Пятница", "Суббота",
];

export const WEEKDAY_NAMES_EN = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

// ===== Month names (genitive) =====
export const MONTH_NAMES_RU_GEN = [
  "", "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

export const MONTH_NAMES_EN = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
