"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile, usePrefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: mobile ? 16 : 36 },
        {
          autoAlpha: 1,
          y: 0,
          duration: mobile ? 0.4 : 0.85,
          delay: mobile ? Math.min(delay, 0.08) : delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: mobile ? "top 92%" : "top 88%",
            toggleActions: "play none none none",
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [delay, reduced, mobile]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
