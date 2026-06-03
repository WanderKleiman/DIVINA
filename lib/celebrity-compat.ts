/**
 * Celebrity compatibility calculation.
 * Uses Sun sign element compatibility + birth date variation.
 */

// Sun sign index from birth date (same formula as astro-calc.ts)
function getSunSignIndex(birthDateStr: string): number {
  const J2000 = new Date("2000-01-01T12:00:00Z").getTime();
  const date = new Date(birthDateStr + "T12:00:00Z").getTime();
  const days = (date - J2000) / 86400000;
  const lon = ((280.46 + 0.9856 * days) % 360 + 360) % 360;
  return Math.floor(lon / 30);
}

// Elements: 0=Fire, 1=Earth, 2=Air, 3=Water
const ELEMENT: number[] = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3]; // Aries=0 … Pisces=11

// Element base compatibility (same, trine, sextile, square/opposite)
const ELEMENT_COMPAT: number[][] = [
  // Fire  Earth  Air   Water
  [  82,   52,   80,   58  ], // Fire
  [  52,   83,   55,   80  ], // Earth
  [  80,   55,   82,   54  ], // Air
  [  58,   80,   54,   83  ], // Water
];

const SIGN_NAMES_RU = [
  "Овен", "Телец", "Близнецы", "Рак",
  "Лев", "Дева", "Весы", "Скорпион",
  "Стрелец", "Козерог", "Водолей", "Рыбы",
];

export interface CompatResult {
  score: number;       // 0–100
  label: string;
  description: string;
  userSign: string;
}

export function calcCelebrityCompat(
  userBirthDate: string,
  celebBirthDate: string,
): CompatResult {
  const userIdx  = getSunSignIndex(userBirthDate);
  const celebIdx = getSunSignIndex(celebBirthDate);

  const uEl = ELEMENT[userIdx];
  const cEl = ELEMENT[celebIdx];

  let base = ELEMENT_COMPAT[uEl][cEl];

  // Bonus for exact same sign
  if (userIdx === celebIdx) base = Math.max(base, 78);

  // Opposite sign (magnetic tension): slight bump
  if ((userIdx + 6) % 12 === celebIdx) base = Math.max(base, 62);

  // Trine (4 signs apart, same element): boost
  if (Math.abs(userIdx - celebIdx) === 4 || Math.abs(userIdx - celebIdx) === 8) {
    base = Math.max(base, 85);
  }

  // Add deterministic variation based on birth day numbers (±9 pts)
  const userDay  = parseInt(userBirthDate.split("-")[2], 10);
  const celebDay = parseInt(celebBirthDate.split("-")[2], 10);
  const variation = ((userDay * 7 + celebDay * 13) % 19) - 9; // -9 … +9
  const score = Math.min(95, Math.max(42, base + variation));

  const userSign = SIGN_NAMES_RU[userIdx];

  let label: string;
  let description: string;

  if (score >= 85) {
    label = "Невероятная связь";
    description = "Ваши натальные карты резонируют на глубоком уровне. Такое сочетание встречается редко.";
  } else if (score >= 74) {
    label = "Высокая совместимость";
    description = "Между вами много общего на уровне ценностей и восприятия мира. Взаимопонимание приходит естественно.";
  } else if (score >= 62) {
    label = "Хорошая совместимость";
    description = "Ваши энергии дополняют друг друга. Есть точки напряжения, но они рождают рост.";
  } else if (score >= 50) {
    label = "Интересное притяжение";
    description = "Контрастные энергии создают магнетизм. Вы цепляете друг друга именно своей непохожестью.";
  } else {
    label = "Сложная динамика";
    description = "Разные стихии создают трение. Но именно такие встречи часто меняют нас больше всего.";
  }

  return { score, label, description, userSign };
}
