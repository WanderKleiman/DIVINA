"use client";

export default function ForecastSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Moon with phase animation */}
      <div className="relative w-24 h-24 mb-8">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Moon base - glowing circle */}
          <defs>
            <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#moonGlow)" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="32" fill="rgba(255,255,255,0.08)" />
          {/* Moon shadow - animating phase */}
          <ellipse cx="50" cy="50" rx="0" ry="32" fill="rgba(0,0,0,0.6)" className="animate-moon-phase" />
        </svg>

        {/* Twinkling stars */}
        <div className="absolute -top-3 -right-2 w-1.5 h-1.5 rounded-full bg-white/60 animate-twinkle-1" />
        <div className="absolute top-2 -left-4 w-1 h-1 rounded-full bg-white/40 animate-twinkle-2" />
        <div className="absolute -bottom-1 right-4 w-1 h-1 rounded-full bg-white/50 animate-twinkle-3" />
        <div className="absolute top-8 -right-5 w-0.5 h-0.5 rounded-full bg-white/30 animate-twinkle-4" />
        <div className="absolute -bottom-3 -left-2 w-1 h-1 rounded-full bg-white/35 animate-twinkle-2" />
      </div>

      {/* Label with fade */}
      <p className="text-sm text-white/70 animate-pulse-slow">{label}</p>

      <style jsx>{`
        @keyframes moonPhase {
          0% { rx: 0; }
          25% { rx: 20; }
          50% { rx: 32; }
          75% { rx: 20; }
          100% { rx: 0; }
        }
        @keyframes twinkle1 {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(0.5); }
        }
        @keyframes twinkle2 {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.05; transform: scale(0.3); }
        }
        @keyframes twinkle3 {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(0.4); }
        }
        @keyframes twinkle4 {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.05; transform: scale(0.2); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .animate-moon-phase {
          animation: moonPhase 4s ease-in-out infinite;
        }
        .animate-twinkle-1 {
          animation: twinkle1 2.5s ease-in-out infinite;
        }
        .animate-twinkle-2 {
          animation: twinkle2 3.2s ease-in-out infinite;
        }
        .animate-twinkle-3 {
          animation: twinkle3 2.8s ease-in-out infinite;
        }
        .animate-twinkle-4 {
          animation: twinkle4 3.5s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
