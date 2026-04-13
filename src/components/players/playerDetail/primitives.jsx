import { T, card } from "./tokens";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

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
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 max-w-[9.5rem] truncate ${v[variant] || v.gray}`}
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
      {value || "N/A"}
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

/* ─── Chart.js Radar Chart ────────────────────────────────── */
export const RadarChart = ({ axes }) => {
  const labels = axes.map((axis) => axis.label);
  const values = axes.map((axis) => Math.max(0, Math.min(100, axis.value ?? 0)));

  const data = {
    labels,
    datasets: [
      {
        label: "Skill",
        data: values,
        borderColor: "#C4161C",
        backgroundColor: "rgba(196, 22, 28, 0.18)",
        borderWidth: 2,
        pointBackgroundColor: "#C4161C",
        pointBorderColor: "#C4161C",
        pointRadius: 2.5,
        pointHoverRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.formattedValue}%`,
        },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          display: false,
          stepSize: 25,
        },
        angleLines: {
          color: "rgba(255,255,255,0.08)",
        },
        grid: {
          color: "rgba(255,255,255,0.08)",
        },
        pointLabels: {
          color: "rgba(255,255,255,0.55)",
          font: {
            size: 11,
            family: "system-ui",
          },
        },
      },
    },
  };

  return (
    <div className="w-full max-w-xs mx-auto h-[250px]">
      <Radar data={data} options={options} />
    </div>
  );
};
