"use client";

import { memo } from "react";
import type { Planet } from "@/lib/types";

interface NatalChartWheelProps {
  planets: Planet[];
  ascendantSymbol: string;
}

const SIGNS = [
  { symbol: "♈", name: "Овен" },
  { symbol: "♉", name: "Телец" },
  { symbol: "♊", name: "Близнецы" },
  { symbol: "♋", name: "Рак" },
  { symbol: "♌", name: "Лев" },
  { symbol: "♍", name: "Дева" },
  { symbol: "♎", name: "Весы" },
  { symbol: "♏", name: "Скорпион" },
  { symbol: "♐", name: "Стрелец" },
  { symbol: "♑", name: "Козерог" },
  { symbol: "♒", name: "Водолей" },
  { symbol: "♓", name: "Рыбы" },
];

// Thin-line SVG paths for each zodiac sign (viewBox 0 0 24 24)
function signSvgPath(index: number) {
  switch (index) {
    case 0: // Aries
      return "M6 18C6 18 6 8 12 4C18 8 18 18 18 18M12 4V20";
    case 1: // Taurus
      return "M12 15m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M4 5C4 5 6 9 12 9C18 9 20 5 20 5";
    case 2: // Gemini
      return "M5 4C8 6 16 6 19 4M5 20C8 18 16 18 19 20M8 4V20M16 4V20";
    case 3: // Cancer
      return "M4 12C4 12 4 7 9 7C14 7 14 12 14 12M20 12C20 12 20 17 15 17C10 17 10 12 10 12";
    case 4: // Leo
      return "M9 14m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M13 14C13 14 13 6 17 6C21 6 19 10 17 10C15 10 15 14 17 18C19 22 21 20 21 20";
    case 5: // Virgo
      return "M4 4V16C4 16 4 20 8 20M4 10C4 10 8 4 8 4V16M8 10C8 10 12 4 12 4V16M12 10C12 10 16 4 16 4V12C16 16 20 16 20 12M18 16L20 20M16 18L20 18";
    case 6: // Libra
      return "M4 20H20M4 15H20M6 15C6 15 6 8 12 8C18 8 18 15 18 15";
    case 7: // Scorpio
      return "M4 4V16C4 16 4 20 8 20M4 10C4 10 8 4 8 4V16C8 16 8 20 12 20M8 10C8 10 12 4 12 4V16C12 16 12 20 16 20M16 20L20 16M16 20L20 20";
    case 8: // Sagittarius
      return "M4 20L20 4M13 4H20V11M6 14H14M10 10V18";
    case 9: // Capricorn
      return "M4 12V4C8 4 10 8 10 12C10 16 12 18 14 18C16 18 18 16 18 14C18 12 16 10 14 12C14 14 16 20 20 20";
    case 10: // Aquarius
      return "M3 9L6 6L9 9L12 6L15 9L18 6L21 9M3 15L6 12L9 15L12 12L15 15L18 12L21 15";
    case 11: // Pisces
      return "M6 4C6 4 10 8 10 12C10 16 6 20 6 20M18 4C18 4 14 8 14 12C14 16 18 20 18 20M4 12H20";
    default:
      return "";
  }
}

function signIndex(signSymbol: string): number {
  return SIGNS.findIndex((s) => s.symbol === signSymbol);
}

function planetAngle(planet: Planet): number {
  const idx = signIndex(planet.signSymbol);
  if (idx === -1) return 0;
  return idx * 30 + planet.degree;
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

const NatalChartWheel = memo(function NatalChartWheel({ planets, ascendantSymbol }: NatalChartWheelProps) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 145;
  const signR = 125;
  const innerR = 105;
  const planetR = 85;
  const iconSize = 13;

  return (
    <div className="flex justify-center mx-5">
      <div
        className="rounded-full bg-[rgba(10,10,20,0.55)] backdrop-blur-[20px] border border-white/10"
        style={{ width: size, height: size }}
      >
        <div className="relative z-10">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Matte background fill for the whole wheel */}
            <circle cx={cx} cy={cy} r={outerR} fill="rgba(10,10,20,0.4)" />

            {/* Sign ring band */}
            <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

            {/* Inner area — darker */}
            <circle cx={cx} cy={cy} r={innerR} fill="rgba(5,5,15,0.5)" />

            {/* Center circle */}
            <circle cx={cx} cy={cy} r={40} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

            {/* Sign divisions and SVG icons */}
            {SIGNS.map((_, i) => {
              const angle = i * 30;
              const p1 = polarToXY(cx, cy, innerR, angle);
              const p2 = polarToXY(cx, cy, outerR, angle);
              const labelPos = polarToXY(cx, cy, signR, angle + 15);
              const pathD = signSvgPath(i);
              return (
                <g key={i}>
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <g transform={`translate(${labelPos.x - iconSize / 2}, ${labelPos.y - iconSize / 2})`}>
                    <svg
                      width={iconSize}
                      height={iconSize}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.55)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={pathD} />
                    </svg>
                  </g>
                </g>
              );
            })}

            {/* Ascendant marker */}
            {(() => {
              const ascIdx = signIndex(ascendantSymbol);
              if (ascIdx === -1) return null;
              const angle = ascIdx * 30;
              const p = polarToXY(cx, cy, outerR + 14, angle);
              return (
                <text
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="rgba(255,255,255,0.8)"
                  fontSize="11"
                  fontWeight="bold"
                >
                  ASC
                </text>
              );
            })()}

            {/* Planets */}
            {planets.map((planet, i) => {
              const angle = planetAngle(planet);
              const pos = polarToXY(cx, cy, planetR, angle);
              return (
                <g key={i}>
                  <circle cx={pos.x} cy={pos.y} r={12} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="rgba(255,255,255,0.9)"
                    fontSize="11"
                  >
                    {planet.symbol}
                  </text>
                  {planet.retrograde && (
                    <text
                      x={pos.x + 10}
                      y={pos.y - 8}
                      fill="rgba(255,255,255,0.5)"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      R
                    </text>
                  )}
                </g>
              );
            })}

          </svg>
        </div>
      </div>
    </div>
  );
});

export default NatalChartWheel;
