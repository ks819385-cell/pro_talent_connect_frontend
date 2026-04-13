import { useState, useEffect } from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  ArrowDownTrayIcon,
  ScaleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { T, card, tH, tD, tDW, gradeStyle } from "./tokens";
import { Badge, StatItem, RatingBar } from "./primitives";
import { api } from "../../../services/api";
import { VideoPlayer } from "@/components/ui/video-thumbnail-player.jsx";

const DEFAULT_IMG = "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400";
const DEFAULT_VIDEO_THUMBNAIL =
  "https://images.unsplash.com/photo-1593642532454-e138e28a63f4?q=80&w=2069&auto=format&fit=crop";

const EMBED_PARAMS = "autoplay=1&rel=0&modestbranding=1&playsinline=1";

const getPlayerVideoLink = (player) => {
  if (typeof player?.youtubeVideoUrl === "string" && player.youtubeVideoUrl.trim()) {
    return player.youtubeVideoUrl.trim();
  }

  const links = Array.isArray(player?.media_links) ? player.media_links : [];
  const youtubeLink = links.find(
    (link) => typeof link === "string" && /youtube\.com|youtu\.be/.test(link)
  );
  return youtubeLink || "";
};

const toYoutubeEmbedUrl = (url) => {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  if (trimmed.includes("youtube.com/embed/") || trimmed.includes("youtube-nocookie.com/embed/")) {
    const normalized = trimmed
      .replace("https://www.youtube.com/embed/", "https://www.youtube-nocookie.com/embed/")
      .replace("http://www.youtube.com/embed/", "https://www.youtube-nocookie.com/embed/");
    return normalized.includes("autoplay=") ? normalized : `${normalized}${normalized.includes("?") ? "&" : "?"}${EMBED_PARAMS}`;
  }

  try {
    const parsed = new URL(trimmed);
    let videoId = "";

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.replace("/", "");
    } else if (parsed.pathname === "/watch") {
      videoId = parsed.searchParams.get("v") || "";
    } else if (parsed.pathname.startsWith("/shorts/")) {
      videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0] || "";
    }

    if (!videoId) return "";
    return `https://www.youtube-nocookie.com/embed/${videoId}?${EMBED_PARAMS}`;
  } catch {
    return "";
  }
};

// ── Compare Modal ──────────────────────────────────────────────────────────
const CompareModal = ({ basePlayer, onClose }) => {
  const [step, setStep] = useState("pick"); // "pick" | "result"
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    api.getPlayers({ limit: 200 })
      .then((r) => setPlayers((r.data.players || r.data || []).filter((p) => p._id !== basePlayer._id)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [basePlayer._id]);

  const filtered = players.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.playingPosition?.toLowerCase().includes(search.toLowerCase())
  );

  const gs = (g) => gradeStyle(g || "N/A");

  const CmpRow = ({ label, a, b, better }) => {
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    const aWins = !isNaN(aNum) && !isNaN(bNum) && (better === "high" ? aNum >= bNum : aNum <= bNum);
    const bWins = !isNaN(aNum) && !isNaN(bNum) && (better === "high" ? bNum > aNum : bNum < aNum);
    return (
      <tr className="border-b border-white/[0.05]">
        <td className="py-2.5 px-3 text-right text-sm" style={{ color: aWins ? "#34D399" : "rgba(255,255,255,0.65)" }}>
          <span className={aWins ? "font-bold" : ""}>{a ?? "—"}</span>
        </td>
        <td className="py-2.5 px-2 text-center text-[11px] text-gray-500 font-medium whitespace-nowrap">{label}</td>
        <td className="py-2.5 px-3 text-left text-sm" style={{ color: bWins ? "#34D399" : "rgba(255,255,255,0.65)" }}>
          <span className={bWins ? "font-bold" : ""}>{b ?? "—"}</span>
        </td>
      </tr>
    );
  };

  const ScoreBar = ({ score, color }) => (
    <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden mt-1">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color || "#C4161C" }} />
    </div>
  );

  const PlayerHeader = ({ p }) => {
    const g = gs(p.scoutReport?.grade);
    return (
      <div className="flex flex-col items-center gap-2 px-2">
        <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10">
          <img src={p.profileImage || DEFAULT_IMG} alt={p.name} className="w-full h-full object-cover object-top" />
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-sm leading-tight max-w-[110px] truncate">{p.name}</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{p.playingPosition || "—"}</p>
          {p.scoutReport?.grade && (
            <span
              className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ color: gs(p.scoutReport.grade).bar, background: `${gs(p.scoutReport.grade).bar}22`, border: `1px solid ${gs(p.scoutReport.grade).bar}44` }}
            >
              Grade {p.scoutReport.grade}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <ScaleIcon className="w-5 h-5 text-red-500" />
            <span className="text-white font-bold text-base">
              {step === "pick" ? "Compare Player" : `${basePlayer.name} vs ${picked?.name}`}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ background: "none", border: "none", cursor: "pointer" }}>
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {step === "pick" ? (
          <div className="p-5">
            <p className="text-sm text-gray-400 mb-4">Select a player to compare with <span className="text-white font-semibold">{basePlayer.name}</span></p>
            {/* Search */}
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type="text"
                placeholder="Search by name or position..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            {/* Player list */}
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />)}</div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">No players found</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filtered.map((p) => {
                  const g = gs(p.scoutReport?.grade);
                  return (
                    <button
                      key={p._id}
                      onClick={() => { setPicked(p); setStep("result"); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-white/[0.07]"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer" }}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <img src={p.profileImage || DEFAULT_IMG} alt={p.name} className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                        <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{p.playingPosition || "—"} · {p.age ? `${p.age}y` : ""}</p>
                      </div>
                      {p.scoutReport?.grade && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: gs(p.scoutReport.grade).bar, background: `${gs(p.scoutReport.grade).bar}22` }}>{p.scoutReport.grade}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="p-5">
            {/* Player headers */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-5">
              <PlayerHeader p={basePlayer} />
              <div className="text-center">
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: "rgba(196,22,28,0.15)", color: "#FCA5A5", border: "1px solid rgba(196,22,28,0.3)" }}>VS</span>
              </div>
              <PlayerHeader p={picked} />
            </div>

            {/* Score bars */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[basePlayer, picked].map((p, i) => {
                const g = gs(p.scoutReport?.grade);
                const score = p.scoutReport?.totalScore || 0;
                return (
                  <div key={i} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Scout Score</span>
                      <span className={`text-base font-black tabular-nums`} style={{ color: g.bar }}>{score}<span className="text-xs text-gray-600 font-normal">/100</span></span>
                    </div>
                    <ScoreBar score={score} color={g.bar || "#C4161C"} />
                  </div>
                );
              })}
            </div>

            {/* Comparison table */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                    <th className="py-2.5 px-3 text-right text-[11px] text-gray-500 font-semibold w-[40%] truncate max-w-[110px]">{basePlayer.name.split(" ")[0]}</th>
                    <th className="py-2.5 px-2 text-center text-[10px] text-gray-600 font-medium uppercase tracking-wide w-[20%]">Stat</th>
                    <th className="py-2.5 px-3 text-left text-[11px] text-gray-500 font-semibold w-[40%] truncate max-w-[110px]">{picked.name.split(" ")[0]}</th>
                  </tr>
                </thead>
                <tbody>
                  <CmpRow label="Age" a={basePlayer.age} b={picked.age} better="low" />
                  <CmpRow label="Height (cm)" a={basePlayer.height} b={picked.height} better="high" />
                  <CmpRow label="Weight (kg)" a={basePlayer.weight} b={picked.weight} />
                  <CmpRow label="Sprint 30m (s)" a={basePlayer.sprint30m} b={picked.sprint30m} better="low" />
                  <CmpRow label="Mentality Score" a={basePlayer.mentalityScore} b={picked.mentalityScore} better="high" />
                  <CmpRow label="Scout Score /100" a={basePlayer.scoutReport?.totalScore} b={picked.scoutReport?.totalScore} better="high" />
                  <CmpRow label="Age Score /5" a={basePlayer.scoutReport?.ageScore} b={picked.scoutReport?.ageScore} better="high" />
                  <CmpRow label="Physical /5" a={basePlayer.scoutReport?.physicalScore} b={picked.scoutReport?.physicalScore} better="high" />
                  <CmpRow label="Transfer Mkt /7.5" a={basePlayer.scoutReport?.transferMarketScore} b={picked.scoutReport?.transferMarketScore} better="high" />
                  <CmpRow label="Competition /50" a={basePlayer.scoutReport?.competitionScore} b={picked.scoutReport?.competitionScore} better="high" />
                  <CmpRow label="Championship Bonus" a={basePlayer.scoutReport?.championshipBonus} b={picked.scoutReport?.championshipBonus} better="high" />
                  <CmpRow label="State League /2" a={basePlayer.scoutReport?.stateLeagueBonus} b={picked.scoutReport?.stateLeagueBonus} better="high" />
                  <CmpRow label="Club Rep. /3" a={basePlayer.scoutReport?.clubReputationBonus} b={picked.scoutReport?.clubReputationBonus} better="high" />
                  <CmpRow label="Speed /2" a={basePlayer.scoutReport?.speedScore} b={picked.scoutReport?.speedScore} better="high" />
                  <CmpRow label="Mentality /2" a={basePlayer.scoutReport?.mentalityAssessment} b={picked.scoutReport?.mentalityAssessment} better="high" />
                </tbody>
              </table>
            </div>

            <button
              onClick={() => { setPicked(null); setStep("pick"); }}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.55)", cursor: "pointer" }}
            >
              ← Pick a different player
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
// ── OverviewTab ────────────────────────────────────────────────────────────
const OverviewTab = ({ player, onDownload }) => {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const report = player.scoutReport;
  const gStyle = report?.grade ? gradeStyle(report.grade) : gradeStyle("N/A");
  const score = report?.totalScore ?? 0;
  const recentComps = [...(player.competitions || [])].slice(-5).reverse();
  const playerVideoUrl = toYoutubeEmbedUrl(getPlayerVideoLink(player));
  const playerVideoThumbnail =
    player.videoThumbnail || player.profileImage || player?.media_links?.[0] || DEFAULT_VIDEO_THUMBNAIL;
  const playerVideoTitle =
    player.videoTitle || `${player.name} Highlights`;
  const playerVideoDescription =
    player.videoDescription || "Tap to watch in fullscreen modal";

  const skillBars = report
    ? [
        { label: "Age Prospect", value: report.ageScore ?? 0, max: 5 },
        { label: "Physical Profile", value: report.physicalScore ?? 0, max: 5 },
        {
          label: "Competition Level",
          value: (report.competitionScore ?? 0) / 10,
          max: 5,
        },
        { label: "Speed", value: report.speedScore ?? 0, max: 2 },
        { label: "Mentality", value: report.mentalityAssessment ?? 0, max: 2 },
        {
          label: "Club Reputation",
          value: report.clubReputationBonus ?? 0,
          max: 3,
        },
      ]
    : [];

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-6 items-start">
      {/* ── LEFT COLUMN ── */}
      <div className="space-y-5 min-w-0">
        {/* 1. Rating Overview */}
        {report && (
          <div className={card + " p-5"}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className={T.labelText}>Overall Scout Rating</p>
                <div className="flex items-end gap-2 mt-2">
                  <span
                    className={`text-[56px] leading-none font-black tabular-nums ${gStyle.color}`}
                  >
                    {score}
                  </span>
                  <span className="text-gray-600 text-xl mb-2">/100</span>
                </div>
              </div>
              <span
                className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-bold border ${gStyle.bg} ${gStyle.color} ${gStyle.border}`}
              >
                Grade {report.grade} — {gStyle.label}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${score}%`, backgroundColor: gStyle.bar }}
              />
            </div>
            <p className="text-[11px] text-gray-600 text-right">
              {score}% of maximum score
            </p>
            {skillBars.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {skillBars.map((s) => (
                  <RatingBar
                    key={s.label}
                    label={s.label}
                    value={s.value}
                    max={s.max}
                    color={gStyle.bar}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. Competition Performance Table */}
        {recentComps.length > 0 && (
          <div className={card + " overflow-hidden"}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div>
                <p className={T.sectionTitle}>Competition Performance</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Last {recentComps.length} competitions
                </p>
              </div>
            </div>
            {/* Mobile: competition card list */}
            <div className="sm:hidden divide-y divide-white/[0.04]">
              {recentComps.map((c, i) => (
                <div
                  key={i}
                  className="px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-100 truncate">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {[c.type, c.year].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  {c.result === "Champion" ? (
                    <Badge label="Champion" variant="gold" />
                  ) : c.result === "Runner-up" ? (
                    <Badge label="Runner-up" variant="yellow" />
                  ) : (
                    <Badge label={c.result || "Participant"} variant="gray" />
                  )}
                </div>
              ))}
            </div>

            {/* Desktop: competition table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className={tH}>Competition</th>
                    <th className={tH + " hidden sm:table-cell"}>Type</th>
                    <th className={tH + " text-center"}>Year</th>
                    <th className={tH + " text-right"}>Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentComps.map((c, i) => (
                    <tr
                      key={i}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className={tDW}>{c.name}</td>
                      <td className={tD + " hidden sm:table-cell"}>
                        {c.type || "—"}
                      </td>
                      <td className={tD + " text-center"}>{c.year || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        {c.result === "Champion" ? (
                          <Badge label="Champion" variant="gold" />
                        ) : c.result === "Runner-up" ? (
                          <Badge label="Runner-up" variant="yellow" />
                        ) : (
                          <Badge
                            label={c.result || "Participant"}
                            variant="gray"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Scouting Summary */}
        {player.scouting_notes && (
          <div className={card + " overflow-hidden"}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div>
                <p className={T.sectionTitle}>Scouting Summary</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Scout analysis & assessment notes
                </p>
              </div>
              <button
                onClick={() => setNotesExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
              >
                {notesExpanded ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
                {notesExpanded ? "Collapse" : "Expand"}
              </button>
            </div>
            <div className="px-5 py-5">
              <div className="border-l-2 border-[#C4161C]/40 pl-4 bg-[#C4161C]/[0.04] py-3 rounded-r-lg">
                <p
                  className={`text-sm text-gray-300 leading-relaxed ${!notesExpanded ? "line-clamp-3" : ""}`}
                >
                  {player.scouting_notes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Performance Indicators */}
        {report && (
          <div className={card + " overflow-hidden"}>
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <p className={T.sectionTitle}>Performance Indicators</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Metric-level score breakdown
              </p>
            </div>
            {/* Mobile: metric stat cards grid */}
            <div className="sm:hidden p-4 grid grid-cols-2 gap-3">
              {[
                { label: "Age Prospect",  score: report.ageScore,            max: 5,    missing: !player.age },
                { label: "Physical",      score: report.physicalScore,        max: 5,    missing: !player.height || !player.weight },
                { label: "Transfer Mkt",  score: report.transferMarketScore,  max: 7.5,  missing: !player.transferMarketLink },
                { label: "Competition",   score: report.competitionScore,     max: 50,   missing: !player.competitions?.length },
                { label: "Championship",  score: report.championshipBonus,    max: "—",  missing: !player.competitions?.length },
                { label: "State League",  score: report.stateLeagueBonus,     max: 2,    missing: !player.stateLeague },
                { label: "Club Rep.",     score: report.clubReputationBonus,  max: 3,    missing: !player.clubsPlayed?.length },
                { label: "Speed (30m)",   score: report.speedScore,           max: 2,    missing: !player.sprint30m },
                { label: "Mentality",     score: report.mentalityAssessment,  max: 2,    missing: player.mentalityScore == null },
              ].map((b, i) => {
                const pct =
                  b.max !== "—" && !b.missing
                    ? Math.min(Math.round((b.score / b.max) * 100), 100)
                    : null;
                const barColor =
                  pct == null
                    ? "#374151"
                    : pct >= 70
                    ? "#34D399"
                    : pct >= 40
                    ? "#FBBF24"
                    : "#F87171";
                return (
                  <div
                    key={i}
                    className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]"
                  >
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide leading-snug">
                      {b.label}
                    </p>
                    {b.missing ? (
                      <p className="text-xs text-gray-700 mt-2 italic">—</p>
                    ) : (
                      <>
                        <div className="flex items-end justify-between mt-2 mb-1.5">
                          <span className="text-lg font-black tabular-nums text-white leading-none">
                            {b.score}
                          </span>
                          <span className="text-[10px] text-gray-600">
                            /{b.max}
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              {/* Total score chip */}
              <div
                className={`col-span-2 rounded-xl p-3 border flex items-center justify-between ${gStyle.bg} ${gStyle.border}`}
              >
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Total Score
                </span>
                <span
                  className={`text-xl font-black tabular-nums ${gStyle.color}`}
                >
                  {report.totalScore}
                  <span className="text-sm font-normal text-gray-600">
                    /100
                  </span>
                </span>
              </div>
            </div>

            {/* Desktop: metric table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className={tH}>Metric</th>
                    <th className={tH + " hidden md:table-cell"}>Progress</th>
                    <th className={tH + " text-right"}>Score</th>
                    <th className={tH + " text-right"}>Max</th>
                    <th className={tH + " text-right"}>%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    {
                      label: "Age Prospect",
                      score: report.ageScore,
                      max: 5,
                      missing: !player.age,
                    },
                    {
                      label: "Physical Profile",
                      score: report.physicalScore,
                      max: 5,
                      missing: !player.height || !player.weight,
                    },
                    {
                      label: "Transfer Market",
                      score: report.transferMarketScore,
                      max: 7.5,
                      missing: !player.transferMarketLink,
                    },
                    {
                      label: "Competition Level",
                      score: report.competitionScore,
                      max: 50,
                      missing: !player.competitions?.length,
                    },
                    {
                      label: "Championship Bonus",
                      score: report.championshipBonus,
                      max: "—",
                      missing: !player.competitions?.length,
                    },
                    {
                      label: "State League",
                      score: report.stateLeagueBonus,
                      max: 2,
                      missing: !player.stateLeague,
                    },
                    {
                      label: "Club Reputation",
                      score: report.clubReputationBonus,
                      max: 3,
                      missing: !player.clubsPlayed?.length,
                    },
                    {
                      label: "Speed (30m Sprint)",
                      score: report.speedScore,
                      max: 2,
                      missing: !player.sprint30m,
                    },
                    {
                      label: "Mentality",
                      score: report.mentalityAssessment,
                      max: 2,
                      missing: player.mentalityScore == null,
                    },
                  ].map((b, i) => {
                    const pct =
                      b.max !== "—" && !b.missing
                        ? Math.min(Math.round((b.score / b.max) * 100), 100)
                        : null;
                    const barColor =
                      pct == null
                        ? "#374151"
                        : pct >= 70
                          ? "#34D399"
                          : pct >= 40
                            ? "#FBBF24"
                            : "#F87171";
                    return (
                      <tr
                        key={i}
                        className={`hover:bg-white/[0.02] transition-colors ${i % 2 !== 0 ? "bg-white/[0.015]" : ""}`}
                      >
                        <td className={tDW}>{b.label}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {b.missing ? (
                            <span className="text-xs text-gray-700 italic">
                              Not provided
                            </span>
                          ) : (
                            <div className="w-28 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: barColor,
                                }}
                              />
                            </div>
                          )}
                        </td>
                        <td className={tDW + " text-right"}>
                          {b.missing ? "—" : b.score}
                        </td>
                        <td className={tD + " text-right text-gray-600"}>
                          {b.max}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold">
                          {pct != null ? (
                            <span style={{ color: barColor }}>{pct}%</span>
                          ) : (
                            <span className="text-gray-700">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10 bg-gray-800/30">
                    <td
                      colSpan={2}
                      className="px-4 py-3.5 text-sm font-semibold text-white"
                    >
                      Total
                    </td>
                    <td colSpan={3} className="px-4 py-3.5 text-right">
                      <span
                        className={`text-base font-black tabular-nums ${gStyle.color}`}
                      >
                        {report.totalScore}
                      </span>
                      <span className="text-gray-600 text-sm font-normal">
                        {" "}
                        /100
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {playerVideoUrl && (
          <div className={card + " p-4"}>
            <div className="mb-4">
              <p className={T.sectionTitle}>Player Highlight Video</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Embedded video preview below the overview metrics table
              </p>
            </div>
            <VideoPlayer
              thumbnailUrl={playerVideoThumbnail}
              videoUrl={playerVideoUrl}
              title={playerVideoTitle}
              description={playerVideoDescription}
              className="rounded-xl"
            />
          </div>
        )}
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className="space-y-4">
        {/* Personal Details */}
        <div className={card + " overflow-hidden"}>
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className={T.sectionTitle}>Personal Details</p>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-1 gap-4">
            <StatItem
              label="Age"
              value={player.age ? `${player.age} years` : null}
            />
            <StatItem label="Nationality" value={player.nationality} />
            <StatItem label="State" value={player.state} />
            <StatItem label="State League" value={player.stateLeague || null} />
            <StatItem label="Preferred Foot" value={player.preferredFoot} />
          </div>
        </div>

        {/* Physical Attributes */}
        <div className={card + " overflow-hidden"}>
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className={T.sectionTitle}>Physical Attributes</p>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-1 gap-4">
            <StatItem
              label="Height"
              value={player.height ? `${player.height} cm` : null}
            />
            <StatItem
              label="Weight"
              value={player.weight ? `${player.weight} kg` : null}
            />
            <StatItem
              label="Sprint 30m"
              value={player.sprint30m ? `${player.sprint30m}s` : null}
            />
            <StatItem
              label="Mentality Score"
              value={
                player.mentalityScore != null
                  ? String(player.mentalityScore)
                  : null
              }
            />
          </div>
        </div>

        {/* Contact Information */}
        {(player.email || player.mobileNumber) && (
          <div className={card + " overflow-hidden"}>
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <p className={T.sectionTitle}>Contact Information</p>
            </div>
            <div className="p-4 space-y-2">
              {player.email && (
                <a
                  href={`mailto:${player.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-white/[0.06] hover:border-white/[0.12] transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0B0B0D] flex items-center justify-center shrink-0">
                    <EnvelopeIcon className="w-4 h-4 text-gray-500 group-hover:text-[#C4161C] transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className={T.labelText}>Email</p>
                    <p className="text-xs text-gray-300 group-hover:text-white transition-colors truncate mt-0.5">
                      {player.email}
                    </p>
                  </div>
                </a>
              )}
              {player.mobileNumber && (
                <a
                  href={`tel:${player.mobileNumber}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-white/[0.06] hover:border-white/[0.12] transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0B0B0D] flex items-center justify-center shrink-0">
                    <PhoneIcon className="w-4 h-4 text-gray-500 group-hover:text-[#C4161C] transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className={T.labelText}>Phone</p>
                    <p className="text-xs text-gray-300 group-hover:text-white transition-colors mt-0.5">
                      {player.mobileNumber}
                    </p>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions — desktop only; mobile uses sticky bottom bar */}
        <div className={`${card} p-4 space-y-2 hidden sm:block`}>
          <p className={T.labelText + " mb-3"}>Quick Actions</p>
          <button
            onClick={() => setCompareOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#C4161C] hover:bg-[#A81319] text-white text-xs font-bold transition-colors"
          >
            <ScaleIcon className="w-4 h-4" />
            Compare Player
          </button>
          <button
            onClick={onDownload}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 border border-white/[0.08] text-gray-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Download Report
          </button>
          {player.email && (
            <a
              href={`mailto:${player.email}?subject=Contact Request — ${player.name}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 border border-white/[0.08] text-gray-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <EnvelopeIcon className="w-4 h-4" />
              Request Contact
            </a>
          )}
        </div>
      </div>
    </div>
      {compareOpen && <CompareModal basePlayer={player} onClose={() => setCompareOpen(false)} />}
    </>
  );
};

export default OverviewTab;
