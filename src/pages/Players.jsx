import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowTopRightOnSquareIcon,
  Squares2X2Icon,
  ChevronRightIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  ListBulletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { api } from "../services/api";
import PlayerDetailPage from "../components/players/PlayerDetailPage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// ─── Constants ────────────────────────────────────────────────────────────────
const GLASS = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const GLASS_HOVER = {
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
};

const POSITIONS = [
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Forward",
  "Winger",
  "Striker",
];

const POSITION_COLORS = {
  goalkeeper: {
    bg: "rgba(234,179,8,0.15)",
    color: "#EAB308",
    border: "rgba(234,179,8,0.3)",
  },
  defender: {
    bg: "rgba(59,130,246,0.15)",
    color: "#60A5FA",
    border: "rgba(59,130,246,0.3)",
  },
  midfielder: {
    bg: "rgba(34,197,94,0.15)",
    color: "#4ADE80",
    border: "rgba(34,197,94,0.3)",
  },
  forward: {
    bg: "rgba(251,146,60,0.15)",
    color: "#FB923C",
    border: "rgba(251,146,60,0.3)",
  },
  winger: {
    bg: "rgba(168,85,247,0.15)",
    color: "#C084FC",
    border: "rgba(168,85,247,0.3)",
  },
  striker: {
    bg: "rgba(251,146,60,0.15)",
    color: "#FB923C",
    border: "rgba(251,146,60,0.3)",
  },
};

const PLAYERS_PER_PAGE = 18;

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getGradeStyle = (grade) => {
  const map = {
    A: { color: "#34D399", label: "Elite" },
    B: { color: "#60A5FA", label: "Professional" },
    C: { color: "#FBBF24", label: "Semi-Pro" },
    D: { color: "#FB923C", label: "Amateur" },
    E: { color: "#F87171", label: "Semi-Amateur" },
    INCOMPLETE: { color: "#9CA3AF", label: "Incomplete" },
    "N/A": { color: "#6B7280", label: "No Rating" },
  };
  return map[grade] || null;
};

const getPositionStyle = (position) =>
  POSITION_COLORS[position?.toLowerCase()] || {
    bg: "rgba(107,114,128,0.15)",
    color: "#9CA3AF",
    border: "rgba(107,114,128,0.3)",
  };

// ─── Sub-components ────────────────────────────────────────────────────────────

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/6 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-left"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.1em",
          }}
        >
          {title.toUpperCase()}
        </span>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
};

const FilterChip = ({ label, onRemove }) => (
  <span
    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-medium"
    style={{
      background: "rgba(196,22,28,0.15)",
      border: "1px solid rgba(196,22,28,0.35)",
      color: "#FCA5A5",
    }}
  >
    {label}
    <button
      onClick={onRemove}
      className="hover:text-white transition-colors"
      style={{ background: "none", border: "none", cursor: "pointer" }}
    >
      <XMarkIcon className="w-3 h-3" />
    </button>
  </span>
);

const ScoreBar = ({ score, grade }) => {
  const style = getGradeStyle(grade);
  const isHigh = score > 75;
  const barColor = isHigh ? "#C4161C" : style?.color || "#6B7280";
  const clampedScore = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.3)",
            fontWeight: 500,
            letterSpacing: "0.04em",
          }}
        >
          SCOUT SCORE
        </span>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: isHigh ? "#FCA5A5" : "rgba(255,255,255,0.65)",
          }}
        >
          {score}
          <span
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.25)",
              fontWeight: 400,
            }}
          >
            /100
          </span>
        </span>
      </div>
      <div
        className="h-1.5 w-full rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.12)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${clampedScore}%`, background: barColor }}
        />
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden animate-pulse" style={GLASS}>
    <div
      style={{
        aspectRatio: "3/4",
        maxHeight: "260px",
        background: "rgba(255,255,255,0.05)",
      }}
    />
    <div className="p-5 space-y-3">
      <div
        className="h-4 rounded w-2/3"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
      <div
        className="h-3 rounded w-1/2"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />
      <div
        className="h-3 rounded w-1/3 mt-4"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />
      <div
        className="h-1 rounded-full mt-4"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
      <div
        className="h-10 rounded-xl mt-4"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />
    </div>
  </div>
);

/* -- Mobile skeleton row --------------------------------------- */
const MobileSkeletonCard = () => (
  <div
    className="flex items-center gap-3 px-4 py-3 rounded-2xl animate-pulse"
    style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    {/* Avatar placeholder */}
    <div
      className="shrink-0 rounded-xl"
      style={{
        width: "68px",
        height: "68px",
        background: "rgba(255,255,255,0.08)",
      }}
    />
    {/* Content placeholder */}
    <div className="flex-1 min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div
          className="h-4 rounded-md w-32"
          style={{ background: "rgba(255,255,255,0.09)" }}
        />
        <div
          className="h-4 w-8 rounded-md"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
      </div>
      <div className="flex items-center gap-2">
        <div
          className="h-3.5 w-10 rounded"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />
        <div
          className="h-3.5 w-24 rounded"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div
          className="h-3 w-20 rounded"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
        <div
          className="h-2 w-16 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
      </div>
    </div>
    {/* Chevron placeholder */}
    <div
      className="w-4 h-4 rounded shrink-0"
      style={{ background: "rgba(255,255,255,0.05)" }}
    />
  </div>
);

/* -- Mobile Player Card ---------------------------------------- */
/*
  UX Laws applied:
  - Fitts's Law: entire row tappable, min ~88px touch height
  - Miller's Law: 3 lines of info max, short position codes
  - Serial Position: name (most important) in top-left anchor
  - Von Restorff: grade badge stands out with brand color
  - Gestalt Proximity: related info grouped tightly in 3 rows
  - Zeigarnik Effect: score bar implies incompleteness and drives tap
  - Aesthetic-Usability: consistent spacing, clear type hierarchy
*/
const POS_CODES = {
  goalkeeper: "GK",
  defender: "DEF",
  midfielder: "MID",
  forward: "FWD",
  winger: "WNG",
  striker: "ST",
};

const MobilePlayerCard = ({ player, onViewProfile }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [pressed, setPressed] = useState(false);
  const currentClub =
    player.clubsPlayed?.[player.clubsPlayed.length - 1]?.clubName;
  const posStyle = getPositionStyle(player.playingPosition);
  const gradeStyle = player.scoutReport?.grade
    ? getGradeStyle(player.scoutReport.grade)
    : null;
  const score = player.scoutReport?.totalScore;
  const posCode =
    POS_CODES[player.playingPosition?.toLowerCase()] ||
    player.playingPosition?.slice(0, 3).toUpperCase() ||
    "N/A";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View profile of ${player.name}`}
      onClick={() => onViewProfile(player)}
      onKeyDown={(e) => e.key === "Enter" && onViewProfile(player)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer select-none"
      style={{
        background: pressed
          ? "rgba(255,255,255,0.08)"
          : "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        transform: pressed ? "scale(0.985)" : "scale(1)",
        transition: "transform 0.1s ease, background 0.1s ease",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* -- Avatar (68x68, rounded-xl) -- */}
      <div
        className="relative shrink-0 rounded-xl overflow-hidden"
        style={{
          width: "68px",
          height: "68px",
          background: "rgba(255,255,255,0.08)",
        }}
      >
        {!imgLoaded && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ background: "rgba(255,255,255,0.09)" }}
          />
        )}
        <img
          src={player.profileImage || DEFAULT_IMAGE}
          alt={player.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className="w-full h-full object-cover object-top"
          style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 0.25s" }}
        />
        {/* Bottom scrim */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)",
          }}
        />
        {/* Age pill - bottom center */}
        {player.age && (
          <span
            className="absolute bottom-1 left-0 right-0 text-center font-bold text-white"
            style={{ fontSize: "9px", letterSpacing: "0.02em" }}
          >
            {player.age}y
          </span>
        )}
      </div>

      {/* -- Content - 3 tight rows -- */}
      <div className="flex-1 min-w-0">
        {/* Row 1 : Name  +  Grade badge (Von Restorff) */}
        <div className="flex items-center justify-between gap-2">
          <h3
            className="text-white font-semibold truncate"
            style={{ fontSize: "15px", lineHeight: 1.3 }}
          >
            {player.name}
          </h3>
          {gradeStyle && (
            <span
              className="shrink-0 font-bold rounded-md px-1.5 py-0.5"
              style={{
                fontSize: "10px",
                color: gradeStyle.color,
                background: `${gradeStyle.color}22`,
                border: `1px solid ${gradeStyle.color}44`,
                lineHeight: 1.4,
              }}
            >
              {player.scoutReport.grade}
            </span>
          )}
        </div>

        {/* Row 2 : Position code  +  Club */}
        <div className="flex items-center gap-2 mt-1">
          <span
            className="shrink-0 font-bold rounded px-1.5 py-0.5"
            style={{
              fontSize: "10px",
              color: posStyle.color,
              background: posStyle.bg,
              letterSpacing: "0.05em",
              lineHeight: 1.4,
            }}
          >
            {posCode}
          </span>
          <span
            className="text-[12px] truncate"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            {currentClub || "Free Agent"}
          </span>
        </div>

        {/* Row 3 : City  +  Score bar + number (Zeigarnik) */}
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <span
            className="text-[11px] truncate"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            {[player.state, player.nationality].filter(Boolean).join(", ") || ""}
          </span>
          {score > 0 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="rounded-full overflow-hidden"
                style={{
                  width: "48px",
                  height: "3px",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${score}%`,
                    background: gradeStyle?.color || "#C4161C",
                  }}
                />
              </div>
              <span
                className="font-bold"
                style={{
                  fontSize: "11px",
                  color: gradeStyle?.color || "rgba(255,255,255,0.5)",
                }}
              >
                {score}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* -- Chevron affordance -- */}
      <ChevronRightIcon
        className="w-4 h-4 shrink-0"
        style={{ color: "rgba(255,255,255,0.2)" }}
      />
    </div>
  );
};

/* -- Mobile Filter Drawer (bottom sheet) ---------------------- */
/* Hick's Law: filters grouped, progressive disclosure           */
const MobileFilterDrawer = ({
  open,
  onClose,
  filters,
  set,
  activeCount,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [posOpen, setPosOpen] = useState(true);
  const [ageOpen, setAgeOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);

  const localSet = (key, val) =>
    setLocalFilters((prev) => ({ ...prev, [key]: val }));

  const handleApply = () => {
    Object.entries(localFilters).forEach(([k, v]) => set(k, v));
    onClose();
  };

  const handleClear = () => {
    const empty = {
      position: "",
      ageMin: "",
      ageMax: "",
      heightMin: "",
      heightMax: "",
      state: "",
      searchQuery: filters.searchQuery,
    };
    setLocalFilters(empty);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
        style={{
          background: "#161616",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none",
          paddingBottom: "env(safe-area-inset-bottom)",
          maxHeight: "82vh",
          display: "flex",
          flexDirection: "column",
          animation: "slideUpSheet 0.28s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.2)" }}
          />
        </div>

        {/* Sheet header */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="text-white font-semibold text-base">Filters</span>
          <div className="flex items-center gap-4">
            <button
              onClick={handleClear}
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.4)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable filter sections */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {/* Position */}
          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <button
              className="w-full flex items-center justify-between py-4"
              style={{ background: "none", border: "none", cursor: "pointer" }}
              onClick={() => setPosOpen((o) => !o)}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                Position
              </span>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform duration-200 ${posOpen ? "rotate-180" : ""}`}
                style={{ color: "rgba(255,255,255,0.3)" }}
              />
            </button>
            {posOpen && (
              <div className="pb-4 flex flex-wrap gap-2">
                {["", ...POSITIONS].map((p) => (
                  <button
                    key={p || "all"}
                    onClick={() => localSet("position", p)}
                    className="px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-150"
                    style={{
                      background:
                        localFilters.position === p
                          ? "#C4161C"
                          : "rgba(255,255,255,0.06)",
                      color:
                        localFilters.position === p
                          ? "#fff"
                          : "rgba(255,255,255,0.55)",
                      border:
                        localFilters.position === p
                          ? "none"
                          : "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      minHeight: "44px",
                    }}
                  >
                    {p || "All"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Age range */}
          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <button
              className="w-full flex items-center justify-between py-4"
              style={{ background: "none", border: "none", cursor: "pointer" }}
              onClick={() => setAgeOpen((o) => !o)}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                Age Range
              </span>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform duration-200 ${ageOpen ? "rotate-180" : ""}`}
                style={{ color: "rgba(255,255,255,0.3)" }}
              />
            </button>
            {ageOpen && (
              <div className="pb-4 flex gap-3">
                {[
                  ["Min age", "ageMin"],
                  ["Max age", "ageMax"],
                ].map(([ph, key]) => (
                  <input
                    key={key}
                    type="number"
                    placeholder={ph}
                    value={localFilters[key]}
                    onChange={(e) => localSet(key, e.target.value)}
                    style={{
                      flex: 1,
                      height: "48px",
                      padding: "0 14px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "14px",
                      color: "#fff",
                      outline: "none",
                    }}
                    className="placeholder:text-white/25"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <button
              className="w-full flex items-center justify-between py-4"
              style={{ background: "none", border: "none", cursor: "pointer" }}
              onClick={() => setLocOpen((o) => !o)}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                Location
              </span>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform duration-200 ${locOpen ? "rotate-180" : ""}`}
                style={{ color: "rgba(255,255,255,0.3)" }}
              />
            </button>
            {locOpen && (
              <div className="pb-4">
                <input
                  type="text"
                  placeholder="e.g. Kerala"
                  value={localFilters.state}
                  onChange={(e) => localSet("state", e.target.value)}
                  style={{
                    width: "100%",
                    height: "48px",
                    padding: "0 14px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "14px",
                    color: "#fff",
                    outline: "none",
                  }}
                  className="placeholder:text-white/25"
                />
              </div>
            )}
          </div>
        </div>

        {/* Apply CTA - Fitts's Law: full-width, 56px */}
        <div
          className="px-5 pt-3 pb-4 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={handleApply}
            className="w-full flex items-center justify-center text-white font-bold rounded-2xl transition-opacity duration-150 active:opacity-80"
            style={{
              height: "56px",
              fontSize: "16px",
              background: "#C4161C",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(196,22,28,0.4)",
              letterSpacing: "0.01em",
            }}
          >
            Apply Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
        </div>
      </div>
    </>
  );
};

const NoResults = ({ onReset }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <MagnifyingGlassIcon
        className="w-7 h-7"
        style={{ color: "rgba(255,255,255,0.2)" }}
      />
    </div>
    <h3
      style={{
        fontSize: "20px",
        fontWeight: 600,
        color: "rgba(255,255,255,0.8)",
        fontFamily: "'Poppins', sans-serif",
      }}
      className="mb-2"
    >
      No players found
    </h3>
    <p
      style={{
        fontSize: "14px",
        color: "rgba(255,255,255,0.3)",
        lineHeight: 1.6,
      }}
      className="mb-6 max-w-xs"
    >
      Try adjusting your filters or search query to find matching players.
    </p>
    <button
      onClick={onReset}
      style={{
        fontSize: "14px",
        fontWeight: 600,
        color: "#FCA5A5",
        background: "none",
        border: "none",
        cursor: "pointer",
      }}
    >
      Reset all filters
    </button>
  </div>
);

// ─── Player Card (Grid) ───────────────────────────────────────────────────────
const PlayerCardGrid = ({ player, onViewProfile }) => {
  const [hovered, setHovered] = useState(false);
  const currentClub =
    player.clubsPlayed?.[player.clubsPlayed.length - 1]?.clubName;
  const posStyle = getPositionStyle(player.playingPosition);
  const gradeStyle = player.scoutReport?.grade
    ? getGradeStyle(player.scoutReport.grade)
    : null;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
      style={{
        ...GLASS,
        ...(hovered ? GLASS_HOVER : {}),
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image — 3:4 ratio */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "3/4", maxHeight: "260px" }}
      >
        <img
          src={player.profileImage || DEFAULT_IMAGE}
          alt={player.name}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? "scale(1.04)" : "scale(1)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        {/* Position badge top-left */}
        <div className="absolute top-3 left-3">
          <span
            className="px-2.5 py-1 rounded-md font-semibold"
            style={{
              background: posStyle.bg,
              color: posStyle.color,
              border: `1px solid ${posStyle.border}`,
              backdropFilter: "blur(8px)",
              fontSize: "11px",
            }}
          >
            {player.playingPosition || "N/A"}
          </span>
        </div>
        {/* Grade badge top-right */}
        {gradeStyle && (
          <div className="absolute top-3 right-3">
            <span
              className="px-2 py-1 rounded-md font-bold"
              style={{
                background: "rgba(0,0,0,0.6)",
                color: gradeStyle.color,
                backdropFilter: "blur(8px)",
                fontSize: "11px",
              }}
            >
              {player.scoutReport.grade}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <div>
          <h3
            className="text-white truncate mb-1"
            style={{
              fontSize: "18px",
              fontWeight: 600,
              lineHeight: 1.3,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {player.name}
          </h3>
          {currentClub && (
            <p
              className="truncate"
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.5,
              }}
            >
              {currentClub}
            </p>
          )}
          {player.state && (
            <p
              className="truncate"
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.28)",
                marginTop: "2px",
              }}
            >
              {player.state}
              {player.nationality ? `, ${player.nationality}` : ""}
            </p>
          )}
        </div>

        {player.scoutReport?.totalScore > 0 && (
          <ScoreBar
            score={player.scoutReport.totalScore}
            grade={player.scoutReport.grade}
          />
        )}

        <div className="flex-1" />

        <div>
          {/* Icon row */}
          <div className="flex items-center gap-2 mb-3">
            {player.email && (
              <a
                href={`mailto:${player.email}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                style={{
                  width: "32px",
                  height: "32px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                title={`Email ${player.name}`}
              >
                <EnvelopeIcon
                  className="w-3.5 h-3.5"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                />
              </a>
            )}
            {player.mobileNumber && (
              <a
                href={`tel:${player.mobileNumber}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                style={{
                  width: "32px",
                  height: "32px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                title={`Call ${player.name}`}
              >
                <PhoneIcon
                  className="w-3.5 h-3.5"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                />
              </a>
            )}
            {player.transferMarketLink && (
              <a
                href={player.transferMarketLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                style={{
                  width: "32px",
                  height: "32px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                title="View on Transfer Market"
              >
                <ArrowTopRightOnSquareIcon
                  className="w-3.5 h-3.5"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                />
              </a>
            )}
          </div>
          {/* CTA */}
          <button
            onClick={() => onViewProfile(player)}
            className="w-full font-semibold text-white rounded-xl transition-all duration-200"
            style={{
              height: "48px",
              fontSize: "14px",
              fontWeight: 600,
              background: "#C4161C",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#a81219";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#C4161C";
            }}
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Player Card (List) ───────────────────────────────────────────────────────
const PlayerCardList = ({ player, onViewProfile }) => {
  const [hovered, setHovered] = useState(false);
  const currentClub =
    player.clubsPlayed?.[player.clubsPlayed.length - 1]?.clubName;
  const posStyle = getPositionStyle(player.playingPosition);
  const gradeStyle = player.scoutReport?.grade
    ? getGradeStyle(player.scoutReport.grade)
    : null;

  return (
    <div
      className="flex items-center gap-4 rounded-2xl px-5 transition-all duration-200"
      style={{
        ...GLASS,
        ...(hovered
          ? {
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.08)",
            }
          : {}),
        height: "72px",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-xl overflow-hidden shrink-0"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <img
          src={player.profileImage || DEFAULT_IMAGE}
          alt={player.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Name + position */}
      <div className="min-w-0 w-40 shrink-0">
        <p
          className="text-white truncate"
          style={{
            fontSize: "15px",
            fontWeight: 600,
            lineHeight: 1.3,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          {player.name}
        </p>
        <span
          className="inline-block mt-0.5 px-2 py-0.5 rounded"
          style={{
            background: posStyle.bg,
            color: posStyle.color,
            fontSize: "11px",
            fontWeight: 500,
          }}
        >
          {player.playingPosition || "N/A"}
        </span>
      </div>

      {/* Club */}
      <div className="min-w-0 w-36 shrink-0 hidden lg:block">
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Club</p>
        <p
          className="truncate"
          style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}
        >
          {currentClub || "N/A"}
        </p>
      </div>

      {/* Location */}
      <div className="min-w-0 w-32 shrink-0 hidden xl:block">
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
          Location
        </p>
        <p
          className="truncate"
          style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}
        >
          {player.state
            ? `${player.state}${player.nationality ? `, ${player.nationality}` : ""}`
            : "N/A"}
        </p>
      </div>

      {/* Age */}
      <div className="w-12 shrink-0 hidden md:block">
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Age</p>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {player.age || "N/A"}
        </p>
      </div>

      {/* Score */}
      {gradeStyle && (
        <div className="w-20 shrink-0 hidden md:block">
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
            Score
          </p>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: gradeStyle.color,
            }}
          >
            {player.scoutReport?.totalScore ?? "N/A"}
            <span
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.25)",
                fontWeight: 400,
              }}
            >
              {" "}
              {player.scoutReport?.grade}
            </span>
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        {player.email && (
          <a
            href={`mailto:${player.email}`}
            className="items-center justify-center rounded-lg hidden sm:flex transition-colors hover:bg-white/10"
            style={{
              width: "34px",
              height: "34px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            title={`Email ${player.name}`}
          >
            <EnvelopeIcon
              className="w-3.5 h-3.5"
              style={{ color: "rgba(255,255,255,0.35)" }}
            />
          </a>
        )}
        {player.mobileNumber && (
          <a
            href={`tel:${player.mobileNumber}`}
            className="items-center justify-center rounded-lg hidden sm:flex transition-colors hover:bg-white/10"
            style={{
              width: "34px",
              height: "34px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            title={`Call ${player.name}`}
          >
            <PhoneIcon
              className="w-3.5 h-3.5"
              style={{ color: "rgba(255,255,255,0.35)" }}
            />
          </a>
        )}
        <button
          onClick={() => onViewProfile(player)}
          className="font-semibold text-white rounded-xl transition-all duration-200"
          style={{
            height: "36px",
            padding: "0 16px",
            fontSize: "13px",
            fontWeight: 600,
            background: "#C4161C",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#a81219";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#C4161C";
          }}
        >
          View Profile
        </button>
      </div>
    </div>
  );
};
const Players = () => {
  const location = useLocation();
  const featuredRouteHandledRef = useRef(false);
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const mobileSearchRef = useRef(null);

  const [filters, setFilters] = useState({
    position: "",
    ageMin: "",
    ageMax: "",
    heightMin: "",
    heightMax: "",
    state: "",
    searchQuery: "",
  });

  const fetchPlayers = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getPlayers({ limit: 100, signal });
      const playersList = response.data.players || response.data || [];
      if (!signal.aborted) {
        setPlayers(playersList);
        setFilteredPlayers(playersList);
      }
    } catch (err) {
      if (!signal.aborted) {
        console.error("Error fetching players:", err);
        setError("Failed to load players. Please try again.");
        setPlayers([]);
        setFilteredPlayers([]);
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchPlayers(ac.signal);
    return () => ac.abort();
  }, [fetchPlayers]);

  const applyFilters = useCallback(() => {
    let result = [...players];
    const q = filters.searchQuery.toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.playingPosition?.toLowerCase().includes(q) ||
          p.state?.toLowerCase().includes(q) ||
          p.nationality?.toLowerCase().includes(q),
      );
    }
    if (filters.position) {
      // Normalise both sides to a common root so "MIDFIELD" matches
      // the "Midfielder" filter option, "FORWARD" matches "Forward", etc.
      const normalisePos = (str = "") =>
        str.toLowerCase().replace(/keeper$/, "").replace(/er$/, "").replace(/or$/, "").trim();
      const filterRoot = normalisePos(filters.position);
      result = result.filter((p) =>
        normalisePos(p.playingPosition).includes(filterRoot),
      );
    }
    if (filters.ageMin)
      result = result.filter((p) => p.age >= parseInt(filters.ageMin));
    if (filters.ageMax)
      result = result.filter((p) => p.age <= parseInt(filters.ageMax));
    if (filters.heightMin)
      result = result.filter((p) => p.height >= parseInt(filters.heightMin));
    if (filters.heightMax)
      result = result.filter((p) => p.height <= parseInt(filters.heightMax));
    if (filters.state)
      result = result.filter((p) =>
        p.state?.toLowerCase().includes(filters.state.toLowerCase()),
      );
    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "score")
        return (
          (b.scoutReport?.totalScore || 0) - (a.scoutReport?.totalScore || 0)
        );
      if (sortBy === "age") return (a.age || 0) - (b.age || 0);
      if (sortBy === "position")
        return (a.playingPosition || "").localeCompare(b.playingPosition || "");
      return 0;
    });
    setCurrentPage(1);
    setFilteredPlayers(result);
  }, [filters, players, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const clearFilters = () =>
    setFilters({
      position: "",
      ageMin: "",
      ageMax: "",
      heightMin: "",
      heightMax: "",
      state: "",
      searchQuery: "",
    });

  const set = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));

  const handleViewProfile = useCallback((player) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const routeState = location.state;
    if (!routeState || featuredRouteHandledRef.current) return;

    const requestedId = routeState.openPlayerId;
    const requestedPlayer = routeState.openPlayer;

    if (!requestedId && !requestedPlayer) return;

    const resolvedPlayer = requestedId
      ? players.find((p) => p._id === requestedId) || requestedPlayer
      : requestedPlayer;

    if (!resolvedPlayer) return;

    featuredRouteHandledRef.current = true;
    handleViewProfile(resolvedPlayer);
  }, [location.state, players, handleViewProfile]);

  const activeChips = [
    filters.position && {
      key: "position",
      label: `Position: ${filters.position}`,
    },
    (filters.ageMin || filters.ageMax) && {
      key: "age",
      label: `Age: ${filters.ageMin || "any"}-${filters.ageMax || "any"}`,
    },
    filters.state && { key: "state", label: `State: ${filters.state}` },
    (filters.heightMin || filters.heightMax) && {
      key: "height",
      label: `Height: ${filters.heightMin || "any"}-${filters.heightMax || "any"} cm`,
    },
  ].filter(Boolean);

  const removeChip = (key) => {
    if (key === "age") {
      set("ageMin", "");
      set("ageMax", "");
    } else if (key === "height") {
      set("heightMin", "");
      set("heightMax", "");
    } else set(key, "");
  };

  const totalPages = Math.ceil(filteredPlayers.length / PLAYERS_PER_PAGE);
  const pagedPlayers = filteredPlayers.slice(
    (currentPage - 1) * PLAYERS_PER_PAGE,
    currentPage * PLAYERS_PER_PAGE,
  );

  const inputStyle = {
    width: "100%",
    height: "44px",
    padding: "0 12px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#fff",
    outline: "none",
  };

  if (showPlayerModal && selectedPlayer) {
    return (
      <PlayerDetailPage
        player={selectedPlayer}
        onClose={() => {
          setShowPlayerModal(false);
          setSelectedPlayer(null);
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{
        background:
          "linear-gradient(160deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0b 100%)",
      }}
    >
      {/* Ambient glow — 30% dimmer than before */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-160 h-95 rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(196,22,28,0.22) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Header ── */}
      {/* --------------- MOBILE LAYOUT (< md) --------------- */}
      <div className="md:hidden flex flex-col" style={{ minHeight: "100dvh" }}>
        {/* Sticky mobile top bar */}
        <div
          className="sticky z-30 shrink-0"
          style={{
            top: 0,
            background: "rgba(10,10,15,0.92)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            paddingTop: "calc(64px + env(safe-area-inset-top))",
          }}
        >
          {/* Title + controls row */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div>
              <h1
                className="text-white font-bold leading-tight"
                style={{ fontSize: "22px" }}
              >
                Player <span style={{ color: "#C4161C" }}>Database</span>
              </h1>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.32)",
                  marginTop: "2px",
                }}
              >
                {loading
                  ? "Loading\u2026"
                  : `${filteredPlayers.length} verified player${filteredPlayers.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger
                  size="sm"
                  className="h-9 min-w-[120px] text-xs"
                  style={{ borderRadius: "10px" }}
                >
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="position">Position</SelectItem>
                  <SelectItem value="age">Age</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="relative flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95"
                style={{
                  width: "42px",
                  height: "38px",
                  background:
                    activeChips.length > 0
                      ? "rgba(196,22,28,0.2)"
                      : "rgba(255,255,255,0.06)",
                  border:
                    activeChips.length > 0
                      ? "1px solid rgba(196,22,28,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer",
                }}
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5 text-white" />
                {activeChips.length > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-white font-bold"
                    style={{ fontSize: "9px", background: "#C4161C" }}
                  >
                    {activeChips.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Sticky search bar */}
          <div className="px-4 pb-3">
            <div className="relative">
              <MagnifyingGlassIcon
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                style={{ color: "rgba(255,255,255,0.3)" }}
              />
              <input
                ref={mobileSearchRef}
                type="text"
                placeholder="Search name, position, city\u2026"
                value={filters.searchQuery}
                onChange={(e) => set("searchQuery", e.target.value)}
                style={{
                  width: "100%",
                  height: "48px",
                  paddingLeft: "40px",
                  paddingRight: filters.searchQuery ? "42px" : "14px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "14px",
                  fontSize: "14px",
                  color: "#fff",
                  outline: "none",
                }}
                className="placeholder:text-white/25 transition-all"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => set("searchQuery", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full active:bg-white/10 transition-colors"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <XMarkIcon
                    className="w-4 h-4"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  />
                </button>
              )}
            </div>
            {activeChips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activeChips.map((chip) => (
                  <FilterChip
                    key={chip.key}
                    label={chip.label}
                    onRemove={() => removeChip(chip.key)}
                  />
                ))}
                <button
                  onClick={clearFilters}
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.3)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile player list */}
        <div
          className="flex-1 px-4 pt-3 pb-24 space-y-3"
          style={{ overscrollBehavior: "contain" }}
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <MobileSkeletonCard key={i} />
            ))
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>
                {error}
              </p>
              <button
                onClick={() => {
                  const ac = new AbortController();
                  fetchPlayers(ac.signal);
                }}
                className="mt-4"
                style={{
                  fontSize: "14px",
                  color: "#FCA5A5",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Try again
              </button>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <NoResults onReset={clearFilters} />
          ) : (
            <>
              {pagedPlayers.map((player) => (
                <MobilePlayerCard
                  key={player._id}
                  player={player}
                  onViewProfile={handleViewProfile}
                />
              ))}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2 pb-2">
                  <button
                    onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0 }); }}
                    disabled={currentPage === 1}
                    style={{
                      height: "40px", padding: "0 14px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "10px", fontSize: "13px",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      color: currentPage === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                    }}
                  >
                    Prev
                  </button>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0 }); }}
                    disabled={currentPage === totalPages}
                    style={{
                      height: "40px", padding: "0 14px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "10px", fontSize: "13px",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      color: currentPage === totalPages ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Filter Drawer */}
        <MobileFilterDrawer
          key={filterDrawerOpen ? "open" : "closed"}
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          filters={filters}
          set={set}
          activeCount={activeChips.length}
        />
      </div>

      {/* --------------- DESKTOP LAYOUT (= md) --------------- */}
      <div className="hidden md:block">
        <div className="relative pt-32 pb-8 px-4 sm:px-6">
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div className="flex flex-col lg:flex-row lg:items-end gap-6">
              <div className="flex-1">
                <p
                  className="uppercase tracking-widest mb-2"
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.28)",
                    letterSpacing: "0.16em",
                  }}
                >
                  Pro Talent Connect
                </p>
                <h1
                  className="text-white"
                  style={{
                    fontSize: "clamp(36px, 5vw, 48px)",
                    fontWeight: 600,
                    lineHeight: 1.1,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Player <span style={{ color: "#C4161C" }}>Database</span>
                </h1>
                <p
                  style={{
                    fontSize: "15px",
                    color: "rgba(255,255,255,0.32)",
                    marginTop: "8px",
                    lineHeight: 1.5,
                  }}
                >
                  {loading
                    ? "Loading players..."
                    : `${filteredPlayers.length} verified player${filteredPlayers.length !== 1 ? "s" : ""}`}
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search — Fitts's Law: 48px height */}
                <div
                  className="relative"
                  style={{ minWidth: "260px", flex: "1 1 260px" }}
                >
                  <MagnifyingGlassIcon
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                    style={{ color: "rgba(255,255,255,0.28)" }}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, position, city..."
                    value={filters.searchQuery}
                    onChange={(e) => set("searchQuery", e.target.value)}
                    style={{
                      width: "100%",
                      height: "48px",
                      paddingLeft: "48px",
                      paddingRight: "16px",
                      ...GLASS,
                      borderRadius: "14px",
                      fontSize: "14px",
                      color: "#fff",
                      outline: "none",
                    }}
                    className="placeholder:text-white/25 focus:border-white/20 transition-all"
                  />
                </div>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger
                    size="lg"
                    className="text-sm"
                    style={{
                      ...GLASS,
                      borderRadius: "14px",
                      minWidth: "140px",
                    }}
                  >
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort: Name</SelectItem>
                    <SelectItem value="score">Sort: Score</SelectItem>
                    <SelectItem value="position">Sort: Position</SelectItem>
                    <SelectItem value="age">Sort: Age</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div
                  className="flex items-center p-1 gap-1 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {[
                    { mode: "grid", Icon: Squares2X2Icon },
                    { mode: "list", Icon: ListBulletIcon },
                  ].map(({ mode, Icon }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className="flex items-center justify-center rounded-lg transition-all duration-200"
                      style={{
                        width: "36px",
                        height: "36px",
                        background:
                          viewMode === mode
                            ? "rgba(255,255,255,0.1)"
                            : "transparent",
                        border:
                          viewMode === mode
                            ? "1px solid rgba(255,255,255,0.12)"
                            : "1px solid transparent",
                        cursor: "pointer",
                      }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{
                          color:
                            viewMode === mode
                              ? "#fff"
                              : "rgba(255,255,255,0.3)",
                        }}
                      />
                    </button>
                  ))}
                </div>

                {/* Mobile filter toggle */}
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  className="lg:hidden flex items-center gap-2 rounded-xl px-4 transition-all duration-200"
                  style={{
                    height: "48px",
                    ...GLASS,
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.55)",
                    cursor: "pointer",
                  }}
                >
                  Filters
                  {activeChips.length > 0 && (
                    <span
                      className="flex items-center justify-center w-5 h-5 rounded-full"
                      style={{
                        background: "#C4161C",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {activeChips.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-5">
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.28)",
                    fontWeight: 500,
                  }}
                >
                  Active:
                </span>
                {activeChips.map((chip) => (
                  <FilterChip
                    key={chip.key}
                    label={chip.label}
                    onRemove={() => removeChip(chip.key)}
                  />
                ))}
                <button
                  onClick={clearFilters}
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.28)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Reset all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto 32px",
            padding: "0 24px",
          }}
        >
          <div
            style={{ height: "1px", background: "rgba(255,255,255,0.05)" }}
          />
        </div>

        {/* ── Main Content ── */}
        <div className="relative px-4 sm:px-6 pb-24">
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div className="flex gap-8">
              {/* ── Filter Sidebar ── */}
              <aside
                className={`${showFilters ? "block" : "hidden"} lg:block shrink-0`}
                style={{ width: "232px" }}
              >
                <div
                  className="lg:sticky"
                  style={{
                    top: "96px",
                    ...GLASS,
                    borderRadius: "20px",
                    padding: "0 20px",
                    maxHeight: "calc(100vh - 120px)",
                    overflowY: "auto",
                  }}
                >
                  <div className="flex items-center justify-between py-5">
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.8)",
                      }}
                    >
                      Filters
                    </span>
                    {activeChips.length > 0 && (
                      <button
                        onClick={clearFilters}
                        style={{
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.3)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Reset all
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      height: "1px",
                      background: "rgba(255,255,255,0.05)",
                    }}
                  />

                  <FilterSection title="Position">
                    <Select
                      value={filters.position || "all"}
                      onValueChange={(value) =>
                        set("position", value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger
                        size="md"
                        style={{
                          ...inputStyle,
                          paddingRight: "36px",
                          color: filters.position
                            ? "#fff"
                            : "rgba(255,255,255,0.3)",
                        }}
                      >
                        <SelectValue placeholder="All Positions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Positions</SelectItem>
                        {POSITIONS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FilterSection>

                  <FilterSection title="Age Range">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.ageMin}
                        onChange={(e) => set("ageMin", e.target.value)}
                        style={{ ...inputStyle, width: "50%" }}
                        className="placeholder:text-white/20"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.ageMax}
                        onChange={(e) => set("ageMax", e.target.value)}
                        style={{ ...inputStyle, width: "50%" }}
                        className="placeholder:text-white/20"
                      />
                    </div>
                  </FilterSection>

                  <FilterSection title="Location">
                    <input
                      type="text"
                      placeholder="e.g. Kerala"
                      value={filters.state}
                      onChange={(e) => set("state", e.target.value)}
                      style={inputStyle}
                      className="placeholder:text-white/20"
                    />
                  </FilterSection>

                  {/* Advanced */}
                  <button
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="w-full flex items-center justify-between py-4"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.3)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      ADVANCED
                    </span>
                    <ChevronDownIcon
                      className={`w-3.5 h-3.5 text-white/25 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showAdvanced && (
                    <div className="pb-5">
                      <p
                        style={{
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.25)",
                          marginBottom: "10px",
                        }}
                      >
                        Height (cm)
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.heightMin}
                          onChange={(e) => set("heightMin", e.target.value)}
                          style={{ ...inputStyle, width: "50%" }}
                          className="placeholder:text-white/20"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.heightMax}
                          onChange={(e) => set("heightMax", e.target.value)}
                          style={{ ...inputStyle, width: "50%" }}
                          className="placeholder:text-white/20"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </aside>

              {/* ── Player Grid / List ── */}
              <main className="flex-1 min-w-0">
                {loading ? (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                        : "space-y-3"
                    }
                  >
                    {Array.from({ length: 6 }).map((_, i) =>
                      viewMode === "grid" ? (
                        <SkeletonCard key={i} />
                      ) : (
                        <div
                          key={i}
                          className="rounded-2xl animate-pulse"
                          style={{ height: "72px", ...GLASS }}
                        />
                      ),
                    )}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <p
                      style={{
                        fontSize: "15px",
                        color: "rgba(255,255,255,0.35)",
                      }}
                    >
                      {error}
                    </p>
                    <button
                      onClick={() => {
                        const ac = new AbortController();
                        fetchPlayers(ac.signal);
                      }}
                      className="mt-4"
                      style={{
                        fontSize: "14px",
                        color: "#FCA5A5",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Try again
                    </button>
                  </div>
                ) : filteredPlayers.length === 0 ? (
                  <NoResults onReset={clearFilters} />
                ) : (
                  <>
                    {viewMode === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {pagedPlayers.map((player) => (
                          <PlayerCardGrid
                            key={player._id}
                            player={player}
                            onViewProfile={handleViewProfile}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pagedPlayers.map((player) => (
                          <PlayerCardList
                            key={player._id}
                            player={player}
                            onViewProfile={handleViewProfile}
                          />
                        ))}
                      </div>
                    )}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 mt-10">
                        <button
                          onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0 }); }}
                          disabled={currentPage === 1}
                          style={{
                            height: "44px", padding: "0 20px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "12px", fontSize: "14px",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            color: currentPage === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                          }}
                        >
                          Previous
                        </button>
                        <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0 }); }}
                          disabled={currentPage === totalPages}
                          style={{
                            height: "44px", padding: "0 20px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "12px", fontSize: "14px",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                            color: currentPage === totalPages ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                          }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
      {/* end desktop hidden md:block */}
    </div>
  );
};

export default Players;
