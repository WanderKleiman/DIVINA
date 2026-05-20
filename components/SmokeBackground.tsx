"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
}

interface Nebula {
  x: number;
  y: number;
  baseRadius: number;
  color1: [number, number, number];
  color2: [number, number, number];
  phase: number;
  pulseSpeed: number;
  driftX: number;
  driftY: number;
  driftSpeed: number;
  brightnessPhase: number;
  brightnessSpeed: number;
  baseAlpha: number;
}

export default function CosmosBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let stars: Star[] = [];
    let nebulae: Nebula[] = [];
    let time = 0;
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;

    const STAR_COUNT = 1200;
    const MAX_DEPTH = 1500;
    const SPEED = 0.4;

    const starColors = [
      "255,255,255",
      "200,220,255",
      "255,220,200",
      "220,200,255",
      "180,220,255",
      "255,200,180",
      "255,255,240",
    ];

    function createStar(startFar: boolean): Star {
      return {
        x: (Math.random() - 0.5) * w * 3,
        y: (Math.random() - 0.5) * h * 3,
        z: startFar ? MAX_DEPTH : Math.random() * MAX_DEPTH,
        size: Math.random() * 1.5 + 0.5,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cx = w / 2;
      cy = h / 2;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
    }

    function init() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(createStar(false));
      }

      const maxDim = Math.max(w, h);
      nebulae = [
        // Large red/crimson nebula — top-left
        {
          x: w * 0.2, y: h * 0.2,
          baseRadius: maxDim * 0.45,
          color1: [200, 30, 60], color2: [255, 80, 40],
          phase: 0, pulseSpeed: 0.003,
          driftX: w * 0.06, driftY: h * 0.04, driftSpeed: 0.0004,
          brightnessPhase: 0, brightnessSpeed: 0.005,
          baseAlpha: 0.18,
        },
        // Deep purple nebula — center-right
        {
          x: w * 0.75, y: h * 0.35,
          baseRadius: maxDim * 0.4,
          color1: [130, 40, 200], color2: [80, 20, 160],
          phase: Math.PI * 0.7, pulseSpeed: 0.0025,
          driftX: w * 0.05, driftY: h * 0.05, driftSpeed: 0.0005,
          brightnessPhase: Math.PI * 0.3, brightnessSpeed: 0.004,
          baseAlpha: 0.2,
        },
        // Blue/teal nebula — bottom
        {
          x: w * 0.5, y: h * 0.75,
          baseRadius: maxDim * 0.38,
          color1: [20, 80, 180], color2: [40, 140, 200],
          phase: Math.PI * 1.3, pulseSpeed: 0.002,
          driftX: w * 0.07, driftY: h * 0.03, driftSpeed: 0.00035,
          brightnessPhase: Math.PI, brightnessSpeed: 0.006,
          baseAlpha: 0.15,
        },
        // Hot pink/magenta — right side
        {
          x: w * 0.85, y: h * 0.7,
          baseRadius: maxDim * 0.3,
          color1: [220, 40, 140], color2: [180, 60, 200],
          phase: Math.PI * 0.4, pulseSpeed: 0.0035,
          driftX: w * 0.04, driftY: h * 0.06, driftSpeed: 0.0006,
          brightnessPhase: Math.PI * 1.5, brightnessSpeed: 0.007,
          baseAlpha: 0.16,
        },
        // Orange/gold glow — left
        {
          x: w * 0.15, y: h * 0.6,
          baseRadius: maxDim * 0.28,
          color1: [200, 120, 30], color2: [220, 80, 50],
          phase: Math.PI * 1.8, pulseSpeed: 0.003,
          driftX: w * 0.05, driftY: h * 0.04, driftSpeed: 0.00045,
          brightnessPhase: Math.PI * 0.8, brightnessSpeed: 0.005,
          baseAlpha: 0.12,
        },
        // Small bright violet — top center (active flicker)
        {
          x: w * 0.5, y: h * 0.15,
          baseRadius: maxDim * 0.2,
          color1: [160, 80, 255], color2: [120, 40, 220],
          phase: Math.PI * 0.9, pulseSpeed: 0.004,
          driftX: w * 0.03, driftY: h * 0.03, driftSpeed: 0.0007,
          brightnessPhase: 0.5, brightnessSpeed: 0.01,
          baseAlpha: 0.14,
        },
      ];
    }

    function drawNebulae() {
      for (const neb of nebulae) {
        // Drift position
        const ox = Math.sin(time * neb.driftSpeed + neb.phase) * neb.driftX;
        const oy = Math.cos(time * neb.driftSpeed * 0.7 + neb.phase) * neb.driftY;

        // Pulse size
        const sizePulse = 1 + Math.sin(time * neb.pulseSpeed + neb.phase) * 0.12;

        // Brightness flicker — oscillates between dim and bright
        const flicker = 0.6 + Math.sin(time * neb.brightnessSpeed + neb.brightnessPhase) * 0.4;

        const ncx = neb.x + ox;
        const ncy = neb.y + oy;
        const r = neb.baseRadius * sizePulse;
        const alpha = neb.baseAlpha * flicker;

        // Inner core — brighter, color1
        const grad1 = ctx!.createRadialGradient(ncx, ncy, 0, ncx, ncy, r * 0.5);
        const [r1, g1, b1] = neb.color1;
        grad1.addColorStop(0, `rgba(${r1},${g1},${b1},${alpha * 1.2})`);
        grad1.addColorStop(0.5, `rgba(${r1},${g1},${b1},${alpha * 0.4})`);
        grad1.addColorStop(1, "transparent");
        ctx!.fillStyle = grad1;
        ctx!.fillRect(0, 0, w, h);

        // Outer halo — softer, color2
        const grad2 = ctx!.createRadialGradient(ncx, ncy, r * 0.2, ncx, ncy, r);
        const [r2, g2, b2] = neb.color2;
        grad2.addColorStop(0, `rgba(${r2},${g2},${b2},${alpha * 0.6})`);
        grad2.addColorStop(0.5, `rgba(${r2},${g2},${b2},${alpha * 0.2})`);
        grad2.addColorStop(1, "transparent");
        ctx!.fillStyle = grad2;
        ctx!.fillRect(0, 0, w, h);
      }
    }

    function draw() {
      time++;

      // Background
      const bgGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
      bgGrad.addColorStop(0, "#0c0820");
      bgGrad.addColorStop(1, "#050210");
      ctx!.fillStyle = bgGrad;
      ctx!.fillRect(0, 0, w, h);

      // Nebulae behind stars
      drawNebulae();

      // Stars — fly toward camera
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.z -= SPEED;

        if (s.z <= 0) {
          stars[i] = createStar(true);
          continue;
        }

        const scale = 300 / s.z;
        const sx = cx + s.x * scale;
        const sy = cy + s.y * scale;

        if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) {
          stars[i] = createStar(true);
          continue;
        }

        const depthRatio = 1 - s.z / MAX_DEPTH;
        const alpha = depthRatio * depthRatio * 0.9 + 0.1;
        const rad = s.size * scale * 0.8;
        const drawRadius = Math.min(Math.max(rad, 0.3), 3.5);

        ctx!.beginPath();
        ctx!.arc(sx, sy, drawRadius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${s.color},${alpha})`;
        ctx!.fill();

        // Glow
        if (drawRadius > 1.2) {
          ctx!.beginPath();
          ctx!.arc(sx, sy, drawRadius * 3, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${s.color},${alpha * 0.08})`;
          ctx!.fill();
        }

        // Streak for close stars
        if (depthRatio > 0.7 && drawRadius > 1) {
          const streakLen = depthRatio * 8;
          const dx = sx - cx;
          const dy = sy - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = dx / dist;
          const ny = dy / dist;

          const grad = ctx!.createLinearGradient(
            sx, sy,
            sx - nx * streakLen, sy - ny * streakLen
          );
          grad.addColorStop(0, `rgba(${s.color},${alpha * 0.6})`);
          grad.addColorStop(1, `rgba(${s.color},0)`);
          ctx!.beginPath();
          ctx!.moveTo(sx, sy);
          ctx!.lineTo(sx - nx * streakLen, sy - ny * streakLen);
          ctx!.strokeStyle = grad;
          ctx!.lineWidth = drawRadius * 0.6;
          ctx!.stroke();
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    />
  );
}
