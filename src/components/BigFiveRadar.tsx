import { motion } from "framer-motion";

interface Props {
  values: { openness: number; conscientiousness: number; extraversion: number; agreeableness: number; neuroticism: number };
  size?: number;
}

export default function BigFiveRadar({ values, size = 180 }: Props) {
  const labels = ["开放", "尽责", "外向", "亲和", "敏感"];
  const labelsEn = ["O", "C", "E", "A", "N"];
  const vals = [values.openness, values.conscientiousness, values.extraversion, values.agreeableness, values.neuroticism];
  const count = 5;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.35;

  const point = (i: number, v: number) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    return { x: cx + (r * v / 100) * Math.cos(angle), y: cy + (r * v / 100) * Math.sin(angle) };
  };

  const axisPoints = Array.from({ length: count }, (_, i) => point(i, 100));
  const dataPoints = vals.map((v, i) => point(i, v));
  const pathD = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
  const gridLevels = [25, 50, 75, 100];

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Grid */}
      {gridLevels.map((level) => {
        const pts = Array.from({ length: count }, (_, i) => point(i, level));
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
        return <path key={level} d={d} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />;
      })}
      {/* Axes */}
      {axisPoints.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
      ))}
      {/* Data area */}
      <motion.path
        d={pathD}
        fill="rgba(255,20,147,0.15)"
        stroke="#FF1493"
        strokeWidth={1.5}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r={3}
          fill="#FF1493" stroke="black" strokeWidth={1}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }} />
      ))}
      {/* Labels */}
      {axisPoints.map((_p, i) => {
        const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
        const lx = cx + (r + 18) * Math.cos(angle);
        const ly = cy + (r + 18) * Math.sin(angle);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.35)" fontSize={8}>
            {labels[i]} <tspan fill="rgba(255,255,255,0.2)" fontSize={7}>{labelsEn[i]}{vals[i]}</tspan>
          </text>
        );
      })}
    </svg>
  );
}
