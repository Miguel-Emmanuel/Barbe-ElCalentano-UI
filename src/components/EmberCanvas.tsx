"use client";

import { useEffect, useRef } from "react";
import { useIsMobile, usePrefersReducedMotion } from "@/lib/motion";

/** Lightweight ember particles — disabled on mobile for battery/FPS. */
export function EmberCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced || mobile) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const count = 36;

    type P = { x: number; y: number; r: number; vy: number; vx: number; a: number };
    let particles: P[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        r: 0.6 + Math.random() * 1.8,
        vy: -0.15 - Math.random() * 0.45,
        vx: (Math.random() - 0.5) * 0.25,
        a: 0.2 + Math.random() * 0.45,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4) {
          p.y = canvas.offsetHeight + 4;
          p.x = Math.random() * canvas.offsetWidth;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(196,92,74,${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduced, mobile]);

  if (reduced || mobile) return null;

  return (
    <canvas
      ref={ref}
      className={`pointer-events-none absolute inset-0 h-full w-full opacity-60 ${className}`}
      aria-hidden
    />
  );
}
