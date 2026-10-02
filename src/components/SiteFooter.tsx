"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { MotionButton } from "@/components/motion/MotionButton";

export function SiteFooter() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 420);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Reveal>
        <footer className="border-t border-brick/40 bg-ink/90 py-8 sm:py-10">
          <div className="mx-auto max-w-6xl safe-px">
            <Image
              src="/brand/logo-new.png"
              alt="Barber Shop El Calentano"
              width={180}
              height={72}
              className="h-16 w-auto max-w-[18rem] object-contain object-left sm:h-20 sm:max-w-[22rem]"
            />
            <p className="mt-3 text-sm leading-relaxed text-bone/60">
              C. Miguel Hidalgo 4A, Metepec · Barbería artesanal mexicana
            </p>
          </div>
        </footer>
      </Reveal>

      <motion.div
        className="fixed right-3 z-50 lg:bottom-6 lg:right-4"
        style={{ bottom: "calc(var(--bottom-nav-h) + env(safe-area-inset-bottom) + 0.75rem)" }}
        initial={false}
        animate={{
          opacity: showTop ? 1 : 0,
          y: showTop ? 0 : 10,
          pointerEvents: showTop ? "auto" : "none",
        }}
      >
        <MotionButton
          variant="ghost"
          className="!min-h-12 !min-w-12 !rounded-full !px-0 shadow-panel backdrop-blur lg:!bottom-auto"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Volver arriba"
        >
          ↑
        </MotionButton>
      </motion.div>
    </>
  );
}
