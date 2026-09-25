"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrandTitle } from "@/components/BrandTitle";
import { MotionButton } from "@/components/motion/MotionButton";
import { useIsMobile } from "@/lib/motion";

export function NewsModal() {
  const [open, setOpen] = useState(false);
  const mobile = useIsMobile();

  useEffect(() => {
    const dismissed = sessionStorage.getItem("el_calentano_news_dismissed");
    if (dismissed) return;
    const delay = mobile ? 1800 : 2400;
    const t = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(t);
  }, [mobile]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function close() {
    setOpen(false);
    sessionStorage.setItem("el_calentano_news_dismissed", "1");
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label="Cerrar novedades"
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="news-title"
            className="relative w-full max-w-md overflow-hidden rounded-t-2xl border border-gold/35 bg-charcoal shadow-panel sm:rounded-2xl"
            style={{
              paddingBottom: mobile ? "calc(0.75rem + env(safe-area-inset-bottom))" : undefined,
              marginBottom: mobile ? "var(--bottom-nav-h)" : undefined,
            }}
            initial={mobile ? { y: "100%", opacity: 1 } : { scale: 0.9, y: 20, opacity: 0 }}
            animate={mobile ? { y: 0, opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
            exit={mobile ? { y: "100%", opacity: 1 } : { scale: 0.94, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-bone/25 sm:hidden" aria-hidden />
            <div className="h-20 bg-brick-wall bg-cover bg-center sm:h-28" />
            <div className="space-y-3 p-4 sm:p-5">
              <p id="news-title" className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Novedad
              </p>
              <BrandTitle className="text-xl text-bone sm:text-2xl">El Calentano</BrandTitle>
              <p className="text-sm leading-relaxed text-bone/75">
                Reserva en 4 pasos: servicio, barbero, horario y tus datos. Pagas en el local (MXN).
              </p>
              <div className="flex gap-2 pt-1">
                <MotionButton
                  className="flex-1 !rounded-xl"
                  onClick={() => {
                    close();
                    document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Reservar ahora
                </MotionButton>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={close}
                  className="tap-target rounded-xl border border-bone/25 text-bone/70"
                  aria-label="Cerrar"
                >
                  ✕
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
