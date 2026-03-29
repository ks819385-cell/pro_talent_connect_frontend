import { T, card } from "./tokens";

/** Status badge */
export const Badge = ({ label, variant = "gray" }) => {
  const v = {
    gray: "bg-gray-800/80 text-gray-400   border-gray-700",
    green: "bg-green-500/10 text-green-400  border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    gold: "bg-amber-400/10 text-amber-300  border-amber-400/20",
    red: "bg-red-500/10   text-red-400    border-red-500/20",
    blue: "bg-blue-500/10  text-blue-400   border-blue-500/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${v[variant] || v.gray}`}
    >
      {label}
    </span>
  );
};

/** Labelled stat cell */
export const StatItem = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <p className={T.labelText}>{label}</p>
    <p
      className={`text-sm font-semibold leading-snug ${value ? "text-white" : "text-gray-600 italic"}`}
    >
      {value || "—"}
    </p>
  </div>
);

/** Horizontal attribute bar */
export const RatingBar = ({ label, value, max, color }) => {
  const pct = max
    ? Math.min(Math.round((value / max) * 100), 100)
    : Math.min(Math.round(value), 100);
  const barColor =
    color || (pct >= 70 ? "#34D399" : pct >= 40 ? "#FBBF24" : "#F87171");
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-400">{label}</span>
        <span
          className="text-xs font-bold tabular-nums"
          style={{ color: barColor }}
        >
          {pct}%
        </span>
      </div>
      <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
};

/** Card section with optional header */
export const Section = ({ title, sub, children, className = "" }) => (
  <div className={`${card} overflow-hidden ${className}`}>
    {title && (
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className={T.sectionTitle}>{title}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

/* ─── SVG Radar Chart ─────────────────────────────────────── */
export const RadarChart = ({ axes }) => {
  const SIZE = 200;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 75;
  const LEVELS = 4;
  const n = axes.length;

  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (r, i) => ({
    x: CX + r * Math.cos(angle(i)),
    y: CY + r * Math.sin(angle(i)),
  });

  const gridPolygons = Array.from({ length: LEVELS }, (_, l) => {
    const r = (R * (l + 1)) / LEVELS;
    return Array.from({ length: n }, (_, i) => {
      const p = point(r, i);
      return `${p.x},${p.y}`;
    }).join(" ");
  });

  const spokes = Array.from({ length: n }, (_, i) => {
    const outer = point(R, i);
    return `M${CX},${CY} L${outer.x},${outer.y}`;
  });

  const dataPath = axes
    .map((ax, i) => {
      const r = R * (ax.value / 100);
      const p = point(r, i);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-xs mx-auto">
      {gridPolygons.map((pts, l) => (
        <polygon
          key={l}
          points={pts}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}
      {spokes.map((d, i) => (
        <path key={i} d={d} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      ))}
      <polygon
        points={dataPath}
        fill="rgba(196,22,28,0.18)"
        stroke="#C4161C"
        strokeWidth={1.5}
      />
      {axes.map((ax, i) => {
        const r = R * (ax.value / 100);
        const p = point(r, i);
        return <circle key={i} cx={p.x} cy={p.y} r={3} fill="#C4161C" />;
      })}
      {axes.map((ax, i) => {
        const p = point(R + 18, i);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fill="rgba(255,255,255,0.45)"
          >
            {ax.label}
          </text>
        );
      })}
    </svg>
  );
};
