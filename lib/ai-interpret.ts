import OpenAI from "openai";
import type { Transit, DayTag } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 55000,   // 55s hard cap
  maxRetries: 0,    // fail fast, return fallback
});

// ===== Cache =====
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T;
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
  if (cache.size > 200) {
    const cutoff = Date.now() - CACHE_TTL;
    for (const [k, v] of cache) {
      if (v.ts < cutoff) cache.delete(k);
    }
  }
}

// ===== System Prompts (Tone of Voice) =====

export type ToneOfVoice = "direct" | "deep" | "friendly";

const SHARED_RULES = (lang: string) => `
ЖЁСТКИЕ ЗАПРЕТЫ:
- НИКОГДА не описывай «энергию дня/недели» абстрактно — говори что КОНКРЕТНО делать
- НИКОГДА не начинай с приветствий
- НИКОГДА не используй астрологический жаргон: квадратура, тригон, секстиль, аспект, оппозиция, соединение, транзит, натальный, ретроград
- НИКОГДА не упоминай названия планет
- НЕ описывай — побуждай к действию
- НЕ повторяй мысли разными словами
- НЕ будь банальной. Если совет подходит любому человеку в любой день — удали его
- ЗАПРЕЩЕНЫ ИИ-конструкции с пояснением через запятую: «Сделай до конца, без отвлечений», «Работа головой, не частями», «Действуй, но осторожно». Пиши нормальными человеческими предложениями. Каждая мысль — отдельное предложение

АУДИТОРИЯ:
- Пользователи 16-40 лет. Не все бизнесмены. Пиши так, чтобы было понятно и 17-летней девочке, и 35-летнему мужчине.
- НЕ используй деловую лексику: «результат», «договор», «сделка», «контракт», «партнёр по бизнесу», «закрой хвосты», «письмо», «проект», «дедлайн», «встреча» — если контекст не требует
- Пиши про ЖИЗНЬ, а не про работу: отношения, самочувствие, внутренние конфликты, привычки, смелость, честность с собой

ФОРМАТ:
- Отвечай ТОЛЬКО валидным JSON. Без markdown, без комментариев.
${lang === "en" ? "- CRITICAL: ALL text content in your JSON response MUST be in ENGLISH. The instructions above are in Russian for context only — your output must be entirely in English." : "- Язык ответа: Русский."}`;

const TONE_DIRECT = (lang: string) => `Ты — Divina. Не астролог-комментатор, а голос, который говорит человеку то, что он ДОЛЖЕН услышать сегодня.

ГЛАВНЫЙ ПРИНЦИП:
Ты не описываешь что происходит — ты говоришь человеку что ДЕЛАТЬ. Не «энергия дня растёт», а «хватит откладывать — сегодня тот самый день». Не «решения становятся острее», а «тот разговор, который ты избегал — начни его сейчас».

ГОЛОС И СТИЛЬ:
- Говори как человек, который знает тебя лучше, чем ты сам. Прямо, без обёрток.
- Обращайся на «ты». Короткие, рубленые предложения.
- Указывай на слабые места: откладывание, страхи, зона комфорта, повторение ошибок. Но без грубости — с уважением.
- Чередуй прямоту с поддержкой: «Да, это страшно. Но ты справишься — ты уже через худшее проходил».
- Пиши так, будто знаешь секрет человека и мягко на него указываешь.
- НЕ пиши как коуч: «рекомендуется», «благоприятный», «гармония», «баланс», «потенциал»

ПРИМЕРЫ ПРАВИЛЬНОГО ТОНА:
✓ «Делай что должен. Перестань ждать идеальный момент или подходящее настроение.»
✓ «Тот разговор, которого ты избегаешь, та привычка, от которой пора избавиться — разберись с этим сегодня.»
✓ «Не проси разрешения жить так, как хочешь. Ты не обязан объяснять свои решения.»

ПРИМЕРЫ НЕПРАВИЛЬНОГО ТОНА (так НЕ пиши):
✗ «Энергия дня благоприятна для новых начинаний»
✗ «Неделя предлагает чередование активных и спокойных дней»
${SHARED_RULES(lang)}`;

const TONE_DEEP = (lang: string) => `Ты — Divina. Мудрый, тёплый голос, который помогает человеку увидеть себя глубже — и почувствовать, что его жизнь имеет смысл, направление и силу.

ГЛАВНЫЙ ПРИНЦИП:
Ты не описываешь что происходит — ты помогаешь человеку ПОНЯТЬ себя и действовать осознанно. Каждое слово — как зеркало для души. Ты видишь глубже, чем человек сам, и с теплом указываешь на суть.

Твой текст должен вдохновлять — не пустыми словами, а точными. Человек должен дочитать и почувствовать: «да, это про меня» — и что-то внутри сдвинется.

ГОЛОС И СТИЛЬ:
- Мягкий, поддерживающий, эмпатичный. Как мудрый наставник, которому доверяешь.
- Обращайся на «ты». Спокойные, вдумчивые предложения. Иногда — короткий, сильный удар.
- Признавай дискомфорт: «это нормально», «это часть пути», «ты не один в этом».
- Сложное преподноси как трансформацию и рост — с достоинством, не со страхом.
- Вдохновляй через правду. Не через лесть. Покажи человеку, что он сильнее, чем думает — но через конкретное, узнаваемое.
- Иногда давай ощущение масштаба: этот момент — часть чего-то большего, твоей истории.
- Глубокий самоанализ — помогай человеку увидеть паттерны и скрытые мотивы.
- НЕ будь елейным. Не обещай что «всё будет хорошо». Говори правду — но с заботой и огнём.

ПРИМЕРЫ ПРАВИЛЬНОГО ТОНА:
✓ «Сегодня ты можешь заметить, как привычная реакция снова пытается взять верх. Это не слабость — это узнавание паттерна. А узнавание — первый шаг к свободе от него.»
✓ «Если внутри что-то сопротивляется — не гони это чувство. Оно пришло не мешать, а показать, что пора отпустить старое. И за этим отпусканием — что-то твоё, настоящее.»
✓ «Ты в точке, где старое уже не работает, а новое ещё не оформилось. Это не тупик. Это именно то место, откуда начинается что-то настоящее.»
✓ «Ты уже прошёл через то, что казалось невозможным. Сегодня — не исключение. Просто ещё один шаг вперёд.»

ПРИМЕРЫ НЕПРАВИЛЬНОГО ТОНА (так НЕ пиши):
✗ «Всё будет замечательно, просто верь!»
✗ «Энергия дня благоприятна для новых начинаний»
✗ «Вселенная готовит тебе подарок»
${SHARED_RULES(lang)}`;

const TONE_FRIENDLY = (lang: string) => `Ты — Divina. Как близкий друг, который хорошо тебя знает — и умеет одновременно говорить по делу и поддержать.

ГЛАВНЫЙ ПРИНЦИП:
Ты не описываешь что происходит — ты даёшь практичный совет с теплотой, как друг за чашкой кофе. Без менторства, без пафоса. Просто и понятно. И при этом — вдохновляешь. Не пустыми словами, а конкретным «ты это можешь».

ГОЛОС И СТИЛЬ:
- Разговорный, тёплый, на равных. Используй «слушай», «понимаешь», «вот в чём дело», «знаешь что».
- Обращайся на «ты». Живые, разговорные предложения.
- Поддерживай по-настоящему — не дежурными фразами, а конкретным признанием: «ты справлялся и с более сложным», «это не значит что ты застрял», «один шаг — это уже движение».
- Нейтральный по гендеру. Никаких «девочка», «красотка», «боец».
- Лёгкий реализм и практичность. Без драмы, без сахара — но с верой в человека.
- Если ситуация сложная — признай это честно, и сразу покажи выход или опору.

ПРИМЕРЫ ПРАВИЛЬНОГО ТОНА:
✓ «Слушай, сегодня хороший день чтобы разобраться с тем, что ты откладывал. Не обязательно всё сразу — начни с одного дела. Ты увидишь, как сразу станет легче.»
✓ «Знаешь что, иногда лучше просто сказать «нет» и не объяснять почему. Сегодня как раз такой день. И это не слабость — это уважение к себе.»
✓ «Вот в чём дело: ты уже знаешь ответ. Просто пока не решился его принять. Но ты справлялся и с более сложным — справишься и с этим.»
✓ «Небольшой прогресс сегодня лучше, чем идеальный план завтра. Сделай один шаг — и посмотри, куда он приведёт.»

ПРИМЕРЫ НЕПРАВИЛЬНОГО ТОНА (так НЕ пиши):
✗ «Энергия дня благоприятна для новых начинаний»
✗ «Я обнимаю тебя и верю в тебя, девочка!»
✗ «Неделя предлагает чередование активных и спокойных дней»
${SHARED_RULES(lang)}`;

export function getSystemPrompt(tone: ToneOfVoice = "deep", lang: string = "ru"): string {
  switch (tone) {
    case "direct": return TONE_DIRECT(lang);
    case "friendly": return TONE_FRIENDLY(lang);
    case "deep":
    default: return TONE_DEEP(lang);
  }
}

// ===== Daily Forecast =====

interface DailyAIInput {
  date: string;
  weekday: string;
  moonSign: string;
  moonPhase: string;
  moonPercent: number;
  transits: Transit[];
  sunSign: string;
  ascendant: string;
}

export interface DailyAIResult {
  energy: string;
  summary: string;
  doList: string[];
  dontList: string[];
  advice: string;
  affirmation: string;
  categories: {
    love: { rating: number; brief: string; detailed: string };
    finance: { rating: number; brief: string; detailed: string };
    health: { rating: number; brief: string; detailed: string };
    career: { rating: number; brief: string; detailed: string };
    spiritual: { rating: number; brief: string; detailed: string };
  };
  transitBriefs: string[];
}

export async function interpretDaily(input: DailyAIInput, tone: ToneOfVoice = "deep", lang: string = "ru"): Promise<DailyAIResult> {
  const cacheKey = `daily_${input.date}_${tone}_${lang}`;
  const cached = getCached<DailyAIResult>(cacheKey);
  if (cached) return cached;

  const transitsDesc = input.transits.map((t, i) =>
    `${i + 1}. ${t.transitPlanet} ${t.aspect} ${t.natalPlanet} — влияние: ${t.impact === "positive" ? "позитивное" : t.impact === "challenging" ? "напряжённое" : "нейтральное"}`
  ).join("\n");

  const userPrompt = `Скажи человеку что ему нужно услышать сегодня.

ВХОДНЫЕ ДАННЫЕ (не упоминай их напрямую — используй как контекст):
Дата: ${input.date} (${input.weekday})
Луна: ${input.moonSign}, фаза: ${input.moonPhase} (${input.moonPercent}%)
Знак: ${input.sunSign}, Асцендент: ${input.ascendant}
Планетарные влияния:
${transitsDesc || "Нет значимых влияний — спокойный день."}

ВЕРНИ JSON:
{
  "energy": "(120-200 символов) Не описывай энергию — скажи человеку правду о том, что ему нужно сделать/понять/отпустить сегодня. Прямо, в лоб, без обёрток. Пример: 'Хватит прокрастинировать. Тот список дел, который ты игнорируешь неделю — открой его и сделай хотя бы первый пункт. Остальное пойдёт легче.'",
  "summary": "(до 60 символов) Короткий пинок или истина дня. Пример: 'Хватит ждать — действуй' или 'Сегодня ты сильнее, чем думаешь'.",
  "doList": ["(3 пункта, каждый 40-70 символов) Конкретные действия-вызовы про ЖИЗНЬ — не про работу/бизнес. Пиши нормальным языком. Каждый пункт — одно чистое предложение без уточнений через запятую. НЕ 'Позвони тому, кто ждёт', А 'Позвони тому человеку, которому давно хотел'. НЕ 'Сделай главное, без оглядки', А 'Скажи вслух то, что молчишь уже неделю'."],
  "dontList": ["(3 пункта, каждый 40-70 символов) Прямые запреты. Нормальный язык. Без конструкций 'Не X, а Y' через запятую. НЕ 'Не скрывай, проговори', А 'Не листай соцсети вместо того, чтобы жить'. НЕ 'Не жди идеала, действуй', А 'Не оправдывай свою лень усталостью'."],
  "advice": "(80-120 символов) Не совет, а правда в лицо с заботой. Пример: 'Ты знаешь ответ. Просто боишься его принять. Но сегодня — самое время.'",
  "affirmation": "(до 80 символов) Мощная, дерзкая. Пример: 'Я не прошу разрешения жить так, как хочу'.",
  "categories": {
    "love": { "rating": 1-5, "brief": "(до 80 символов) Что в отношениях сегодня", "detailed": "(120-180 символов) Подробнее — конкретика, что делать" },
    "finance": { "rating": 1-5, "brief": "(до 80 символов)", "detailed": "(120-180 символов)" },
    "health": { "rating": 1-5, "brief": "(до 80 символов)", "detailed": "(120-180 символов)" },
    "career": { "rating": 1-5, "brief": "(до 80 символов)", "detailed": "(120-180 символов)" },
    "spiritual": { "rating": 1-5, "brief": "(до 80 символов)", "detailed": "(120-180 символов)" }
  },
  "transitBriefs": ["(ровно ${input.transits.length} штук, каждый 60-100 символов) Для каждого планетарного влияния — что оно означает для жизни. БЕЗ названий планет. Пример: 'Период, когда дела продвигаются медленнее — терпение окупится' вместо 'Сатурн на Марсе замедляет'."]
}

ПРАВИЛА РЕЙТИНГОВ:
- Позитивное влияние → +1 к рейтингу связанной сферы
- Напряжённое влияние → -1 к рейтингу связанной сферы
- Базовый рейтинг = 3, диапазон 1-5`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: getSystemPrompt(tone, lang) },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_completion_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(text) as DailyAIResult;

    if (!result.doList?.length) result.doList = [lang === "en" ? "Follow your usual rhythm and trust your intuition" : "Следуй привычному ритму и доверяй интуиции"];
    if (!result.dontList?.length) result.dontList = [lang === "en" ? "Don't overwork yourself" : "Не перенапрягайся"];
    if (!result.transitBriefs) result.transitBriefs = input.transits.map(() => "");

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error("AI daily interpretation failed:", err);
    return getFallbackDaily(input, lang);
  }
}

function getFallbackDaily(input: DailyAIInput, lang: string = "ru"): DailyAIResult {
  if (lang === "en") {
    return {
      energy: `The Moon in ${input.moonSign} sets the mood today. ${input.moonPhase} — time to listen to yourself and act thoughtfully.`,
      summary: "A calm day — trust your intuition",
      doList: ["Finish what you started", "Spend time with loved ones", "Take a walk outside"],
      dontList: ["Don't make impulsive decisions", "Don't overwork yourself", "Don't start big projects"],
      advice: "Trust yourself and don't rush things. Everything is unfolding as it should.",
      affirmation: "I am on the right path and I trust my inner voice",
      categories: {
        love: { rating: 3, brief: "A calm day in relationships.", detailed: "Pay attention to loved ones. A good day for warm conversations and care." },
        finance: { rating: 3, brief: "A stable period for finances.", detailed: "Not the best time for big spending, but good for budget planning." },
        health: { rating: 3, brief: "Watch your energy levels.", detailed: "Don't overexert yourself. A walk or light exercise would help." },
        career: { rating: 3, brief: "A routine work day.", detailed: "Finish current tasks. Not the best moment for drastic changes." },
        spiritual: { rating: 4, brief: "Good time for self-reflection.", detailed: "Meditation or journaling will help you hear yourself and set priorities." },
      },
      transitBriefs: input.transits.map(() => ""),
    };
  }
  return {
    energy: `Луна в ${input.moonSign} задаёт настроение дня. ${input.moonPhase} — время прислушаться к себе и действовать обдуманно.`,
    summary: "Спокойный день — следуй интуиции",
    doList: ["Заверши начатые дела", "Удели время близким", "Прогуляйся на свежем воздухе"],
    dontList: ["Не принимай импульсивных решений", "Не перенапрягайся", "Не начинай крупных проектов"],
    advice: "Доверяй себе и не торопи события. Всё идёт так, как нужно.",
    affirmation: "Я на правильном пути и доверяю своему внутреннему голосу",
    categories: {
      love: { rating: 3, brief: "Спокойный день в отношениях.", detailed: "Удели внимание близким. Хороший день для тёплого общения и заботы." },
      finance: { rating: 3, brief: "Стабильный период для финансов.", detailed: "Не лучшее время для крупных трат, но хорошо для планирования бюджета." },
      health: { rating: 3, brief: "Следи за уровнем энергии.", detailed: "Не перенапрягайся. Прогулка или лёгкая зарядка будут кстати." },
      career: { rating: 3, brief: "Рутинный рабочий день.", detailed: "Завершай текущие задачи. Не лучший момент для кардинальных перемен." },
      spiritual: { rating: 4, brief: "Хорошее время для саморефлексии.", detailed: "Медитация или ведение дневника помогут услышать себя и расставить приоритеты." },
    },
    transitBriefs: input.transits.map(() => ""),
  };
}

// ===== Weekly Forecast =====

interface WeeklyAIInput {
  weekLabel: string;
  days: {
    date: string;
    weekday: string;
    moonSign: string;
    moonPhase: string;
    energy: "high" | "medium" | "low";
    transits: Transit[];
  }[];
  sunSign: string;
  ascendant: string;
}

export interface WeeklyAIResult {
  overview: string;
  weeklyAdvice: string;
  days: {
    headline: string;
    doList: string[];
    dontList: string[];
    tags: DayTag[];
  }[];
  bestDayFor: Record<string, { day: string; why: string }>;
}

export async function interpretWeekly(input: WeeklyAIInput, tone: ToneOfVoice = "deep", lang: string = "ru"): Promise<WeeklyAIResult> {
  const cacheKey = `weekly_v2_${input.days[0]?.date}_${tone}_${lang}`;
  const cached = getCached<WeeklyAIResult>(cacheKey);
  if (cached) return cached;

  const daysDesc = input.days.map((d) => {
    const transits = d.transits.slice(0, 3).map((t) =>
      `${t.transitPlanet} ${t.aspect} ${t.natalPlanet} (${t.impact === "positive" ? "+" : t.impact === "challenging" ? "−" : "~"})`
    ).join("; ");
    return `${d.weekday}: Луна в ${d.moonSign}, ${d.moonPhase}, энергия ${d.energy}. Влияния: ${transits || "—"}`;
  }).join("\n");

  const userPrompt = `Скажи человеку что его ждёт на этой неделе — прямо, без обёрток.

ВХОДНЫЕ ДАННЫЕ (не упоминай напрямую — используй как контекст):
Неделя: ${input.weekLabel}
Знак: ${input.sunSign}, Асцендент: ${input.ascendant}
${daysDesc}

ВЕРНИ JSON:
{
  "overview": "(700-1000 символов, 2-3 абзаца) История этой недели — не описание 'энергии', а живой рассказ о том, что тебя ждёт и почему это важно именно сейчас. Структура: первый абзац — главный вызов или тема недели, конкретно и прямо, как это коснётся жизни, отношений, внутреннего состояния. Второй абзац — что происходит в середине недели, поворот или возможность, которую легко пропустить. Третий абзац — к чему прийти к концу недели, что останется с тобой. Пиши как друг, который видит тебя насквозь. Про жизнь, не про астрологию. Без слова 'энергия'. Пример стиля: 'Эта неделя начинается с вопроса, который ты давно откладывал. Не из тех вопросов, что задаёт кто-то снаружи — а из тех, что живёт внутри и тихо ждёт. Ты знаешь, о чём речь. Первые дни могут быть немного напряжёнными — не потому что всё плохо, а потому что ты стал честнее с собой.\n\nГде-то в среду или четверг что-то сдвинется. Появится человек, разговор или момент тишины, в котором придёт ответ. Не гони это — просто будь открытым. Иногда неделя даёт именно то, что нужно, а не то, что ты планировал.\n\nК выходным у тебя будет больше ясности, чем в начале. Это не обещание лёгкой недели — это обещание нужной.'",
  "weeklyAdvice": "(100-160 символов) Одна фраза-пинок на всю неделю. Не 'будь гибким', а 'Перестань подстраиваться под всех. На этой неделе ставь себя на первое место.'",
  "days": [
    {
      "headline": "(40-70 символов) Пинок дня, не описание. Пример: 'Скажи наконец то, что молчишь' или 'Не трогай телефон до обеда'.",
      "doList": ["(2-3 пункта, 40-60 символов каждый) Конкретные вызовы про ЖИЗНЬ. Пиши нормальным языком, одна мысль на предложение. НЕ 'Напиши сообщение, без объяснений', А 'Напиши тому, с кем давно не общался'. НЕ 'Сделай до конца, без отвлечений', А 'Доведи хотя бы одно дело до конца'."],
      "dontList": ["(1-2 пункта, 40-60 символов каждый) Так же: нормальный язык, без пояснений через запятую"],
      "tags": ["1-3 из: деньги, решения, любовь, действия, карьера, отдых, интуиция, творчество, здоровье, осторожно"]
    }
  ],
  "bestDayFor": {
    "love": { "day": "среда", "why": "Хорошее время открыться близким" },
    "finances": { "day": "четверг", "why": "Момент для важных финансовых шагов" }
  }
}

Замени ключи "love" и "finances" на те, что реально отражают данные недели. Возможные ключи: decisions, love, newProjects, rest, finances, health, creativity, selfCare, communication, boundaries, adventure, learning.

ПРАВИЛА:
- "days" — ровно 7 элементов, каждый день должен ОТЛИЧАТЬСЯ
- Не описывай дни — давай вызовы и задания на каждый день
- headline — как SMS от друга, который верит в тебя больше, чем ты сам
- НЕ ИСПОЛЬЗУЙ деловую лексику: «результат», «договор», «сделка», «закрой хвосты», «письмо», «проект», «дедлайн». Пиши про жизнь, не про офис
- ЗАПРЕЩЕНЫ конструкции с уточнением через запятую: «Сделай X, без Y», «Действуй, но Z». Каждая мысль — отдельное чистое предложение

ПРАВИЛА bestDayFor:
- Генерируй ТОЛЬКО те категории, для которых РЕАЛЬНО есть подтверждение в данных (транзиты, энергия дней)
- Если данные говорят только про 3 темы — верни 3. Если про 8 — верни 8. Не натягивай
- Возможные ключи (но не обязательно все): decisions, love, newProjects, rest, finances, health, creativity, selfCare, communication, boundaries, adventure, learning — или СВОИ если тема подходит
- НЕ вставляй категорию «для галочки» если реальных данных нет
- bestDayFor.why — конкретно, без названий планет, нормальным языком`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: getSystemPrompt(tone, lang) },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_completion_tokens: 3800,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(text) as WeeklyAIResult;

    while (result.days && result.days.length < 7) {
      result.days.push({
        headline: lang === "en" ? "A calm day — follow your rhythm" : "Спокойный день — следуй своему ритму",
        doList: [lang === "en" ? "Follow your usual routine" : "Следуй привычному распорядку"],
        dontList: [lang === "en" ? "Don't rush" : "Не торопись"],
        tags: ["отдых" as DayTag],
      });
    }

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error("AI weekly interpretation failed:", err);
    return getFallbackWeekly(input, lang);
  }
}

// ===== Natal Chart Deep Interpretation =====

interface NatalDeepInput {
  planets: { name: string; sign: string; house?: number }[];
  aspects: { planet1: string; aspect: string; planet2: string }[];
  sunSign: string;
  moonSign: string;
  ascendant: string;
}

export interface NatalDeepSection {
  title: string;
  text: string;
}

const NATAL_SECTIONS = [
  { key: "conflicts", title: "Как поступать в конфликтах", context: "Марс, его знак, дом и аспекты" },
  { key: "love", title: "Как любить и быть любимым", context: "Венера, 7-й дом, аспекты Венеры" },
  { key: "choices", title: "Как делать правильный выбор", context: "Меркурий, его знак и аспекты" },
  { key: "doubts", title: "Когда сомневаешься", context: "Луна, Нептун, их аспекты" },
  { key: "friends", title: "Дружба и окружение", context: "11-й дом, планеты в нём" },
  { key: "career", title: "Карьера и призвание", context: "MC, 10-й дом, Сатурн" },
  { key: "money", title: "Деньги и ресурсы", context: "2-й дом, Юпитер, Венера" },
];

export async function interpretNatalDeep(input: NatalDeepInput, tone: ToneOfVoice = "deep", lang: string = "ru"): Promise<NatalDeepSection[]> {
  const cacheKey = `natal_deep_v4_${input.sunSign}_${input.ascendant}_${input.moonSign}_${tone}_${lang}`;
  const cached = getCached<NatalDeepSection[]>(cacheKey);
  if (cached) return cached;

  const planetsDesc = input.planets.map(p =>
    `${p.name} в ${p.sign}${p.house ? ` (${p.house}-й дом)` : ""}`
  ).join(", ");

  const aspectsDesc = input.aspects.slice(0, 15).map(a =>
    `${a.planet1} ${a.aspect} ${a.planet2}`
  ).join(", ");

  const chartBlock = `КАРТА:
Солнце: ${input.sunSign}, Луна: ${input.moonSign}, Асцендент: ${input.ascendant}
Планеты: ${planetsDesc}
Аспекты: ${aspectsDesc}`;

  const rules = `ПРАВИЛА:
- Говори как Divina — прямо, с заботой и вдохновением
- Без названий планет и астрологического жаргона в текстах
- Обращайся на «ты»
- Каждый раздел — это захватывающее чтение, не справочник
- Предложения разной длины, живой ритм, органичные переходы между абзацами
- Вдохновляй через точные детали, которые человек узнаёт в себе — не через клише
- НЕ перечисляй — рассказывай историю с конкретными примерами как ведёт себя этот человек`;

  function buildSectionsPrompt(sections: typeof NATAL_SECTIONS, startIndex: number): string {
    return sections.map((s, i) =>
      `${startIndex + i + 1}. "${s.title}" — на основе: ${s.context}. Текст 900-1200 символов — глубокое вдохновляющее эссе. 3-4 абзаца. Структура: сначала кто этот человек в этой теме (как он устроен), потом его сильные стороны с конкретными примерами как это проявляется, потом зоны роста — что даётся труднее и через какие уроки, потом практический вывод — что делать прямо сейчас. Пиши про жизнь и отношения — не про астрологию.`
    ).join("\n");
  }

  const sectionsA = NATAL_SECTIONS.slice(0, 4);
  const sectionsB = NATAL_SECTIONS.slice(4);

  const userPromptA = `Дай глубокую расшифровку натальной карты по ${sectionsA.length} темам жизни.

${chartBlock}

ВЕРНИ JSON:
{
  "sections": [
    { "title": "...", "text": "..." }
  ]
}

${sectionsA.length} РАЗДЕЛОВ:
${buildSectionsPrompt(sectionsA, 0)}

${rules}`;

  const userPromptB = `Дай глубокую расшифровку натальной карты по ${sectionsB.length} темам жизни.

${chartBlock}

ВЕРНИ JSON:
{
  "sections": [
    { "title": "...", "text": "..." }
  ]
}

${sectionsB.length} РАЗДЕЛОВ:
${buildSectionsPrompt(sectionsB, 4)}

${rules}`;

  const systemPrompt = getSystemPrompt(tone, lang);

  async function fetchA(): Promise<NatalDeepSection[]> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPromptA },
      ],
      temperature: 0.7,
      max_completion_tokens: 4500,
      response_format: { type: "json_object" },
    });
    const text = response.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(text);
    return (result.sections || []).map((s: { title: string; text: string }, i: number) => ({
      title: s.title || sectionsA[i]?.title || `Раздел ${i + 1}`,
      text: s.text || "",
    }));
  }

  async function fetchB(): Promise<NatalDeepSection[]> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPromptB },
      ],
      temperature: 0.7,
      max_completion_tokens: 3500,
      response_format: { type: "json_object" },
    });
    const text = response.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(text);
    return (result.sections || []).map((s: { title: string; text: string }, i: number) => ({
      title: s.title || sectionsB[i]?.title || `Раздел ${i + 5}`,
      text: s.text || "",
    }));
  }

  try {
    const [resultA, resultB] = await Promise.all([fetchA(), fetchB()]);
    const sections: NatalDeepSection[] = [...resultA, ...resultB];

    // Ensure 7 sections with empty fallback (UI handles empty with loading skeleton)
    while (sections.length < 7) {
      const idx = sections.length;
      sections.push({
        title: NATAL_SECTIONS[idx]?.title || (lang === "en" ? `Section ${idx + 1}` : `Раздел ${idx + 1}`),
        text: "",
      });
    }

    setCache(cacheKey, sections);
    return sections;
  } catch (err) {
    console.error("AI natal deep interpretation failed:", err);
    return NATAL_SECTIONS.map(s => ({
      title: s.title,
      text: "",
    }));
  }
}

// ===== Compatibility Interpretation =====

interface CompatibilityAIInput {
  user: { sunSign: string; moonSign: string; planets: { name: string; sign: string }[] };
  partner: { sunSign: string; moonSign: string; planets: { name: string; sign: string }[] };
  synastryAspects: { planet1: string; planet2: string; aspect: string }[];
}

export interface CompatibilityAIResult {
  overallPercent: number;
  categories: { name: string; percent: number; description: string }[];
  essence: string;
  keywords: string[];
  sections: {
    title: string;
    story: string;
  }[];
  summary: string;
}

export async function interpretCompatibility(input: CompatibilityAIInput, tone: ToneOfVoice = "deep", lang: string = "ru"): Promise<CompatibilityAIResult> {
  const aspectsDesc = input.synastryAspects.slice(0, 12).map(a =>
    `${a.planet1}(1) ${a.aspect} ${a.planet2}(2)`
  ).join(", ");

  const userPrompt = lang === "en"
    ? `Analyze the compatibility of two people based on their natal charts. Write directly to the reader (YOU) about how these two types of people interact in real life.

PERSON 1 (reader): Sun ${input.user.sunSign}, Moon ${input.user.moonSign}
Planets: ${input.user.planets.map(p => `${p.name} in ${p.sign}`).join(", ")}

PERSON 2 (partner): Sun ${input.partner.sunSign}, Moon ${input.partner.moonSign}
Planets: ${input.partner.planets.map(p => `${p.name} in ${p.sign}`).join(", ")}

Synastry aspects: ${aspectsDesc || "none significant"}

RETURN JSON:
{
  "overallPercent": number 40-95,
  "categories": [
    { "name": "Love", "percent": number, "description": "(80-150 chars) specific insight" },
    { "name": "Emotions", "percent": number, "description": "..." },
    { "name": "Intellect", "percent": number, "description": "..." },
    { "name": "Values", "percent": number, "description": "..." },
    { "name": "Passion", "percent": number, "description": "..." }
  ],
  "essence": "(5-10 words) the core of this couple",
  "keywords": ["3-5 keywords describing the pair"],
  "sections": [
    {
      "title": "First attraction",
      "story": "(3000-4000 chars) How you and this person perceive each other from the very first moments. What draws you to their personality type and what draws them to yours. How your energies read each other — what clicks instantly and what takes time. What surprises you, what sparks interest, what gives you pause. A concrete psychological analysis of two archetypes meeting."
    },
    {
      "title": "Love and tenderness",
      "story": "(3000-4000 chars) How you express love and how your partner receives it based on your natures. How your partner shows care and whether that matches what you need. Where your love languages align, where they diverge, and how this plays out in real situations. What each of you needs to feel truly loved. How your emotional archetypes interact in intimacy."
    },
    {
      "title": "Emotions and feelings",
      "story": "(3000-4000 chars) How each of you is wired emotionally by nature. How you react to stress, conflict, and joy — and how your partner does. Where your emotional responses resonate and where they create misunderstanding. How you support each other in difficult moments. What happens when one of you shuts down — how the other experiences it. A deep look at the emotional dynamics of this pairing."
    },
    {
      "title": "Values and life goals",
      "story": "(3000-4000 chars) What is fundamentally important to you in life based on your chart, and what matters to your partner. How you both view family, freedom, money, career, and personal growth. Where your priorities align and create a solid foundation. Where they diverge and how that might show up years into the relationship. What you need to discuss early to prevent those differences from becoming sources of disappointment."
    },
    {
      "title": "Passion and attraction",
      "story": "(3000-4000 chars) How strong the physical and sensual attraction is between your two types. What fuels it — which qualities in each other you find irresistible. How your natural energies of desire and attraction interact. What keeps the spark alive long-term for people with your charts. What can extinguish it and how to prevent that. How your passion transforms over time."
    },
    {
      "title": "Conflicts and disagreements",
      "story": "(3000-4000 chars) The typical tension zones between your types — where and why you clash. How you behave in conflict by nature, and how your partner does. What bothers each of you most. How you make up — and what gets in the way. What argument patterns are characteristic of this sign combination. What to change in your approach so conflicts become growth points."
    },
    {
      "title": "Shared growth and potential",
      "story": "(3000-4000 chars) What you gain from this person for your own development — what they teach you, which sides of you they bring out. What your partner gains from you. What lesson this combination holds for you. Where this couple can arrive if both are willing to do the work. What makes this union special and rare. The long-term potential of your relationship."
    }
  ],
  "summary": "(150-300 chars) The essential truth about this couple — direct and honest"
}

RULES:
- Address the reader as "you", refer to the partner as "they" or "your partner"
- No invented scenes or stories ("they met one evening", etc.)
- Write like a real psychological astrologer: analyze archetypes and how they interact
- No planet names or astrological jargon in the text — only the essence
- Each section must be a full, rich read — several paragraphs minimum`
    : `Проанализируй совместимость двух людей по натальным картам. Пиши напрямую читателю (ТЫ) о том, как эти два типа людей взаимодействуют в реальности.

ЧЕЛОВЕК 1 (читатель): Солнце ${input.user.sunSign}, Луна ${input.user.moonSign}
Планеты: ${input.user.planets.map(p => `${p.name} в ${p.sign}`).join(", ")}

ЧЕЛОВЕК 2 (партнёр): Солнце ${input.partner.sunSign}, Луна ${input.partner.moonSign}
Планеты: ${input.partner.planets.map(p => `${p.name} в ${p.sign}`).join(", ")}

Синастрические аспекты: ${aspectsDesc || "нет значимых"}

ВЕРНИ JSON:
{
  "overallPercent": число 40-95,
  "categories": [
    { "name": "Любовь", "percent": число, "description": "(80-150 символов) конкретно" },
    { "name": "Эмоции", "percent": число, "description": "..." },
    { "name": "Интеллект", "percent": число, "description": "..." },
    { "name": "Ценности", "percent": число, "description": "..." },
    { "name": "Страсть", "percent": число, "description": "..." }
  ],
  "essence": "(5-10 слов) суть этой пары",
  "keywords": ["3-5 ключевых слова пары"],
  "sections": [
    {
      "title": "Первое притяжение",
      "story": "(4500-6000 символов) Как ты и этот человек воспринимают друг друга с первых минут. Что в нём притягивает тебя как тип личности, что в тебе притягивает его. Как ваши энергии считывают друг друга — что совпадает мгновенно, а что требует времени. Что вас удивляет, что вызывает интерес, что настораживает. Конкретный психологический анализ двух архетипов при встрече."
    },
    {
      "title": "Любовь и нежность",
      "story": "(4500-6000 символов) Как ты выражаешь любовь и как партнёр воспринимает её исходя из ваших природ. Как партнёр выражает заботу и соответствует ли это тому, что тебе нужно. Где ваши языки любви совпадают, где расходятся и как это проявляется в реальных ситуациях. Что нужно каждому из вас чтобы чувствовать себя любимым. Как ваши эмоциональные архетипы взаимодействуют в близости."
    },
    {
      "title": "Эмоции и чувства",
      "story": "(4500-6000 символов) Как каждый из вас устроен эмоционально по своей природе. Как ты реагируешь на стресс, конфликт, радость — и как реагирует партнёр. Где ваши эмоциональные реакции резонируют, а где создают непонимание. Как вы поддерживаете друг друга в трудные моменты. Что происходит когда один из вас закрывается — как другой это воспринимает. Глубокий разбор эмоциональной динамики этой пары."
    },
    {
      "title": "Ценности и жизненные цели",
      "story": "(4500-6000 символов) Что для тебя фундаментально важно в жизни исходя из твоей карты, и что важно для партнёра. Как вы смотрите на семью, свободу, деньги, карьеру, развитие. Где ваши приоритеты совпадают и создают прочную основу. Где расходятся и как это может проявиться через несколько лет отношений. Что нужно обсуждать заранее чтобы эти расхождения не стали источником разочарования."
    },
    {
      "title": "Страсть и притяжение",
      "story": "(4500-6000 символов) Насколько сильно физическое и чувственное притяжение между вашими типами. Что его питает — какие качества друг друга вы находите притягательными. Как взаимодействуют ваши природные энергии притяжения и желания. Что поддерживает огонь в долгосрочных отношениях для людей с вашими картами. Что может его гасить и как этого не допустить. Как ваша страсть трансформируется со временем."
    },
    {
      "title": "Конфликты и разногласия",
      "story": "(4500-6000 символов) Типичные зоны напряжения между вашими типами — где и почему именно вы расходитесь. Как ты ведёшь себя в конфликте по своей природе, как ведёт себя партнёр. Что больше всего задевает каждого из вас. Как вы миритесь — и что мешает. Какие паттерны ссор характерны для этого сочетания знаков. Что нужно изменить в подходе чтобы конфликты становились точками роста."
    },
    {
      "title": "Общий рост и потенциал",
      "story": "(4500-6000 символов) Что ты получаешь от этого человека для своего развития — чему он тебя учит, какие твои стороны он раскрывает. Что партнёр получает от тебя. Какой урок несёт для тебя это сочетание. К чему может прийти эта пара если оба будут работать над собой. Что делает этот союз особенным и редким. Долгосрочный потенциал ваших отношений."
    }
  ],
  "summary": "(200-400 символов) Главное об этой паре — прямо и честно"
}

ПРАВИЛА:
- Обращайся к читателю на «ты», про партнёра — «он/она» или «партнёр»
- Никаких выдуманных сцен и историй («они встретились», «однажды вечером»)
- Пиши как реальный психолог-астролог: анализ архетипов, как они взаимодействуют
- Без названий планет и астрологических терминов в тексте — только суть
- Каждый раздел — развёрнутый, конкретный, на несколько страниц чтения`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: getSystemPrompt(tone, lang) },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_completion_tokens: 16000,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    return JSON.parse(text) as CompatibilityAIResult;
  } catch (err) {
    console.error("AI compatibility failed:", err);
    return {
      overallPercent: 65,
      categories: [
        { name: "Любовь", percent: 70, description: "Между вами есть потенциал для глубоких чувств, но придётся работать над доверием." },
        { name: "Эмоции", percent: 60, description: "Вы чувствуете по-разному, но это может стать силой, если научитесь слушать друг друга." },
        { name: "Интеллект", percent: 65, description: "Ваши умы работают в разном ритме — это и вызов, и источник роста." },
        { name: "Ценности", percent: 70, description: "Основы совпадают, но в деталях придётся искать компромиссы." },
        { name: "Страсть", percent: 60, description: "Притяжение есть, но ему нужна подпитка — не позволяйте рутине взять верх." },
      ],
      essence: "Два мира, которые учатся понимать друг друга",
      keywords: ["притяжение", "рост", "трение", "глубина"],
      sections: [
        { title: "Первый взгляд", story: "Между вами есть что-то, что сложно объяснить словами с первого раза. Притяжение возникает не сразу — оно нарастает. Первые встречи кажутся случайными, но что-то внутри уже знает: этот человек появился не просто так." },
        { title: "Любовь и нежность", story: "Вы выражаете любовь по-разному, и это может быть как источником недопонимания, так и точкой роста. Один из вас говорит любовь словами, другой — действиями. Когда вы поймёте язык друг друга — всё встанет на своё место." },
        { title: "Эмоции и чувства", story: "Эмоционально вы устроены не одинаково. Один переживает внутри, другой выражает открыто. Это создаёт асимметрию, которая требует внимания — но при честном разговоре превращается в силу." },
        { title: "Ценности и жизненные цели", story: "В главном вы близки — оба ценят честность и глубину. Но в деталях жизненных приоритетов могут быть расхождения. Их важно обсуждать заранее, не откладывая на потом." },
        { title: "Страсть и притяжение", story: "Физическое притяжение между вами есть. Оно не кричит — оно тихое и устойчивое. Чтобы оно не угасло, нужно поддерживать живость: новые впечатления, неожиданные жесты, интерес друг к другу." },
        { title: "Конфликты и разногласия", story: "Конфликты у вас случаются не из-за того, что вы не любите друг друга, а из-за разного темпа и способа реагировать. Один торопит, другой затягивает. Ключ — не кто прав, а как вы выходите из ссоры." },
        { title: "Общий рост", story: "Вместе вы можете стать лучше, чем по отдельности. Этот союз несёт уроки — и их нельзя пропустить. Если оба готовы быть честными и не убегать от трудных разговоров, эта пара способна на что-то настоящее." },
      ],
      summary: "У вас есть база для крепких отношений, но это не тот случай, когда всё складывается само. Придётся разговаривать, уступать и не убегать от сложных тем.",
    };
  }
}

function getFallbackWeekly(input: WeeklyAIInput, lang: string = "ru"): WeeklyAIResult {
  if (lang === "en") {
    const dayTemplatesEn = [
      { headline: "Start clean — one thing at a time", doList: ["Pick the most important task and start it", "Reach out to someone you've been meaning to call"], dontList: ["Don't multitask today"], tags: ["действия" as DayTag] },
      { headline: "Listen more than you talk today", doList: ["Ask a question instead of giving advice", "Spend 10 minutes in silence"], dontList: ["Don't rush into decisions"], tags: ["интуиция" as DayTag] },
      { headline: "Mid-week reset — check in with yourself", doList: ["Review what's working and what isn't", "Do something kind for your body"], dontList: ["Don't push through exhaustion"], tags: ["отдых" as DayTag] },
      { headline: "Something unexpected may surprise you", doList: ["Stay open to a change of plans", "Reach out to an old friend"], dontList: ["Don't cling to the original plan"], tags: ["интуиция" as DayTag] },
      { headline: "The week's turning point — act on it", doList: ["Make that decision you've been postponing", "Have an honest conversation"], dontList: ["Don't avoid what needs to be said"], tags: ["решения" as DayTag] },
      { headline: "Save your energy — you'll need it", doList: ["Rest without guilt", "Do one thing purely for yourself"], dontList: ["Don't overschedule the weekend"], tags: ["отдых" as DayTag] },
      { headline: "End the week with intention", doList: ["Reflect on what you're grateful for", "Set one clear intention for next week"], dontList: ["Don't carry this week's stress into tomorrow"], tags: ["интуиция" as DayTag] },
    ];
    return {
      overview: "The week offers a mix of active and calm days. Use high-energy days for important tasks and quiet ones for recovery.",
      weeklyAdvice: "Be flexible and follow the rhythm of the week. Alternate activity and rest.",
      days: input.days.map((d, i) => {
        const base = dayTemplatesEn[i % dayTemplatesEn.length];
        if (d.energy === "high") return { ...base, tags: ["действия" as DayTag] };
        if (d.energy === "low") return { ...base, headline: "Save your energy — rest is productive too", tags: ["отдых" as DayTag] };
        return base;
      }),
      bestDayFor: {
        decisions: { day: input.days[0]?.weekday ?? "Monday", why: "Start of the week — fresh perspective and clear mind" },
        love: { day: input.days[4]?.weekday ?? "Friday", why: "Good for closeness and warm conversations" },
        newProjects: { day: input.days[0]?.weekday ?? "Monday", why: "Beginning energy supports new ideas" },
        rest: { day: input.days[5]?.weekday ?? "Saturday", why: "Calm energy for recovery" },
        finances: { day: input.days[2]?.weekday ?? "Wednesday", why: "Mid-week — clear view on numbers" },
        health: { day: input.days[3]?.weekday ?? "Thursday", why: "Good time to take care of your body" },
      },
    };
  }
  const dayTemplatesRu = [
    { headline: "Начни чисто — одно дело за раз", doList: ["Выбери самое важное и начни с него", "Напиши тому, кому давно хотел"], dontList: ["Не пытайся сделать всё сразу"], tags: ["действия" as DayTag] },
    { headline: "Сегодня слушай больше, чем говоришь", doList: ["Задай вопрос вместо того, чтобы советовать", "Проведи 10 минут в тишине"], dontList: ["Не торопись с выводами"], tags: ["интуиция" as DayTag] },
    { headline: "Середина недели — проверь себя", doList: ["Оцени, что работает, а что нет", "Сделай что-то доброе для своего тела"], dontList: ["Не гони себя через усталость"], tags: ["отдых" as DayTag] },
    { headline: "Что-то неожиданное может удивить тебя", doList: ["Будь открыт к изменению планов", "Свяжись с кем-то из прошлого"], dontList: ["Не цепляйся за первоначальный план"], tags: ["интуиция" as DayTag] },
    { headline: "Переломный момент недели — действуй", doList: ["Прими то решение, которое откладываешь", "Поговори честно — с собой или с близким"], dontList: ["Не избегай разговора, который давно назрел"], tags: ["решения" as DayTag] },
    { headline: "Береги силы — они тебе ещё понадобятся", doList: ["Отдыхай без вины", "Сделай одно то, что только для тебя"], dontList: ["Не перегружай выходной делами"], tags: ["отдых" as DayTag] },
    { headline: "Завершай неделю осознанно", doList: ["Подумай, за что благодарен", "Поставь одно чёткое намерение на следующую неделю"], dontList: ["Не тащи стресс этой недели в завтра"], tags: ["интуиция" as DayTag] },
  ];
  return {
    overview: "Неделя предлагает чередование активных и спокойных дней. Используй энергичные дни для важных дел, а тихие — для восстановления.",
    weeklyAdvice: "Будь гибким и следуй ритму недели. Чередуй активность и отдых.",
    days: input.days.map((d, i) => {
      const base = dayTemplatesRu[i % dayTemplatesRu.length];
      if (d.energy === "high") return { ...base, tags: ["действия" as DayTag] };
      if (d.energy === "low") return { ...base, headline: "Береги силы — отдых тоже продуктивен", tags: ["отдых" as DayTag] };
      return base;
    }),
    bestDayFor: {
      decisions: { day: input.days[0]?.weekday ?? "Понедельник", why: "Начало недели — свежий взгляд и ясная голова" },
      love: { day: input.days[4]?.weekday ?? "Пятница", why: "Располагает к близости и тёплому общению" },
      newProjects: { day: input.days[0]?.weekday ?? "Понедельник", why: "Энергия начала поддерживает новые идеи" },
      rest: { day: input.days[5]?.weekday ?? "Суббота", why: "Спокойная энергия для восстановления" },
      finances: { day: input.days[2]?.weekday ?? "Среда", why: "Середина недели — трезвый взгляд на цифры" },
      health: { day: input.days[3]?.weekday ?? "Четверг", why: "Хорошее время для заботы о теле" },
    },
  };
}

// ===== Life Periods =====

export interface LifePeriod {
  planetTitle: string;   // "Юпитер в Раке"
  emoji: string;
  theme: string;
  startDate: string;     // ISO "2025-06-09"
  endDate: string;       // ISO "2026-07-26"
  story: string;         // "Для тебя это..." storytelling narrative
  whatToFocus: string;
  whatToLetGo: string;
  intensity: "high" | "medium" | "low";
}

export interface LifePeriodsResult {
  overallPhase: string;
  periods: LifePeriod[];
}

interface SlowPlanetPeriodInput {
  planetName: string;
  sign: string;
  signPrep?: string; // prepositional case, e.g. "Раке"
  startDate: string;
  endDate: string;
  natalAspects: { planet: string; aspect: string; impact: string; orb: number }[];
}

function formatDateShortRu(iso: string): string {
  const M = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${M[m - 1]} ${y}`;
}

function formatDateShortEn(iso: string): string {
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [y, m, d] = iso.split("-").map(Number);
  return `${M[m - 1]} ${d}, ${y}`;
}

export async function interpretLifePeriods(input: {
  sunSign: string;
  moonSign: string;
  ascendant: string;
  slowPlanetPeriods: SlowPlanetPeriodInput[];
}, tone: ToneOfVoice = "deep", lang: string = "ru"): Promise<LifePeriodsResult> {
  const cacheKey = `periods_v4_${input.sunSign}_${input.ascendant}_${input.slowPlanetPeriods.map(p => p.planetName + p.sign).join("")}_${tone}_${lang}`;
  const cached = getCached<LifePeriodsResult>(cacheKey);
  if (cached) return cached;

  const n = input.slowPlanetPeriods.length;
  const isEn = lang === "en";

  const periodsDesc = input.slowPlanetPeriods.map((p, i) => {
    const dateRange = isEn
      ? `from ${formatDateShortEn(p.startDate)} to ${formatDateShortEn(p.endDate)}`
      : `с ${formatDateShortRu(p.startDate)} по ${formatDateShortRu(p.endDate)}`;
    const aspects = p.natalAspects.length > 0
      ? isEn
        ? `Aspects to natal: ${p.natalAspects.map(a => `${a.planet} (${a.aspect}, ${a.orb}°, ${a.impact === "positive" ? "+" : a.impact === "challenging" ? "−" : "~"})`).join(", ")}`
        : `Аспекты к натальным: ${p.natalAspects.map(a => `${a.planet} (${a.aspect}, ${a.orb}°, ${a.impact === "positive" ? "+" : a.impact === "challenging" ? "−" : "~"})`).join(", ")}`
      : isEn ? "No aspects to natal planets — background influence" : "Аспектов к натальным планетам нет — фоновое влияние";
    return `${i + 1}. ${p.planetName} in ${p.sign} (${dateRange})\n   ${aspects}`;
  }).join("\n\n");

  const userPrompt = isEn
    ? `You are a narrator who knows this person's future. Describe their active astrological periods as a compelling story about THEIR life — what will actually happen, how to prepare, what they will go through.

PERSON: Sun ${input.sunSign}, Moon ${input.moonSign}, Ascendant ${input.ascendant}

ACTIVE PERIODS:
${periodsDesc}

For each period, write like a detective who knows EXACTLY what awaits this person. Be specific and predictive: "During this period you'll notice...", "A moment will come when...", "By the end of this time you will...", "You are about to...". The person should read this and recognize their own situation.

RETURN JSON:
{
  "overallPhase": "(50-80 chars) One phrase — the main theme of this life chapter",
  "periods": [
    {
      "story": "(500-650 chars) Three paragraphs separated by \\n\\n. First: what is already happening or has begun — what the person feels and is going through right now. Second: what will unfold further in this period — specific patterns, situations, choices that are coming. Third: how it all resolves and where it leads — what the person will understand or gain by the end. Start the first paragraph with 'For you this is'. Write as 'you', no astrological terms.",
      "whatToFocus": "(80-120 chars) A specific action or focus — what to do in this period to come out stronger",
      "whatToLetGo": "(80-120 chars) What is specifically holding you back — a habit, fear, or pattern to release right now",
      "emoji": "one emoji — the essence of this period",
      "theme": "(1-2 words) Theme: Growth / Transformation / Relationships / Challenge / Opportunity / Liberation / Building / Awakening / Choice",
      "intensity": "high | medium | low"
    }
  ]
}

RULES:
- Exactly ${n} periods, in the same order as the data above
- Each story is unique — different events, different tone, different life themes
- intensity: high if aspects < 3° or challenging; low if no aspects
- No astrological terms, planet names or zodiac signs in the story text
- Write about real life: relationships, feelings, decisions, habits, fears, courage`
    : `Ты — рассказчик, который знает будущее этого человека. Опиши его активные астрологические периоды как захватывающую историю о ЕГО жизни — что именно произойдёт, как подготовиться, через что придётся пройти.

ЧЕЛОВЕК: ${input.sunSign}, Луна ${input.moonSign}, Асцендент ${input.ascendant}

АКТИВНЫЕ ПЕРИОДЫ:
${periodsDesc}

Для каждого периода напиши историю как детектив, который знает ЧТО ИМЕННО ждёт этого человека. Пиши конкретно и с предсказаниями: "В этом периоде ты заметишь, что...", "Придёт момент, когда...", "К концу этого времени ты...", "Тебе предстоит...". Человек должен читать это и узнавать свою ситуацию.

ВЕРНИ JSON:
{
  "overallPhase": "(50-80 символов) Одна фраза — главная тема этого отрезка жизни",
  "periods": [
    {
      "story": "(500-650 символов) Три абзаца разделённые \\n\\n. Первый: что уже происходит или началось — что человек сейчас чувствует и через что проходит. Второй: что будет происходить дальше в этом периоде — конкретные паттерны, ситуации, выборы которые придут. Третий: как это всё разрешится и к чему приведёт — что человек поймёт или получит к концу. Начни первый абзац с 'Для тебя это'. Пиши на 'ты', без астрологических терминов.",
      "whatToFocus": "(80-120 символов) Конкретное действие или фокус — что делать в этом периоде чтобы выйти из него сильнее",
      "whatToLetGo": "(80-120 символов) Что конкретно мешает — привычка, страх, паттерн, который нужно отпустить прямо сейчас",
      "emoji": "один эмодзи — суть периода",
      "theme": "(1-2 слова) Тема: Рост / Трансформация / Отношения / Испытание / Возможность / Освобождение / Строительство / Пробуждение / Выбор",
      "intensity": "high | medium | low"
    }
  ]
}

ПРАВИЛА:
- Ровно ${n} периодов, в том же порядке что в данных выше
- Каждая история уникальна — разные события, разный тон, разные жизненные темы
- intensity: high если аспекты < 3° или challenging-влияние; low если аспектов нет
- Без астрологических терминов, названий планет и знаков зодиака в текстах
- Пиши про реальную жизнь: отношения, чувства, решения, привычки, страхи, смелость`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: getSystemPrompt(tone, lang) },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_completion_tokens: 1200,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const aiResult = JSON.parse(text) as {
      overallPhase: string;
      periods: { story: string; whatToFocus: string; whatToLetGo: string; emoji: string; theme: string; intensity: "high" | "medium" | "low" }[];
    };

    if (!aiResult.periods?.length) throw new Error("No periods returned");

    const result: LifePeriodsResult = {
      overallPhase: aiResult.overallPhase || "",
      periods: input.slowPlanetPeriods.map((p, i) => {
        const ai = aiResult.periods[i] ?? aiResult.periods[0];
        return {
          planetTitle: isEn ? `${p.planetName} in ${p.sign}` : `${p.planetName} в ${p.signPrep ?? p.sign}`,
          startDate: p.startDate,
          endDate: p.endDate,
          story: ai.story ?? "",
          whatToFocus: ai.whatToFocus ?? "",
          whatToLetGo: ai.whatToLetGo ?? "",
          emoji: ai.emoji ?? "✦",
          theme: ai.theme ?? "",
          intensity: ai.intensity ?? "medium",
        };
      }),
    };

    setCache(cacheKey, result);
    return result;
  } catch {
    const isEn = lang === "en";
    return {
      overallPhase: isEn ? "A time of change and internal restructuring" : "Время перемен и внутренней перестройки",
      periods: input.slowPlanetPeriods.map((p) => ({
        planetTitle: isEn ? `${p.planetName} in ${p.sign}` : `${p.planetName} в ${p.signPrep ?? p.sign}`,
        startDate: p.startDate,
        endDate: p.endDate,
        story: isEn
          ? "For you, this is a time when old patterns start losing their grip. Something inside is shifting — slowly, but irreversibly. The discomfort you feel is the old version of you making room for what's coming next."
          : "Для тебя это время, когда старые паттерны начинают терять хватку. Что-то внутри меняется — медленно, но необратимо. Дискомфорт, который ты чувствуешь — это старая версия тебя уступает место тому, что придёт следующим.",
        whatToFocus: isEn ? "What genuinely matters — not what others expect of you" : "На то, что реально важно тебе, а не на ожидания других",
        whatToLetGo: isEn ? "The need to have certainty before every step" : "Потребность знать ответы до того, как сделать шаг",
        emoji: "🌊",
        theme: isEn ? "Transformation" : "Трансформация",
        intensity: "medium" as const,
      })),
    };
  }
}

// ===== Personality Breakdown =====

export interface PersonalityBreakdown {
  essence: string;          // "Глубокий мыслитель-бунтарь" — short tagline
  keywords: string[];       // 5–7 single-word traits
  narrative: string;        // full flowing essay, ~1800-2500 chars
  lifePathNumber: number;
  lifePathMeaning: string;  // 1-2 sentences
}

export async function interpretPersonality(input: {
  birthDate: string;
  sunSign: string;
  moonSign: string;
  ascendant: string;
  planets: { name: string; sign: string; house?: number }[];
  aspects: { planet1: string; aspect: string; planet2: string }[];
}, lang: string = "ru"): Promise<PersonalityBreakdown> {
  const cacheKey = `personality_v4_${input.birthDate}_${input.sunSign}_${input.ascendant}_${lang}`;
  const cached = getCached<PersonalityBreakdown>(cacheKey);
  if (cached) return cached;

  // Calculate life path number
  const digits = input.birthDate.replace(/-/g, "").split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split("").map(Number).reduce((a, b) => a + b, 0);
  }
  const lifePathNum = sum;

  const planetsDesc = input.planets.slice(0, 8).map(p =>
    `${p.name} в ${p.sign}${p.house ? ` (${p.house}-й дом)` : ""}`
  ).join(", ");
  const aspectsDesc = input.aspects.slice(0, 10).map(a =>
    `${a.planet1} ${a.aspect} ${a.planet2}`
  ).join(", ");

  const isEn = lang === "en";

  const userPrompt = `Напиши глубокое эссе о личности человека — одним непрерывным текстом без заголовков и списков. Читается как захватывающая глава из биографии.

ДАННЫЕ КАРТЫ:
Солнце: ${input.sunSign}, Луна: ${input.moonSign}, Асцендент: ${input.ascendant}
Планеты: ${planetsDesc}
Аспекты: ${aspectsDesc}
Число жизненного пути: ${lifePathNum}

ВЕРНИ JSON:
{
  "essence": "(3-6 слов) Суть личности одной фразой. Примеры: 'Лидер с мягким сердцем', 'Глубокий мыслитель-бунтарь', 'Созидатель с душой художника'",
  "keywords": ["(5-7 слов-качеств, существительные) например: интуиция, решительность, глубина, перфекционизм, харизма"],
  "narrative": "(3500-5000 символов, 7-10 абзацев) Большое эссе одним непрерывным текстом без заголовков и списков. Это должно читаться как захватывающая глава из биографии — подробно, с деталями, с примерами, с глубиной.\n\nСтруктура плавно переходит одно в другое:\n— Кто этот человек: как думает, как воспринимает мир, что им движет изнутри. Несколько абзацев — подробно.\n— Его главные сильные стороны — 3-4 черты, каждая раскрыта через конкретные ситуации: как это проявляется в жизни, в отношениях, в работе, в трудных моментах.\n— Плавный переход к зонам роста через 'при этом', 'и всё же', 'но есть одно' — что даётся труднее, через какие повторяющиеся уроки он проходит, какие паттерны держат его назад.\n— Как его натура проявляется в отношениях с людьми — близких и дальних. Что он даёт другим и что ему сложно принимать.\n— Его призвание и путь: куда ведёт эта конкретная комбинация качеств, какой след он оставляет, что является его настоящим даром для мира.\n— Завершающий абзац — личный, вдохновляющий, точный. Как будто ты видел этого человека всю жизнь и говоришь ему самое важное.\n\nСТИЛЬ ТЕКСТА: обращайся на 'ты', прямо и с теплом. Предложения разной длины — где-то короткий удар, где-то широкая мысль. Не перечисляй — рассказывай историю. Переходы между темами органичные, каждый абзац вытекает из предыдущего. Никакого жаргона, никаких клише 'ты уникален', 'слушай своё сердце', 'энергия', 'вселенная'. Без названий планет и знаков зодиака в тексте. Пиши вдохновляюще — не пустыми словами, а точными деталями, которые человек узнаёт в себе.",
  "lifePathNumber": ${lifePathNum},
  "lifePathMeaning": "(100-150 символов) Что значит число ${lifePathNum} для жизни и решений этого человека"
}

${isEn ? "CRITICAL: ALL text content MUST be in ENGLISH." : "Язык: Русский."}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: getSystemPrompt("deep", lang) },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_completion_tokens: 2800,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(text) as PersonalityBreakdown;
    result.lifePathNumber = lifePathNum;
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error("Personality interpretation failed:", err);
    return {
      essence: isEn ? "Deep, independent thinker" : "Глубокий, независимый мыслитель",
      keywords: isEn
        ? ["intuition", "independence", "depth", "sensitivity", "determination"]
        : ["интуиция", "независимость", "глубина", "чувствительность", "решительность"],
      narrative: isEn
        ? "You feel things more deeply than most people realise. Your inner world is rich and complex — and sometimes that's your greatest strength, sometimes your hardest challenge. You don't follow crowds; you forge your own path, often before you fully understand where it leads.\n\nOne of your clearest gifts is the ability to see what others miss. Not just patterns in situations, but the unspoken dynamics in rooms, the real feelings behind words, the thing that nobody names but everyone feels. This makes you unusually perceptive — and unusually private, because you know how much goes unsaid.\n\nYet there's a tension you carry. The same depth that makes you insightful can turn inward, becoming rumination. You can get caught in loops of analysis when the answer was already there, felt — not reasoned. Learning to trust what you feel before you understand it fully is one of the quiet lessons of your life.\n\nIn relationships, you give a lot — sometimes more than people even ask for. The growth edge here is learning that you don't have to earn presence. You belong in rooms, in conversations, in people's lives — without performing or proving. The right people will meet you where you are.\n\nWhat you're here to do is deepen things. Whatever field you work in, whatever relationships you build — your presence adds weight, meaning, substance. That's not a small thing. That's rare."
        : "Ты чувствуешь глубже, чем большинство людей замечает. Внутренний мир богатый и сложный — и это одновременно твоя сила и твоя нагрузка. Ты не следуешь за толпой — идёшь своим путём, часто ещё до того, как до конца понял, куда он ведёт.\n\nОдна из самых ярких твоих черт — способность замечать то, что другие пропускают. Не просто закономерности в ситуациях, а невысказанные динамики в разговорах, настоящие чувства за словами, то, что никто не называет, но все ощущают. Это делает тебя необычно проницательным — и необычно закрытым, потому что ты знаешь, сколько всего остаётся невысказанным.\n\nПри этом есть одно напряжение, которое ты несёшь с собой. Та же глубина, что делает тебя чутким, может обращаться внутрь, превращаясь в самоанализ без конца. Ты умеешь думать по кругу там, где ответ уже давно был — просто чувствовался, а не просчитывался. Научиться доверять тому, что ощущаешь, раньше чем поймёшь это разумом — один из тихих уроков твоей жизни.\n\nВ отношениях ты отдаёшь много — иногда больше, чем у тебя просят. Точка роста здесь — понять, что тебе не нужно зарабатывать своё место рядом с людьми. Ты принадлежишь этим разговорам, этим пространствам, этим жизням — без выступлений и доказательств. Нужные люди встретят тебя там, где ты есть.\n\nТо, для чего ты здесь — углублять вещи. В какой бы сфере ты ни работал, какие бы отношения ни строил — твоё присутствие добавляет вес, смысл, содержание. Это не мало. Это редкость.",
      lifePathNumber: lifePathNum,
      lifePathMeaning: isEn
        ? `Life path ${lifePathNum}: your path is about mastery through depth. You achieve most when you go all the way in.`
        : `Число ${lifePathNum}: твой путь — мастерство через глубину. Ты достигаешь большего, когда идёшь до конца.`,
    };
  }
}
