"use client";

import { useEffect } from "react";

interface PaywallSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  cta?: React.ReactNode;
  videoSrc?: string;
  rotateVideo?: boolean; // true for landscape-encoded prodaction videos
}

export default function PaywallSheet({ open, onClose, children, cta, videoSrc = "/cosmos-4.mp4", rotateVideo = false }: PaywallSheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 animate-fade-in" onClick={onClose} />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[92dvh] flex flex-col rounded-t-3xl overflow-hidden animate-slide-up">
        {/* Video background */}
        {rotateVideo ? (
          <video
            src={videoSrc}
            autoPlay loop muted playsInline
            style={{
              pointerEvents: "none",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(90deg)",
              minWidth: "100vh",
              minHeight: "100vw",
              width: "auto",
              height: "auto",
            }}
          />
        ) : (
          <video
            src={videoSrc}
            autoPlay loop muted playsInline
            className="absolute inset-0 h-full w-full object-cover"
            style={{ pointerEvents: "none" }}
          />
        )}
        <div className="absolute inset-0 bg-black/65" style={{ pointerEvents: "none" }} />

        {/* Handle + Close */}
        <div className="relative z-10 flex items-center justify-center pt-3 pb-1 shrink-0">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Scrollable content */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 pt-2 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
          {children}
          {/* Legacy CTA slot — renders inline if passed */}
          {cta && <div className="mt-4">{cta}</div>}
        </div>
      </div>
    </div>
  );
}
