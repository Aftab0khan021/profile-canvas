import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTextScramble } from '@/hooks/useTextScramble';

interface IntroScreenProps {
  name: string;
  onComplete: () => void;
}

/**
 * Branded intro loading screen — shows once per session.
 * Phases:
 *   0–600ms  : Counter 000→100 in monospace
 *   600–1400ms: Name scramble-decode from ████ → real name
 *   1400–1800ms: Brand line sweeps + vertical split reveal
 *
 * Security:
 *   - name prop sanitised via textContent (React default) — no dangerouslySetInnerHTML
 *   - sessionStorage access wrapped in try/catch (Safari private mode)
 *   - No external URLs or dynamic code execution
 */
export function IntroScreen({ name, onComplete }: IntroScreenProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [counter, setCounter] = useState(0);
  const nameRef = useRef<HTMLSpanElement>(null);
  const { scramble } = useTextScramble();

  useEffect(() => {
    // Only show once per session — try/catch for Safari private mode
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem('portfolio_intro_seen') === '1';
    } catch {
      alreadySeen = false;
    }

    if (alreadySeen) {
      onComplete();
      return;
    }

    // Respect reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      try { sessionStorage.setItem('portfolio_intro_seen', '1'); } catch { /* noop */ }
      onComplete();
      return;
    }

    setVisible(true);

    // Phase 0 → counter animation
    const start = performance.now();
    const duration = 600;
    const rafId = { current: 0 };

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setCounter(Math.floor(p * 100));
      if (p < 1) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        setPhase(1);
      }
    };
    rafId.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Phase 1 → name scramble
  useEffect(() => {
    if (phase !== 1) return;
    // Small delay before scramble starts
    const t = setTimeout(() => {
      const cancel = scramble(nameRef.current, name.toUpperCase(), 700);
      const t2 = setTimeout(() => {
        cancel();
        setPhase(2);
      }, 900);
      return () => clearTimeout(t2);
    }, 100);
    return () => clearTimeout(t);
  }, [phase, name, scramble]);

  // Phase 2 → line + split
  useEffect(() => {
    if (phase !== 2) return;
    const t = setTimeout(() => {
      setPhase(3);
      setTimeout(() => {
        setVisible(false);
        try { sessionStorage.setItem('portfolio_intro_seen', '1'); } catch { /* noop */ }
        onComplete();
      }, 700);
    }, 500);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: '#080808',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Counter */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: phase >= 1 ? 0.3 : 1 }}
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '80px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.08)',
              letterSpacing: '-0.04em',
              userSelect: 'none',
            }}
          >
            [{String(counter).padStart(3, '0')}]
          </motion.div>

          {/* Name decode */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 'clamp(32px, 6vw, 72px)',
                  fontWeight: 700,
                  color: '#f0ede6',
                  letterSpacing: '-0.04em',
                  userSelect: 'none',
                }}
              >
                <span ref={nameRef}>{name.toUpperCase()}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Brand sweep line */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  bottom: '35%',
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: 'var(--cursor-color, #7c3aed)',
                  transformOrigin: 'left',
                  opacity: 0.8,
                }}
              />
            )}
          </AnimatePresence>

          {/* Split panels */}
          <AnimatePresence>
            {phase >= 3 && (
              <>
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: '-100%' }}
                  transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    bottom: '50%',
                    backgroundColor: '#080808',
                  }}
                />
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: '100%' }}
                  transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    top: '50%',
                    backgroundColor: '#080808',
                  }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
