"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BookingWizard } from "@/components/BookingWizard";
import { BrandTitle } from "@/components/BrandTitle";
import { HeroBrand } from "@/components/HeroBrand";
import { NewsModal } from "@/components/NewsModal";
import { PhotoGallery, type GalleryItem } from "@/components/PhotoGallery";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { EmberCanvas } from "@/components/EmberCanvas";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { MotionLinkButton } from "@/components/motion/MotionButton";
import { useIsMobile } from "@/lib/motion";
import { requestFreshBooking } from "@/lib/bookingReset";

const MAPS_LINK = "https://maps.app.goo.gl/N9v43hhsgxcHeqM76";
const MAPS_EMBED =
  "https://maps.google.com/maps?q=C.+Miguel+Hidalgo+4A,+Metepec,+Estado+de+M%C3%A9xico,+52172&hl=es&z=16&output=embed";

const GALLERY: GalleryItem[] = [
  {
    src: "/brand/shop-1.jpg",
    alt: "Corte en Barbería El Calentano",
    title: "Fade limpio",
    category: "cortes",
  },
  {
    src: "/brand/shop-2.jpg",
    alt: "Estilo y fade El Calentano",
    title: "Detalle de línea",
    category: "barba",
  },
  {
    src: "/brand/shop-3.jpg",
    alt: "Interior con muro de ladrillo",
    title: "Local · ladrillo rojo",
    category: "local",
  },
];

const SERVICES = [
  ["Corte de cabello", "$120", "40 min · adulto y niño"],
  ["Alineado de ceja", "$25 c/u", "15 min"],
  ["Combo barba y corte", "$260", "60 min"],
  ["Solo barba", "$145", "40 min"],
  ["Facial con vaporizador", "$200", "60 min · incluye mascarilla"],
] as const;

export function HomeExperience() {
  const mobile = useIsMobile();

  return (
    <SmoothScroll>
      <ScrollProgress />
      <NewsModal />
      <SiteHeader />

      <main className="page-with-mobile-nav min-h-screen bg-brick-wall bg-cover bg-center pt-[calc(3.25rem+env(safe-area-inset-top))] sm:pt-16">
        {/* Mobile: booking first. Desktop: brand + booking side by side */}
        <section className="relative mx-auto grid max-w-6xl items-start gap-4 safe-px pb-6 pt-3 sm:gap-6 sm:pb-8 sm:pt-4 lg:grid-cols-2 lg:items-center lg:gap-10 lg:pb-16 lg:pt-8">
          <div className="order-2 lg:order-1">
            <HeroBrand />
          </div>
          <div
            id="reservar"
            className="order-1 scroll-mt-mobile lg:order-2 lg:scroll-mt-24"
          >
            <div className="mb-2.5 flex items-center justify-between gap-2 lg:hidden">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold">
                Reserva · 4 pasos
              </p>
              <p className="text-[11px] text-bone/50">Pago en local</p>
            </div>
            <BookingWizard />
          </div>
        </section>

        <section
          id="servicios"
          className="relative scroll-mt-mobile border-t border-brick/40 bg-ink/85 section-pad"
        >
          {!mobile ? <EmberCanvas className="opacity-30" /> : null}
          <div className="relative mx-auto max-w-6xl safe-px">
            <Reveal>
              <h2 className="text-xl font-semibold text-gold sm:text-3xl">Servicios</h2>
              <p className="mt-1.5 text-sm text-bone/60">Catálogo oficial · precios MXN</p>
            </Reveal>
            <div className="mt-4 grid gap-2.5 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {SERVICES.map(([name, price, dur], i) => (
                <Reveal key={name} delay={mobile ? 0 : 0.04 * i}>
                  <motion.a
                    href="#reservar"
                    onClick={() => requestFreshBooking("reservar")}
                    whileTap={{ scale: 0.98 }}
                    whileHover={
                      mobile
                        ? undefined
                        : {
                            rotateY: 4,
                            rotateX: -3,
                            scale: 1.02,
                            borderColor: "rgba(244,239,232,0.55)",
                          }
                    }
                    transition={{ type: "spring", stiffness: 320, damping: 22 }}
                    className="touch-card block border-brick/30 bg-charcoal/70 sm:p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 text-sm font-medium text-bone sm:text-base">{name}</p>
                      <p className="shrink-0 text-sm font-semibold text-gold sm:text-base">{price}</p>
                    </div>
                    <p className="mt-1 text-xs text-bone/50">{dur} · tocar para reservar</p>
                  </motion.a>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <p className="mt-5 text-sm text-bone/55 sm:mt-8">
                Todos los días 9:00–20:00
              </p>
              <p className="mt-2 text-xs leading-relaxed text-bone/45 sm:text-sm">
                Cancela con 24h. Cancelación tardía: 50%. Pago en el local (MXN).
              </p>
            </Reveal>
          </div>
        </section>

        <section
          id="galeria"
          className="scroll-mt-mobile border-t border-brick/40 bg-brick-wall-soft bg-cover bg-center section-pad"
        >
          <div className="mx-auto max-w-6xl safe-px">
            <Reveal>
              <h2 className="text-xl font-semibold text-gold sm:text-3xl">Galería</h2>
              <p className="mt-1.5 text-sm text-bone/70">Trabajo real · toca una foto</p>
            </Reveal>
            <div className="mt-4 sm:mt-6">
              <PhotoGallery items={GALLERY} />
            </div>
            <Reveal>
              <div className="mt-6 flex items-center gap-4 sm:mt-8 sm:gap-6">
                <Image
                  src="/brand/qr-instagram.jpg"
                  alt="QR Instagram @barber_elcalentano"
                  width={96}
                  height={96}
                  className="h-20 w-20 shrink-0 rounded-xl border border-gold/30 bg-bone p-1.5 sm:h-28 sm:w-28 sm:p-2"
                />
                <div className="min-w-0">
                  <p className="font-medium text-bone">Síguenos</p>
                  <a
                    href="https://www.instagram.com/barber_elcalentano"
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-gold underline-offset-2 hover:underline"
                  >
                    @barber_elcalentano
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="ubicacion"
          className="scroll-mt-mobile border-t border-brick/40 bg-ink/90 section-pad"
        >
          <div className="mx-auto grid max-w-6xl gap-5 safe-px lg:grid-cols-2 lg:gap-8">
            <Reveal>
              <h2 className="text-xl font-semibold text-gold sm:text-3xl">Ubicación</h2>
              <p className="mt-2.5 text-sm text-bone/85 sm:mt-3 sm:text-base">
                <strong>C. Miguel Hidalgo 4A</strong>, Metepec, 52172, Edomex.
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-bone/70">
                Zona Espíritu Santo / San Miguel. Referencia:{" "}
                <strong>Centro Cultural Quimera</strong>. Local de{" "}
                <strong>ladrillo rojo</strong> —{" "}
                <BrandTitle className="text-base text-bone">El Calentano</BrandTitle>.
              </p>
              <MotionLinkButton
                href={MAPS_LINK}
                target="_blank"
                rel="noreferrer"
                className="mt-4 w-full !rounded-xl sm:mt-6 sm:w-auto"
              >
                Abrir en Google Maps
              </MotionLinkButton>
            </Reveal>
            <Reveal delay={mobile ? 0 : 0.08}>
              <div className="overflow-hidden rounded-xl border border-brick/40 shadow-panel sm:rounded-2xl">
                <iframe
                  title="Mapa Barbería El Calentano"
                  src={MAPS_EMBED}
                  className="h-56 w-full border-0 sm:h-80 lg:min-h-[320px] lg:h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </Reveal>
          </div>
        </section>

        <SiteFooter />

        <nav className="mobile-bottom-nav" aria-label="Acciones rápidas">
          <div className="mx-auto grid max-w-lg grid-cols-3 gap-1.5 safe-px py-2">
            <a
              href="#reservar"
              className="btn-gold !min-h-12 !rounded-xl !px-2 !py-2 !text-xs font-semibold"
              onClick={() => requestFreshBooking("reservar")}
            >
              Reservar
            </a>
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost !min-h-12 !rounded-xl !px-2 !py-2 !text-xs"
            >
              Llegar
            </a>
            <a
              href="https://www.instagram.com/barber_elcalentano"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost !min-h-12 !rounded-xl !px-2 !py-2 !text-xs border-gold/40 text-gold-soft"
            >
              Instagram
            </a>
          </div>
        </nav>
      </main>
    </SmoothScroll>
  );
}
