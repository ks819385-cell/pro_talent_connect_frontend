/* ═══ Design Tokens ════════════════════════════════════════ */
export const T = {
  labelText:
    "text-[10px] font-semibold uppercase tracking-[0.09em] text-gray-500",
  sectionTitle: "text-sm font-semibold text-white",
};

export const card = "bg-[#111115] border border-white/[0.07] rounded-xl";
export const tH =
  "text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3 text-left";
export const tD = "px-4 py-3 text-sm text-gray-400";
export const tDW = "px-4 py-3 text-sm font-semibold text-gray-100";

/* ═══ Data Meta ════════════════════════════════════════════ */
export const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400";

export const POSITION_COLORS = {
  goalkeeper: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
  },
  defender: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  midfielder: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
  },
  forward: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
  },
  winger: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
  striker: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
  },
};

export const GRADE_META = {
  A: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    label: "Elite",
    bar: "#34D399",
  },
  B: {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    label: "Professional",
    bar: "#60A5FA",
  },
  C: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    label: "Semi-Pro",
    bar: "#FBBF24",
  },
  D: {
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    label: "Amateur",
    bar: "#FB923C",
  },
  E: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    label: "Semi-Amateur",
    bar: "#F87171",
  },
  INCOMPLETE: {
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    label: "Incomplete",
    bar: "#9CA3AF",
  },
  "N/A": {
    color: "text-gray-500",
    bg: "bg-gray-800",
    border: "border-gray-700",
    label: "Unrated",
    bar: "#6B7280",
  },
};

export const posStyle = (pos) =>
  POSITION_COLORS[pos?.toLowerCase()] || {
    bg: "bg-gray-500/10",
    text: "text-gray-400",
    border: "border-gray-500/20",
  };

export const gradeStyle = (g) => GRADE_META[g] || GRADE_META["N/A"];
