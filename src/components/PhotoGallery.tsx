"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile, usePrefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

export type GalleryItem = {
  src: string;
  alt: string;
  title: string;
  category: "cortes" | "barba" | "local";
};

const FILTERS: Array<{ id: "all" | GalleryItem["category"]; label: string }> = [
  { id: "all", label: "Todo" },
  { id: "cortes", label: "Cortes" },
  { id: "barba", label: "Barba" },
  { id: "local", label: "Local" },
];

export function PhotoGallery({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [active, setActive] = useState<GalleryItem | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();

  const visible =
    filter === "all" ? items : items.filter((i) => i.category === filter);

  useEffect(() => {
    if (reduced || mobile || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll<HTMLElement>("[data-gallery-card]");
    const ctx = gsap.context(() => {
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { clipPath: "inset(18% 0 0 0)", autoAlpha: 0, y: 40 },
          {
            clipPath: "inset(0% 0 0 0)",
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    }, gridRef);
    return () => ctx.revert();
  }, [visible, reduced, mobile]);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  return (
    <div>
      <div className="chip-scroll gap-2" role="tablist" aria-label="Filtrar galería">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`min-h-11 shrink-0 rounded-full px-4 py-2.5 text-sm transition active:scale-95 ${
              filter === f.id
                ? "bg-bone font-semibold text-ink"
                : "border border-bone/20 text-bone/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div ref={gridRef} className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((item) => (
            <motion.button
              layout={!mobile}
              key={item.src}
              type="button"
              data-gallery-card
              onClick={() => setActive(item)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-xl border border-gold/20 text-left shadow-panel sm:rounded-2xl"
            >
              <div className="relative h-48 w-full overflow-hidden bg-ink/40 img-shimmer sm:h-72">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                {/* Titles always visible on touch devices (no hover) */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 sm:translate-y-1 sm:opacity-90 sm:transition sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                  <p className="text-sm font-medium text-bone sm:text-base">{item.title}</p>
                  <p className="text-[11px] uppercase tracking-wider text-gold">{item.category}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/85 p-0 backdrop-blur-md sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.div
              className="relative max-h-[92dvh] w-full max-w-3xl overflow-hidden rounded-t-2xl border border-gold/30 bg-charcoal sm:rounded-2xl"
              style={{
                marginBottom: mobile ? "var(--bottom-nav-h)" : undefined,
                paddingBottom: mobile ? "env(safe-area-inset-bottom)" : undefined,
              }}
              initial={mobile ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
              animate={mobile ? { y: 0 } : { scale: 1, opacity: 1 }}
              exit={mobile ? { y: "100%" } : { scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-bone/25 sm:hidden" />
              <div className="relative aspect-[4/5] w-full max-h-[60dvh] sm:aspect-video sm:max-h-none">
                <Image
                  src={active.src}
                  alt={active.alt}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              </div>
              <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-bone">{active.title}</p>
                  <p className="truncate text-xs text-gold">{active.alt}</p>
                </div>
                <button
                  type="button"
                  className="btn-ghost !min-h-11 shrink-0 !rounded-xl !px-4"
                  onClick={() => setActive(null)}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
