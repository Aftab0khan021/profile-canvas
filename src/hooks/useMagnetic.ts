import { useRef, useCallback } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

/**
 * Makes an element magnetically follow the cursor on hover, then spring back.
 * Strength controls how many px max the element moves (default 20).
 *
 * Security: Uses only offsetLeft/offsetTop and getBoundingClientRect — no eval.
 * Accessibility: No-ops on touch devices (hover:none media query).
 */
export function useMagnetic(strength = 20) {
  const ref = useRef<HTMLElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 200, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 200, damping: 20, mass: 0.5 });

  const isTouch = typeof window !== 'undefined' &&
    window.matchMedia('(hover: none)').matches;

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current || isTouch) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = ((e.clientX - centerX) / (rect.width / 2)) * strength;
    const deltaY = ((e.clientY - centerY) / (rect.height / 2)) * strength;
    x.set(deltaX);
    y.set(deltaY);
  }, [isTouch, strength, x, y]);

  const onMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const magneticRef = useCallback((node: HTMLElement | null) => {
    if (ref.current) {
      ref.current.removeEventListener('mousemove', onMouseMove);
      ref.current.removeEventListener('mouseleave', onMouseLeave);
    }
    ref.current = node;
    if (node && !isTouch) {
      node.addEventListener('mousemove', onMouseMove);
      node.addEventListener('mouseleave', onMouseLeave);
    }
  }, [onMouseMove, onMouseLeave, isTouch]);

  return { magneticRef, springX, springY };
}
