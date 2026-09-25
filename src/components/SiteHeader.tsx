"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrandTitle } from "@/components/BrandTitle";
import { easeOut, useIsMobile } from "@/lib/motion";
import { requestFreshBooking } from "@/lib/bookingReset";

const LINKS = [
  { href: "#reservar", label: "Reservar" },
  { href: "#servicios", label: "Servicios" },
  { href: "#galeria", label: "Galería" },
  { href: "#ubicacion", label: "Ubicación" },
];

export function SiteHeader() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const mobile = useIsMobile();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 16);
      // On mobile keep header reachable; only hide after deeper scroll.
      const threshold = mobile ? 140 : 80;
      setHidden(!open && y > lastY.current && y > threshold);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobile, open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <motion.header
      className={`safe-pt fixed inset-x-0 top-0 z-50 border-b transition-colors ${
        scrolled || open
          ? "border-brick/40 bg-ink/95 backdrop-blur-xl"
          : "border-transparent bg-ink/60 backdrop-blur-md"
      }`}
      animate={{ y: hidden && !open ? -120 : 0 }}
      transition={{ duration: 0.28, ease: easeOut }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 safe-px py-2.5 sm:py-3">
        <Link
          href="/"
          className="min-w-0 shrink"
          onClick={(e) => {
            setOpen(false);
            if (window.location.pathname === "/") {
              e.preventDefault();
              requestFreshBooking("top");
            }
          }}
        >
          <BrandTitle className="truncate text-[0.95rem] text-bone sm:text-lg">
            El Calentano
          </BrandTitle>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href="#reservar"
            className="btn-gold !min-h-10 !rounded-xl !px-3 !text-xs md:hidden"
            onClick={() => {
              setOpen(false);
              requestFreshBooking("reservar");
            }}
          >
            Reservar
          </a>

          <nav className="hidden items-center gap-6 text-sm text-bone/85 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative py-1 transition hover:text-gold"
                onClick={() => {
                  if (l.href === "#reservar") requestFreshBooking("reservar");
                }}
              >
                {l.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-bone transition group-hover:scale-x-100" />
              </a>
            ))}
            <Link href="/admin" className="text-bone/60 transition hover:text-gold">
              Staff
            </Link>
          </nav>

          <button
            type="button"
            className="tap-target flex flex-col items-center justify-center gap-1.5 rounded-xl border border-gold/35 px-3 md:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <motion.span
              className="block h-0.5 w-5 bg-bone"
              animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            />
            <motion.span
              className="block h-0.5 w-5 bg-bone"
              animate={open ? { opacity: 0 } : { opacity: 1 }}
            />
            <motion.span
              className="block h-0.5 w-5 bg-bone"
              animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: easeOut }}
            className="overflow-hidden border-t border-brick/30 bg-ink/95 md:hidden"
          >
            <div className="flex max-h-[70dvh] flex-col gap-1 overflow-y-auto safe-px py-3 pb-4">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => {
                    setOpen(false);
                    if (l.href === "#reservar") requestFreshBooking("reservar");
                  }}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.03 * i }}
                  className="min-h-12 rounded-xl px-3 py-3.5 text-base text-bone active:bg-brick/25 active:text-gold"
                >
                  {l.label}
                </motion.a>
              ))}
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="min-h-12 rounded-xl px-3 py-3.5 text-bone/55"
              >
                Staff
              </Link>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
