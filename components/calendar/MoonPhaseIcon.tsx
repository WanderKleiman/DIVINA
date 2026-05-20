import type { MoonPhaseName } from "@/lib/types";

interface MoonPhaseIconProps {
  phase: MoonPhaseName;
  size?: number;
}

const phaseSymbols: Record<MoonPhaseName, string> = {
  "new": "🌑",
  "waxing-crescent": "🌒",
  "first-quarter": "🌓",
  "waxing-gibbous": "🌔",
  "full": "🌕",
  "waning-gibbous": "🌖",
  "last-quarter": "🌗",
  "waning-crescent": "🌘",
};

export default function MoonPhaseIcon({ phase, size = 14 }: MoonPhaseIconProps) {
  return <span style={{ fontSize: size }}>{phaseSymbols[phase]}</span>;
}
