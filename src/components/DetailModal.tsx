"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { MotionButton } from "@/components/motion/MotionButton";
import { easeOut } from "@/lib/motion";

/** Modal de detalle temático (contenido libre) — paleta El Calentano. */
export function DetailModal({
  open,
  title,
  subtitle,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-modal-title"
            className="relative flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-gold/35 bg-charcoal shadow-panel sm:rounded-2xl"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
            initial={{ y: 48, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0 }}
            transition={{ duration: 0.28, ease: easeOut }}
          >
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-bone/25 sm:hidden" />
            <div className="h-14 shrink-0 bg-brick-wall bg-cover bg-center sm:h-16" />
            <div className="shrink-0 space-y-1 border-b border-white/10 px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">El Calentano</p>
              <h2 id="detail-modal-title" className="text-xl font-semibold text-bone">
                {title}
              </h2>
              {subtitle ? <p className="text-sm text-bone/60">{subtitle}</p> : null}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
            <div className="shrink-0 border-t border-white/10 px-5 py-3">
              <MotionButton className="w-full !rounded-xl" onClick={onClose}>
                Cerrar
              </MotionButton>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
