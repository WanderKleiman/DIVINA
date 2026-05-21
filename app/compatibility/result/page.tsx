"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserData } from "@/lib/user-data";
import { savePurchase, hasPurchase } from "@/lib/purchases";
import { useT } from "@/lib/i18n";
import type { CompatibilityAIResult } from "@/lib/ai-interpret";


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

const GLASS_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.80)",
  backdropFilter: "blur(32px) saturate(1.8)",
  WebkitBackdropFilter: "blur(32px) saturate(1.8)",
  border: "1px solid rgba(255,255,255,0.90)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
};

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

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const rawPage = el.scrollTop / el.clientHeight;
    const rounded = Math.round(rawPage);
    activePageRef.current = rounded;
    setActivePage(rounded);

    el.querySelectorAll("[data-sp]").forEach((node, i) => {
      const dist = Math.abs(rawPage - i);
      const opacity = Math.max(0.06, 1 - dist * 2.4);
      const ty = (rawPage - i) * -16;
      const el2 = node as HTMLElement;
      el2.style.opacity = opacity.toFixed(3);
      el2.style.transform = `translateY(${ty.toFixed(1)}px)`;
    });
  }, []);

  const handleBack = useCallback(() => {
    const el = scrollRef.current;
    const currentPage = activePageRef.current;
    if (currentPage > 0 && el) {
      const targetPage = currentPage - 1;
      activePageRef.current = targetPage;
      setActivePage(targetPage);
      el.scrollTo({ top: targetPage * el.clientHeight, behavior: "smooth" });
    } else {
      onBack();
    }
  }, [onBack]);

  const displayPage = Math.min(activePage + 1, total);

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh" }}
      onClick={onBack}
    >
      <div
        className="flex items-center justify-between px-5 pt-14 pb-2 shrink-0"
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

      <div
        className="flex-1 min-h-0 px-4 pb-6 pt-2"
        onClick={e => e.stopPropagation()}
      >
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
            {pages.map((page, i) => (
              <div
                key={i}
                data-sp={i}
                className="snap-start p-6 flex flex-col justify-center"
                style={{
                  minHeight: "100%",
                  opacity: i === 0 ? 1 : 0.06,
                  transform: "translateY(0px)",
                  transition: "opacity 0.1s ease-out, transform 0.1s ease-out",
                }}
              >
                {page}
              </div>
            ))}

            <div
              data-sp={total}
              className="snap-start p-6 flex flex-col items-center justify-center gap-4"
              style={{
                minHeight: "100%",
                opacity: 0.06,
                transform: "translateY(0px)",
                transition: "opacity 0.1s ease-out, transform 0.1s ease-out",
              }}
            >
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

function LoadingSkeleton({ partnerName }: { partnerName: string }) {
  const { t } = useT();
  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
      <div className="flex items-center justify-between px-5 pt-14 pb-2 shrink-0">
        <div className="h-10 w-10 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.15)" }} />
        <div className="h-3 w-20 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.12)" }} />
        <div className="w-10" />
      </div>
      <div className="flex-1 min-h-0 px-4 pb-6 pt-2">
        <div className="h-full rounded-3xl p-6 flex flex-col justify-center gap-5" style={GLASS_STYLE}>
          <div className="h-3 w-24 rounded-full animate-pulse" style={{ background: "rgba(0,0,0,0.08)" }} />
          <div className="h-7 w-3/4 rounded-full animate-pulse" style={{ background: "rgba(0,0,0,0.10)" }} />
          {partnerName && (
            <p className="text-sm text-black/40">{t("compat.analyzing")}</p>
          )}
          <div className="flex gap-2 flex-wrap">
            {[1,2,3].map(n => (
              <div key={n} className="h-7 rounded-full animate-pulse" style={{ width: `${50 + n * 20}px`, background: "rgba(0,0,0,0.07)" }} />
            ))}
          </div>
          <div className="space-y-3 mt-2">
            {[1,2,3,4,5].map(n => (
              <div key={n} className="h-3.5 bg-black/[0.07] rounded-lg animate-pulse" style={{ width: `${65 + (n % 4) * 8}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompatibilityResultPage() {
  const router = useRouter();
  const { t } = useT();
  const [result, setResult] = useState<CompatibilityAIResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [phase, setPhase] = useState<"overview" | "menu" | "section">("overview");
  const [sectionIdx, setSectionIdx] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const partnerRaw = sessionStorage.getItem("divina_compat_partner");
        if (!partnerRaw) {
          setError(t("compat.partnerNotFound"));
          setLoading(false);
          return;
        }
        const partner = JSON.parse(partnerRaw);
        const name = partner.name || t("compat.partner");
        setPartnerName(name);

        const user = getUserData();

        // Check session cache
        const cacheKey = `divina-compat-result-v2_${name}_${user.birthDate}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed?.overallPercent) {
              setResult(parsed);
              setLoading(false);
              return;
            }
          } catch {}
        }

        const res = await fetch("/api/compatibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: { birthDate: user.birthDate, birthTime: user.birthTime, lat: user.lat, lng: user.lng, tzOffset: user.tzOffset },
            partner: { birthDate: partner.birthDate, birthTime: partner.birthTime, lat: partner.lat, lng: partner.lng, tzOffset: partner.tzOffset },
            tone: user.tone,
            lang: user.lang,
          }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json() as CompatibilityAIResult;
        if (controller.signal.aborted) return;
        setResult(data);
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        if (!hasPurchase("compatibility")) {
          savePurchase("compatibility", { partnerName: name });
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(t("error.compat_result"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSection = useCallback((idx: number) => {
    setSectionIdx(idx);
    setPhase("section");
  }, []);

  const goToMenu = useCallback(() => setPhase("menu"), []);
  const goToOverview = useCallback(() => setPhase("overview"), []);

  if (loading) return <LoadingSkeleton partnerName={partnerName} />;

  if (error || !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] px-6">
        <p className="text-sm text-white/40 mb-4">{error || t("generic.error_occurred")}</p>
        <button onClick={() => router.back()} className="text-sm text-white/50 border border-white/15 rounded-xl px-4 py-2">
          {t("generic.back")}
        </button>
      </div>
    );
  }

  const sections = result.sections ?? [];

  // ── SECTION ───────────────────────────────────────────────────────────────
  if (phase === "section") {
    const currentSection = sections[sectionIdx];
    const chunks = splitIntoChunks(currentSection?.story ?? "", 480);

    const sectionPages: React.ReactNode[] = chunks.length > 0
      ? chunks.map((chunk, i) => (
          <div key={i} className="flex flex-col">
            {i === 0 && (
              <>
                <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">{t("compat.section")}</p>
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
            <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">{t("compat.section")}</p>
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
        pages={sectionPages}
        completionLabel={t("compat.backToSections")}
        onBack={goToMenu}
        onComplete={goToMenu}
      />
    );
  }

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (phase === "menu") {
    return (
      <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
        <div className="flex items-center px-5 pt-14 pb-2 shrink-0">
          <button
            onClick={goToOverview}
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
              <p className="text-[10px] text-black/35 uppercase tracking-widest mb-1">{t("compat.youAndLabel")} {partnerName}</p>
              <h2 className="text-[20px] font-bold text-black mb-1">{t("compat.sections")}</h2>
              <p className="text-sm text-black/40 mb-5">{t("compat.chooseTopic")}</p>

              {/* Overall score */}
              <div className="mb-4 p-4 rounded-2xl flex items-center gap-4" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}>
                <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,0,0,0.06)" }}>
                  <span className="text-xl font-bold text-black">{result.overallPercent}%</span>
                </div>
                <div>
                  <p className="text-[10px] text-black/35 uppercase tracking-wider mb-0.5">{t("compat.overallScore")}</p>
                  <p className="text-sm text-black/70 leading-snug">{result.essence}</p>
                </div>
              </div>

              <div className="space-y-2">
                {sections.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => openSection(i)}
                    className="w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3"
                    style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}
                  >
                    <span className="text-[15px] font-medium text-black flex-1 text-left">{s.title}</span>
                    <svg className="shrink-0 text-black/25" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => router.push("/compatibility")}
                  className="w-full rounded-2xl py-3.5 text-sm font-medium text-black/55"
                  style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}
                >
                  {t("compat.newCheck")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── OVERVIEW ──────────────────────────────────────────────────────────────
  const firstSection = sections[0];
  const firstStoryChunks = splitIntoChunks(firstSection?.story ?? "", 560);

  const overviewPages: React.ReactNode[] = [
    // Page 1: essence + keywords + overall score
    <div key="intro" className="flex flex-col">
      <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">{t("compat.youAndLabel")} {partnerName}</p>
      <h2 className="text-[21px] font-bold text-black leading-tight mb-3">{result.essence}</h2>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {(result.keywords ?? []).map((kw, ki) => (
          <span
            key={ki}
            className="text-xs px-2.5 py-1 rounded-full text-black/55"
            style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" }}
          >
            {kw}
          </span>
        ))}
      </div>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-[52px] font-bold text-black leading-none">{result.overallPercent}%</span>
        <span className="text-sm text-black/40 mb-2">{t("compat.overall")}</span>
      </div>
      <p className="text-[14px] text-black/60 leading-relaxed mt-3">{result.summary}</p>
    </div>,
    // Page 2+: first section story chunks
    ...firstStoryChunks.map((chunk, i) => (
      <div key={`first-${i}`} className="flex flex-col">
        {i === 0 && (
          <>
            <p className="text-[10px] text-black/35 uppercase tracking-widest mb-2">{t("compat.section")}</p>
            <h2 className="text-[19px] font-bold text-black leading-tight mb-4">
              {firstSection?.title}
            </h2>
          </>
        )}
        <p className="text-[15px] text-black leading-[1.85]">{chunk}</p>
      </div>
    )),
  ];

  return (
    <ScrollScreen
      pages={overviewPages}
      completionLabel={t("compat.allSections")}
      onBack={() => router.back()}
      onComplete={goToMenu}
    />
  );
}
