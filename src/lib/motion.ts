"use client";

import { useEffect, useState } from "react";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

/** True for phones / narrow viewports (mobile-first UX). */
export function useIsMobile(breakpointPx = 768) {
  const [mobile, setMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpointPx]);

  return mobile;
}

/** Soften or skip heavy motion on mobile / reduced-motion. */
export function useMotionLite() {
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();
  return reduced || mobile;
}

export const easeOut = [0.22, 1, 0.36, 1] as const;

export const mobileTransition = {
  duration: 0.22,
  ease: easeOut,
} as const;
