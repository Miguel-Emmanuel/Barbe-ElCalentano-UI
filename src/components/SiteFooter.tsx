"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { BrandTitle } from "@/components/BrandTitle";
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
          <div className="mx-auto flex max-w-6xl flex-col gap-5 safe-px sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div>
              <BrandTitle className="text-xl text-bone sm:text-2xl">El Calentano</BrandTitle>
              <p className="mt-2 text-sm leading-relaxed text-bone/60">
                C. Miguel Hidalgo 4A, Metepec · Barbería artesanal mexicana
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
              {[
                {
                  href: "https://www.instagram.com/barber_elcalentano",
                  label: "Instagram",
                },
                {
                  href: "https://maps.app.goo.gl/N9v43hhsgxcHeqM76",
                  label: "Maps",
                },
              ].map((s) => (
                <motion.a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gold/30 px-4 text-sm text-gold"
                >
                  {s.label}
                </motion.a>
              ))}
            </div>
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
