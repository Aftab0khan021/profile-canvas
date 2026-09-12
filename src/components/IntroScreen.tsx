import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { useTextScramble } from '@/hooks/useTextScramble';

interface IntroScreenProps {
  name: string;
  title?: string;
  avatarUrl?: string;
  brandColor?: string;
  skills?: string[];
  onComplete: () => void;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

function scrambleText(target: string, progress: number): string {
  return target
    .split('')
    .map((char, i) => {
      if (char === ' ') return ' ';
      if (i < Math.floor(progress * target.length)) return char;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    })
    .join('');
}

/**
 * Ultra-premium cinematic intro screen.
 * Phases (total ~4.5s):
 *   0  – dark + scan lines + particle field boots up
 *   1  – 3D rotating rings expand (500ms)
 *   2  – avatar scales in with glow (1000ms)
 *   3  – name scramble decode (1500–2500ms)
 *   4  – title + floating skill badges appear (2500ms)
 *   5  – loading bar completes (3000ms)
 *   6  – "ENTERING" flash + split exit (3500–4200ms)
 */
export function IntroScreen({
  name,
  title = 'Developer',
  avatarUrl,
  brandColor = '#7c3aed',
  skills = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'GraphQL'],
  onComplete,
}: IntroScreenProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [loadPct, setLoadPct] = useState(0);
  const [showExit, setShowExit] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const scrambleRaf = useRef<number>(0);
  const mountedRef = useRef(true);

  // Check session
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem('intro_shown') === '1'; } catch {}
    if (seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      try { sessionStorage.setItem('intro_shown', '1'); } catch {}
      onComplete();
      return;
    }
    setVisible(true);
    setScrambled(name.toUpperCase().split('').map(() => CHARS[Math.floor(Math.random() * CHARS.length)]).join(''));
    return () => { mountedRef.current = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Particle canvas
  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const hex = brandColor.replace('#', '');
    const pr = parseInt(hex.slice(0,2),16) || 124;
    const pg = parseInt(hex.slice(2,4),16) || 58;
    const pb = parseInt(hex.slice(4,6),16) || 237;

    const pts = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.8 + 0.4,
      a: Math.random() * 0.6 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x = (p.x + p.vx + canvas.width) % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pr},${pg},${pb},${p.a})`;
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(${pr},${pg},${pb},${(1-d/130)*0.15})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [visible, brandColor]);

  // Phase timeline
  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => mountedRef.current && setPhase(1), 200));
    timers.push(setTimeout(() => mountedRef.current && setPhase(2), 700));
    timers.push(setTimeout(() => mountedRef.current && setPhase(3), 1200));
    timers.push(setTimeout(() => mountedRef.current && setPhase(4), 2400));
    timers.push(setTimeout(() => mountedRef.current && setPhase(5), 3000));
    timers.push(setTimeout(() => {
      if (!mountedRef.current) return;
      setPhase(6);
      setShowExit(true);
      setTimeout(() => {
        setVisible(false);
        try { sessionStorage.setItem('intro_shown', '1'); } catch {}
        onComplete();
      }, 750);
    }, 4000));
    return () => timers.forEach(clearTimeout);
  }, [visible, onComplete]);

  // Loading bar progress
  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    const dur = 3200;
    const animate = (now: number) => {
      const pct = Math.min((now - start) / dur, 1);
      // Ease: fast at start, slow in middle, fast at end
      const eased = pct < 0.5 ? 2 * pct * pct : 1 - Math.pow(-2 * pct + 2, 2) / 2;
      setLoadPct(Math.floor(eased * 100));
      if (pct < 1) scrambleRaf.current = requestAnimationFrame(animate);
    };
    scrambleRaf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(scrambleRaf.current);
  }, [visible]);

  // Name scramble decode during phase 3
  useEffect(() => {
    if (phase !== 3) return;
    const upper = name.toUpperCase();
    const start = performance.now();
    const dur = 1100;
    const anim = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setScrambled(scrambleText(upper, p));
      if (p < 1) scrambleRaf.current = requestAnimationFrame(anim);
      else setScrambled(upper);
    };
    scrambleRaf.current = requestAnimationFrame(anim);
    return () => cancelAnimationFrame(scrambleRaf.current);
  }, [phase, name]);

  const bc = brandColor;
  const bcRgb = (() => {
    const h = bc.replace('#','');
    return [parseInt(h.slice(0,2),16)||124,parseInt(h.slice(2,4),16)||58,parseInt(h.slice(4,6),16)||237];
  })();

  const floatingSkills = skills.slice(0, 8);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            backgroundColor: '#050505',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', perspective: '1200px',
          }}
        >
          {/* Particle canvas */}
          <canvas ref={canvasRef} style={{ position:'absolute', inset:0, pointerEvents:'none' }} />

          {/* Scan lines overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
            zIndex: 1,
          }} />

          {/* Deep radial glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: phase >= 1 ? 1 : 0, scale: phase >= 1 ? 1 : 0.3 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: 900, height: 900, borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${bcRgb[0]},${bcRgb[1]},${bcRgb[2]},0.15) 0%, transparent 70%)`,
              pointerEvents: 'none', zIndex: 1,
            }}
          />

          {/* 3D Rotating outer ring */}
          <motion.div
            initial={{ opacity: 0, rotateX: 80, scale: 0.4 }}
            animate={{ opacity: phase >= 1 ? 0.6 : 0, rotateX: phase >= 1 ? 65 : 80, scale: phase >= 1 ? 1 : 0.4 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: 500, height: 500, borderRadius: '50%',
              border: `1px solid ${bc}30`,
              boxShadow: `0 0 40px ${bc}20, inset 0 0 40px ${bc}10`,
              transformStyle: 'preserve-3d',
              animation: phase >= 1 ? 'spin3d 12s linear infinite' : 'none',
              pointerEvents: 'none', zIndex: 2,
            }}
          />

          {/* 3D Rotating inner ring */}
          <motion.div
            initial={{ opacity: 0, rotateX: -80, scale: 0.4 }}
            animate={{ opacity: phase >= 1 ? 0.8 : 0, rotateX: phase >= 1 ? -65 : -80, scale: phase >= 1 ? 1 : 0.4 }}
            transition={{ duration: 1.0, delay: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: 340, height: 340, borderRadius: '50%',
              border: `1px solid ${bc}50`,
              boxShadow: `0 0 30px ${bc}30`,
              transformStyle: 'preserve-3d',
              animation: phase >= 1 ? 'spin3d-rev 8s linear infinite' : 'none',
              pointerEvents: 'none', zIndex: 2,
            }}
          />

          {/* Corner brackets */}
          {[
            { top:20, left:20, borderTop:`2px solid ${bc}`, borderLeft:`2px solid ${bc}` },
            { top:20, right:20, borderTop:`2px solid ${bc}`, borderRight:`2px solid ${bc}` },
            { bottom:20, left:20, borderBottom:`2px solid ${bc}`, borderLeft:`2px solid ${bc}` },
            { bottom:20, right:20, borderBottom:`2px solid ${bc}`, borderRight:`2px solid ${bc}` },
          ].map((s, i) => (
            <motion.div key={i}
              initial={{ opacity:0, scale:0.3 }}
              animate={{ opacity: phase>=0 ? 1:0, scale:1 }}
              transition={{ delay:0.05*i, duration:0.5 }}
              style={{ position:'absolute', width:36, height:36, zIndex:10, ...s }}
            />
          ))}

          {/* Top label */}
          <motion.div
            initial={{ opacity:0, y:-16 }}
            animate={{ opacity: phase>=0 ? 0.5:0, y:0 }}
            transition={{ duration:0.6, delay:0.1 }}
            style={{
              position:'absolute', top:26,
              fontFamily:'JetBrains Mono, monospace', fontSize:10,
              color:bc, letterSpacing:'0.35em', textTransform:'uppercase', zIndex:10,
            }}
          >
            PORTFOLIO · {new Date().getFullYear()} · LOADING
          </motion.div>

          {/* Floating skill badges orbiting */}
          {phase >= 4 && floatingSkills.map((skill, i) => {
            const angle = (i / floatingSkills.length) * 360;
            const r = 260;
            const rad = (angle * Math.PI) / 180;
            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r * 0.45; // elliptical
            return (
              <motion.div
                key={skill}
                initial={{ opacity:0, scale:0, x, y }}
                animate={{ opacity:0.85, scale:1, x, y }}
                transition={{ duration:0.5, delay:i*0.07, type:'spring', stiffness:260, damping:20 }}
                style={{
                  position:'absolute',
                  fontFamily:'JetBrains Mono, monospace', fontSize:10, fontWeight:600,
                  color:bc, border:`1px solid ${bc}40`, borderRadius:9999,
                  padding:'4px 12px', backgroundColor:`rgba(${bcRgb[0]},${bcRgb[1]},${bcRgb[2]},0.08)`,
                  backdropFilter:'blur(8px)',
                  letterSpacing:'0.08em', whiteSpace:'nowrap', zIndex:10,
                  boxShadow:`0 0 12px -4px ${bc}50`,
                }}
              >
                {skill}
              </motion.div>
            );
          })}

          {/* CENTER CONTENT */}
          <div style={{ position:'relative', textAlign:'center', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center' }}>

            {/* Avatar */}
            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  initial={{ opacity:0, scale:0.3, rotateY:180 }}
                  animate={{ opacity:1, scale:1, rotateY:0 }}
                  transition={{ duration:0.8, type:'spring', stiffness:180, damping:18 }}
                  style={{ marginBottom:28 }}
                >
                  {avatarUrl ? (
                    <div style={{
                      width:96, height:96, borderRadius:'50%', overflow:'hidden',
                      border:`2px solid ${bc}80`,
                      boxShadow:`0 0 0 8px rgba(${bcRgb[0]},${bcRgb[1]},${bcRgb[2]},0.1), 0 0 40px rgba(${bcRgb[0]},${bcRgb[1]},${bcRgb[2]},0.4)`,
                      position:'relative',
                    }}>
                      <img src={avatarUrl} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      {/* Spin overlay */}
                      <div style={{
                        position:'absolute', inset:-4, borderRadius:'50%',
                        border:`1px solid ${bc}30`,
                        animation:'spin-slow 6s linear infinite',
                      }} />
                    </div>
                  ) : (
                    <div style={{
                      width:96, height:96, borderRadius:'50%',
                      background:`linear-gradient(135deg, ${bc}, ${bc}80)`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:32, fontWeight:800, color:'#fff',
                      boxShadow:`0 0 40px rgba(${bcRgb[0]},${bcRgb[1]},${bcRgb[2]},0.5)`,
                      border:`2px solid ${bc}60`,
                    }}>
                      {name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name — scramble decode */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity:0, y:30, filter:'blur(20px)' }}
                  animate={{ opacity:1, y:0, filter:'blur(0px)' }}
                  transition={{ duration:0.7 }}
                >
                  <div style={{
                    fontFamily:'Space Grotesk, sans-serif',
                    fontSize:'clamp(38px, 8vw, 88px)',
                    fontWeight:800,
                    letterSpacing:'-0.04em',
                    lineHeight:1,
                    userSelect:'none',
                    background:`linear-gradient(135deg, #f0ede6 30%, ${bc} 100%)`,
                    WebkitBackgroundClip:'text',
                    WebkitTextFillColor:'transparent',
                    backgroundClip:'text',
                    filter:`drop-shadow(0 0 30px ${bc}50)`,
                  }}>
                    {scrambled || name.toUpperCase()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title */}
            <AnimatePresence>
              {phase >= 4 && title && (
                <motion.p
                  initial={{ opacity:0, y:16, letterSpacing:'0.5em' }}
                  animate={{ opacity:1, y:0, letterSpacing:'0.25em' }}
                  transition={{ duration:0.6, delay:0.1 }}
                  style={{
                    fontFamily:'JetBrains Mono, monospace',
                    fontSize:'clamp(11px, 1.6vw, 15px)',
                    color:bc, letterSpacing:'0.25em',
                    textTransform:'uppercase', marginTop:16,
                    userSelect:'none',
                    textShadow:`0 0 20px ${bc}`,
                  }}
                >
                  ◆ {title} ◆
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Loading bar at bottom */}
          <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity: phase>=0 ? 1:0 }}
            style={{
              position:'absolute', bottom:56,
              width:'min(320px, 70vw)', zIndex:10,
            }}
          >
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{
                fontFamily:'JetBrains Mono, monospace', fontSize:9,
                color:`rgba(${bcRgb[0]},${bcRgb[1]},${bcRgb[2]},0.5)`,
                letterSpacing:'0.25em', textTransform:'uppercase',
              }}>INITIALIZING</span>
              <span style={{
                fontFamily:'JetBrains Mono, monospace', fontSize:9,
                color:bc, letterSpacing:'0.1em', fontWeight:700,
              }}>{String(loadPct).padStart(3,'0')}%</span>
            </div>
            <div style={{
              height:2, backgroundColor:'rgba(255,255,255,0.05)',
              borderRadius:2, overflow:'hidden', position:'relative',
            }}>
              <motion.div style={{
                position:'absolute', inset:0,
                width:`${loadPct}%`,
                background:`linear-gradient(90deg, ${bc}60, ${bc})`,
                boxShadow:`0 0 12px ${bc}, 0 0 4px ${bc}`,
                transition:'width 0.1s linear',
              }} />
            </div>
          </motion.div>

          {/* Bottom label */}
          <motion.div
            animate={{ opacity: phase>=5 ? 0.5 : 0 }}
            style={{
              position:'absolute', bottom:28,
              fontFamily:'JetBrains Mono, monospace', fontSize:9,
              color:'#fff', letterSpacing:'0.35em', zIndex:10,
            }}
          >
            WELCOME — PRESS ANY KEY TO SKIP
          </motion.div>

          {/* Horizontal sweep line */}
          <AnimatePresence>
            {phase >= 5 && (
              <motion.div
                initial={{ scaleX:0, opacity:1 }}
                animate={{ scaleX:1, opacity:0.6 }}
                transition={{ duration:0.5 }}
                style={{
                  position:'absolute', left:0, right:0,
                  height:1,
                  background:`linear-gradient(90deg, transparent 0%, ${bc} 30%, ${bc} 70%, transparent 100%)`,
                  transformOrigin:'left', zIndex:10,
                }}
              />
            )}
          </AnimatePresence>

          {/* ENTERING flash text */}
          <AnimatePresence>
            {phase >= 6 && (
              <motion.div
                initial={{ opacity:0, scale:2, filter:'blur(20px)' }}
                animate={{ opacity:[0,1,0], scale:[2,1,0.8], filter:['blur(20px)','blur(0px)','blur(8px)'] }}
                transition={{ duration:0.6, times:[0,0.4,1] }}
                style={{
                  position:'absolute', zIndex:20,
                  fontFamily:'JetBrains Mono, monospace', fontSize:'clamp(14px,3vw,24px)',
                  fontWeight:700, color:bc, letterSpacing:'0.5em', textTransform:'uppercase',
                  textShadow:`0 0 40px ${bc}, 0 0 80px ${bc}`,
                }}
              >
                ENTERING
              </motion.div>
            )}
          </AnimatePresence>

          {/* Split panels exit */}
          <AnimatePresence>
            {showExit && (
              <>
                <motion.div
                  initial={{ y:0 }} animate={{ y:'-100%' }}
                  transition={{ duration:0.7, ease:[0.76,0,0.24,1] }}
                  style={{ position:'absolute', inset:0, bottom:'50%', backgroundColor:'#050505', zIndex:30 }}
                />
                <motion.div
                  initial={{ y:0 }} animate={{ y:'100%' }}
                  transition={{ duration:0.7, ease:[0.76,0,0.24,1] }}
                  style={{ position:'absolute', inset:0, top:'50%', backgroundColor:'#050505', zIndex:30 }}
                />
              </>
            )}
          </AnimatePresence>

          {/* CSS animations for rings */}
          <style>{`
            @keyframes spin3d {
              from { transform: rotateX(65deg) rotateZ(0deg); }
              to   { transform: rotateX(65deg) rotateZ(360deg); }
            }
            @keyframes spin3d-rev {
              from { transform: rotateX(-65deg) rotateZ(0deg); }
              to   { transform: rotateX(-65deg) rotateZ(-360deg); }
            }
            @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
