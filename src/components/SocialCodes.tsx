"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SOCIAL } from "@/lib/shopInfo";
import { useIsMobile } from "@/lib/motion";

const QR_SRC = {
  instagram: "/brand/qr-instagram.jpg",
  facebook: "/brand/qr-facebook.jpg",
  tiktok: "/brand/qr-tiktok.jpg",
} as const;

function pageLabel(href: string) {
  try {
    const url = new URL(href);
    const path = url.pathname.replace(/\/$/, "");
    return `${url.host.replace(/^www\./, "")}${path}`;
  } catch {
    return href;
  }
}

export function SocialCodes() {
  const [openId, setOpenId] = useState<(typeof SOCIAL)[number]["id"] | null>(null);
  const mobile = useIsMobile();
  const active = SOCIAL.find((network) => network.id === openId) ?? null;

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <div id="redes" className="scroll-mt-mobile mt-6 sm:mt-8">
      <p className="font-medium text-bone">Síguenos</p>
      <p className="mt-1 text-sm text-bone/60">Toca un código para verlo grande.</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {SOCIAL.map((network) => (
          <button
            key={network.id}
            type="button"
            onClick={() => setOpenId(network.id)}
            className="group w-24 text-center sm:w-28"
            aria-haspopup="dialog"
            aria-label={`Ampliar QR de ${network.label}`}
          >
            <Image
              src={QR_SRC[network.id]}
              alt=""
              width={112}
              height={112}
              className="mx-auto h-24 w-24 rounded-xl border border-gold/30 bg-bone object-contain p-1.5 shadow-panel transition duration-200 group-hover:scale-[1.04] group-active:scale-[0.98] sm:h-28 sm:w-28 sm:p-2"
            />
            <span className="mt-1 block text-center text-[11px] text-bone/70">{network.label}</span>
          </button>
        ))}
      </div>

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
        {active ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenId(null)}
            role="presentation"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`QR de ${active.label}`}
              className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gold/30 bg-charcoal"
              style={{
                marginBottom: mobile ? "var(--bottom-nav-h)" : undefined,
              }}
              initial={{ scale: 0.72, opacity: 0, y: mobile ? 40 : 0 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: mobile ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="min-h-0 bg-bone p-3 sm:p-5">
                <Image
                  src={QR_SRC[active.id]}
                  alt={`Código QR de ${active.label}`}
                  width={640}
                  height={640}
                  priority
                  className="mx-auto h-auto w-full object-contain"
                  style={{ maxHeight: "42dvh" }}
                />
              </div>
              <div className="space-y-3 p-4 sm:p-5">
                <div>
                  <p className="font-medium text-bone">{active.label}</p>
                  <p className="mt-1 break-all text-xs text-bone/55">{pageLabel(active.href)}</p>
                </div>
                <a
                  href={active.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-gold !flex !min-h-11 w-full items-center justify-center !rounded-xl text-center"
                >
                  Visitar {active.label}
                </a>
                <button
                  type="button"
                  className="btn-ghost !min-h-11 w-full !rounded-xl"
                  onClick={() => setOpenId(null)}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
