"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserData } from "@/lib/user-data";
import { useT } from "@/lib/i18n";

interface Section {
  title: string;
  text: string;
}

const GLASS_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.80)",
  backdropFilter: "blur(32px) saturate(1.8)",
  WebkitBackdropFilter: "blur(32px) saturate(1.8)",
  border: "1px solid rgba(255,255,255,0.90)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
};

function splitIntoChunks(text: string, maxChars = 480): string[] {
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

// ── ScrollScreen (same pattern as other story pages) ──────────────────────
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
      const e = child as HTMLElement;
      e.style.opacity = '0';
      e.style.animationDelay = `${idx * STAGGER_MS}ms`;
    });
    inner.classList.remove("page-enter", "page-enter-flat");
    void inner.offsetHeight;
    inner.classList.add(wrapper ? "page-enter" : "page-enter-flat");
    const totalTime = ANIM_MS + (targets.length - 1) * STAGGER_MS;
    setTimeout(() => {
      targets.forEach(child => {
        const e = child as HTMLElement;
        e.style.opacity = '';
        e.style.animationDelay = '';
      });
    }, totalTime);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const snap = el.querySelector('[data-sp="0"]');
    const inner = snap?.querySelector("[data-inner]") as HTMLElement | null;
    if (inner) triggerEnter(inner);
  }, [triggerEnter]);

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
      (node as HTMLElement).style.opacity = Math.max(0, 1 - dist * 2.4).toFixed(3);
    });
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
      <div className="flex items-center justify-between px-5 pt-14 pb-2 shrink-0" onClick={e => e.stopPropagation()}>
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
              <div key={i} data-sp={i} className="snap-start flex flex-col justify-center" style={{ minHeight: "100%", opacity: 1 }}>
                <div data-inner className="p-6">{page}</div>
              </div>
            ))}
            <div data-sp={total} className="snap-start flex flex-col items-center justify-center" style={{ minHeight: "100%", opacity: 1 }}>
              <div data-inner className="w-full flex flex-col items-center gap-4 p-6">
                <button
                  onClick={onComplete}
                  className="w-full h-14 rounded-2xl text-sm font-semibold text-black/75"
                  style={{ background: "rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.10)" }}
                >
                  {completionLabel}
                </button>
                <p className="text-xs text-black/25">свайп вниз для перехода</p>
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

// ── Skeleton ────────────────────────────────────────────────────────────────
function InterpretationSkeleton() {
  return (
    <div className="flex flex-col pb-28">
      <div className="px-5 pt-[env(safe-area-inset-top)] mt-4 mb-6">
        <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse mb-4" />
        <div className="h-6 w-48 bg-white/[0.12] rounded-full animate-pulse mb-2" />
        <div className="h-3.5 w-36 bg-white/[0.08] rounded-full animate-pulse" />
      </div>
      <div className="px-5 space-y-2.5">
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="h-3.5 flex-1 bg-white/[0.10] rounded-full animate-pulse" />
            <div className="h-4 w-4 bg-white/[0.08] rounded animate-pulse shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function InterpretationPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openSection, setOpenSection] = useState<number | null>(null);
  const { t } = useT();

  useEffect(() => {
    const cached = sessionStorage.getItem("divina-natal-deep-v4");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSections(parsed);
          setLoading(false);
          return;
        }
      } catch {}
    }
    async function load() {
      try {
        const user = getUserData();
        const res = await fetch("/api/interpretation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            birthDate: user.birthDate, birthTime: user.birthTime,
            lat: user.lat, lng: user.lng,
            tzOffset: user.tzOffset, tone: user.tone, lang: user.lang,
          }),
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (Array.isArray(data.sections) && data.sections.length > 0) {
          setSections(data.sections);
          sessionStorage.setItem("divina-natal-deep-v4", JSON.stringify(data.sections));
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Section story view ────────────────────────────────────────────────────
  if (openSection !== null) {
    const sec = sections[openSection];
    const chunks = splitIntoChunks(sec?.text ?? "", 480);
    const storyPages: React.ReactNode[] = chunks.length > 0
      ? [
          // First page: title + first chunk
          <div key="t" className="flex flex-col">
            <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">Разбор карты</p>
            <h2 className="text-[20px] font-bold text-black leading-tight mb-4">{sec.title}</h2>
            <p className="text-[15px] text-black leading-[1.85]">{chunks[0]}</p>
          </div>,
          ...chunks.slice(1).map((chunk, i) => (
            <div key={i} className="flex flex-col">
              <p className="text-[15px] text-black leading-[1.85]">{chunk}</p>
            </div>
          )),
        ]
      : [
          <div key="loading" className="flex flex-col gap-3">
            <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">Разбор карты</p>
            <h2 className="text-[20px] font-bold text-black leading-tight mb-4">{sec?.title}</h2>
            <div className="space-y-3">
              {[1,2,3,4].map(n => (
                <div key={n} className="h-3.5 bg-black/[0.07] rounded-lg animate-pulse" style={{ width: `${75 + (n % 3) * 8}%` }} />
              ))}
            </div>
          </div>,
        ];
    return (
      <ScrollScreen
        pages={storyPages}
        completionLabel="К разделам"
        onBack={() => setOpenSection(null)}
        onComplete={() => setOpenSection(null)}
      />
    );
  }

  if (loading) return <InterpretationSkeleton />;

  if (error || sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] px-6">
        <p className="text-sm text-white/40 mb-4 text-center">Не удалось загрузить расшифровку.</p>
        <button onClick={() => router.back()} className="text-sm text-white/50 border border-white/15 rounded-xl px-4 py-2">
          Назад
        </button>
      </div>
    );
  }

  // ── Sections list (white glass cards) ─────────────────────────────────────
  const CARD_GLASS: React.CSSProperties = {
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(255,255,255,0.92)",
    backdropFilter: "blur(28px) saturate(1.6)",
    WebkitBackdropFilter: "blur(28px) saturate(1.6)",
  };

  return (
    <div className="flex flex-col pb-28">
      {/* Header */}
      <div className="px-5 pt-[env(safe-area-inset-top)] mt-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-white mb-1">Расшифровка карты</h1>
        <p className="text-sm text-white/40">Глубокий анализ каждой сферы жизни</p>
      </div>

      {/* White cards */}
      <div className="px-5 space-y-2.5 stagger">
        {sections.map((sec, i) => (
          <button
            key={i}
            onClick={() => setOpenSection(i)}
            className="animate-fade-in-up w-full text-left rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
            style={CARD_GLASS}
          >
            <div className="flex items-center gap-3 p-4">
              <span className="text-[14px] font-semibold text-black flex-1 leading-snug">{sec.title}</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
