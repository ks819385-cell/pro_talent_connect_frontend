import { useState, useEffect, lazy, Suspense } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

import { DEFAULT_IMAGE, posStyle, gradeStyle } from "./playerDetail/tokens";
import DetailSkeleton from "./playerDetail/DetailSkeleton";
import TabBar from "./playerDetail/TabBar";
import OverviewTab from "./playerDetail/OverviewTab";

// -- Lazy-load non-initial tabs (each becomes its own JS chunk) -
const ScoutReportTab  = lazy(() => import("./playerDetail/ScoutReportTab"));
const CareerTab       = lazy(() => import("./playerDetail/CareerTab"));
const CompetitionsTab = lazy(() => import("./playerDetail/CompetitionsTab"));
const AnalyticsTab    = lazy(() => import("./playerDetail/AnalyticsTab"));

// -- Skeleton shown while a lazy tab chunk downloads ------------
const TabFallback = () => (
  <div className="animate-pulse space-y-4 py-4">
    <div className="h-40 bg-white/[0.04] rounded-xl" />
    <div className="h-56 bg-white/[0.04] rounded-xl" />
    <div className="h-28 bg-white/[0.04] rounded-xl" />
  </div>
);

const formatPlayerId = (playerId) => {
  if (!playerId) return "—";
  if (playerId.startsWith("PL_TEMP_")) return "Player Has No ID";
  if (playerId.startsWith("Player Has No ID")) return "Player Has No ID";
  return playerId;
};

/* -----------------------------------------------------------
   MAIN COMPONENT
----------------------------------------------------------- */
const PlayerDetailPage = ({ player, onClose, isLoading = false }) => {
  const [activeTab, setActiveTab]     = useState("overview");

  // Escape key to close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!player && !isLoading) return null;

  const currentClub =
    player?.clubsPlayed?.[player.clubsPlayed.length - 1]?.clubName;
  const pStyle = player ? posStyle(player.playingPosition) : {};
  const gStyle = player?.scoutReport?.grade
    ? gradeStyle(player.scoutReport.grade)
    : null;

  const handleDownloadReport = () => {
    if (!player) return;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const red   = [196, 22, 28];   // #C4161C
    const dark  = [15, 15, 17];    // near-black bg
    const white = [255, 255, 255];
    const gray  = [160, 160, 160];
    const lightGray = [240, 240, 240];

    const GRADE_COLORS = {
      A: [52, 211, 153],   // emerald
      B: [96, 165, 250],   // blue
      C: [251, 191, 36],   // yellow
      D: [251, 146, 60],   // orange
      E: [248, 113, 113],  // red
    };
    const GRADE_LABELS = { A: "Elite", B: "Professional", C: "Semi-Pro", D: "Amateur", E: "Semi-Amateur" };

    const grade       = player.scoutReport?.grade;
    const gradeColor  = GRADE_COLORS[grade] || [156, 163, 175];
    const totalScore  = player.scoutReport?.totalScore ?? 0;
    const sr          = player.scoutReport || {};

    // ── Header banner ──────────────────────────────────────────
    doc.setFillColor(...dark);
    doc.rect(0, 0, W, 32, "F");

    // Red accent bar on left
    doc.setFillColor(...red);
    doc.rect(0, 0, 4, 32, "F");

    // Brand name
    doc.setTextColor(...red);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("PRO TALENT CONNECT", 10, 13);

    doc.setTextColor(...gray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("OFFICIAL PLAYER SCOUTING REPORT", 10, 19);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`, 10, 24);

    // ── Grade badge (top-right) ─────────────────────────────────
    if (grade) {
      doc.setFillColor(...gradeColor);
      doc.roundedRect(W - 36, 4, 28, 24, 3, 3, "F");
      doc.setTextColor(15, 15, 17);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text(grade, W - 26, 18, { align: "center" });
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(GRADE_LABELS[grade] || "", W - 22, 24, { align: "center" });
    }

    let y = 40;

    // ── Player name + position ──────────────────────────────────
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(player.name || "", 14, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...gray);
    const subParts = [player.playingPosition, player.nationality, player.state].filter(Boolean);
    doc.text(subParts.join("  ·  "), 14, y);
    y += 10;

    // ── Score bar ───────────────────────────────────────────────
    if (totalScore > 0) {
      const barW = W - 28;
      const fillW = (totalScore / 100) * barW;
      doc.setFillColor(...lightGray);
      doc.roundedRect(14, y, barW, 5, 2, 2, "F");
      doc.setFillColor(...gradeColor);
      doc.roundedRect(14, y, fillW, 5, 2, 2, "F");
      doc.setTextColor(...gradeColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`${totalScore}/100`, W - 14, y + 4, { align: "right" });
      y += 12;
    }

    // ── Divider ─────────────────────────────────────────────────
    doc.setDrawColor(220, 220, 220);
    doc.line(14, y, W - 14, y);
    y += 7;

    // ── Basic info grid (2 columns) ─────────────────────────────
    const infoLeft = [
      ["Player ID",      formatPlayerId(player.playerId)],
      ["Date of Birth",  player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString("en-GB") : "—"],
      ["Age",            player.age ? `${player.age} years` : "—"],
      ["Gender",         player.gender    || "—"],
      ["Nationality",    player.nationality || "—"],
      ["State",          player.state     || "—"],
    ];
    const infoRight = [
      ["Height",         player.height  ? `${player.height} cm` : "—"],
      ["Weight",         player.weight  ? `${player.weight} kg` : "—"],
      ["Preferred Foot", player.preferredFoot || "—"],
      ["Current Club",   currentClub    || "—"],
      ["Current League", player.currentLeague || "—"],
      ["State League",   player.stateLeague   || "—"],
    ];

    const colMid = W / 2;
    doc.setFontSize(9);
    infoLeft.forEach(([label, val], i) => {
      const iy = y + i * 8;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...gray);
      doc.text(label, 14, iy);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(val, 60, iy);
    });
    infoRight.forEach(([label, val], i) => {
      const iy = y + i * 8;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...gray);
      doc.text(label, colMid, iy);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(val, colMid + 40, iy);
    });
    y += infoLeft.length * 8 + 6;

    // ── Scout Report Scores table ───────────────────────────────
    doc.setDrawColor(220, 220, 220);
    doc.line(14, y, W - 14, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text("Scout Report Scores", 14, y);
    y += 5;

    const scoreRows = [
      ["Age Score",            `${sr.ageScore ?? 0}`,            "/5"],
      ["Physical Profile",     `${sr.physicalScore ?? 0}`,       "/5"],
      ["Transfer Market",      `${sr.transferMarketScore ?? 0}`, "/7.5"],
      ["Competition Level",    `${sr.competitionScore ?? 0}`,    "/50"],
      ["Championship Bonus",   `${sr.championshipBonus ?? 0}`,   "bonus"],
      ["State League Bonus",   `${sr.stateLeagueBonus ?? 0}`,    "/2"],
      ["Club Reputation",      `${sr.clubReputationBonus ?? 0}`, "/3"],
      ["Speed (Sprint 30m)",   `${sr.speedScore ?? 0}`,          "/2"],
      ["Mentality",            `${sr.mentalityAssessment ?? 0}`, "/2"],
      ["Total Score",          `${totalScore}`,                  "/100"],
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [["Category", "Score", "Max"]],
      body: scoreRows,
      theme: "grid",
      headStyles: { fillColor: dark, textColor: white, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 25, halign: "right" }, 2: { cellWidth: 20, halign: "center", textColor: gray } },
      didParseCell(data) {
        // Highlight the total row
        if (data.row.index === scoreRows.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [...gradeColor, 40];
        }
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    // ── Clubs Played ────────────────────────────────────────────
    if (player.clubsPlayed?.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text("Clubs Played", 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14 },
        head: [["Club", "Duration"]],
        body: player.clubsPlayed.map((c) => [c.clubName || "", c.duration || "—"]),
        theme: "grid",
        headStyles: { fillColor: dark, textColor: white, fontStyle: "bold", fontSize: 9 },
        bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
        alternateRowStyles: { fillColor: [248, 248, 248] },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // ── Competitions ─────────────────────────────────────────────
    if (player.competitions?.length > 0) {
      // New page if not enough space
      if (y > 230) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text("Competitions", 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14 },
        head: [["Competition", "Type", "Year", "Result"]],
        body: player.competitions.map((c) => [
          c.name || "",
          c.type || "—",
          c.year ? String(c.year) : "—",
          c.result || "Participant",
        ]),
        theme: "grid",
        headStyles: { fillColor: dark, textColor: white, fontStyle: "bold", fontSize: 9 },
        bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
        alternateRowStyles: { fillColor: [248, 248, 248] },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // ── Scouting Notes ───────────────────────────────────────────
    if (player.scouting_notes) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text("Scouting Notes", 14, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      const noteLines = doc.splitTextToSize(player.scouting_notes, W - 28);
      doc.text(noteLines, 14, y);
      y += noteLines.length * 5 + 6;
    }

    // ── Footer on every page ─────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 285, W - 14, 285);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...gray);
      doc.text("Pro Talent Connect — Confidential Scouting Report", 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, W - 14, 290, { align: "right" });
    }

    doc.save(`${player.name?.replace(/\s+/g, "_")}_report.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#0B0B0D] text-white">
      {isLoading ? (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <DetailSkeleton />
        </div>
      ) : (
        <>
          {/* -- Sticky Header -- */}
          <div className="sticky top-0 z-20">
            {/* Top bar */}
            <div className="border-b border-white/[0.07] bg-[#0B0B0D]/95 backdrop-blur-sm">
              <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors focus:outline-none"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to players
                </button>
                <div className="flex items-center gap-2">
                  {player.transferMarketLink && (
                    <a
                      href={player.transferMarketLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.07] text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                      Transfer Market
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Player identity */}
            <div className="bg-[#0E0E12] border-b border-white/[0.07]">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-start gap-3 sm:gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={player.profileImage || DEFAULT_IMAGE}
                    alt={player.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl object-cover border border-white/10"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }}
                  />
                  {gStyle && (
                    <div
                      className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold ${gStyle.bg} ${gStyle.color} ${gStyle.border}`}
                    >
                      {player.scoutReport.grade}
                    </div>
                  )}
                </div>

                {/* Score box - visible sm+ */}
                {player.scoutReport?.totalScore > 0 && gStyle && (
                  <div
                    className={`hidden sm:flex w-20 h-20 rounded-xl border flex-col items-center justify-center shrink-0 ${gStyle.bg} ${gStyle.border}`}
                  >
                    <span
                      className={`text-3xl font-black tabular-nums leading-none ${gStyle.color}`}
                    >
                      {player.scoutReport.totalScore}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500 mt-0.5 uppercase tracking-wider">
                      /100
                    </span>
                  </div>
                )}

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
                      {player.name}
                    </h1>
                    {player.playingPosition && (
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}
                      >
                        {player.playingPosition}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-5 gap-y-1 text-sm text-gray-500 mb-3">
                    {currentClub && (
                      <span className="font-semibold text-gray-200">
                        {currentClub}
                      </span>
                    )}
                    {player.age && <span>{player.age} years</span>}
                    {player.nationality && <span>{player.nationality}</span>}
                    {player.state && <span>{player.state}</span>}
                    {player.preferredFoot && (
                      <span>{player.preferredFoot} foot</span>
                    )}
                  </div>

                  {player.scoutReport?.totalScore > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-36 h-3 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${player.scoutReport.totalScore}%`,
                            backgroundColor: gStyle?.bar || "#9CA3AF",
                          }}
                        />
                      </div>
                      <span
                        className={`text-sm font-bold tabular-nums ${gStyle?.color}`}
                      >
                        {player.scoutReport.totalScore}/100
                      </span>
                      <span className="text-xs text-gray-500">
                        {gStyle?.label}
                      </span>
                    </div>
                  )}

                  {/* Primary action buttons — desktop only; mobile uses sticky bottom bar */}
                  <div className="hidden sm:flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/[0.05]">
                    <button
                      onClick={handleDownloadReport}
                      className="h-8 px-4 rounded-lg bg-[#C4161C] hover:bg-[#a81218] text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                    >
                      <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                      Download Report
                    </button>
                    {player.email && (
                      <a
                        href={`mailto:${player.email}`}
                        className="h-8 px-4 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs font-semibold text-gray-300 hover:bg-white/[0.08] transition-colors flex items-center gap-1.5"
                      >
                        <EnvelopeIcon className="w-3.5 h-3.5" />
                        Request Contact
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab bar */}
            <div key={player?._id} className="bg-[#0B0B0D] border-b border-white/[0.07]">
              <div className="max-w-6xl mx-auto">
                <TabBar active={activeTab} setActive={setActiveTab} />
              </div>
            </div>
          </div>

          {/* -- Page Content -- */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
            {/* Overview is eagerly loaded - always the first visible tab */}
            {activeTab === "overview" && (
              <OverviewTab
                player={player}
                onDownload={handleDownloadReport}
              />
            )}

            {/* Remaining tabs are lazy-loaded on first click */}
            <Suspense fallback={<TabFallback />}>
              {activeTab === "scout"        && <ScoutReportTab  player={player} />}
              {activeTab === "career"       && <CareerTab       player={player} />}
              {activeTab === "competitions" && <CompetitionsTab player={player} />}
              {activeTab === "analytics"    && <AnalyticsTab    player={player} />}
            </Suspense>
          </div>

          {/* ── Mobile sticky bottom action bar ─────────────────────── */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0B0D]/96 backdrop-blur-md border-t border-white/[0.09] px-4 py-3 flex gap-2">
            <button
              onClick={handleDownloadReport}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#C4161C] hover:bg-[#a81218] text-white text-xs font-bold transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download
            </button>
            {player.email && (
              <a
                href={`mailto:${player.email}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-gray-300 text-xs font-bold transition-colors hover:bg-white/[0.08]"
              >
                <EnvelopeIcon className="w-4 h-4" />
                Contact
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PlayerDetailPage;
