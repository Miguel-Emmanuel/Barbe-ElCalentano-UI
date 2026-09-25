"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { MotionButton } from "@/components/motion/MotionButton";
import { easeOut } from "@/lib/motion";

export type ConfirmTone = "gold" | "danger" | "neutral";

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  /** Omit or pass "" / null to hide cancel (alert-style). */
  cancelLabel?: string | null;
  tone?: ConfirmTone;
};

type Pending = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

type AlertOptions = {
  title?: string;
  message: string;
  tone?: ConfirmTone;
  okLabel?: string;
};

/**
 * Modal de confirmación / aviso con paleta El Calentano.
 * Sustituye window.confirm / window.alert.
 */
export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Aceptar",
  cancelLabel,
  tone = "gold",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string | null;
  tone?: ConfirmTone;
  onConfirm: () => void;
  onCancel: () => void;
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
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

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
            onClick={onCancel}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            className="relative w-full max-w-md overflow-hidden rounded-t-2xl border border-gold/35 bg-charcoal shadow-panel sm:rounded-2xl"
            style={{
              paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
            }}
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.28, ease: easeOut }}
          >
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-bone/25 sm:hidden" aria-hidden />
            <div className="h-16 bg-brick-wall bg-cover bg-center sm:h-20" />
            <div className="space-y-3 p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">El Calentano</p>
              <h2 id="confirm-modal-title" className="text-xl font-semibold text-bone">
                {title}
              </h2>
              <p className="text-sm leading-relaxed text-bone/75">{message}</p>
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                {cancelLabel ? (
                  <MotionButton
                    variant="ghost"
                    className="w-full !rounded-xl sm:w-auto"
                    onClick={onCancel}
                  >
                    {cancelLabel}
                  </MotionButton>
                ) : null}
                <MotionButton
                  variant={tone === "gold" ? "gold" : "ghost"}
                  className={`w-full sm:w-auto !rounded-xl ${
                    tone === "danger"
                      ? "border-brick-soft/60 bg-brick/35 text-bone"
                      : tone === "neutral"
                        ? ""
                        : ""
                  }`}
                  onClick={onConfirm}
                >
                  {confirmLabel}
                </MotionButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function useConfirmDialog() {
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);

  const close = useCallback((value: boolean) => {
    const current = pendingRef.current;
    pendingRef.current = null;
    setPending(null);
    current?.resolve(value);
  }, []);

  const ask = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const next: Pending = {
        ...options,
        resolve,
      };
      pendingRef.current = next;
      setPending(next);
    });
  }, []);

  const alert = useCallback((options: AlertOptions | string) => {
    const opts = typeof options === "string" ? { message: options } : options;
    return ask({
      title: opts.title ?? "Aviso",
      message: opts.message,
      confirmLabel: opts.okLabel ?? "Entendido",
      cancelLabel: "",
      tone: opts.tone ?? "gold",
    }).then(() => undefined);
  }, [ask]);

  const Dialog = (
    <ConfirmModal
      open={Boolean(pending)}
      title={pending?.title ?? ""}
      message={pending?.message ?? ""}
      confirmLabel={pending?.confirmLabel ?? "Aceptar"}
      cancelLabel={
        pending?.cancelLabel === undefined
          ? "Cancelar"
          : pending.cancelLabel || null
      }
      tone={pending?.tone ?? "gold"}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  );

  return { ask, alert, Dialog };
}
