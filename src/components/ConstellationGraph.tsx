import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Skill {
  id: string;
  skill_name: string;
  proficiency_level: number;
  category: string;
}

interface Node {
  id: string;
  x: number;
  y: number;
  radius: number;
  skill: Skill;
  category: string;
}

interface ConstellationGraphProps {
  skills: Skill[];
  brandColor: string;
  filterCategory?: string | null;
  width?: number;
  height?: number;
}

/**
 * SVG constellation network — skills as glowing dot nodes connected by category lines.
 * Nodes sized by proficiency. Lines drawn via stroke-dashoffset animation.
 * Hover highlights a node + its connections, dims others.
 * Security: all data from typed props, no innerHTML, no eval.
 */
export function ConstellationGraph({
  skills,
  brandColor,
  filterCategory = null,
  width = 700,
  height = 450,
}: ConstellationGraphProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; skill: Skill } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Build nodes with stable positions using seeded layout
  const nodes: Node[] = useMemo(() => {
    const catGroups: Record<string, Skill[]> = {};
    skills.forEach(s => {
      if (!catGroups[s.category]) catGroups[s.category] = [];
      catGroups[s.category].push(s);
    });

    const cats = Object.entries(catGroups);
    const result: Node[] = [];
    const padding = 60;
    const usableW = width - padding * 2;
    const usableH = height - padding * 2;

    cats.forEach(([, catSkills], catIdx) => {
      // Place each category cluster in a different quadrant
      const clusterAngle = (catIdx / cats.length) * Math.PI * 2;
      const clusterR = Math.min(usableW, usableH) * 0.28;
      const clusterCX = usableW / 2 + Math.cos(clusterAngle) * clusterR + padding;
      const clusterCY = usableH / 2 + Math.sin(clusterAngle) * clusterR + padding;

      catSkills.forEach((skill, i) => {
        const nodeAngle = (i / catSkills.length) * Math.PI * 2;
        const nodeR = 55 + (catSkills.length > 3 ? 20 : 0);
        result.push({
          id: skill.id,
          x: clusterCX + Math.cos(nodeAngle) * nodeR,
          y: clusterCY + Math.sin(nodeAngle) * nodeR,
          radius: 4 + (skill.proficiency_level / 100) * 8,
          skill,
          category: skill.category,
        });
      });
    });

    return result;
  }, [skills, width, height]);

  // Build edges within same category
  const edges = useMemo(() => {
    const result: { from: Node; to: Node }[] = [];
    const catMap: Record<string, Node[]> = {};
    nodes.forEach(n => {
      if (!catMap[n.category]) catMap[n.category] = [];
      catMap[n.category].push(n);
    });
    Object.values(catMap).forEach(catNodes => {
      for (let i = 0; i < catNodes.length - 1; i++) {
        result.push({ from: catNodes[i], to: catNodes[i + 1] });
      }
    });
    return result;
  }, [nodes]);

  const visibleNodes = useMemo(() =>
    filterCategory ? nodes.filter(n => n.category === filterCategory) : nodes,
    [nodes, filterCategory]
  );
  const visibleEdges = useMemo(() =>
    filterCategory ? edges.filter(e => e.from.category === filterCategory) : edges,
    [edges, filterCategory]
  );

  const connectedIds = useMemo(() => {
    if (!hoveredId) return new Set<string>();
    const ids = new Set<string>();
    visibleEdges.forEach(({ from, to }) => {
      if (from.id === hoveredId) ids.add(to.id);
      if (to.id === hoveredId) ids.add(from.id);
    });
    return ids;
  }, [hoveredId, visibleEdges]);

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto' }}
        aria-label="Skill constellation graph"
        role="img"
      >
        {/* Edges */}
        {visibleEdges.map(({ from, to }, i) => {
          const len = Math.hypot(to.x - from.x, to.y - from.y);
          const isRelated = hoveredId && (from.id === hoveredId || to.id === hoveredId);
          const dimmed = hoveredId && !isRelated;
          return (
            <motion.line
              key={`e-${i}`}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={brandColor}
              strokeWidth={isRelated ? 1.5 : 0.8}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: dimmed ? 0.04 : isRelated ? 0.7 : 0.18,
              }}
              transition={{ duration: 1.2, delay: i * 0.04, ease: 'easeOut' }}
            />
          );
        })}

        {/* Nodes */}
        {visibleNodes.map((node, i) => {
          const isHovered = hoveredId === node.id;
          const isConnected = connectedIds.has(node.id);
          const dimmed = hoveredId && !isHovered && !isConnected;
          return (
            <motion.g key={node.id}>
              {/* Glow ring */}
              {(isHovered || isConnected) && (
                <motion.circle
                  cx={node.x} cy={node.y}
                  r={node.radius + 8}
                  fill="none"
                  stroke={brandColor}
                  strokeWidth={1}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 0.4, scale: 1 }}
                  style={{ filter: `blur(2px)` }}
                />
              )}
              {/* Node dot */}
              <motion.circle
                cx={node.x} cy={node.y}
                r={node.radius}
                fill={isHovered ? brandColor : isConnected ? brandColor : brandColor}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: dimmed ? 0.15 : isHovered ? 1 : 0.65,
                  scale: isHovered ? 1.4 : 1,
                }}
                transition={{ duration: 0.8, delay: i * 0.03, ease: 'backOut' }}
                onMouseEnter={(e) => {
                  setHoveredId(node.id);
                  const rect = svgRef.current?.getBoundingClientRect();
                  if (rect) {
                    setTooltip({
                      x: node.x / width * rect.width + rect.left,
                      y: node.y / height * rect.height + rect.top,
                      skill: node.skill,
                    });
                  }
                }}
                onMouseLeave={() => { setHoveredId(null); setTooltip(null); }}
                style={{ cursor: 'pointer', filter: isHovered ? `drop-shadow(0 0 6px ${brandColor})` : 'none' }}
              />
              {/* Label */}
              <motion.text
                x={node.x}
                y={node.y + node.radius + 14}
                textAnchor="middle"
                fill={isHovered ? '#f0ede6' : '#6b7280'}
                fontSize={isHovered ? 11 : 9.5}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={isHovered ? 600 : 400}
                initial={{ opacity: 0 }}
                animate={{ opacity: dimmed ? 0.1 : isHovered ? 1 : 0.55 }}
                transition={{ duration: 0.4 }}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {node.skill.skill_name.length > 12
                  ? node.skill.skill_name.slice(0, 11) + '…'
                  : node.skill.skill_name}
              </motion.text>
            </motion.g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 16,
            top: tooltip.y - 40,
            backgroundColor: '#111',
            border: `1px solid ${brandColor}40`,
            borderRadius: 8,
            padding: '8px 12px',
            pointerEvents: 'none',
            zIndex: 1000,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            color: '#f0ede6',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontWeight: 600, color: brandColor }}>{tooltip.skill.skill_name}</div>
          <div style={{ color: '#6b7280', marginTop: 2 }}>
            {tooltip.skill.category} · {tooltip.skill.proficiency_level}%
          </div>
        </div>
      )}
    </div>
  );
}
