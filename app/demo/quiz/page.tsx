"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

const SIGNS = [
  "Овен ♈", "Телец ♉", "Близнецы ♊", "Рак ♋",
  "Лев ♌", "Дева ♍", "Весы ♎", "Скорпион ♏",
  "Стрелец ♐", "Козерог ♑", "Водолей ♒", "Рыбы ♓",
];

const SIGN_COLORS: Record<string, string> = {
  "Овен ♈": "#ff6b6b", "Телец ♉": "#69db7c", "Близнецы ♊": "#ffd43b",
  "Рак ♋": "#74c0fc", "Лев ♌": "#ffa94d", "Дева ♍": "#a9e34b",
  "Весы ♎": "#f783ac", "Скорпион ♏": "#cc5de8", "Стрелец ♐": "#748ffc",
  "Козерог ♑": "#adb5bd", "Водолей ♒": "#4dabf7", "Рыбы ♓": "#9775fa",
};

interface QuizPerson {
  name: string;
  sign: string;
  photo?: string;
  clues: string[];
}

const PEOPLE: QuizPerson[] = [
  {
    name: "Ваня Дмитриенко",
    sign: "Дева ♍",
    photo: "/photos/stars/dmitrienko.jpg",
    clues: [
      "Превращает личную боль в точные, почти хирургические слова",
      "Перфекционист — не выпустит трек, пока каждый слог не встанет на место",
      "Родом из Украины, покорил русскоязычную сцену тихо и основательно",
      "Его знак управляется Меркурием — планетой текста и коммуникации",
    ],
  },
  {
    name: "Моргенштерн",
    sign: "Водолей ♒",
    photo: "/photos/stars/morgenshtern.jpg",
    clues: [
      "Живёт на несколько шагов впереди общества — и раздражает именно этим",
      "Эпатаж — не маска, а способ защититься от тех, кто подбирается слишком близко",
      "Видит тренды раньше, чем они становятся трендами",
      "Знак воздуха — рождён ломать системы, а не встраиваться в них",
    ],
  },
  {
    name: "Хабиб Нурмагомедов",
    sign: "Дева ♍",
    photo: "/photos/stars/khabib.jpg",
    clues: [
      "Завершил карьеру непобеждённым — 29 побед, 0 поражений",
      "Скромность и дисциплина — не поза, а физиология",
      "Знак земли — тысячи часов методичного труда вместо вспышек таланта",
      "Ушёл на пике, выполнив обещание маме",
    ],
  },
  {
    name: "Тимати",
    sign: "Лев ♌",
    photo: "/photos/stars/timati.jpg",
    clues: [
      "Построил целую экосистему вокруг своего имени — лейбл, барбершопы, рестораны",
      "Знак огня — нужно быть в центре, иначе не дышится",
      "Любит ярко, публично и с полной отдачей",
      "Управляется Солнцем — буквально рождён светить",
    ],
  },
  {
    name: "Ольга Бузова",
    sign: "Водолей ♒",
    photo: "/photos/stars/buzova.jpg",
    clues: [
      "Из реалити — в певицы, из певицы — в медиаперсону. И каждый раз это работало",
      "Знак воздуха — адаптируется без потери себя",
      "Миллионы подписчиков — не тщеславие, а инфраструктура",
      "Умеет смеяться над собой так, что это обезоруживает критиков",
    ],
  },
  {
    name: "Клава Кока",
    sign: "Скорпион ♏",
    photo: "/photos/stars/klava-koka.jpg",
    clues: [
      "Каждый трек — настоящее переживание, не перформанс",
      "Знак воды — всё или ничего, середины не бывает",
      "Трансформируется несколько раз, но остаётся узнаваемой",
      "Управляется Плутоном — планетой перерождения",
    ],
  },
  {
    name: "Элджей",
    sign: "Дева ♍",
    photo: "/photos/stars/eljay.jpg",
    clues: [
      "Визуальный код так же важен, как музыка — каждый образ не случаен",
      "Знак земли — детали решают всё",
      "Из Новосибирска, но его эстетика — вне географии",
      "Перфекционист: долгие паузы между проектами — это Дева не выпускает недозрелое",
    ],
  },
  {
    name: "Монеточка",
    sign: "Овен ♈",
    photo: "/photos/stars/monetochka.jpg",
    clues: [
      "Ирония как способ вскрыть настоящую боль — смеёшься и плачешь одновременно",
      "Знак огня — прямо, быстро, без фильтра",
      "Дебютировала сразу на уровне важного разговора, без раскрутки по ступенькам",
      "Управляется Марсом — не умеет молчать о том, что считает правдой",
    ],
  },
  {
    name: "Niletto",
    sign: "Близнецы ♊",
    photo: "/photos/stars/niletto.jpg",
    clues: [
      "Мелодия и текст — без скандалов, без хайпа, только музыка",
      "Знак воздуха — лёгкость, за которой прячется наблюдательность",
      "Из Красноярска — в федеральные чарты через чистый звук",
      "Управляется Меркурием — дар говорить о сложном просто",
    ],
  },
  {
    name: "Настя Ивлеева",
    sign: "Стрелец ♐",
    photo: "/photos/stars/ivleeva.jpg",
    clues: [
      "Одна из первых поняла, что личный бренд в интернете — это медиаимперия",
      "Знак огня — живёт громко, думает масштабно, тормозов нет",
      "Управляется Юпитером — удача приходит к тем, кто открыт",
      "Аутентичность — её главный актив в эпоху выверенных образов",
    ],
  },
  {
    name: "INSTASAMKA",
    sign: "Телец ♉",
    photo: "/photos/stars/instasamka.jpg",
    clues: [
      "Пришла, когда её не ждали — и осталась надолго",
      "Знак земли — упрямство методичнее любого таланта",
      "Самоирония без самоуничижения — редкий и ценный навык",
      "Управляется Венерой — финансовая независимость как необходимость, не привилегия",
    ],
  },
];

function getDailyPerson(): QuizPerson {
  const day = Math.floor(Date.now() / 86400000);
  return PEOPLE[day % PEOPLE.length];
}

export default function QuizDemo() {
  const router = useRouter();
  const person = useMemo(() => getDailyPerson(), []);

  const [revealed, setRevealed] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const correct = guess === person.sign;

  function handleGuess(sign: string) {
    if (done) return;
    setGuess(sign);
    setDone(true);
  }

  function revealNext() {
    if (revealed < person.clues.length) setRevealed(r => r + 1);
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: "#08041a" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-5">
        <button onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Угадай знак</h1>
          <p className="text-xs text-white/40">Ежедневный вызов · {person.clues.length} подсказки</p>
        </div>
      </div>

      <div className="px-5 space-y-4">

        {/* Clues card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {/* Mystery avatar */}
          <div className="flex items-center justify-center py-8" style={{ background: "rgba(167,139,250,0.06)" }}>
            <div className="flex items-center justify-center rounded-full text-4xl"
              style={{ width: 88, height: 88, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {done ? "✦" : "?"}
            </div>
          </div>

          {/* Clues */}
          <div className="p-5 space-y-3">
            {person.clues.slice(0, revealed).map((clue, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ width: 20, height: 20, background: "rgba(167,139,250,0.2)", color: "rgb(196,181,253)" }}>
                  {i + 1}
                </span>
                <p className="text-sm text-white/75 leading-relaxed">{clue}</p>
              </div>
            ))}

            {!done && revealed < person.clues.length && (
              <button onClick={revealNext}
                className="w-full py-2.5 rounded-xl text-sm text-white/40 mt-2"
                style={{ border: "1px dashed rgba(255,255,255,0.12)" }}>
                + Ещё подсказка ({person.clues.length - revealed} осталось)
              </button>
            )}
          </div>
        </div>

        {/* Result */}
        {done && (
          <div className="rounded-2xl p-5 text-center"
            style={{
              background: correct ? "rgba(105,219,124,0.1)" : "rgba(255,107,107,0.1)",
              border: `1px solid ${correct ? "rgba(105,219,124,0.3)" : "rgba(255,107,107,0.3)"}`,
            }}>
            <p className="text-2xl mb-2">{correct ? "🎯" : "✗"}</p>
            <p className="text-base font-bold text-white mb-1">
              {correct ? "Верно!" : `Не угадал — это ${person.sign}`}
            </p>
            <p className="text-sm font-semibold mb-1" style={{ color: SIGN_COLORS[person.sign] }}>
              {person.name}
            </p>
            <p className="text-xs text-white/40">{person.sign}</p>
          </div>
        )}

        {/* Sign grid */}
        {!done && (
          <div>
            <p className="text-xs text-white/40 mb-3 text-center">Выбери знак зодиака</p>
            <div className="grid grid-cols-3 gap-2">
              {SIGNS.map(sign => (
                <button key={sign} onClick={() => handleGuess(sign)}
                  className="py-3 rounded-xl text-sm font-medium active:scale-[0.97] transition-transform"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: SIGN_COLORS[sign] }}>
                  {sign}
                </button>
              ))}
            </div>
          </div>
        )}

        {done && (
          <div className="grid grid-cols-3 gap-2">
            {SIGNS.map(sign => {
              const isGuess = sign === guess;
              const isAnswer = sign === person.sign;
              let bg = "rgba(255,255,255,0.04)";
              let border = "rgba(255,255,255,0.07)";
              if (isAnswer) { bg = "rgba(105,219,124,0.15)"; border = "rgba(105,219,124,0.4)"; }
              else if (isGuess && !correct) { bg = "rgba(255,107,107,0.15)"; border = "rgba(255,107,107,0.4)"; }
              return (
                <div key={sign}
                  className="py-3 rounded-xl text-sm font-medium text-center"
                  style={{ background: bg, border: `1px solid ${border}`, color: SIGN_COLORS[sign] }}>
                  {sign}
                </div>
              );
            })}
          </div>
        )}

        {done && (
          <button onClick={() => router.back()}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white/60"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            Вернуться
          </button>
        )}

      </div>
    </div>
  );
}
