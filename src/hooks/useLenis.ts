import { useEffect, useRef } from 'react';

/**
 * Initialises Lenis smooth scroll and wires it to GSAP's ticker so that
 * ScrollTrigger reads from Lenis's interpolated scroll position — keeping
 * pinned sections and scroll-linked animations perfectly in sync.
 *
 * Wrapped in try/catch — if Lenis or GSAP fail to load, scroll falls back
 * to native browser scrolling (zero impact on UX).
 *
 * Security: no external input, purely internal RAF loop.
 */
export function useLenis() {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // Respect reduced-motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let lenis: any = null;
    let gsapRef: any = null;
    let onTick: ((time: number) => void) | null = null;

    const init = async () => {
      try {
        const [LenisModule, gsapModule, stModule] = await Promise.all([
          import('lenis'),
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ]);

        const Lenis = LenisModule.default;
        gsapRef = gsapModule.default;
        const ScrollTrigger = stModule.ScrollTrigger;

        gsapRef.registerPlugin(ScrollTrigger);

        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });
        lenisRef.current = lenis;

        // Sync Lenis → GSAP ticker
        onTick = (time: number) => lenis.raf(time * 1000);
        gsapRef.ticker.add(onTick);
        gsapRef.ticker.lagSmoothing(0);

        // Let ScrollTrigger use Lenis's scroll
        lenis.on('scroll', ScrollTrigger.update);
      } catch (err) {
        // Graceful fallback — native scroll will work fine
        console.warn('[useLenis] Failed to init smooth scroll:', err);
      }
    };

    init();

    return () => {
      try {
        if (onTick && gsapRef) gsapRef.ticker.remove(onTick);
        if (lenis) lenis.destroy();
        lenisRef.current = null;
      } catch { /* cleanup errors are safe to swallow */ }
    };
  }, []);

  return lenisRef;
}
