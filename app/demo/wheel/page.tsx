"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { approximatePlanets } from "@/lib/astro-calc";
import { getUserData } from "@/lib/user-data";

const SIGNS = [
  { name: "Овен",     symbol: "♈", color: "#ff6b6b" },
  { name: "Телец",    symbol: "♉", color: "#69db7c" },
  { name: "Близнецы", symbol: "♊", color: "#ffd43b" },
  { name: "Рак",      symbol: "♋", color: "#74c0fc" },
  { name: "Лев",      symbol: "♌", color: "#ffa94d" },
  { name: "Дева",     symbol: "♍", color: "#a9e34b" },
  { name: "Весы",     symbol: "♎", color: "#f783ac" },
  { name: "Скорпион", symbol: "♏", color: "#cc5de8" },
  { name: "Стрелец",  symbol: "♐", color: "#748ffc" },
  { name: "Козерог",  symbol: "♑", color: "#adb5bd" },
  { name: "Водолей",  symbol: "♒", color: "#4dabf7" },
  { name: "Рыбы",     symbol: "♓", color: "#9775fa" },
];

const PLANET_INFO: Record<string, { color: string; meaning: string }> = {
  "Солнце":   { color: "#ffd43b", meaning: "Твоё ядро и суть личности. Знак Солнца — кем ты стремишься стать, твоя жизненная сила и основная идентичность." },
  "Луна":     { color: "#c5c8ff", meaning: "Эмоции, интуиция и внутренний мир. Луна показывает, что тебе нужно для ощущения безопасности и комфорта." },
  "Меркурий": { color: "#74c0fc", meaning: "Мышление и коммуникация. Управляет тем, как ты говоришь, учишься и обрабатываешь информацию." },
  "Венера":   { color: "#f783ac", meaning: "Любовь, красота и ценности. Показывает, кого и что ты притягиваешь, как выражаешь нежность." },
  "Марс":     { color: "#ff6b6b", meaning: "Энергия, воля и страсть. Марс управляет тем, как ты действуешь, борешься и добиваешься целей." },
  "Юпитер":   { color: "#ffa94d", meaning: "Рост и удача. Показывает, где тебе везёт и где ты можешь расширяться с минимальным сопротивлением." },
  "Сатурн":   { color: "#adb5bd", meaning: "Дисциплина и уроки жизни. Сатурн — строгий учитель, который формирует характер через испытания." },
  "Уран":     { color: "#4dabf7", meaning: "Революция и нестандартность. Уран ломает устаревшие паттерны и открывает путь к новому." },
  "Нептун":   { color: "#9775fa", meaning: "Мечты и интуиция. Нептун связан с духовностью, искусством и растворением границ." },
  "Плутон":   { color: "#cc5de8", meaning: "Трансформация и перерождение. Плутон уничтожает старое, чтобы возникло новое, более мощное." },
};

const C = 185;   // center
const OR = 178;  // outer ring edge
const MR = 162;  // middle of sign ring
const IR = 146;  // inner ring edge
const PR = 112;  // planet orbit
const CR = 48;   // core circle

function toRad(deg: number) { return (deg / 360) * 2 * Math.PI - Math.PI / 2; }
function px(r: number, angle: number) { return C + r * Math.cos(angle); }
function py(r: number, angle: number) { return C + r * Math.sin(angle); }

function signPath(i: number) {
  const a1 = toRad(i * 30 + 0.5);
  const a2 = toRad((i + 1) * 30 - 0.5);
  return [
    `M ${px(IR, a1)} ${py(IR, a1)}`,
    `L ${px(OR, a1)} ${py(OR, a1)}`,
    `A ${OR} ${OR} 0 0 1 ${px(OR, a2)} ${py(OR, a2)}`,
    `L ${px(IR, a2)} ${py(IR, a2)}`,
    `A ${IR} ${IR} 0 0 0 ${px(IR, a1)} ${py(IR, a1)} Z`,
  ].join(" ");
}

export default function WheelDemo() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const planets = useMemo(() => {
    const user = getUserData();
    if (!user.birthDate) return [];
    const dateStr = user.birthDate + (user.birthTime ? `T${user.birthTime}:00` : "T12:00:00");
    return approximatePlanets(new Date(dateStr));
  }, []);

  const planetPositions = useMemo(() => {
    return planets.map(p => {
      const signIdx = SIGNS.findIndex(s => s.name === p.sign);
      const lon = signIdx * 30 + p.degree;
      const angle = toRad(lon);
      return { ...p, lon, x: px(PR, angle), y: py(PR, angle) };
    });
  }, [planets]);

  const selectedPlanet = planetPositions.find(p => p.name === selected);
  const selectedInfo = selected ? PLANET_INFO[selected] : null;
  const selectedSign = selectedPlanet ? SIGNS.find(s => s.name === selectedPlanet.sign) : null;

  return (
    <div className="min-h-screen pb-10" style={{ background: "#08041a" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Натальное колесо</h1>
          <p className="text-xs text-white/40">Нажми на планету чтобы узнать её значение</p>
        </div>
      </div>

      {/* Wheel SVG */}
      <div className="flex justify-center px-4 mt-2">
        <svg viewBox={`0 0 ${C * 2} ${C * 2}`} width="100%" style={{ maxWidth: 400 }}>
          {/* Sign segments */}
          {SIGNS.map((sign, i) => (
            <path
              key={sign.name}
              d={signPath(i)}
              fill={`${sign.color}18`}
              stroke={`${sign.color}40`}
              strokeWidth="0.5"
            />
          ))}

          {/* Sign symbols */}
          {SIGNS.map((sign, i) => {
            const a = toRad(i * 30 + 15);
            return (
              <text key={sign.symbol} x={px(MR, a)} y={py(MR, a)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="11" fill={`${sign.color}cc`}>
                {sign.symbol}
              </text>
            );
          })}

          {/* Orbit rings */}
          <circle cx={C} cy={C} r={IR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <circle cx={C} cy={C} r={PR} fill="none" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" strokeWidth="0.5" />

          {/* Core */}
          <circle cx={C} cy={C} r={CR} fill="rgba(167,139,250,0.07)" stroke="rgba(167,139,250,0.2)" strokeWidth="1" />
          <text x={C} y={C} textAnchor="middle" dominantBaseline="middle" fontSize="22" fill="rgba(255,255,255,0.7)">✦</text>

          {/* Planets */}
          {planetPositions.map(p => {
            const info = PLANET_INFO[p.name];
            const isSelected = selected === p.name;
            return (
              <g key={p.name} onClick={() => setSelected(isSelected ? null : p.name)} style={{ cursor: "pointer" }}>
                {isSelected && (
                  <circle cx={p.x} cy={p.y} r={14} fill={`${info?.color}25`} stroke={`${info?.color}80`} strokeWidth="1" />
                )}
                <circle cx={p.x} cy={p.y} r={isSelected ? 9 : 7}
                  fill={info?.color ?? "#fff"}
                  opacity={isSelected ? 1 : 0.75}
                />
                <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize={isSelected ? "9" : "8"} fill="#08041a" fontWeight="bold" style={{ pointerEvents: "none" }}>
                  {p.symbol}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Info panel */}
      <div className="px-5 mt-4">
        {selectedPlanet && selectedInfo && selectedSign ? (
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${selectedInfo.color}40` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center rounded-xl w-10 h-10 text-lg"
                style={{ background: `${selectedInfo.color}20`, border: `1px solid ${selectedInfo.color}40` }}>
                {selectedPlanet.symbol}
              </div>
              <div>
                <p className="text-base font-bold text-white">{selectedPlanet.name}</p>
                <p className="text-sm" style={{ color: selectedSign.color }}>
                  {selectedSign.symbol} {selectedPlanet.sign}, {selectedPlanet.degree}°
                </p>
              </div>
            </div>
            <p className="text-sm text-white/65 leading-relaxed">{selectedInfo.meaning}</p>
          </div>
        ) : (
          <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-sm text-white/30">Нажми на любую планету чтобы узнать её влияние на тебя</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {planetPositions.map(p => {
                const info = PLANET_INFO[p.name];
                return (
                  <button key={p.name} onClick={() => setSelected(p.name)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs"
                    style={{ background: `${info?.color}15`, border: `1px solid ${info?.color}30`, color: info?.color }}>
                    {p.symbol} {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
