"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "@/components/ui/DatePicker";
import TimePicker from "@/components/ui/TimePicker";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import SubscriptionPaywall from "@/components/paywall/SubscriptionPaywall";
import { getUserData } from "@/lib/user-data";
import { useT } from "@/lib/i18n";
import { useProStatus } from "@/lib/pro-status";
import type { PersonalityBreakdown } from "@/lib/ai-interpret";

const GLASS_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.80)",
  backdropFilter: "blur(32px) saturate(1.8)",
  WebkitBackdropFilter: "blur(32px) saturate(1.8)",
  border: "1px solid rgba(255,255,255,0.90)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
};

interface OtherRecord {
  name: string;
  birthDate: string;
  cachedAt: number;
  data: PersonalityBreakdown;
}

function splitIntoChunks(text: string, maxChars = 560): string[] {
  if (!text?.trim()) return [];
  const paras = text.split("\n\n").filter(Boolean).map(p => p.trim());
  const merged: string[] = [];
  let cur = "";
  for (const p of paras) {
    if (cur && cur.length + 2 + p.length > maxChars) { merged.push(cur); cur = p; }
    else { cur = cur ? cur + "\n\n" + p : p; }
  }
  if (cur) merged.push(cur);
  const result: string[] = [];
  for (const chunk of merged) {
    if (chunk.length <= maxChars * 1.4) { result.push(chunk); continue; }
    const sentences = chunk.split(/(?<=[.!?…])\s+/);
    let s = "";
    for (const sent of sentences) {
      if (s && s.length + 1 + sent.length > maxChars) { result.push(s.trim()); s = sent; }
      else { s = s ? s + " " + sent : sent; }
    }
    if (s.trim()) result.push(s.trim());
  }
  return result.length ? result : [text.slice(0, maxChars)];
}

function ScrollScreen({
  pages,
  onBack,
  onComplete,
  completionLabel,
}: {
  pages: React.ReactNode[];
  onBack: () => void;
  onComplete: () => void;
  completionLabel: string;
}) {
  const { t } = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const activePageRef = useRef(0);
  const total = pages.length;

  const STAGGER_MS = 85;
  const ANIM_MS = 600;

  const triggerEnter = useCallback((inner: HTMLElement) => {
    const wrapper = inner.firstElementChild as HTMLElement | null;
    const targets = wrapper ? Array.from(wrapper.children) : Array.from(inner.children);
    targets.forEach((child, idx) => {
      const el = child as HTMLElement;
      el.style.opacity = "0";
      el.style.animationDelay = `${idx * STAGGER_MS}ms`;
    });
    inner.classList.remove("page-enter", "page-enter-flat");
    void inner.offsetHeight;
    inner.classList.add(wrapper ? "page-enter" : "page-enter-flat");
    const totalTime = ANIM_MS + (targets.length - 1) * STAGGER_MS;
    setTimeout(() => {
      targets.forEach(child => {
        (child as HTMLElement).style.opacity = "";
        (child as HTMLElement).style.animationDelay = "";
      });
    }, totalTime);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const rawPage = el.scrollTop / el.clientHeight;
    const rounded = Math.round(rawPage);
    if (rounded !== activePageRef.current) {
      activePageRef.current = rounded;
      setActivePage(rounded);
      const snap = el.querySelector(`[data-sp="${rounded}"]`);
      const inner = snap?.querySelector("[data-inner]") as HTMLElement | null;
      if (inner) triggerEnter(inner);
    }
    el.querySelectorAll("[data-sp]").forEach((node, i) => {
      const dist = Math.abs(rawPage - i);
      const opacity = Math.max(0, 1 - dist * 2.4);
      (node as HTMLElement).style.opacity = opacity.toFixed(3);
    });
  }, [triggerEnter]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const snap = el.querySelector('[data-sp="0"]');
    const inner = snap?.querySelector("[data-inner]") as HTMLElement | null;
    if (inner) triggerEnter(inner);
  }, [triggerEnter]);

  const handleBack = useCallback(() => {
    const el = scrollRef.current;
    const currentPage = activePageRef.current;
    if (currentPage > 0 && el) {
      const targetPage = currentPage - 1;
      activePageRef.current = targetPage;
      setActivePage(targetPage);
      el.scrollTo({ top: targetPage * el.clientHeight, behavior: "smooth" });
      const snap = el.querySelector(`[data-sp="${targetPage}"]`);
      const inner = snap?.querySelector("[data-inner]") as HTMLElement | null;
      if (inner) triggerEnter(inner);
    } else {
      onBack();
    }
  }, [onBack, triggerEnter]);

  const displayPage = Math.min(activePage + 1, total);

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }} onClick={onBack}>
      <div
        className="flex items-center justify-between px-5 pb-2 shrink-0"
        style={{ paddingTop: "max(3.5rem, env(safe-area-inset-top))" }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        {total > 1 && <span className="text-white/40 text-xs tabular-nums">{displayPage} / {total}</span>}
        <div className="w-10" />
      </div>

      <div className="flex-1 min-h-0 px-4 pb-6 pt-2" onClick={e => e.stopPropagation()}>
        <div className="relative h-full">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full rounded-3xl scrollbar-hide"
            style={{ ...GLASS_STYLE, overflowY: "scroll", scrollSnapType: "y mandatory" }}
          >
            {pages.map((page, i) => (
              <div
                key={i}
                data-sp={i}
                className="snap-start flex flex-col justify-center"
                style={{ minHeight: "100%", opacity: 1 }}
              >
                <div data-inner className="p-6">
                  {page}
                </div>
              </div>
            ))}
            <div
              data-sp={total}
              className="snap-start flex flex-col items-center justify-center gap-4"
              style={{ minHeight: "100%", opacity: 1 }}
            >
              <div data-inner className="w-full flex flex-col items-center gap-4 p-6">
                <button
                  onClick={onComplete}
                  className="w-full h-14 rounded-2xl text-sm font-semibold text-black/75"
                  style={{ background: "rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.10)" }}
                >
                  {completionLabel}
                </button>
                <p className="text-xs text-black/25">{t("swipe.hint")}</p>
              </div>
            </div>
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 px-6 pb-4 pt-10 rounded-b-3xl pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.65))" }}
          >
            <div className="h-[3px] rounded-full" style={{ background: "rgba(0,0,0,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ background: "rgba(0,0,0,0.28)", width: `${((activePage + 1) / (total + 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OthersPage() {
  const router = useRouter();
  const { t } = useT();
  const { isPro, isLoading: proLoading } = useProStatus();
  const [showPaywall, setShowPaywall] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [birthTime, setBirthTime] = useState("12:00");
  const [birthCity, setBirthCity] = useState("");
  const [cityLat, setCityLat] = useState<number | null>(null);
  const [cityLng, setCityLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Result state
  const [result, setResult] = useState<PersonalityBreakdown | null>(null);
  const [history, setHistory] = useState<OtherRecord[]>([]);

  const canSubmit = name.trim() !== "" && birthDate !== "" && birthTime !== "" && cityLat != null;

  useEffect(() => {
    if (!proLoading && !isPro) {
      setShowPaywall(true);
    }
    // Load history
    try {
      const raw = localStorage.getItem("divina-others-history-v1");
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, [isPro, proLoading]);

  const handleCityChange = useCallback((city: string, lat?: number, lng?: number) => {
    setBirthCity(city);
    if (lat != null && lng != null) {
      setCityLat(lat);
      setCityLng(lng);
    }
  }, []);

  async function handleAnalyze() {
    if (!canSubmit || loading) return;

    const nameTrimmed = name.trim();
    const user = getUserData();
    const cacheKey = `divina-others-v1_${nameTrimmed}_${birthDate}`;

    // Check cache
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.narrative || parsed?.essence) {
          setResult(parsed);
          return;
        }
      } catch {}
    }

    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/personality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
          birthTime,
          lat: cityLat,
          lng: cityLng,
          tzOffset: cityLng != null ? Math.round(cityLng / 15) : 0,
          tone: user.tone,
          lang: user.lang,
        }),
      });
      const d = await res.json();
      if (d?.narrative || d?.essence) {
        setResult(d);
        // Cache result
        localStorage.setItem(cacheKey, JSON.stringify(d));
        // Update history
        const record: OtherRecord = { name: nameTrimmed, birthDate, cachedAt: Date.now(), data: d };
        const newHistory = [record, ...history.filter(h => h.name !== nameTrimmed || h.birthDate !== birthDate)].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem("divina-others-history-v1", JSON.stringify(newHistory));
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function openFromHistory(record: OtherRecord) {
    setName(record.name);
    setBirthDate(record.birthDate);
    setResult(record.data);
  }

  if (showPaywall) {
    return <SubscriptionPaywall open={true} onClose={() => router.back()} />;
  }

  // Show result
  if (result) {
    const narrativeChunks = splitIntoChunks(result.narrative ?? result.essence ?? "", 560);
    const pages: React.ReactNode[] = [
      <div key="cover" className="flex flex-col gap-4">
        <div>
          <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">{t("others.title")}</p>
          <h2 className="text-[22px] font-bold text-black leading-tight mb-1">{name}</h2>
          <p className="text-sm text-black/50">{birthDate}</p>
        </div>
        {result.keywords?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {result.keywords.map((kw: string, i: number) => (
              <span key={i} className="text-[11px] text-black/60 rounded-full px-2.5 py-1" style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)" }}>
                {kw}
              </span>
            ))}
          </div>
        )}
        {result.essence && (
          <div className="rounded-2xl p-4" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}>
            <p className="text-[14px] text-black/70 leading-relaxed">{result.essence}</p>
          </div>
        )}
      </div>,
      ...narrativeChunks.map((chunk, i) => (
        <div key={`chunk-${i}`} className="flex flex-col">
          <p className="text-[15px] text-black leading-[1.85]">{chunk}</p>
        </div>
      )),
    ];

    if (result.lifePathNumber) {
      pages.push(
        <div key="lifepath" className="flex flex-col gap-4">
          <p className="text-[10px] text-black/35 uppercase tracking-widest">{t("personality.lifePathNumber")}</p>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-bold text-black/80" style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)" }}>
              {result.lifePathNumber}
            </div>
            <p className="flex-1 text-[14px] text-black/65 leading-relaxed">{result.lifePathMeaning}</p>
          </div>
        </div>
      );
    }

    return (
      <ScrollScreen
        pages={pages}
        onBack={() => setResult(null)}
        onComplete={() => setResult(null)}
        completionLabel={t("others.newAnalysis")}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-dvh pb-28">
      <div className="px-5 pt-[env(safe-area-inset-top)] mt-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-white mb-1">{t("others.title")}</h1>
        <p className="text-sm text-white/40 leading-relaxed">{t("others.subtitle")}</p>
      </div>

      <div className="px-5 space-y-3 mb-6">
        <div>
          <label className="block text-sm text-white/50 mb-2 font-medium">{t("others.name")}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("others.namePlaceholder")}
            className="w-full rounded-2xl bg-white/[0.12] border border-white/15 px-5 py-4 text-base text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-white/50 mb-2 font-medium">{t("profile.birthDate")}</label>
          <DatePicker value={birthDate} onChange={setBirthDate} />
        </div>
        <div>
          <label className="block text-sm text-white/50 mb-2 font-medium">{t("profile.birthTime")}</label>
          <TimePicker value={birthTime} onChange={setBirthTime} />
        </div>
        <div>
          <label className="block text-sm text-white/50 mb-2 font-medium">{t("profile.birthCity")}</label>
          <CityAutocomplete
            value={birthCity}
            onChange={handleCityChange}
            placeholder={t("onboarding.cityPlaceholder")}
            className="w-full rounded-2xl bg-white/[0.12] border border-white/15 px-5 py-4 text-base text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="px-5 mb-4">
          <p className="text-sm text-red-400/80">{t("others.error")}</p>
        </div>
      )}

      <div className="px-5 mt-auto">
        <button
          onClick={handleAnalyze}
          disabled={!canSubmit || loading}
          className="w-full rounded-2xl bg-white/80 backdrop-blur-md border border-white/20 py-4 text-base font-semibold text-black/90 active:bg-white/60 transition-colors shadow-[0_4px_24px_rgba(0,0,0,0.5)] disabled:opacity-40"
        >
          {loading ? t("others.analyzing") : t("others.analyze")}
        </button>
      </div>

      {history.length > 0 && (
        <div className="px-5 mt-8">
          <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">{t("others.history")}</h3>
          <div className="space-y-2">
            {history.map((record, i) => (
              <button
                key={i}
                onClick={() => openFromHistory(record)}
                className="w-full text-left rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98] transition-transform"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <div>
                  <p className="text-sm text-white/80 font-medium">{record.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{record.birthDate}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/25 group-hover:text-white/40 transition-colors">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
