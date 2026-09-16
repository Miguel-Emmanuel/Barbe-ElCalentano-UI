import Image from "next/image";
import Link from "next/link";
import { BookingWizard, BrandMark } from "@/components/BookingWizard";
import { BrandTitle } from "@/components/BrandTitle";

const MAPS_LINK = "https://maps.app.goo.gl/N9v43hhsgxcHeqM76";
const MAPS_EMBED =
  "https://maps.google.com/maps?q=C.+Miguel+Hidalgo+4A,+Metepec,+Estado+de+M%C3%A9xico,+52172&hl=es&z=16&output=embed";

const GALLERY = [
  { src: "/brand/shop-1.jpg", alt: "Corte en Barbería El Calentano" },
  { src: "/brand/shop-2.jpg", alt: "Estilo y fade El Calentano" },
  { src: "/brand/shop-3.jpg", alt: "Interior con muro de ladrillo" },
];

export default function HomePage() {
  return (
    <main className="page-with-mobile-nav min-h-screen bg-brick-wall bg-cover bg-center">
      <header className="safe-pt sticky top-0 z-40 border-b border-brick/30 bg-ink/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 safe-px py-3">
          <Link href="/" className="shrink-0">
            <BrandTitle className="text-base text-gold sm:text-lg">El Calentano</BrandTitle>
          </Link>
          <nav className="chip-scroll max-w-[68%] text-sm text-bone/85 sm:max-w-none sm:gap-4">
            <a
              href="#reservar"
              className="shrink-0 rounded-full bg-gold px-3 py-1.5 font-semibold text-ink sm:bg-transparent sm:px-0 sm:py-0 sm:font-normal sm:text-bone/85 sm:hover:text-gold"
            >
              Reservar
            </a>
            <a href="#servicios" className="shrink-0 py-1.5 hover:text-gold">
              Servicios
            </a>
            <a href="#galeria" className="shrink-0 py-1.5 hover:text-gold">
              Galería
            </a>
            <a href="#ubicacion" className="shrink-0 py-1.5 hover:text-gold">
              Ubicación
            </a>
            <Link href="/admin" className="hidden shrink-0 py-1.5 hover:text-gold sm:inline">
              Staff
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-6xl items-start gap-6 safe-px pb-8 pt-4 lg:grid-cols-2 lg:items-center lg:gap-10 lg:pb-16 lg:pt-8">
        <div className="order-2 animate-fade-up text-center lg:order-1 lg:text-left">
          {/* Logo en placa oscura; el nombre ya va en el logo — no duplicar Cream Cake debajo */}
          <div className="flex justify-center lg:justify-start">
            <div className="sm:hidden">
              <BrandMark size={200} />
            </div>
            <div className="hidden sm:block">
              <BrandMark size={260} />
            </div>
          </div>
          <h1 className="sr-only">El Calentano — Barber Shop Metepec</h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-balance text-bone/80 sm:mt-5 sm:text-base lg:mx-0">
            Barbería en Metepec. Reserva con Ismael, Alex o Zaira. Pagas en el local.
          </p>
          <div className="mt-5 hidden flex-wrap items-center justify-center gap-3 sm:flex lg:justify-start">
            <a href="#reservar" className="btn-gold animate-gold-pulse">
              Reservar cita
            </a>
            <a
              href="https://www.instagram.com/barber_elcalentano"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost border-gold/40 text-gold-soft"
            >
              Instagram
            </a>
            <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="btn-ghost">
              Cómo llegar
            </a>
          </div>
          <div className="mt-4 flex justify-center gap-2 sm:hidden">
            <a
              href="https://www.instagram.com/barber_elcalentano"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost !min-h-10 flex-1 !px-3 !text-xs border-gold/40 text-gold-soft"
            >
              Instagram
            </a>
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost !min-h-10 flex-1 !px-3 !text-xs"
            >
              Maps
            </a>
          </div>
          <p className="mt-4 text-[11px] text-bone/55 sm:mt-6 sm:text-xs">
            C. Miguel Hidalgo 4A, Metepec, 52172 · MXN
          </p>
        </div>

        <div id="reservar" className="order-1 scroll-mt-24 lg:order-2 lg:scroll-mt-8">
          <p className="mb-2 text-center text-xs uppercase tracking-[0.2em] text-gold lg:hidden">
            Reserva en 4 pasos
          </p>
          <BookingWizard />
        </div>
      </section>

      <section id="servicios" className="scroll-mt-20 border-t border-brick/40 bg-ink/75 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl safe-px">
          <h2 className="text-2xl font-semibold text-gold sm:text-3xl">Servicios</h2>
          <p className="mt-2 text-sm text-bone/60">Catálogo oficial · precios MXN</p>
          <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {[
              ["Corte adulto / niño", "$120", "40 min"],
              ["Alineado de ceja", "$25 c/u", "15 min"],
              ["Combo barba y corte", "$260", "60 min"],
              ["Solo barba", "$145", "40 min"],
              ["Facial + vaporizador", "$200", "60 min"],
            ].map(([name, price, dur]) => (
              <a
                key={name}
                href="#reservar"
                className="rounded-xl border border-brick/30 bg-charcoal/50 p-4 transition active:bg-brick/20"
              >
                <p className="font-medium text-bone">{name}</p>
                <p className="mt-1 text-gold">
                  {price} <span className="text-bone/45">· {dur}</span>
                </p>
              </a>
            ))}
          </div>
          <p className="mt-6 text-sm text-bone/55 sm:mt-8">
            Lun–Sáb 10:00–20:00 · Domingos por cita 11:00–16:00
          </p>
          <p className="mt-2 text-xs text-bone/45 sm:text-sm">
            Cancela con 24h de aviso. Cancelación tardía: 50%. Pago en el local (MXN).
          </p>
        </div>
      </section>

      <section
        id="galeria"
        className="scroll-mt-20 border-t border-brick/40 bg-brick-wall-soft bg-cover bg-center py-10 sm:py-14"
      >
        <div className="mx-auto max-w-6xl safe-px">
          <h2 className="text-2xl font-semibold text-gold sm:text-3xl">Galería</h2>
          <p className="mt-2 text-sm text-bone/70">Trabajo real · ladrillo rojo</p>
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2 sm:mt-8 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0">
            {GALLERY.map((item) => (
              <div
                key={item.src}
                className="w-[78vw] shrink-0 overflow-hidden rounded-2xl border border-gold/20 shadow-panel sm:w-auto"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={640}
                  height={800}
                  className="h-56 w-full object-cover sm:h-72"
                  sizes="(max-width: 640px) 78vw, 33vw"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-8 sm:gap-6">
            <Image
              src="/brand/qr-instagram.jpg"
              alt="QR Instagram @barber_elcalentano"
              width={112}
              height={112}
              className="rounded-xl border border-gold/30 bg-bone p-2"
            />
            <div>
              <p className="font-medium text-bone">Síguenos</p>
              <a
                href="https://www.instagram.com/barber_elcalentano"
                target="_blank"
                rel="noreferrer"
                className="text-gold hover:underline"
              >
                @barber_elcalentano
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="ubicacion" className="scroll-mt-20 border-t border-brick/40 bg-ink/85 py-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl gap-6 safe-px lg:grid-cols-2 lg:gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-gold sm:text-3xl">Ubicación</h2>
            <p className="mt-3 text-sm text-bone/80 sm:text-base">
              <strong>C. Miguel Hidalgo 4A</strong>, Metepec, 52172, Edomex.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-bone/70">
              Zona Espíritu Santo / San Miguel. Referencia:{" "}
              <strong>Centro Cultural Quimera</strong>. Busca el local de{" "}
              <strong>ladrillo rojo</strong> —{" "}
              <BrandTitle className="text-base text-bone">El Calentano</BrandTitle>.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-bone/70">
              <li>
                Abre la pin en{" "}
                <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="text-gold underline">
                  Google Maps
                </a>
              </li>
              <li>Desde el centro de Metepec: Miguel Hidalgo hacia Espíritu Santo → 4A</li>
            </ul>
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noreferrer"
              className="btn-gold mt-5 w-full sm:mt-6 sm:w-auto"
            >
              Abrir en Google Maps
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl border border-brick/40 shadow-panel">
            <iframe
              title="Mapa Barbería El Calentano"
              src={MAPS_EMBED}
              className="h-64 w-full border-0 sm:h-80 lg:min-h-[320px] lg:h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <nav className="mobile-bottom-nav" aria-label="Acciones rápidas">
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-2 safe-px py-2">
          <a href="#reservar" className="btn-gold !min-h-11 !rounded-xl !px-2 !text-xs">
            Reservar
          </a>
          <a
            href={MAPS_LINK}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost !min-h-11 !rounded-xl !px-2 !text-xs"
          >
            Cómo llegar
          </a>
          <a
            href="https://www.instagram.com/barber_elcalentano"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost !min-h-11 !rounded-xl !px-2 !text-xs border-gold/40 text-gold-soft"
          >
            Instagram
          </a>
        </div>
      </nav>
    </main>
  );
}
