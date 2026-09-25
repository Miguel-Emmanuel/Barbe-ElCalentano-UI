"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile, usePrefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();

  useEffect(() => {
    // Native scroll feels better on phones (no Lenis rubber-banding fights).
    if (reduced || mobile) return;

    document.documentElement.classList.add("lenis-smooth");

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      touchMultiplier: 1,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      document.documentElement.classList.remove("lenis-smooth");
      gsap.ticker.remove(ticker);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [reduced, mobile]);

  return <>{children}</>;
}
