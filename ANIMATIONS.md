# Animaciones — El Calentano Web

## Stack
- **Lenis** — scroll suave en toda la home
- **GSAP + ScrollTrigger** — reveal, parallax del hero, clip-path de galería, stagger de letras
- **Framer Motion** — modal, header, botones, lightbox, filtros, pasos del wizard
- **Canvas** — brasas/partículas ligeras (sin Three.js; pensado para móvil)

## Marca
Se mantiene la identidad rústica mexicana: ladrillo real, dorado, Cream Cake y logo negro. No se sustituyó por Bebas/Montserrat ni por la paleta genérica del brief.

## Cómo correr
```bash
# API (puerto 4000)
cd el-calentano-api
npm run dev

# Web (puerto 3000, LAN)
cd el-calentano-web
npm install
npm run dev
```

Build de producción:
```bash
cd el-calentano-web
npm run build
npm start
```

## Mobile-first (≤768px)
- Lenis **desactivado** en móvil (scroll nativo).
- Sin canvas de brasas ni parallax GSAP.
- Animaciones más cortas (`~220–400ms`); títulos de galería siempre visibles.
- Modal / lightbox como bottom sheet sobre la bottom nav.
- Wizard: barra de progreso + chips con nombre de paso + calendario ≥44px.
- Header con CTA «Reservar» siempre a mano.
- `useIsMobile()` / `useMotionLite()` en `src/lib/motion.ts`.

## Modales (sin alert del navegador)
Usa `useConfirmDialog()` en lugar de `window.confirm` / `window.alert`:

```tsx
const { ask, alert, Dialog } = useConfirmDialog();
// en el JSX: {Dialog}

const ok = await ask({
  title: "Check-in",
  message: "¿El cliente ya llegó?",
  confirmLabel: "Sí",
  cancelLabel: "Cancelar",
  tone: "gold", // | "danger" | "neutral"
});

await alert({ title: "Listo", message: "Acción completada." });
```

Archivo: `src/components/ConfirmModal.tsx`

## Cómo añadir una animación
1. **Reveal al scroll:** envuelve con `<Reveal delay={0.1}>...</Reveal>`
2. **Botón con microinteracción:** `<MotionButton>` o `<MotionLinkButton>` (scale, tap, ripple, spinner)
3. **Campo con floating label:** `<FloatingField label="…" value={…} onChange={…} error={…} />`
4. **ScrollTrigger custom:** `gsap.registerPlugin(ScrollTrigger)` + `gsap.context` y cleanup `ctx.revert()`
5. **Accesibilidad:** si `usePrefersReducedMotion()` es `true`, no inicies GSAP/Lenis/Canvas

## Archivos clave
| Pieza | Ruta |
|-------|------|
| Experiencia home | `src/components/HomeExperience.tsx` |
| Lenis + ScrollTrigger | `src/components/motion/SmoothScroll.tsx` |
| Barra de progreso | `src/components/motion/ScrollProgress.tsx` |
| Reveal | `src/components/motion/Reveal.tsx` |
| Botones | `src/components/motion/MotionButton.tsx` |
| Inputs | `src/components/motion/FloatingField.tsx` |
| Modal novedades | `src/components/NewsModal.tsx` |
| Galería + lightbox | `src/components/PhotoGallery.tsx` |
| Hero | `src/components/HeroBrand.tsx` |
| Header smart | `src/components/SiteHeader.tsx` |
| Footer + top | `src/components/SiteFooter.tsx` |
| Brasas | `src/components/EmberCanvas.tsx` |
| Preferencias motion | `src/lib/motion.ts` |

## Checklist de efectos
1. Scroll Lenis + sync ScrollTrigger
2. Hero: stagger de letras, parallax, CTA hover, scroll indicator
3. Galería: clip-path, hover, lightbox, filtros
4. Modal novedades (2.4s, escala + fade)
5. Botones: scale / tap / ripple / loading
6. Inputs: floating label, hover, shake de error, check de éxito
7. Cards de servicios con tilt 3D CSS
8. Partículas canvas (brasas)
9. Texto reveal + progreso de scroll
10. Header hide/show + blur + menú móvil
11. Lazy + shimmer en galería
12. Footer + volver arriba
13. `prefers-reduced-motion` respetado

## Notas de rendimiento
- Three.js / Lottie no se cargaron a propósito (prioridad móvil).
- Menos partículas en viewport estrecho.
- Animaciones con `transform` / `opacity` / `clip-path`.
- Con Lenis activo, `html` usa `scroll-behavior: auto` (clase `.lenis-smooth`).
