"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserData } from "@/lib/user-data";
import { useT } from "@/lib/i18n";
import { useProStatus } from "@/lib/pro-status";
import SubscriptionPaywall from "@/components/paywall/SubscriptionPaywall";
import { canUsePersonalityFree, recordPersonalityUse } from "@/lib/free-limits";
import { lcGet, lcSet, TTL_MONTH } from "@/lib/local-cache";
import type { PersonalityBreakdown } from "@/lib/ai-interpret";

interface Section { title: string; text: string }

import { APP_LANG } from "@/lib/i18n";

const SECTION_TITLES_FALLBACK = APP_LANG === "en"
  ? [
      "How to Handle Conflicts", "How to Love and Be Loved",
      "How to Make the Right Choice", "When in Doubt",
      "Friendships & Circle", "Career & Purpose", "Money & Resources",
    ]
  : [
      "Как поступать в конфликтах", "Как любить и быть любимым",
      "Как делать правильный выбор", "Когда сомневаешься",
      "Дружба и окружение", "Карьера и призвание", "Деньги и ресурсы",
    ];

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

const GLASS_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.80)",
  backdropFilter: "blur(32px) saturate(1.8)",
  WebkitBackdropFilter: "blur(32px) saturate(1.8)",
  border: "1px solid rgba(255,255,255,0.90)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
};

// Scrollable card screen — scroll-snap, no Далее button
function ScrollScreen({
  pages,
  completionLabel,
  onBack,
  onComplete,
}: {
  pages: React.ReactNode[];
  completionLabel: string;
  onBack: () => void;
  onComplete: () => void;
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
      el.style.opacity = '0';
      el.style.animationDelay = `${idx * STAGGER_MS}ms`;
    });
    inner.classList.remove("page-enter", "page-enter-flat");
    void inner.offsetHeight;
    inner.classList.add(wrapper ? "page-enter" : "page-enter-flat");
    const totalTime = ANIM_MS + (targets.length - 1) * STAGGER_MS;
    setTimeout(() => {
      targets.forEach(child => {
        (child as HTMLElement).style.opacity = '';
        (child as HTMLElement).style.animationDelay = '';
      });
    }, totalTime);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const rawPage = el.scrollTop / el.clientHeight;
    const rounded = Math.round(rawPage);

    // Entrance animation when page snaps to a new position
    if (rounded !== activePageRef.current) {
      activePageRef.current = rounded;
      setActivePage(rounded);
      const snap = el.querySelector(`[data-sp="${rounded}"]`);
      const inner = snap?.querySelector("[data-inner]") as HTMLElement | null;
      if (inner) triggerEnter(inner);
    }

    // Scroll-based fade between pages
    el.querySelectorAll("[data-sp]").forEach((node, i) => {
      const dist = Math.abs(rawPage - i);
      const opacity = Math.max(0, 1 - dist * 2.4);
      (node as HTMLElement).style.opacity = opacity.toFixed(3);
    });
  }, [triggerEnter]);

  // Animate first page on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const snap = el.querySelector('[data-sp="0"]');
    const inner = snap?.querySelector("[data-inner]") as HTMLElement | null;
    if (inner) triggerEnter(inner);
  }, [triggerEnter]);

  // #10: back button goes to previous page, or exits if on first page
  const handleBack = useCallback(() => {
    const el = scrollRef.current;
    if (activePage > 0 && el) {
      el.scrollTo({ top: (activePage - 1) * el.clientHeight, behavior: "smooth" });
    } else {
      onBack();
    }
  }, [activePage, onBack]);

  const displayPage = Math.min(activePage + 1, total);

  return (
    // #9: clicking outside the card navigates back
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh" }}
      onClick={onBack}
    >
      {/* Top bar — stop propagation so clicks here don't close */}
      <div
        className="flex items-center justify-between px-5 pb-2 shrink-0" style={{ paddingTop: "max(3.5rem, env(safe-area-inset-top))" }}
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
        {total > 1 && (
          <span className="text-white/40 text-xs tabular-nums">{displayPage} / {total}</span>
        )}
        <div className="w-10" />
      </div>

      {/* Card container — stop propagation so taps on card don't close */}
      <div
        className="flex-1 min-h-0 px-4 pb-6 pt-2"
        onClick={e => e.stopPropagation()}
      >
        {/* #7: progress bar is INSIDE this relative wrapper, at bottom of card */}
        <div className="relative h-full">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full rounded-3xl scrollbar-hide"
            style={{
              ...GLASS_STYLE,
              overflowY: "scroll",
              scrollSnapType: "y mandatory",
            }}
          >
            {/* Content pages */}
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

            {/* Completion page — last snap item inside card */}
            <div
              data-sp={total}
              className="snap-start flex flex-col items-center justify-center gap-4"
              style={{ minHeight: "100%", opacity: 1 }}
            >
              <div data-inner className="w-full flex flex-col items-center gap-4">
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
          </div>{/* end scroll container */}

          {/* #7: Progress bar — absolute overlay at bottom of card */}
          <div
            className="absolute bottom-0 left-0 right-0 px-6 pb-4 pt-10 rounded-b-3xl pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.65))" }}
          >
            <div className="h-[3px] rounded-full" style={{ background: "rgba(0,0,0,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  background: "rgba(0,0,0,0.28)",
                  width: `${((activePage + 1) / (total + 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PersonalityPage() {
  const router = useRouter();
  const { t } = useT();
  const { isPro } = useProStatus();
  const [openUpsell, setOpenUpsell] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [data, setData] = useState<PersonalityBreakdown | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [phase, setPhase] = useState<"narrative" | "menu" | "chapter">("narrative");
  const [chapterIdx, setChapterIdx] = useState(0);

  // Gate: non-Pro users get 1 free personality breakdown
  useEffect(() => {
    if (!isPro && !canUsePersonalityFree()) {
      setShowPaywall(true);
    } else if (!isPro) {
      recordPersonalityUse(); // consume the free use on first open
    }
  }, [isPro]);

  useEffect(() => {
    const userData = getUserData();
    const lang = userData.lang ?? "ru";
    const tone = userData.tone ?? "deep";

    const personalityKey = `divina-personality-v5_${lang}_${tone}`;
    const natKey = `divina-natal-v5_${lang}_${tone}`;

    // Personality — cached 30 days (static data, doesn't change)
    const cachedPersonality = lcGet<{ narrative?: string; essence?: string }>(personalityKey);
    if (cachedPersonality?.narrative || cachedPersonality?.essence) {
      setData(cachedPersonality as never);
      setDataLoading(false);
    } else {
      fetch("/api/personality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: userData.birthDate, birthTime: userData.birthTime,
          lat: userData.lat, lng: userData.lng,
          tzOffset: userData.tzOffset, tone: userData.tone, lang: userData.lang,
        }),
      })
        .then(r => r.json())
        .then(d => {
          if (d?.narrative || d?.essence) {
            setData(d);
            lcSet(personalityKey, d, TTL_MONTH);
          }
        })
        .catch(() => {})
        .finally(() => setDataLoading(false));
    }

    // Natal interpretation — cached 30 days
    const cachedNatal = lcGet<unknown[]>(natKey);
    if (Array.isArray(cachedNatal) && cachedNatal.length > 0) {
      setSections(cachedNatal as never); setSectionsLoading(false); return;
    }

    fetch("/api/interpretation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate: userData.birthDate, birthTime: userData.birthTime,
        lat: userData.lat, lng: userData.lng,
        tzOffset: userData.tzOffset, tone: userData.tone, lang: userData.lang,
      }),
    })
      .then(r => r.json())
      .then(d => {
        if (d?.sections && Array.isArray(d.sections)) {
          setSections(d.sections);
          lcSet(natKey, d.sections, TTL_MONTH);
        }
      })
      .catch(() => {})
      .finally(() => setSectionsLoading(false));
  }, []);

  const openChapter = useCallback((idx: number) => {
    setChapterIdx(idx);
    setPhase("chapter");
  }, []);

  const goToMenu = useCallback(() => setPhase("menu"), []);

  if (!data) {
    if (dataLoading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          <p className="text-white/40 text-sm">Загрузка...</p>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-white/50 text-sm">{t("error.data")}</p>
        <button onClick={() => router.push("/profile")} className="text-sm text-white/60 border border-white/15 rounded-xl px-5 py-2.5">
          Перейти в профиль
        </button>
      </div>
    );
  }

  // ── CHAPTER ────────────────────────────────────────────────────────────────
  if (phase === "chapter") {
    const currentSection = sections[chapterIdx];
    const chapterChunks = splitIntoChunks(currentSection?.text ?? "", 560);

    const chapterPages: React.ReactNode[] = chapterChunks.length > 0
      ? chapterChunks.map((chunk, i) => (
          <div key={i} className="flex flex-col">
            {i === 0 && (
              <>
                <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">{t("personality.breakdown")}</p>
                <h2 className="text-[19px] font-bold text-black leading-tight mb-4">
                  {currentSection?.title}
                </h2>
              </>
            )}
            <p className="text-[15px] text-black leading-[1.85]">{chunk}</p>
          </div>
        ))
      : [
          <div key="loading" className="flex flex-col gap-3">
            <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">Разбор</p>
            <h2 className="text-[19px] font-bold text-black leading-tight mb-4">
              {currentSection?.title ?? ""}
            </h2>
            <div className="space-y-3 w-full">
              {[1,2,3,4].map(n => (
                <div key={n} className="h-3.5 bg-black/[0.07] rounded-lg animate-pulse" style={{ width: `${75 + (n % 3) * 8}%` }} />
              ))}
            </div>
          </div>,
        ];

    return (
      <ScrollScreen
        pages={chapterPages}
        completionLabel={t("personality.backToSections")}
        onBack={goToMenu}
        onComplete={goToMenu}
      />
    );
  }

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (phase === "menu") {
    return (
      <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
        <div className="flex items-center px-5 pb-2 shrink-0" style={{ paddingTop: "max(3.5rem, env(safe-area-inset-top))" }}>
          <button
            onClick={() => setPhase("narrative")}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
        <div className="flex-1 min-h-0 px-4 py-2 pb-10">
          <div className="h-full rounded-3xl overflow-hidden" style={GLASS_STYLE}>
            <div className="h-full overflow-y-auto p-6">
              <p className="text-[10px] text-black/35 uppercase tracking-widest mb-1">{t("personality.personalBreakdown")}</p>
              <h2 className="text-[20px] font-bold text-black mb-1">{t("personality.chooseTopic")}</h2>
              <p className="text-sm text-black/40 mb-5">{t("personality.deepBreakdown")}</p>
              <div className="space-y-2">
                {(sectionsLoading
                  ? SECTION_TITLES_FALLBACK.map(t => ({ title: t, text: "" }))
                  : sections.length > 0 ? sections : SECTION_TITLES_FALLBACK.map(t => ({ title: t, text: "" }))
                ).map((s, i) => {
                  const hasText = !sectionsLoading && !!sections[i]?.text;
                  return (
                    <button key={i} onClick={() => hasText ? openChapter(i) : undefined} disabled={!hasText}
                      className="w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 disabled:opacity-50"
                      style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}
                    >
                      <span className="text-[15px] font-medium text-black flex-1 text-left">{s.title}</span>
                      {sectionsLoading
                        ? <div className="h-3 w-12 bg-black/10 rounded animate-pulse shrink-0" />
                        : hasText
                          ? <svg className="shrink-0 text-black/25" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                          : null}
                    </button>
                  );
                })}
              </div>
              {data.lifePathNumber != null && (
                <div className="mt-4 p-4 rounded-2xl flex items-center gap-4" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}>
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,0,0,0.06)" }}>
                    <span className="text-lg font-bold text-black">{data.lifePathNumber}</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-black/35 uppercase tracking-wider mb-0.5">{t("personality.lifePathNumber")}</p>
                    <p className="text-sm text-black/70 leading-snug">{data.lifePathMeaning}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── NARRATIVE ─────────────────────────────────────────────────────────────
  const narrativeChunks = splitIntoChunks(data?.narrative ?? "", 560);

  const narrativePages: React.ReactNode[] = narrativeChunks.map((chunk, i) => (
    <div key={i} className="flex flex-col">
      {i === 0 && (
        <>
          <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">{t("personality.yourEssence")}</p>
          <h2 className="text-[21px] font-bold text-black leading-tight mb-3">{data.essence}</h2>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(data.keywords ?? []).map((kw, ki) => (
              <span key={ki} className="text-xs px-2.5 py-1 rounded-full text-black/55"
                style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" }}>
                {kw}
              </span>
            ))}
          </div>
        </>
      )}
      <p className="text-[15px] text-black leading-[1.85]">{chunk}</p>
    </div>
  ));

  // Add upsell page at the end for non-Pro users
  if (!isPro) {
    narrativePages.push(
      <div key="upsell" className="flex flex-col gap-5">
        <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)" }}>
          <p className="text-[15px] font-bold text-black">{t("upsell.title")}</p>
          <p className="text-[13px] text-black/60 leading-relaxed">{t("upsell.text")}</p>
          <button
            onClick={() => setOpenUpsell(true)}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white"
            style={{ background: "rgba(0,0,0,0.75)" }}
          >
            {t("upsell.cta")}
          </button>
        </div>
      </div>
    );
  }

  if (showPaywall) {
    return <SubscriptionPaywall open={true} onClose={() => router.back()} />;
  }

  return (
    <>
      <ScrollScreen
        pages={narrativePages}
        completionLabel={t("personality.backToSectionsArrow")}
        onBack={() => router.back()}
        onComplete={goToMenu}
      />
      <SubscriptionPaywall open={openUpsell} onClose={() => setOpenUpsell(false)} />
    </>
  );
}
