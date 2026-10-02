"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BookingWizard } from "@/components/BookingWizard";
import { HeroBrand } from "@/components/HeroBrand";
import { NewsModal } from "@/components/NewsModal";
import { PhotoGallery } from "@/components/PhotoGallery";
import { SocialCodes } from "@/components/SocialCodes";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { EmberCanvas } from "@/components/EmberCanvas";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { MotionLinkButton } from "@/components/motion/MotionButton";
import { useIsMobile } from "@/lib/motion";
import { requestFreshBooking } from "@/lib/bookingReset";
import { PAYMENT_METHODS, PAYMENT_NOTE } from "@/lib/shopInfo";
import { GALLERY, IDENTITY, PRODUCTS } from "@/lib/shopMedia";

const MAPS_LINK = "https://maps.app.goo.gl/N9v43hhsgxcHeqM76";
const MAPS_EMBED =
  "https://maps.google.com/maps?q=C.+Miguel+Hidalgo+4A,+Metepec,+Estado+de+M%C3%A9xico,+52172&hl=es&z=16&output=embed";

const SERVICES = [
  {
    name: "Corte de cabello",
    price: "$120",
    dur: "40 min · adulto y niño",
    image: "/media/cortes/IMG-20260930-WA0006.jpg",
  },
  {
    name: "Alineado de ceja",
    price: "$25 c/u",
    dur: "15 min",
    image: null,
  },
  {
    name: "Combo barba y corte",
    price: "$260",
    dur: "60 min",
    image: "/media/cortes/IMG-20260930-WA0015.jpg",
  },
  {
    name: "Solo barba",
    price: "$145",
    dur: "40 min",
    image: "/media/barba/IMG-20260930-WA0003.jpg",
  },
  {
    name: "Facial con vaporizador",
    price: "$200",
    dur: "60 min · incluye mascarilla",
    image: "/media/facial/IMG-20260930-WA0046.jpg",
  },
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
          <div className="order-1">
            <HeroBrand />
          </div>
          <div
            id="reservar"
            className="order-2 scroll-mt-mobile lg:scroll-mt-24"
          >
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold">
                Reserva · 4 pasos
              </p>
              <a href="/cita" className="text-[11px] text-bone/70 underline-offset-2 hover:text-gold hover:underline">
                Ya tengo cita
              </a>
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
              {SERVICES.map((service, i) => (
                <Reveal key={service.name} delay={mobile ? 0 : 0.04 * i}>
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
                    className="touch-card block overflow-hidden border-brick/30 bg-charcoal/70 p-0 sm:p-0"
                  >
                    {service.image ? (
                      <div className="relative h-36 w-full">
                        <Image
                          src={service.image}
                          alt={service.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      </div>
                    ) : null}
                    <div className="p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="min-w-0 text-sm font-medium text-bone sm:text-base">{service.name}</p>
                        <p className="shrink-0 text-sm font-semibold text-dorado sm:text-base">{service.price}</p>
                      </div>
                      <p className="mt-1 text-xs text-bone/50">{service.dur} · tocar para reservar</p>
                    </div>
                  </motion.a>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <p className="mt-5 text-sm text-bone/55 sm:mt-8">
                Todos los días 9:00–20:00
              </p>
              <p className="mt-2 text-sm text-bone/70">
                Métodos de pago:{" "}
                {PAYMENT_METHODS.map((method, index) => (
                  <span key={method}>
                    {index > 0 ? " · " : ""}
                    <span className="text-dorado">{method}</span>
                  </span>
                ))}
                . {PAYMENT_NOTE}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-bone/45 sm:text-sm">
                Cancela con 24h. Cancelación tardía: 50%. Pago en el local (MXN).
              </p>
            </Reveal>
          </div>
        </section>

        <section
          id="productos"
          className="scroll-mt-mobile border-t border-brick/40 bg-charcoal/80 section-pad"
        >
          <div className="mx-auto max-w-6xl safe-px">
            <Reveal>
              <h2 className="text-xl font-semibold text-gold sm:text-3xl">Productos</h2>
              <p className="mt-1.5 text-sm text-bone/60">Barba y cabello · Salerm Homme</p>
            </Reveal>
            <div className="mt-4 grid gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
              {PRODUCTS.map((product) => (
                <Reveal key={product.src}>
                  <article className="overflow-hidden rounded-xl border border-gold/20 bg-ink/70 shadow-panel sm:rounded-2xl">
                    <div className="relative h-64 w-full bg-ink/40 sm:h-80">
                      <Image
                        src={product.src}
                        alt={product.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-3.5 sm:p-4">
                      <p className="font-medium text-bone">{product.title}</p>
                      <p className="mt-1 text-sm text-bone/60">{product.detail}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
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
              <SocialCodes />
            </Reveal>
          </div>
        </section>

        <section
          id="origen"
          className="scroll-mt-mobile border-t border-brick/40 bg-ink/90 section-pad"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-5 safe-px lg:grid-cols-2 lg:gap-8">
            <Reveal>
              <h2 className="text-xl font-semibold text-gold sm:text-3xl">Origen</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-bone/75 sm:text-base">
                La identidad de la barbería sale de Arcelia, Guerrero: el sombrero, el pueblo y el nombre
                El Calentano.
              </p>
            </Reveal>
            <Reveal delay={mobile ? 0 : 0.08}>
              <div className="overflow-hidden rounded-xl border border-brick/40 shadow-panel sm:rounded-2xl">
                <Image
                  src={IDENTITY.src}
                  alt={IDENTITY.alt}
                  width={1200}
                  height={1600}
                  className="h-auto w-full object-cover"
                />
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
                <strong>ladrillo rojo</strong> — El Calentano.
              </p>
              <MotionLinkButton
                href={MAPS_LINK}
                target="_blank"
                rel="noreferrer"
                className="mt-4 w-full !rounded-xl sm:mt-6 sm:w-auto"
              >
                Abrir en Google Maps
              </MotionLinkButton>
              <div className="mt-5 overflow-hidden rounded-xl border border-brick/40 shadow-panel sm:rounded-2xl">
                <Image
                  src="/media/local/IMG-20260930-WA0042.jpg"
                  alt="Fachada de Barber Shop El Calentano en Miguel Hidalgo, Metepec"
                  width={1600}
                  height={900}
                  className="h-auto w-full object-cover"
                />
              </div>
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
              href="#redes"
              className="btn-ghost !min-h-12 !rounded-xl !px-2 !py-2 !text-xs border-gold/40 text-gold-soft"
            >
              Redes
            </a>
          </div>
        </nav>
      </main>
    </SmoothScroll>
  );
}
