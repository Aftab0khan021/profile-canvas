import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Thin brand-color scroll progress bar fixed at the very top of the viewport.
 * Uses framer-motion useScroll so it reads from Lenis's virtual scroll position.
 */
export function ScrollProgress({ brandColor }: { brandColor: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: brandColor,
        scaleX,
        transformOrigin: '0%',
        zIndex: 9998,
        boxShadow: `0 0 8px ${brandColor}80`,
      }}
    />
  );
}

/**
 * Thin vertical line with section dots on the right edge of the viewport.
 * Highlights the active section using IntersectionObserver.
 * Hidden on mobile.
 */
interface SectionItem { id: string; label: string; }

export function SectionMarker({ sections, brandColor }: { sections: SectionItem[]; brandColor: string }) {
  const [active, setActive] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [sections]);

  return (
    <div
      aria-hidden="true"
      className="hidden lg:flex"
      style={{
        position: 'fixed',
        right: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 200,
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 16,
      }}
    >
      {sections.map(({ id, label }, i) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              opacity: isActive ? 1 : 0.35,
              transition: 'opacity 0.3s',
            }}
          >
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9,
              letterSpacing: '0.12em',
              color: isActive ? brandColor : '#6b7280',
              textTransform: 'uppercase',
              transition: 'color 0.3s',
              whiteSpace: 'nowrap',
            }}>
              {String(i + 1).padStart(2, '0')} {label}
            </span>
            <div style={{
              width: isActive ? 24 : 8,
              height: 2,
              backgroundColor: isActive ? brandColor : '#374151',
              borderRadius: 2,
              transition: 'all 0.3s',
              boxShadow: isActive ? `0 0 6px ${brandColor}` : 'none',
            }} />
          </button>
        );
      })}
    </div>
  );
}
