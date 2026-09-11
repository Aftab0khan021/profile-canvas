import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type CursorLabel = null | 'VIEW' | 'CONNECT' | 'READ' | 'OPEN';

/**
 * Custom SVG-style cursor ring.
 * FIXED: Removed useMotionValue calls from inside Array.from() loop (violated Rules of Hooks).
 * Trail dots are now managed via requestAnimationFrame + DOM refs only.
 *
 * Security: Only reads data attributes from DOM — no eval, no innerHTML.
 * Accessibility: Hidden via aria-hidden. Native cursor kept visible as fallback.
 */
export function CustomCursor() {
  const [label, setLabel] = useState<CursorLabel>(null);
  const [clicking, setClicking] = useState(false);
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  // Main cursor spring — hooks called unconditionally at top level
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const springX = useSpring(rawX, { stiffness: 500, damping: 35, mass: 0.3 });
  const springY = useSpring(rawY, { stiffness: 500, damping: 35, mass: 0.3 });

  // Trail: managed via refs + RAF, NOT hooks in a loop
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const posHistory = useRef<{ x: number; y: number }[]>([]);
  const trailCount = 5;

  useEffect(() => {
    if (isTouch) return;

    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);

      posHistory.current.unshift({ x: e.clientX, y: e.clientY });
      if (posHistory.current.length > trailCount * 4) posHistory.current.length = trailCount * 4;

      // Update trail dots via direct DOM style (no state)
      trailRefs.current.forEach((el, i) => {
        if (!el) return;
        const idx = Math.min((i + 1) * 4, posHistory.current.length - 1);
        const pos = posHistory.current[idx];
        if (pos) {
          el.style.transform = `translate(${pos.x - 3}px, ${pos.y - 3}px)`;
        }
      });

      // Detect what's under cursor via data-cursor attribute
      const domEl = document.elementFromPoint(e.clientX, e.clientY);
      const closest = domEl?.closest('[data-cursor]') as HTMLElement | null;
      const cursorType = (closest?.dataset.cursor as CursorLabel) ?? null;
      setLabel(cursorType);
    };

    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isTouch, rawX, rawY]);

  if (isTouch) return null;

  return (
    <>
      {/* Main cursor ring */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          width: label ? 56 : clicking ? 20 : 32,
          height: label ? 56 : clicking ? 20 : 32,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.6)',
          mixBlendMode: 'difference',
          pointerEvents: 'none',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'width 0.2s ease, height 0.2s ease',
        }}
      >
        {label && (
          <span style={{
            fontSize: '7px',
            fontFamily: 'monospace',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '0.1em',
            userSelect: 'none',
          }}>
            {label}
          </span>
        )}
      </motion.div>

      {/* Trail dots — positioned via DOM refs (no hooks in loop) */}
      {Array.from({ length: trailCount }, (_, i) => (
        <div
          key={i}
          ref={el => { trailRefs.current[i] = el; }}
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 6 - i,
            height: 6 - i,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.15)',
            pointerEvents: 'none',
            zIndex: 99998,
            willChange: 'transform',
          }}
        />
      ))}
    </>
  );
}
