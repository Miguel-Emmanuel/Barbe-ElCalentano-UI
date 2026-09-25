"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BrandMark } from "@/components/BookingWizard";
import { MotionLinkButton } from "@/components/motion/MotionButton";
import { EmberCanvas } from "@/components/EmberCanvas";
import { useIsMobile, usePrefersReducedMotion, easeOut } from "@/lib/motion";
import { requestFreshBooking } from "@/lib/bookingReset";

gsap.registerPlugin(ScrollTrigger);

const MAPS_LINK = "https://maps.app.goo.gl/N9v43hhsgxcHeqM76";

export function HeroBrand() {
  const titleRef = useRef<HTMLParagraphElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();

  useEffect(() => {
    if (reduced) return;
    const el = titleRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const letters = el.querySelectorAll("span");
      gsap.fromTo(
        letters,
        { y: mobile ? 12 : 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: mobile ? 0.35 : 0.55,
          stagger: mobile ? 0.02 : 0.035,
          ease: "power3.out",
          delay: 0.08,
        },
      );

      // Parallax only on larger screens — saves battery and jank on phones.
      if (bgRef.current && !mobile) {
        gsap.to(bgRef.current, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: bgRef.current.parentElement,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    });

    return () => ctx.revert();
  }, [reduced, mobile]);

  const word = "El Calentano";

  return (
    <div className="relative overflow-hidden rounded-xl border border-brick/30 sm:rounded-2xl">
      <div
        ref={bgRef}
        className="absolute inset-0 -z-10 scale-105 bg-brick-wall bg-cover bg-center sm:scale-110"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-ink/60" aria-hidden />
      {!mobile ? <EmberCanvas /> : null}

      <div className="relative px-3.5 py-6 text-center xs:px-4 sm:px-8 sm:py-10 lg:text-left">
        <motion.div
          className="flex justify-center lg:justify-start"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: mobile ? 0.35 : 0.6, ease: easeOut }}
        >
          <div className="sm:hidden">
            <BrandMark size={132} className="!rounded-xl" />
          </div>
          <div className="hidden sm:block">
            <BrandMark size={220} />
          </div>
        </motion.div>

        <h1 className="sr-only">El Calentano — Barber Shop Metepec</h1>
        <p
          ref={titleRef}
          aria-hidden
          className="mt-3 font-display text-[1.75rem] leading-tight font-bold text-bone sm:mt-4 sm:text-4xl lg:text-5xl"
        >
          {word.split("").map((ch, i) => (
            <span key={`${ch}-${i}`} className="inline-block">
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </p>

        <motion.p
          className="mx-auto mt-2.5 max-w-sm text-[0.9375rem] leading-snug text-balance text-bone/85 sm:mt-4 sm:max-w-md sm:text-base lg:mx-0"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35, ease: easeOut }}
        >
          Barbería en Metepec. Reserva con Ismael, Alex o Zaira. Pagas en el local.
        </motion.p>

        {/* Primary CTA always visible on mobile */}
        <div className="mt-4 sm:hidden">
          <MotionLinkButton
            href="#reservar"
            className="w-full !rounded-xl !min-h-[3.25rem] text-base"
            onClick={() => requestFreshBooking("reservar")}
          >
            Reservar cita
          </MotionLinkButton>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <MotionLinkButton
              href="https://www.instagram.com/barber_elcalentano"
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              className="!min-h-12 !rounded-xl !px-2 !text-sm border-gold/40 text-gold-soft"
            >
              Instagram
            </MotionLinkButton>
            <MotionLinkButton
              href={MAPS_LINK}
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              className="!min-h-12 !rounded-xl !px-2 !text-sm"
            >
              Cómo llegar
            </MotionLinkButton>
          </div>
        </div>

        <motion.div
          className="mt-5 hidden flex-wrap items-center justify-center gap-3 sm:flex lg:justify-start"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45, ease: easeOut }}
        >
          <MotionLinkButton
            href="#reservar"
            className="animate-gold-pulse"
            onClick={() => requestFreshBooking("reservar")}
          >
            Reservar cita
          </MotionLinkButton>
          <MotionLinkButton
            href="https://www.instagram.com/barber_elcalentano"
            target="_blank"
            rel="noreferrer"
            variant="ghost"
            className="border-gold/40 text-gold-soft"
          >
            Instagram
          </MotionLinkButton>
          <MotionLinkButton href={MAPS_LINK} target="_blank" rel="noreferrer" variant="ghost">
            Cómo llegar
          </MotionLinkButton>
        </motion.div>

        <p className="mt-3 text-[11px] leading-relaxed text-bone/55 sm:mt-6 sm:text-xs">
          C. Miguel Hidalgo 4A, Metepec, 52172 · MXN
        </p>

        {!mobile ? (
          <motion.a
            href="#reservar"
            className="mx-auto mt-6 flex w-fit flex-col items-center text-gold lg:mx-0"
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            aria-label="Bajar a reservar"
          >
            <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
            <span className="text-lg">↓</span>
          </motion.a>
        ) : null}
      </div>
    </div>
  );
}
