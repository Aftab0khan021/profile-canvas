import { useEffect, useRef, useState, useMemo, useCallback } from 'react';

interface Skill {
  id: string;
  skill_name: string;
  proficiency_level: number;
  category: string;
}

interface ConstellationGraphProps {
  skills: Skill[];
  brandColor: string;
  filterCategory?: string | null;
  width?: number;
  height?: number;
}

/** Parse hex/rgb color to [r,g,b] */
function parseColor(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  if (c.length === 6) {
    return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
  }
  return [124, 58, 237];
}

/** Category palette — distinct colors per group */
const CAT_PALETTE = [
  '#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4',
  '#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16',
];

/**
 * 3D rotating skill sphere — canvas-based word cloud globe.
 *  - Skills placed on sphere surface via Fibonacci lattice
 *  - Depth-based opacity + scale (far nodes fade & shrink)
 *  - Auto-rotates; pause on hover; drag to spin
 *  - Hover highlights node with glow + tooltip
 *  - Color-coded by category with a distinct palette
 */
export function ConstellationGraph({
  skills,
  brandColor,
  filterCategory = null,
}: ConstellationGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const rotRef = useRef({ x: 0.3, y: 0 });         // current angles
  const velRef = useRef({ x: 0, y: 0.003 });        // auto-rotate velocity
  const dragRef = useRef({ active: false, lx: 0, ly: 0 });
  const hoveredRef = useRef<number>(-1);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; skill: Skill } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 700, h: 420 });

  const [r, g, b] = parseColor(brandColor);

  // Category → color mapping (stable per render)
  const catColors = useMemo(() => {
    const cats = [...new Set(skills.map(s => s.category))];
    const map: Record<string, string> = {};
    cats.forEach((c, i) => { map[c] = CAT_PALETTE[i % CAT_PALETTE.length]; });
    return map;
  }, [skills]);

  const visibleSkills = useMemo(() =>
    filterCategory ? skills.filter(s => s.category === filterCategory) : skills,
    [skills, filterCategory]
  );

  // Fibonacci lattice sphere positions [phi, theta] for each skill
  const spherePoints = useMemo(() => {
    const n = visibleSkills.length;
    return visibleSkills.map((_, i) => {
      const phi = Math.acos(1 - 2 * (i + 0.5) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      return { phi, theta };
    });
  }, [visibleSkills]);

  // Responsive canvas sizing
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        const w = Math.floor(e.contentRect.width);
        const h = Math.max(360, Math.floor(w * 0.55));
        setCanvasSize({ w, h });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Render loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = canvasSize;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, w * dpr, h * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.36;

    const rx = rotRef.current.x;
    const ry = rotRef.current.y;
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const cosY = Math.cos(ry), sinY = Math.sin(ry);

    // Project each skill to 2D
    type Projected = {
      x: number; y: number; z: number;
      skill: Skill; idx: number; color: string; size: number;
    };

    const projected: Projected[] = visibleSkills.map((skill, i) => {
      const { phi, theta } = spherePoints[i];
      // 3D unit sphere point
      let x0 = Math.sin(phi) * Math.cos(theta);
      let y0 = Math.sin(phi) * Math.sin(theta);
      let z0 = Math.cos(phi);

      // Rotate Y-axis
      const x1 = x0 * cosY - z0 * sinY;
      const z1 = x0 * sinY + z0 * cosY;
      // Rotate X-axis
      const y2 = y0 * cosX - z1 * sinX;
      const z2 = y0 * sinX + z1 * cosX;

      const depth = (z2 + 1) / 2; // 0=back, 1=front
      const scale = 0.55 + depth * 0.45;
      const px = cx + x1 * radius * scale;
      const py = cy + y2 * radius * scale;

      const color = catColors[skill.category] || brandColor;
      const size = (3.5 + (skill.proficiency_level / 100) * 5) * scale;

      return { x: px, y: py, z: depth, skill, idx: i, color, size };
    });

    // Sort back-to-front
    projected.sort((a, b) => a.z - b.z);

    // Draw faint sphere wireframe
    const sphereGrad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
    sphereGrad.addColorStop(0, `rgba(${r},${g},${b},0.03)`);
    sphereGrad.addColorStop(1, `rgba(${r},${g},${b},0.0)`);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = sphereGrad;
    ctx.fill();

    // Draw equator ring
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius, radius * 0.08, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${r},${g},${b},0.06)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw meridian ring
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 0.06, radius, Math.PI / 2, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${r},${g},${b},0.04)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    const hovered = hoveredRef.current;

    // Draw nodes
    for (const p of projected) {
      const alpha = 0.2 + p.z * 0.8;
      const isHov = hovered === p.idx;

      // Glow for hovered / bright front nodes
      if (isHov) {
        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + 4, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '30';
        ctx.fill();
        ctx.restore();
      }

      // Node dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, isHov ? p.size * 1.5 : p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.round(alpha * (isHov ? 255 : 200)).toString(16).padStart(2, '0');
      ctx.fill();

      // Label
      const labelAlpha = isHov ? 1 : Math.max(0, p.z - 0.3) * 1.4;
      if (labelAlpha > 0.05) {
        ctx.globalAlpha = labelAlpha;
        ctx.font = `${isHov ? 600 : 400} ${isHov ? 12 : 10}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = isHov ? '#f0ede6' : '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText(
          skill_name_short(p.skill.skill_name),
          p.x,
          p.y + p.size + (isHov ? 16 : 13)
        );
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();

    // Auto-rotate (slow drift when not dragging)
    if (!dragRef.current.active) {
      rotRef.current.y += velRef.current.y;
      rotRef.current.x += velRef.current.x * 0.1;
      // gentle oscillation on X
      velRef.current.x = Math.sin(Date.now() / 8000) * 0.0008;
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [canvasSize, visibleSkills, spherePoints, catColors, brandColor, r, g, b]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  // Hit-test for hover/tooltip
  const getHoveredIdx = useCallback((mx: number, my: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return -1;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const px = (mx - rect.left);
    const py = (my - rect.top);
    const { w, h } = canvasSize;
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) * 0.36;
    const rx = rotRef.current.x, ry = rotRef.current.y;
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const cosY = Math.cos(ry), sinY = Math.sin(ry);

    let best = -1, bestDist = 28;
    visibleSkills.forEach((skill, i) => {
      const { phi, theta } = spherePoints[i];
      let x0 = Math.sin(phi) * Math.cos(theta);
      let y0 = Math.sin(phi) * Math.sin(theta);
      let z0 = Math.cos(phi);
      const x1 = x0 * cosY - z0 * sinY;
      const z1 = x0 * sinY + z0 * cosY;
      const y2 = y0 * cosX - z1 * sinX;
      const z2 = y0 * sinX + z1 * cosX;
      const depth = (z2 + 1) / 2;
      const scale = 0.55 + depth * 0.45;
      const spx = cx + x1 * radius * scale;
      const spy = cy + y2 * radius * scale;
      const dist = Math.hypot(px - spx, py - spy);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    return best;
  }, [canvasSize, visibleSkills, spherePoints]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragRef.current.active) {
      const dx = e.clientX - dragRef.current.lx;
      const dy = e.clientY - dragRef.current.ly;
      rotRef.current.y += dx * 0.005;
      rotRef.current.x += dy * 0.005;
      dragRef.current.lx = e.clientX;
      dragRef.current.ly = e.clientY;
      hoveredRef.current = -1;
      setTooltip(null);
      return;
    }
    const idx = getHoveredIdx(e.clientX, e.clientY);
    hoveredRef.current = idx;
    if (idx >= 0) {
      const rect = canvasRef.current!.getBoundingClientRect();
      setTooltip({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 36, skill: visibleSkills[idx] });
    } else {
      setTooltip(null);
    }
  }, [getHoveredIdx, visibleSkills]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current = { active: true, lx: e.clientX, ly: e.clientY };
    velRef.current = { x: 0, y: 0 };
  }, []);

  const onMouseUp = useCallback(() => {
    dragRef.current.active = false;
    velRef.current = { x: 0, y: 0.003 };
  }, []);

  const onMouseLeave = useCallback(() => {
    dragRef.current.active = false;
    hoveredRef.current = -1;
    setTooltip(null);
    velRef.current = { x: 0, y: 0.003 };
  }, []);

  // Touch support
  const lastTouchRef = useRef({ x: 0, y: 0 });
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    dragRef.current = { active: true, lx: t.clientX, ly: t.clientY };
    lastTouchRef.current = { x: t.clientX, y: t.clientY };
    velRef.current = { x: 0, y: 0 };
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - dragRef.current.lx;
    const dy = t.clientY - dragRef.current.ly;
    rotRef.current.y += dx * 0.005;
    rotRef.current.x += dy * 0.005;
    dragRef.current.lx = t.clientX;
    dragRef.current.ly = t.clientY;
  }, []);
  const onTouchEnd = useCallback(() => {
    dragRef.current.active = false;
    velRef.current = { x: 0, y: 0.003 };
  }, []);

  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

  // Unique category colors for legend
  const catEntries = useMemo(() => {
    const seen = new Set<string>();
    const out: { cat: string; color: string }[] = [];
    visibleSkills.forEach(s => {
      if (!seen.has(s.category)) {
        seen.add(s.category);
        out.push({ cat: s.category, color: catColors[s.category] || brandColor });
      }
    });
    return out;
  }, [visibleSkills, catColors, brandColor]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      {/* Hint */}
      <div style={{
        position: 'absolute', top: 12, right: 14,
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
        color: 'rgba(255,255,255,0.2)', pointerEvents: 'none', letterSpacing: '0.08em',
      }}>
        DRAG TO ROTATE
      </div>

      <canvas
        ref={canvasRef}
        width={canvasSize.w * dpr}
        height={canvasSize.h * dpr}
        style={{ width: '100%', height: canvasSize.h, cursor: dragRef.current.active ? 'grabbing' : 'grab', display: 'block' }}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        aria-label="3D skill sphere — drag to rotate"
        role="img"
      />

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.x,
          top: tooltip.y,
          backgroundColor: '#111',
          border: `1px solid ${brandColor}50`,
          borderRadius: 8,
          padding: '8px 12px',
          pointerEvents: 'none',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: '#f0ede6',
          whiteSpace: 'nowrap',
          boxShadow: `0 0 20px -4px ${brandColor}40`,
          zIndex: 50,
        }}>
          <div style={{ fontWeight: 700, color: brandColor, marginBottom: 2 }}>{tooltip.skill.skill_name}</div>
          <div style={{ color: '#6b7280' }}>{tooltip.skill.category} · {tooltip.skill.proficiency_level}%</div>
        </div>
      )}

      {/* Category legend */}
      {catEntries.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16 }}>
          {catEntries.map(({ cat, color }) => (
            <span key={cat} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 9999,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: color, border: `1px solid ${color}40`,
              backgroundColor: color + '10',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
              {cat}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function skill_name_short(name: string) {
  return name.length > 14 ? name.slice(0, 13) + '…' : name;
}
