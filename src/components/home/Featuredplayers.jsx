import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

/* --- Grade color map --- */
const GRADE_MAP = {
  A: { bg: "#10b981", glow: "rgba(16,185,129,0.35)", label: "Elite" },
  B: { bg: "#3b82f6", glow: "rgba(59,130,246,0.35)", label: "Pro" },
  C: { bg: "#f59e0b", glow: "rgba(245,158,11,0.35)", label: "Semi-Pro" },
  D: { bg: "#f97316", glow: "rgba(249,115,22,0.35)", label: "Amateur" },
  E: { bg: "#ef4444", glow: "rgba(239,68,68,0.35)", label: "Developing" },
  INCOMPLETE: { bg: "#ca8a04", glow: "rgba(202,138,4,0.3)", label: "Unrated" },
  "N/A": { bg: "#6b7280", glow: "rgba(107,114,128,0.3)", label: "No Rating" },
};
const getGrade = (g) => GRADE_MAP[g] || null;

/* --- Position color + short label --- */
const POS_MAP = {
  FORWARD:    { color: "rgba(239,68,68,0.9)",    short: "FWD" },
  WINGER:     { color: "rgba(249,115,22,0.9)",   short: "WNG" },
  MIDFIELD:   { color: "rgba(59,130,246,0.9)",   short: "MID" },
  DEFENDER:   { color: "rgba(16,185,129,0.9)",   short: "DEF" },
  GOALKEEPER: { color: "rgba(168,85,247,0.9)",   short: "GK"  },
};

/* --- Lazy image with blur-up --- */
const PlayerAvatar = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  const fallback =
    "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&q=80";

  return (
    <div className="relative w-full h-full overflow-hidden bg-white/5">
      <img
        src={src || fallback}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={(e) => { e.currentTarget.src = fallback; setLoaded(true); }}
        className="w-full h-full object-cover object-top transition-opacity duration-400"
        style={{ opacity: loaded ? 1 : 0 }}
      />
      {!loaded && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.04) 100%)",
            backgroundSize: "200% 100%",
            animation: "gradientShift 1.5s ease infinite",
          }}
        />
      )}
    </div>
  );
};

/* --- Animated score bar --- */
const ScoreBar = ({ score, grade }) => {
  const barRef = useRef(null);
  const [animated, setAnimated] = useState(false);
  const gradeData = getGrade(grade);

  useEffect(() => {
    if (!barRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.6 },
    );
    observer.observe(barRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={barRef} className="mt-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-white/40 text-[11px] font-medium">Scout Score</span>
        <span className="text-white text-[11px] font-bold tabular-nums">{score}/100</span>
      </div>
      <div className="w-full rounded-full overflow-hidden bg-white/8" style={{ height: "5px" }}>
        <div
          style={{
            height: "100%",
            borderRadius: "9999px",
            width: animated ? `${score}%` : "0%",
            background: gradeData
              ? `linear-gradient(90deg, ${gradeData.bg}, ${gradeData.bg}bb)`
              : "#C4161C",
            boxShadow: gradeData ? `0 0 6px ${gradeData.glow}` : "none",
            transition: "width 1.1s cubic-bezier(0.4,0,0.2,1) 0.2s",
          }}
        />
      </div>
    </div>
  );
};

/* --- Featured players --- */
const FeaturedPlayers = () => {
  const scrollRef = useRef(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const base = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const res = await axios.get(`${base}/api/players?limit=100`);
        const all = res.data.players || res.data || [];
        const unique = Array.from(new Map(all.map((p) => [p._id, p])).values());
        const sorted = unique
          .sort((a, b) => (b.scoutReport?.totalScore || 0) - (a.scoutReport?.totalScore || 0))
          .slice(0, 6);
        setPlayers(sorted);
      } catch {
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featured = players;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cardW = el.firstChild?.offsetWidth || 1;
    setActiveIdx(Math.round(el.scrollLeft / (cardW + 12)));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = (idx) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardW = el.firstChild?.offsetWidth || 260;
    el.scrollTo({ left: idx * (cardW + 12), behavior: "smooth" });
  };

  /* --- Loading --- */
  if (loading) {
    return (
      <section className="bg-[#0B0B0B] py-6" aria-label="Featured players loading">
        <div className="px-5 mb-5">
          <div className="h-6 w-40 rounded-lg mb-1.5" style={{ background: "rgba(255,255,255,0.08)", animation: "gradientShift 1.5s ease infinite" }} />
          <div className="h-3 w-52 rounded-md" style={{ background: "rgba(255,255,255,0.05)", animation: "gradientShift 1.5s ease infinite" }} />
        </div>
        <div className="flex gap-3 overflow-hidden px-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shrink-0 rounded-2xl" style={{ width: "72vw", maxWidth: 260, height: 340, background: "rgba(255,255,255,0.04)", animation: "gradientShift 1.5s ease infinite" }} />
          ))}
        </div>
      </section>
    );
  }

  /* --- Empty --- */
  if (!featured.length) {
    return (
      <section className="bg-[#0B0B0B] py-10 px-5" aria-label="Featured players">
        <div className="text-center">
          <h2 className="text-white font-bold text-2xl m-0 mb-2">Featured Players</h2>
          <p className="text-white/40 text-sm mb-5">No players available yet.</p>
          <Link to="/players" className="inline-flex items-center px-6 py-3 rounded-xl text-white text-sm font-bold no-underline" style={{ background: "#C4161C" }}>
            Browse All Players
          </Link>
        </div>
      </section>
    );
  }

  /* --- Render --- */
  return (
    <section className="bg-[#0B0B0B] pt-7 pb-5" aria-label="Featured players">

      {/* --- Header --- */}
      <div className="flex items-center justify-between px-5 mb-4">
        <div>
          <h2 className="text-white font-bold m-0 leading-tight" style={{ fontSize: "clamp(20px,5vw,26px)" }}>
            Featured Players
          </h2>
          <p className="text-white/35 text-[12px] mt-0.5 mb-0">
            Top rated talent &amp; curated profiles
          </p>
        </div>
        {/* Fitts's Law - big enough tap target */}
        <Link
          to="/players"
          className="shrink-0 flex items-center justify-center font-semibold text-white text-[13px] px-4 rounded-lg no-underline"
          style={{
            height: "36px",
            background: "#C4161C",
            boxShadow: "0 2px 12px rgba(196,22,28,0.4)",
          }}
        >
          View All
        </Link>
      </div>

      {/* --- Carousel - peek pattern shows ~15% of next card (Zeigarnik affordance) --- */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex overflow-x-auto overflow-y-visible"
        role="list"
        aria-label="Featured players list"
        style={{
          gap: "12px",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingBottom: "4px",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {featured.map((player) => {
          const gradeData = getGrade(player.scoutReport?.grade);
          const lastClub = player.clubsPlayed?.[player.clubsPlayed.length - 1]?.clubName;
          const posData = POS_MAP[player.playingPosition] || { color: "rgba(107,114,128,0.85)", short: player.playingPosition };

          return (
            <article
              key={player._id}
              role="listitem"
              aria-label={`${player.name}, ${player.playingPosition}`}
              className="shrink-0 rounded-2xl overflow-hidden cursor-pointer"
              style={{
                /* 72vw card + 8% right peek = natural affordance to swipe */
                width: "min(72vw, 260px)",
                scrollSnapAlign: "start",
                background: "linear-gradient(160deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.03) 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 6px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
              }}
            >
              {/* --- Avatar zone - shorter on mobile for card economy --- */}
              <div className="relative" style={{ height: "160px" }}>
                <PlayerAvatar src={player.profileImage} alt={`Photo of ${player.name}`} />

                {/* Bottom fade into card body */}
                <div
                  className="absolute bottom-0 left-0 right-0 pointer-events-none"
                  style={{ height: "64px", background: "linear-gradient(to bottom,transparent,rgba(11,11,11,0.92))" }}
                />

                {/* Position chip - top-left */}
                <span
                  className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-white text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: posData.color, backdropFilter: "blur(4px)" }}
                >
                  {posData.short}
                </span>

                {/* Grade + score chip - top-right */}
                {gradeData && (
                  <span
                    className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-white text-[10px] font-bold"
                    style={{ background: gradeData.bg, boxShadow: `0 0 8px ${gradeData.glow}` }}
                  >
                    <span>{player.scoutReport.grade}</span>
                    <span className="opacity-75">{player.scoutReport.totalScore}</span>
                  </span>
                )}
              </div>

              {/* --- Card body --- */}
              <div className="px-3.5 pt-3 pb-4">
                {/* Name - visual anchor (Serial Position: primacy) */}
                <h3 className="text-white font-bold text-[16px] m-0 leading-snug truncate">
                  {player.name}
                </h3>

                {/* Club + location - secondary info */}
                <p className="text-white/50 text-[12px] m-0 mt-0.5 truncate">
                  {lastClub || "Free Agent"}
                </p>
                <p className="text-white/30 text-[11px] m-0 truncate">
                  {[player.state, player.nationality].filter(Boolean).join(", ") || "-"}
                </p>

                {/* Score bar */}
                {player.scoutReport?.totalScore > 0 && (
                  <ScoreBar score={player.scoutReport.totalScore} grade={player.scoutReport.grade} />
                )}

                {/* CTA - Fitts's Law: full-width, 48px tall = easy thumb tap */}
                <Link
                  to="/players"
                  className="mt-3.5 flex items-center justify-center text-white text-[14px] font-bold no-underline rounded-xl transition-opacity duration-200 active:opacity-80"
                  style={{
                    height: "48px",
                    background: "linear-gradient(135deg,#C4161C 0%,#E8242B 100%)",
                    boxShadow: "0 3px 14px rgba(196,22,28,0.4)",
                    letterSpacing: "0.01em",
                  }}
                >
                  View Profile
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* --- Scroll dots --- */}
      <div className="flex items-center justify-center mt-4" style={{ gap: "7px" }} aria-hidden="true">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to player ${i + 1}`}
            className="border-none p-0 cursor-pointer rounded-full transition-all duration-300"
            style={{
              width: i === activeIdx ? "20px" : "6px",
              height: "6px",
              background: i === activeIdx ? "#C4161C" : "rgba(255,255,255,0.2)",
              boxShadow: i === activeIdx ? "0 0 6px rgba(196,22,28,0.5)" : "none",
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedPlayers;
