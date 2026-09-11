import { useRef, useCallback } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Mouse-tracking 3D tilt for cards.
 * Returns spring-animated rotateX/rotateY and a glare position.
 * Disabled entirely on touch devices.
 */
export function use3DTilt(maxTilt = 12) {
  const ref = useRef<HTMLElement | null>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 300, damping: 30,
  });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 300, damping: 30,
  });
  const glareX = useTransform(rawX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(rawY, [-0.5, 0.5], [0, 100]);

  const isTouch = typeof window !== 'undefined' &&
    window.matchMedia('(hover: none)').matches;

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current || isTouch) return;
    const rect = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [isTouch, rawX, rawY]);

  const onMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  const tiltRef = useCallback((node: HTMLElement | null) => {
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

  return { tiltRef, rotateX, rotateY, glareX, glareY };
}
