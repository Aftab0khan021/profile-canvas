import { useEffect, useRef, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageHeroProps {
  eyebrow?: string;       // e.g. "01 — ABOUT"
  title: string;
  subtitle?: string;
  brandColor: string;
  children?: ReactNode;   // extra hero content (stats row etc.)
  align?: 'left' | 'center';
}

/**
 * Shared premium animated page hero — used by EVERY public page.
 * Features:
 *  - Animated gradient grid background
 *  - Radial glow from top
 *  - Staggered eyebrow → title → subtitle reveal
 *  - Floating decorative orbs
 *  - Mouse-parallax spotlight
 */
export function PageHero({ eyebrow, title, subtitle, brandColor, children, align = 'left' }: PageHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Mouse parallax spotlight
  useEffect(() => {
    const el = containerRef.current;
    const spot = spotlightRef.current;
    if (!el || !spot) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      spot.style.setProperty('--x', `${x}%`);
      spot.style.setProperty('--y', `${y}%`);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  const bc = brandColor;
  const isCenter = align === 'center';

  return (
    <section
      ref={containerRef}
      className="relative pt-24 pb-16 px-4 overflow-hidden"
      style={{ borderBottom: `1px solid ${bc}10` }}
    >
      {/* Spotlight overlay */}
      <div ref={spotlightRef} className="spotlight" />

      {/* Grid floor */}
      <div className="grid-floor" />

      {/* Top radial glow */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 300, pointerEvents: 'none',
        background: `radial-gradient(ellipse 70% 100% at 50% 0%, ${bc}20 0%, transparent 70%)`,
      }} />

      {/* Floating decorative orbs */}
      <motion.div
        animate={{ y: [0, -16, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: 40, right: '8%',
          width: 180, height: 180, borderRadius: '50%',
          background: `radial-gradient(circle, ${bc}18 0%, transparent 70%)`,
          border: `1px solid ${bc}15`, pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{
          position: 'absolute', bottom: 20, left: '5%',
          width: 120, height: 120, borderRadius: '50%',
          background: `radial-gradient(circle, ${bc}10 0%, transparent 70%)`,
          border: `1px solid ${bc}10`, pointerEvents: 'none',
        }}
      />

      {/* Corner line accent — top left */}
      <div style={{
        position: 'absolute', top: 20, left: 20,
        width: 40, height: 40,
        borderTop: `1px solid ${bc}40`, borderLeft: `1px solid ${bc}40`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 20, right: 20,
        width: 40, height: 40,
        borderTop: `1px solid ${bc}40`, borderRight: `1px solid ${bc}40`,
        pointerEvents: 'none',
      }} />

      <div className={`container mx-auto max-w-6xl relative z-10 ${isCenter ? 'text-center' : ''}`}>
        {/* Eyebrow */}
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <span
              className="inline-flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-[0.25em]"
              style={{ color: bc }}
            >
              <span style={{ width: 20, height: 1, backgroundColor: bc, display: 'inline-block' }} />
              {eyebrow}
              <span style={{ width: 20, height: 1, backgroundColor: bc, display: 'inline-block' }} />
            </span>
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          style={{
            background: `linear-gradient(135deg, #f0ede6 30%, ${bc} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: `drop-shadow(0 0 24px ${bc}30)`,
          }}
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-base leading-relaxed max-w-2xl ${isCenter ? 'mx-auto' : ''}`}
            style={{ color: '#6b7280' }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Extra content */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10"
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}

/** Reusable 3D animated stat box */
export function StatBox({ value, label, brandColor, delay = 0 }: { value: string | number; label: string; brandColor: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.04, y: -2 }}
      className="card-3d glass-card rounded-xl p-5 text-center cursor-default"
      style={{ backgroundColor: '#0e0e0e', border: `1px solid ${brandColor}15` }}
    >
      <div
        className="text-2xl md:text-3xl font-bold font-mono mb-1 stat-number"
        style={{ color: brandColor, textShadow: `0 0 20px ${brandColor}60` }}
      >
        {value}
      </div>
      <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#6b7280' }}>{label}</div>
    </motion.div>
  );
}

/** Reusable animated section header (for within-page sections) */
export function SectionHeader({ eyebrow, title, brandColor }: { eyebrow: string; title: string; brandColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] mb-3 block" style={{ color: brandColor }}>
        {eyebrow}
      </span>
      <h2
        className="font-display text-3xl md:text-4xl font-bold tracking-tight gradient-title"
        style={{ '--gradient-color': brandColor } as React.CSSProperties}
      >
        {title}
      </h2>
    </motion.div>
  );
}

/** Reusable 3D holo card wrapper */
export function HoloCard({ children, brandColor, className = '', delay = 0 }: { children: ReactNode; brandColor: string; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4 }}
      className={`card-3d holo-card glass-card ${className}`}
      style={{
        backgroundColor: '#0e0e0e',
        border: `1px solid ${brandColor}12`,
        boxShadow: `0 4px 24px -8px rgba(0,0,0,0.4)`,
      }}
    >
      {children}
    </motion.div>
  );
}
