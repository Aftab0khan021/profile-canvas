import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTextScramble } from '@/hooks/useTextScramble';

interface IntroScreenProps {
  name: string;
  title?: string;
  avatarUrl?: string;
  brandColor?: string;
  onComplete: () => void;
}

/**
 * Immersive branded intro screen — cinematic opening sequence.
 *
 * Phases:
 *   0 – loading bar + particle canvas (0–900ms)
 *   1 – name scramble decode (900–1800ms)
 *   2 – title + brand line reveal (1800–2400ms)
 *   3 – split-panel exit (2400–3000ms)
 *
 * Security: no innerHTML, no eval, no external URLs
 */
export function IntroScreen({ name, title, avatarUrl, brandColor = '#7c3aed', onComplete }: IntroScreenProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [progress, setProgress] = useState(0);
  const nameRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const { scramble } = useTextScramble();

  // Particle animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    // Parse brandColor to rgb
    const hex = brandColor.replace('#', '');
    const pr = parseInt(hex.slice(0,2), 16);
    const pg = parseInt(hex.slice(2,4), 16);
    const pb = parseInt(hex.slice(4,6), 16);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pr},${pg},${pb},${p.alpha})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${pr},${pg},${pb},${(1 - dist / 120) * 0.12})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [brandColor, visible]);

  useEffect(() => {
    let alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem('portfolio_intro_seen') === '1'; } catch { alreadySeen = false; }
    if (alreadySeen) { onComplete(); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      try { sessionStorage.setItem('portfolio_intro_seen', '1'); } catch { /* noop */ }
      onComplete();
      return;
    }

    setVisible(true);

    // Phase 0: loading bar (0–900ms)
    const start = performance.now();
    const duration = 900;
    const rafId = { current: 0 };
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setProgress(Math.floor(p * 100));
      if (p < 1) { rafId.current = requestAnimationFrame(tick); }
      else { setPhase(1); }
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Phase 1: name scramble
  useEffect(() => {
    if (phase !== 1) return;
    const t = setTimeout(() => {
      const cancel = scramble(nameRef.current, name.toUpperCase(), 800);
      const t2 = setTimeout(() => { cancel(); setPhase(2); }, 1000);
      return () => clearTimeout(t2);
    }, 100);
    return () => clearTimeout(t);
  }, [phase, name, scramble]);

  // Phase 2: hold, then trigger exit
  useEffect(() => {
    if (phase !== 2) return;
    const t = setTimeout(() => {
      setPhase(3);
      setTimeout(() => {
        setVisible(false);
        try { sessionStorage.setItem('portfolio_intro_seen', '1'); } catch { /* noop */ }
        onComplete();
      }, 700);
    }, 600);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  const bc = brandColor;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            backgroundColor: '#080808',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Particle canvas */}
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          />

          {/* Radial glow behind center */}
          <div style={{
            position: 'absolute',
            width: 600, height: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${bc}18 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* Corner accents */}
          {[
            { top: 24, left: 24, borderTop: `2px solid ${bc}60`, borderLeft: `2px solid ${bc}60` },
            { top: 24, right: 24, borderTop: `2px solid ${bc}60`, borderRight: `2px solid ${bc}60` },
            { bottom: 24, left: 24, borderBottom: `2px solid ${bc}60`, borderLeft: `2px solid ${bc}60` },
            { bottom: 24, right: 24, borderBottom: `2px solid ${bc}60`, borderRight: `2px solid ${bc}60` },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
              style={{ position: 'absolute', width: 32, height: 32, ...s }}
            />
          ))}

          {/* Top label */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: phase >= 0 ? 0.5 : 0, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              position: 'absolute', top: 28,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: bc, letterSpacing: '0.3em', textTransform: 'uppercase',
            }}
          >
            Portfolio · {new Date().getFullYear()}
          </motion.div>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: phase >= 1 ? 0 : 1 }}
            transition={{ duration: 0.4 }}
            style={{ position: 'absolute', bottom: '28%', width: '260px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em' }}>
                LOADING
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: bc, letterSpacing: '0.1em' }}>
                {String(progress).padStart(3, '0')}%
              </span>
            </div>
            <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
              <motion.div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${bc}80, ${bc})`,
                  boxShadow: `0 0 8px ${bc}`,
                }}
              />
            </div>
          </motion.div>

          {/* Main content: avatar + name */}
          <div style={{ position: 'relative', textAlign: 'center', zIndex: 2 }}>
            {/* Avatar (if provided) */}
            <AnimatePresence>
              {phase >= 1 && avatarUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
                  style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}
                >
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
                    border: `2px solid ${bc}60`,
                    boxShadow: `0 0 30px -6px ${bc}80, 0 0 0 6px ${bc}12`,
                  }}>
                    <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span
                    ref={nameRef}
                    style={{
                      display: 'block',
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 'clamp(36px, 7vw, 80px)',
                      fontWeight: 800,
                      color: '#f0ede6',
                      letterSpacing: '-0.04em',
                      userSelect: 'none',
                      lineHeight: 1.05,
                    }}
                  >
                    {name.toUpperCase()}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title / role */}
            <AnimatePresence>
              {phase >= 2 && title && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 'clamp(12px, 1.8vw, 16px)',
                    color: bc,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    marginTop: 16,
                    userSelect: 'none',
                  }}
                >
                  {title}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Brand sweep line */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  bottom: '32%', left: 0, right: 0,
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${bc}80, transparent)`,
                  transformOrigin: 'left',
                }}
              />
            )}
          </AnimatePresence>

          {/* Bottom status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 0.35 : 0 }}
            style={{
              position: 'absolute', bottom: 28,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: '#fff', letterSpacing: '0.2em',
            }}
          >
            WELCOME
          </motion.div>

          {/* Split panel exit */}
          <AnimatePresence>
            {phase >= 3 && (
              <>
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: '-100%' }}
                  transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
                  style={{
                    position: 'absolute', inset: 0, bottom: '50%',
                    backgroundColor: '#080808', zIndex: 10,
                  }}
                />
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: '100%' }}
                  transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
                  style={{
                    position: 'absolute', inset: 0, top: '50%',
                    backgroundColor: '#080808', zIndex: 10,
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
