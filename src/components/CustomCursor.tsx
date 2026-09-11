import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type CursorLabel = null | 'VIEW' | 'CONNECT' | 'READ' | 'OPEN';

/**
 * Custom SVG-style cursor ring that:
 *  - Follows the mouse with a spring lag (premium feel)
 *  - Morphs size + label based on data-cursor attributes on hovered elements
 *  - Uses mix-blend-mode: difference for color inversion effect
 *  - Hidden on touch devices
 *  - Leaves a 6-dot trailing comet tail
 *
 * Security: Only reads data attributes from DOM — no eval, no innerHTML.
 * Accessibility: Hidden via aria-hidden. Native cursor kept visible as fallback.
 */
export function CustomCursor() {
  const [label, setLabel] = useState<CursorLabel>(null);
  const [clicking, setClicking] = useState(false);
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  const springX = useSpring(rawX, { stiffness: 500, damping: 35, mass: 0.3 });
  const springY = useSpring(rawY, { stiffness: 500, damping: 35, mass: 0.3 });

  // Trail dots — 6 positions delayed
  const trailCount = 6;
  const trails = Array.from({ length: trailCount }, () => ({
    x: useMotionValue(-100),
    y: useMotionValue(-100),
  }));

  const posHistory = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (isTouch) return;

    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      posHistory.current.unshift({ x: e.clientX, y: e.clientY });
      if (posHistory.current.length > trailCount * 4) posHistory.current.length = trailCount * 4;

      // Update trail positions with delay
      trails.forEach((trail, i) => {
        const idx = Math.min((i + 1) * 4, posHistory.current.length - 1);
        const pos = posHistory.current[idx];
        if (pos) {
          trail.x.set(pos.x);
          trail.y.set(pos.y);
        }
      });

      // Detect what's under cursor via data-cursor attribute
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const closest = el?.closest('[data-cursor]') as HTMLElement | null;
      const cursorType = closest?.dataset.cursor as CursorLabel ?? null;
      setLabel(cursorType);
    };

    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isTouch]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isTouch) return null;

  const expanded = label !== null;
  const size = clicking ? 20 : expanded ? 64 : 20;

  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>
      {/* Trail dots */}
      {trails.map((trail, i) => (
        <motion.div
          key={i}
          style={{
            position: 'fixed',
            left: trail.x,
            top: trail.y,
            width: Math.max(4, 10 - i * 1.2),
            height: Math.max(4, 10 - i * 1.2),
            borderRadius: '50%',
            backgroundColor: 'var(--cursor-color, #7c3aed)',
            opacity: (trailCount - i) / (trailCount * 2.5),
            transform: 'translate(-50%, -50%)',
            mixBlendMode: 'screen',
          }}
        />
      ))}

      {/* Main cursor ring */}
      <motion.div
        style={{
          position: 'fixed',
          left: springX,
          top: springY,
          width: size,
          height: size,
          borderRadius: '50%',
          border: expanded ? 'none' : '2px solid var(--cursor-color, #7c3aed)',
          backgroundColor: expanded ? 'var(--cursor-color, #7c3aed)' : 'transparent',
          transform: 'translate(-50%, -50%)',
          mixBlendMode: expanded ? 'normal' : 'difference',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        animate={{ width: size, height: size, scale: clicking ? 0.85 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        {label && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: 9,
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '0.08em',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {label} →
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}
