"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import CosmosBackground from "./SmokeBackground";

const VIDEO_BACKGROUNDS = [
  { id: "video-3", label: "Космос 3", src: "/watermarked_preview.mp4" },
  { id: "video-4", label: "Космос 4", src: "/cosmos-4.mp4" },
  { id: "video-10", label: "Космос 10", src: "/cosmos-10.mp4" },
  { id: "video-moon2", label: "Луна", src: "/moon2.mp4" },
];

const MAIN_VIDEO_SRC = "/main-video.mp4";

const BG_OPTIONS = [
  { id: "canvas", label: "Анимация" },
  ...VIDEO_BACKGROUNDS,
];

const VALID_IDS = new Set(BG_OPTIONS.map((o) => o.id));
const STORAGE_KEY = "divina-bg";
const LAST_INDEX_KEY = "divina-bg-last-index";

function getRotatedBackground(): string {
  try {
    const lastStr = localStorage.getItem(LAST_INDEX_KEY);
    const last = lastStr !== null ? parseInt(lastStr, 10) : -1;
    const nextIndex = (last + 1) % VIDEO_BACKGROUNDS.length;
    localStorage.setItem(LAST_INDEX_KEY, String(nextIndex));
    return VIDEO_BACKGROUNDS[nextIndex].id;
  } catch {
    return VIDEO_BACKGROUNDS[0].id;
  }
}

export default function BackgroundSwitcher() {
  const pathname = usePathname();
  const isOnboarding = pathname === "/onboarding";

  const [activeBg, setActiveBg] = useState("canvas");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOnboarding) return; // onboarding uses its own video

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && VALID_IDS.has(saved)) {
        setActiveBg(saved);
      } else {
        // No valid saved bg — rotate to next video
        const rotated = getRotatedBackground();
        setActiveBg(rotated);
        localStorage.setItem(STORAGE_KEY, rotated);
      }
    } catch {
      setActiveBg(VIDEO_BACKGROUNDS[0].id);
    }
  }, [isOnboarding]);

  const handleSelect = (id: string) => {
    setActiveBg(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
    setOpen(false);
  };

  // On onboarding, show main video
  if (isOnboarding) {
    if (!mounted) return null;
    return (
      <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true" style={{ pointerEvents: "none" }}>
        <video
          className="absolute top-1/2 left-1/2"
          style={{
            transform: "translate(-50%, -50%) rotate(90deg)",
            minWidth: "100vh",
            minHeight: "100vw",
            width: "auto",
            height: "auto",
          }}
          src={MAIN_VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
    );
  }

  const videoSrc = VIDEO_BACKGROUNDS.find((v) => v.id === activeBg)?.src;

  if (!mounted) {
    return <CosmosBackground />;
  }

  return (
    <>
      {/* Background layer */}
      {activeBg === "canvas" ? (
        <CosmosBackground />
      ) : videoSrc ? (
        <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true" style={{ pointerEvents: "none" }}>
          <video
            key={videoSrc}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: "translate(-50%, -50%) rotate(90deg)",
              minWidth: "100vh",
              minHeight: "100vw",
              width: "auto",
              height: "auto",
            }}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ) : (
        <CosmosBackground />
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 right-16 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/30 hover:text-white/60 transition-colors"
        aria-label="Сменить фон"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M2 12h4M18 12h4M12 2v4M12 18v4" opacity="0.4" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
          <div className="fixed top-16 right-4 z-50 w-48 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 p-2 space-y-1">
            {BG_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  activeBg === opt.id
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white/70"
                }`}
              >
                {opt.label}
                {activeBg === opt.id && (
                  <span className="float-right text-white/40">●</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
