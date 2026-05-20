"use client";

interface ZodiacIconProps {
  sign: string; // symbol like "♈" or name like "Овен"
  size?: number;
  className?: string;
}

const SIGN_MAP: Record<string, string> = {
  "♈": "aries", "Овен": "aries",
  "♉": "taurus", "Телец": "taurus",
  "♊": "gemini", "Близнецы": "gemini",
  "♋": "cancer", "Рак": "cancer",
  "♌": "leo", "Лев": "leo",
  "♍": "virgo", "Дева": "virgo",
  "♎": "libra", "Весы": "libra",
  "♏": "scorpio", "Скорпион": "scorpio",
  "♐": "sagittarius", "Стрелец": "sagittarius",
  "♑": "capricorn", "Козерог": "capricorn",
  "♒": "aquarius", "Водолей": "aquarius",
  "♓": "pisces", "Рыбы": "pisces",
};

function SignPath({ id }: { id: string }) {
  switch (id) {
    case "aries":
      return (
        <path d="M6 18C6 18 6 8 12 4C18 8 18 18 18 18M12 4V20" />
      );
    case "taurus":
      return (
        <>
          <circle cx="12" cy="15" r="5" />
          <path d="M4 5C4 5 6 9 12 9C18 9 20 5 20 5" />
        </>
      );
    case "gemini":
      return (
        <>
          <path d="M5 4C8 6 16 6 19 4" />
          <path d="M5 20C8 18 16 18 19 20" />
          <line x1="8" y1="4" x2="8" y2="20" />
          <line x1="16" y1="4" x2="16" y2="20" />
        </>
      );
    case "cancer":
      return (
        <>
          <path d="M4 12C4 12 4 7 9 7C14 7 14 12 14 12" />
          <path d="M20 12C20 12 20 17 15 17C10 17 10 12 10 12" />
          <circle cx="5" cy="12" r="1.5" fill="currentColor" />
          <circle cx="19" cy="12" r="1.5" fill="currentColor" />
        </>
      );
    case "leo":
      return (
        <>
          <circle cx="9" cy="14" r="4" />
          <path d="M13 14C13 14 13 6 17 6C21 6 19 10 17 10C15 10 15 14 17 18C19 22 21 20 21 20" />
        </>
      );
    case "virgo":
      return (
        <>
          <path d="M4 4V16C4 16 4 20 8 20" />
          <path d="M4 10C4 10 8 4 8 4V16" />
          <path d="M8 10C8 10 12 4 12 4V16" />
          <path d="M12 10C12 10 16 4 16 4V12C16 16 20 16 20 12" />
          <path d="M18 16L20 20" />
          <path d="M16 18L20 18" />
        </>
      );
    case "libra":
      return (
        <>
          <line x1="4" y1="20" x2="20" y2="20" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <path d="M6 15C6 15 6 8 12 8C18 8 18 15 18 15" />
        </>
      );
    case "scorpio":
      return (
        <>
          <path d="M4 4V16C4 16 4 20 8 20" />
          <path d="M4 10C4 10 8 4 8 4V16C8 16 8 20 12 20" />
          <path d="M8 10C8 10 12 4 12 4V16C12 16 12 20 16 20" />
          <path d="M16 20L20 16" />
          <path d="M16 20L20 20" />
        </>
      );
    case "sagittarius":
      return (
        <>
          <line x1="4" y1="20" x2="20" y2="4" />
          <path d="M13 4H20V11" />
          <line x1="6" y1="14" x2="14" y2="14" />
          <line x1="10" y1="10" x2="10" y2="18" />
        </>
      );
    case "capricorn":
      return (
        <path d="M4 12V4C8 4 10 8 10 12C10 16 12 18 14 18C16 18 18 16 18 14C18 12 16 10 14 12C14 14 16 20 20 20" />
      );
    case "aquarius":
      return (
        <>
          <path d="M3 9L6 6L9 9L12 6L15 9L18 6L21 9" />
          <path d="M3 15L6 12L9 15L12 12L15 15L18 12L21 15" />
        </>
      );
    case "pisces":
      return (
        <>
          <path d="M6 4C6 4 10 8 10 12C10 16 6 20 6 20" />
          <path d="M18 4C18 4 14 8 14 12C14 16 18 20 18 20" />
          <line x1="4" y1="12" x2="20" y2="12" />
        </>
      );
    default:
      return null;
  }
}

export default function ZodiacIcon({ sign, size = 24, className = "" }: ZodiacIconProps) {
  const id = SIGN_MAP[sign];
  if (!id) return <span className={className}>{sign}</span>;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <SignPath id={id} />
    </svg>
  );
}

export { SIGN_MAP };
