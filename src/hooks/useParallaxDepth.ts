import { useEffect, useRef } from 'react';
import { useMotionValue } from 'framer-motion';

/**
 * Tracks mouse position as normalised values (-0.5 → 0.5) relative to
 * the window and exposes them as MotionValues for parallax depth layers.
 * Auto-disables on touch devices.
 */
export function useParallaxDepth() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const isTouch = useRef(
    typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
  );

  useEffect(() => {
    if (isTouch.current) return;

    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  return { mouseX, mouseY };
}
