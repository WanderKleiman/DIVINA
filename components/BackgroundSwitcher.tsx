"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import CosmosBackground from "./SmokeBackground";

// Videos play in order 1→2→3→4→1→2… on each new app session
const SESSION_VIDEOS = [
  "/prodaction1.mp4",
  "/prodaction2.mp4",
  "/prodaction3.mp4",
  "/prodaction4.mp4",
];

const MAIN_VIDEO_SRC = "/prodaction1.mp4";

// Keys
const LAST_INDEX_KEY = "divina-bg-last-index";   // localStorage — which index was last used
const SESSION_KEY    = "divina-bg-session";       // sessionStorage — current session's video

function pickSessionVideo(): string {
  try {
    // If already picked for this session, reuse it
    const sessionSrc = sessionStorage.getItem(SESSION_KEY);
    if (sessionSrc) return sessionSrc;

    // Pick next index
    const lastStr = localStorage.getItem(LAST_INDEX_KEY);
    const last = lastStr !== null ? parseInt(lastStr, 10) : -1;
    const nextIndex = (last + 1) % SESSION_VIDEOS.length;

    localStorage.setItem(LAST_INDEX_KEY, String(nextIndex));
    const src = SESSION_VIDEOS[nextIndex];
    sessionStorage.setItem(SESSION_KEY, src);
    return src;
  } catch {
    return SESSION_VIDEOS[0];
  }
}

export default function BackgroundSwitcher() {
  const pathname = usePathname();
  const isOnboarding = pathname === "/onboarding";

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isOnboarding) {
      setVideoSrc(pickSessionVideo());
    }
  }, [isOnboarding]);

  // Onboarding — always uses first production video
  if (isOnboarding) {
    return (
      <div
        className="fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
        style={{ pointerEvents: "none", background: "#0f0824" }}
      >
        {mounted && (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={MAIN_VIDEO_SRC}
            autoPlay
            loop
            muted
            playsInline
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>
    );
  }

  if (!mounted) {
    return <div className="fixed inset-0 z-0" style={{ background: "#0f0824" }} />;
  }

  if (!videoSrc) {
    return <CosmosBackground />;
  }

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={{ pointerEvents: "none", background: "#0f0824" }}
    >
      <video
        key={videoSrc}
        className="absolute inset-0 w-full h-full object-cover"
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-black/25" />
    </div>
  );
}
