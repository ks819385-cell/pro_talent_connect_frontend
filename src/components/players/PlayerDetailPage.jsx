import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownTrayIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";

import { DEFAULT_IMAGE, posStyle, gradeStyle } from "./playerDetail/tokens";
import DetailSkeleton from "./playerDetail/DetailSkeleton";
import TabBar from "./playerDetail/TabBar";
import OverviewTab from "./playerDetail/OverviewTab";
import { buildScoutReportPdfBuffer } from "./playerDetail/scoutReportPdf";

const ScoutReportTab = lazy(() => import("./playerDetail/ScoutReportTab"));
const CareerTab = lazy(() => import("./playerDetail/CareerTab"));
const CompetitionsTab = lazy(() => import("./playerDetail/CompetitionsTab"));
const AnalyticsTab = lazy(() => import("./playerDetail/AnalyticsTab"));

const TabFallback = () => (
  <div className="animate-pulse space-y-4 py-4">
    <div className="h-40 bg-white/[0.04] rounded-xl" />
    <div className="h-56 bg-white/[0.04] rounded-xl" />
    <div className="h-28 bg-white/[0.04] rounded-xl" />
  </div>
);

const formatPlayerId = (playerId) => {
  if (!playerId) return "N/A";
  if (playerId.startsWith("PL_TEMP_")) return "Player Has No ID";
  if (playerId.startsWith("Player Has No ID")) return "Player Has No ID";
  return playerId;
};

const FALLBACK_TEXT = "N/A";
const REPORT_CACHE_LIMIT = 12;
const REPORT_TEMPLATE_VERSION = "react-pdf-chartjs-v3";

const downloadPdfBuffer = (pdfBuffer, fileName) => {
  const blob = new Blob([pdfBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const buildReportCacheKey = (player) =>
  JSON.stringify({
    reportTemplateVersion: REPORT_TEMPLATE_VERSION,
    id: player?._id || player?.playerId || player?.name || "unknown",
    updatedAt: player?.updatedAt || "",
    scoutReport: player?.scoutReport || {},
    clubsPlayed: player?.clubsPlayed || [],
    competitions: player?.competitions || [],
    scoutingNotes: player?.scouting_notes || "",
  });

const PlayerDetailPage = ({ player, onClose, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingCompareOpen, setPendingCompareOpen] = useState(false);
  const reportCacheRef = useRef(new Map());
  const compareOpenerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (activeTab === "overview" && pendingCompareOpen) {
      compareOpenerRef.current?.();
      setPendingCompareOpen(false);
    }
  }, [activeTab, pendingCompareOpen]);

  if (!player && !isLoading) return null;

  const currentClub = player?.clubsPlayed?.[player.clubsPlayed.length - 1]?.clubName;
  const pStyle = player ? posStyle(player.playingPosition) : {};
  const gStyle = player?.scoutReport?.grade
    ? gradeStyle(player.scoutReport.grade)
    : null;

  const handleDownloadReportLegacy = () => {
    if (!player) return;

    const safeName = (player.name || "player")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^A-Za-z0-9_-]/g, "");
    const reportFileName = `${safeName || "player"}_report.pdf`;
    const cacheKey = buildReportCacheKey(player);
    const cachedReport = reportCacheRef.current.get(cacheKey);

    if (cachedReport?.pdfBuffer) {
      downloadPdfBuffer(
        cachedReport.pdfBuffer,
        cachedReport.fileName || reportFileName
      );
      return;
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const MARGIN = 12;
    const CONTENT_W = W - MARGIN * 2;
    const CONTENT_BOTTOM = H - 18;
    const red = [196, 22, 28];
    const dark = [15, 15, 17];
    const white = [255, 255, 255];
    const gray = [160, 160, 160];
    const panel = [248, 249, 251];

    const grade = player.scoutReport?.grade;
    const gradeColor =
      grade === "A"
        ? [52, 211, 153]
        : grade === "B"
          ? [96, 165, 250]
          : grade === "C"
            ? [251, 191, 36]
            : grade === "D"
              ? [251, 146, 60]
              : grade === "E"
                ? [248, 113, 113]
                : [156, 163, 175];

    const totalScore = player.scoutReport?.totalScore ?? 0;
    const overallScoreTen = Number((totalScore / 10).toFixed(1));
    const sr = player.scoutReport || {};

    const toText = (value) => {
      if (value == null) return FALLBACK_TEXT;
      const text = String(value).trim();
      return text ? text : FALLBACK_TEXT;
    };

    const pct = (score, max) => {
      if (score == null || max == null || max === 0) return 0;
      return Math.max(
        0,
        Math.min(100, Math.round((Number(score) / Number(max)) * 100))
      );
    };

    const scoutingStatus =
      overallScoreTen >= 8
        ? "SIGN TARGET"
        : overallScoreTen >= 6.5
          ? "DEVELOPMENT PLAYER"
          : "MONITOR";

    const finalRecommendation =
      overallScoreTen >= 8
        ? "SIGN"
        : overallScoreTen >= 6.5
          ? "MONITOR"
          : "REJECT";

    const radarMetrics = [
      { short: "Age", pct: pct(sr.ageScore ?? 0, 5) },
      { short: "Physical", pct: pct(sr.physicalScore ?? 0, 5) },
      { short: "Speed", pct: pct(sr.speedScore ?? 0, 2) },
      { short: "Mentality", pct: pct(sr.mentalityAssessment ?? 0, 2) },
      { short: "Club", pct: pct(sr.clubReputationBonus ?? 0, 3) },
      { short: "Competition", pct: pct(sr.competitionScore ?? 0, 50) },
    ];

    const dashboardMetrics = [
      { label: "Physical", score: sr.physicalScore ?? 0, max: 5 },
      { label: "Speed", score: sr.speedScore ?? 0, max: 2 },
      { label: "Mentality", score: sr.mentalityAssessment ?? 0, max: 2 },
      { label: "Competition", score: sr.competitionScore ?? 0, max: 50 },
      { label: "Transfer Market", score: sr.transferMarketScore ?? 0, max: 7.5 },
    ].map((m) => ({ ...m, pct: pct(m.score, m.max) }));

    const analysisMetrics = [
      {
        label: "Physical Profile",
        score: sr.physicalScore ?? 0,
        max: 5,
        provided: player.height != null && player.weight != null,
      },
      {
        label: "Competition Level",
        score: sr.competitionScore ?? 0,
        max: 50,
        provided: Boolean(player.competitions?.length),
      },
      {
        label: "Speed",
        score: sr.speedScore ?? 0,
        max: 2,
        provided: player.sprint30m != null,
      },
      {
        label: "Mentality",
        score: sr.mentalityAssessment ?? 0,
        max: 2,
        provided: player.mentalityScore != null || sr.mentalityAssessment != null,
      },
      {
        label: "Club Reputation",
        score: sr.clubReputationBonus ?? 0,
        max: 3,
        provided: Boolean(player.clubsPlayed?.length),
      },
      {
        label: "Transfer Market",
        score: sr.transferMarketScore ?? 0,
        max: 7.5,
        provided: Boolean(player.transferMarketLink),
      },
    ].map((m) => ({ ...m, pct: pct(m.score, m.max), text: `${m.score}/${m.max}` }));

    const strengths = analysisMetrics
      .filter((m) => m.provided)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3)
      .map((m) => `${m.label}: ${m.text}`);

    const riskPool = [
      ...analysisMetrics
        .filter((m) => m.provided && m.pct < 45)
        .sort((a, b) => a.pct - b.pct)
        .map((m) => `Low ${m.label.toLowerCase()} score (${m.text})`),
      ...(player.competitions?.length
        ? []
        : ["Competition history is limited in this profile"]),
      ...(player.sprint30m == null ? ["Sprint timing data is missing"] : []),
      ...(player.mentalityScore == null && sr.mentalityAssessment == null
        ? ["Mentality data is limited"]
        : []),
    ];

    const risks = Array.from(new Set(riskPool)).slice(0, 3);

    const tacticalSummary = [
      `${toText(player.name)} is profiled primarily as ${toText(
        player.playingPosition
      ).toLowerCase()}.`,
      `Preferred foot: ${toText(player.preferredFoot)}.`,
      overallScoreTen >= 7.5
        ? "Shows strong structure and role clarity in current data."
        : "Requires tighter tactical consistency and role-specific execution.",
    ].join(" ");

    const matchIntelSummary = player.competitions?.length
      ? `Based on ${player.competitions.length} recorded competition entries, positioning and decision quality appear most reliable in structured match environments.`
      : "Detailed match event data is currently limited. Add heatmaps and position tracking snapshots for stronger match intelligence confidence.";

    const projectedScoreTen = Number(
      Math.min(
        10,
        overallScoreTen +
          (player.age && Number(player.age) <= 21
            ? 1.1
            : player.age && Number(player.age) <= 25
              ? 0.7
              : 0.4)
      ).toFixed(1)
    );

    const projectionSummary = `${overallScoreTen.toFixed(
      1
    )}/10 current level -> ${projectedScoreTen.toFixed(
      1
    )}/10 projected level over the next 12-18 months with targeted development.`;

    const recommendationReason =
      finalRecommendation === "SIGN"
        ? "Profile is ready for active recruitment with immediate integration potential."
        : finalRecommendation === "MONITOR"
          ? "Profile shows promise. Continue tracking with updated match data and periodic reassessment."
          : "Current profile does not meet target threshold. Reassess after measurable development progress.";

    const drawMainHeader = () => {
      doc.setFillColor(...dark);
      doc.rect(0, 0, W, 30, "F");

      doc.setFillColor(...red);
      doc.rect(0, 0, 4, 30, "F");

      doc.setTextColor(...white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("FOOTBALL SCOUT REPORT", MARGIN, 12);

      doc.setTextColor(...gray);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        `Generated on ${new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}`,
        MARGIN,
        18
      );
      doc.text(`Reference: ${formatPlayerId(player.playerId)}`, MARGIN, 23);

      doc.setFillColor(...gradeColor);
      doc.roundedRect(W - 50, 5, 38, 20, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(18, 18, 20);
      doc.setFontSize(12);
      doc.text(`${overallScoreTen.toFixed(1)}/10`, W - 31, 14, {
        align: "center",
      });
      doc.setFontSize(7);
      doc.text(scoutingStatus, W - 31, 20, { align: "center" });
    };

    const drawContinuationHeader = () => {
      doc.setFillColor(246, 247, 249);
      doc.rect(0, 0, W, 18, "F");
      doc.setDrawColor(226, 228, 232);
      doc.line(MARGIN, 18, W - MARGIN, 18);
      doc.setTextColor(94, 102, 115);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`${toText(player.name)} | Football Scout Report`, MARGIN, 12);
    };

    const drawRadar = (centerX, centerY, radius, metrics) => {
      const levels = 4;
      const count = metrics.length;
      const point = (index, ratio) => {
        const angle = -Math.PI / 2 + (index * (Math.PI * 2)) / count;
        return {
          x: centerX + Math.cos(angle) * radius * ratio,
          y: centerY + Math.sin(angle) * radius * ratio,
        };
      };

      doc.setDrawColor(223, 227, 233);
      for (let level = 1; level <= levels; level += 1) {
        const r = level / levels;
        let first = null;
        let prev = null;
        for (let i = 0; i < count; i += 1) {
          const p = point(i, r);
          if (!first) first = p;
          if (prev) doc.line(prev.x, prev.y, p.x, p.y);
          prev = p;
        }
        if (first && prev) doc.line(prev.x, prev.y, first.x, first.y);
      }

      for (let i = 0; i < count; i += 1) {
        const p = point(i, 1);
        doc.line(centerX, centerY, p.x, p.y);
      }

      const dataPoints = metrics.map((metric, index) =>
        point(index, Math.max(0.08, metric.pct / 100))
      );
      if (dataPoints.length > 2) {
        const rel = dataPoints
          .slice(1)
          .map((p, idx) => [p.x - dataPoints[idx].x, p.y - dataPoints[idx].y]);
        doc.setDrawColor(...red);
        doc.setFillColor(245, 208, 210);
        doc.lines(rel, dataPoints[0].x, dataPoints[0].y, [1, 1], "FD", true);
      }

      doc.setFillColor(...red);
      dataPoints.forEach((p) => doc.circle(p.x, p.y, 1.2, "F"));

      doc.setTextColor(90, 98, 112);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      metrics.forEach((metric, index) => {
        const labelPoint = point(index, 1.2);
        doc.text(metric.short, labelPoint.x, labelPoint.y, { align: "center" });
      });
    };

    drawMainHeader();
    let y = 36;

    const ensureSpace = (requiredHeight) => {
      if (y + requiredHeight <= CONTENT_BOTTOM) return;
      doc.addPage();
      drawContinuationHeader();
      y = 24;
    };

    const drawSectionTitle = (title) => {
      doc.setFillColor(...dark);
      doc.roundedRect(MARGIN, y, CONTENT_W, 9, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.8);
      doc.setTextColor(...white);
      doc.text(title, MARGIN + 3, y + 6);
      y += 11;
    };

    ensureSpace(42);
    doc.setFillColor(...panel);
    doc.setDrawColor(226, 228, 232);
    doc.roundedRect(MARGIN, y, CONTENT_W, 36, 2, 2, "FD");
    doc.setTextColor(36, 43, 52);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`PLAYER: ${toText(player.name)}`, MARGIN + 4, y + 8);
    doc.text(`POSITION: ${toText(player.playingPosition)}`, MARGIN + 4, y + 14);
    doc.text(`CLUB: ${toText(currentClub)}`, MARGIN + 4, y + 20);
    doc.setTextColor(...gradeColor);
    doc.setFontSize(12);
    doc.text(`OVERALL: ${overallScoreTen.toFixed(1)} / 10`, W - MARGIN - 4, y + 10, {
      align: "right",
    });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`STATUS: ${scoutingStatus}`, W - MARGIN - 4, y + 18, {
      align: "right",
    });
    y += 42;

    ensureSpace(84);
    drawSectionTitle("PERFORMANCE DASHBOARD");
    const dashboardTop = y;
    const dashboardHeight = 70;
    doc.setFillColor(...panel);
    doc.setDrawColor(226, 228, 232);
    doc.roundedRect(MARGIN, dashboardTop, CONTENT_W, dashboardHeight, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(85, 93, 107);
    doc.text("Skill Radar", MARGIN + 4, dashboardTop + 7);
    drawRadar(MARGIN + 41, dashboardTop + 38, 22, radarMetrics);

    const statsX = MARGIN + 84;
    const statsW = CONTENT_W - 88;
    let statsY = dashboardTop + 7;
    dashboardMetrics.forEach((metric) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(56, 63, 74);
      doc.text(metric.label, statsX, statsY);
      doc.text(`${metric.score}/${metric.max}`, statsX + statsW, statsY, {
        align: "right",
      });
      statsY += 2;
      doc.setFillColor(229, 231, 236);
      doc.roundedRect(statsX, statsY, statsW, 2.2, 1, 1, "F");
      doc.setFillColor(...red);
      doc.roundedRect(statsX, statsY, (metric.pct / 100) * statsW, 2.2, 1, 1, "F");
      statsY += 5.4;
    });
    y = dashboardTop + dashboardHeight + 6;

    ensureSpace(40);
    drawSectionTitle("TACTICAL PROFILE");
    const tacticalLines = doc.splitTextToSize(tacticalSummary, CONTENT_W - 8);
    const tacticalHeight = Math.max(20, tacticalLines.length * 4 + 8);
    doc.setFillColor(...panel);
    doc.setDrawColor(226, 228, 232);
    doc.roundedRect(MARGIN, y, CONTENT_W, tacticalHeight, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(55, 65, 81);
    doc.text(tacticalLines, MARGIN + 4, y + 6);
    y += tacticalHeight + 6;

    ensureSpace(52);
    drawSectionTitle("MATCH INTELLIGENCE");
    const matchHeight = 40;
    doc.setFillColor(...panel);
    doc.setDrawColor(226, 228, 232);
    doc.roundedRect(MARGIN, y, CONTENT_W, matchHeight, 2, 2, "FD");
    const innerGap = 4;
    const mapBoxW = (CONTENT_W - innerGap * 3) / 2;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(MARGIN + innerGap, y + 4, mapBoxW, 17, 1.5, 1.5, "FD");
    doc.roundedRect(
      MARGIN + innerGap * 2 + mapBoxW,
      y + 4,
      mapBoxW,
      17,
      1.5,
      1.5,
      "FD"
    );
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    doc.text("Heatmap Snapshot", MARGIN + innerGap + mapBoxW / 2, y + 14, {
      align: "center",
    });
    doc.text(
      "Position Map",
      MARGIN + innerGap * 2 + mapBoxW + mapBoxW / 2,
      y + 14,
      { align: "center" }
    );
    const matchLines = doc.splitTextToSize(matchIntelSummary, CONTENT_W - 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.3);
    doc.setTextColor(75, 85, 99);
    doc.text(matchLines, MARGIN + 4, y + 28);
    y += matchHeight + 6;

    ensureSpace(38);
    drawSectionTitle("DEVELOPMENT PROJECTION");
    const projectionHeight = 26;
    doc.setFillColor(...panel);
    doc.setDrawColor(226, 228, 232);
    doc.roundedRect(MARGIN, y, CONTENT_W, projectionHeight, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.6);
    doc.setTextColor(55, 65, 81);
    doc.text(projectionSummary, MARGIN + 4, y + 8);
    doc.setFillColor(229, 231, 236);
    doc.roundedRect(MARGIN + 4, y + 13, CONTENT_W - 8, 3, 1.2, 1.2, "F");
    doc.setFillColor(...gradeColor);
    doc.roundedRect(
      MARGIN + 4,
      y + 13,
      Math.max(0, Math.min(1, projectedScoreTen / 10)) * (CONTENT_W - 8),
      3,
      1.2,
      1.2,
      "F"
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(95, 103, 116);
    doc.text(
      `Current ${overallScoreTen.toFixed(1)} -> Future ${projectedScoreTen.toFixed(1)}`,
      MARGIN + 4,
      y + 21
    );
    y += projectionHeight + 6;

    ensureSpace(58);
    drawSectionTitle("STRENGTHS VS RISKS");
    const splitHeight = 48;
    const colGap = 4;
    const colW = (CONTENT_W - colGap) / 2;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(MARGIN, y, colW, splitHeight, 2, 2, "FD");
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 205, 211);
    doc.roundedRect(MARGIN + colW + colGap, y, colW, splitHeight, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.4);
    doc.setTextColor(22, 101, 52);
    doc.text("Strengths", MARGIN + 3, y + 6);
    doc.setTextColor(153, 27, 27);
    doc.text("Risks", MARGIN + colW + colGap + 3, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.7);
    const strengthLines = (
      strengths.length
        ? strengths
        : ["No dominant strength detected from current metrics"]
    ).flatMap((item) => doc.splitTextToSize(`- ${item}`, colW - 6));
    const riskLines = (
      risks.length
        ? risks
        : ["No immediate high-priority risk flagged in available data"]
    ).flatMap((item) => doc.splitTextToSize(`- ${item}`, colW - 6));
    doc.setTextColor(22, 101, 52);
    doc.text(strengthLines.slice(0, 8), MARGIN + 3, y + 11);
    doc.setTextColor(153, 27, 27);
    doc.text(riskLines.slice(0, 8), MARGIN + colW + colGap + 3, y + 11);
    y += splitHeight + 6;

    ensureSpace(36);
    drawSectionTitle("FINAL RECOMMENDATION");
    const recommendationHeight = 24;
    const recommendationColor =
      finalRecommendation === "SIGN"
        ? [34, 197, 94]
        : finalRecommendation === "MONITOR"
          ? [245, 158, 11]
          : [239, 68, 68];
    const recommendationTint = recommendationColor.map((value) =>
      Math.min(255, value + 180)
    );
    doc.setFillColor(...recommendationTint);
    doc.setDrawColor(...recommendationColor);
    doc.roundedRect(MARGIN, y, CONTENT_W, recommendationHeight, 2, 2, "FD");
    doc.setTextColor(20, 24, 31);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Recommendation: ${finalRecommendation}`, MARGIN + 4, y + 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.3);
    const recommendationLines = doc.splitTextToSize(
      recommendationReason,
      CONTENT_W - 8
    );
    doc.text(recommendationLines, MARGIN + 4, y + 15);

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(228, 231, 235);
      doc.roundedRect(6, 6, W - 12, 285, 1.5, 1.5, "S");
      doc.setDrawColor(220, 220, 220);
      doc.line(MARGIN, 285, W - MARGIN, 285);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...gray);
      doc.text(
        "Pro Talent Connect | Confidential scouting report for authorized recruitment use",
        MARGIN,
        290
      );
      doc.text(`Page ${i} of ${pageCount}`, W - MARGIN, 290, { align: "right" });
    }

    const pdfBuffer = doc.output("arraybuffer");
    reportCacheRef.current.set(cacheKey, {
      pdfBuffer,
      fileName: reportFileName,
    });

    if (reportCacheRef.current.size > REPORT_CACHE_LIMIT) {
      const oldestKey = reportCacheRef.current.keys().next().value;
      reportCacheRef.current.delete(oldestKey);
    }

    downloadPdfBuffer(pdfBuffer, reportFileName);
  };

  const handleDownloadReport = async () => {
    if (!player) return;

    const safeName = (player.name || "player")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^A-Za-z0-9_-]/g, "");
    const reportFileName = `${safeName || "player"}_report.pdf`;
    const cacheKey = buildReportCacheKey(player);
    const cachedReport = reportCacheRef.current.get(cacheKey);

    if (cachedReport?.pdfBuffer) {
      downloadPdfBuffer(cachedReport.pdfBuffer, cachedReport.fileName || reportFileName);
      return;
    }

    try {
      const pdfBuffer = await buildScoutReportPdfBuffer({ player, currentClub });

      reportCacheRef.current.set(cacheKey, {
        pdfBuffer,
        fileName: reportFileName,
      });

      if (reportCacheRef.current.size > REPORT_CACHE_LIMIT) {
        const oldestKey = reportCacheRef.current.keys().next().value;
        reportCacheRef.current.delete(oldestKey);
      }

      downloadPdfBuffer(pdfBuffer, reportFileName);
    } catch (error) {
      console.error("React PDF generation failed. Falling back to legacy exporter.", error);
      handleDownloadReportLegacy();
    }
  };

  const handleOpenCompare = () => {
    if (activeTab !== "overview") {
      setPendingCompareOpen(true);
      setActiveTab("overview");
      return;
    }
    compareOpenerRef.current?.();
  };

  const mobileActionColumns = player.email ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden bg-[#0B0B0D] text-white">
      {isLoading ? (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <DetailSkeleton />
        </div>
      ) : (
        <>
          <div className="sticky top-0 z-20">
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

            <div className="bg-[#0E0E12] border-b border-white/[0.07]">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-start gap-3 sm:gap-5">
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

                <div className="flex-1 min-w-0">
                  {player.scoutReport?.totalScore > 0 && gStyle && (
                    <div className="sm:hidden flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${gStyle.bg} ${gStyle.color} ${gStyle.border}`}
                      >
                        Grade {player.scoutReport.grade}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold tabular-nums border ${gStyle.bg} ${gStyle.color} ${gStyle.border}`}
                      >
                        {player.scoutReport.totalScore}
                        <span className="text-[10px] font-medium text-gray-500 ml-1">/100</span>
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <h1 className="text-[1.55rem] sm:text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
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

                  <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-5 gap-y-1 text-[13px] sm:text-sm text-gray-500 mb-3">
                    {currentClub && (
                      <span className="font-semibold text-gray-200">{currentClub}</span>
                    )}
                    {player.age && <span>{player.age} years</span>}
                    {player.nationality && <span>{player.nationality}</span>}
                    {player.state && <span>{player.state}</span>}
                    {player.preferredFoot && <span>{player.preferredFoot} foot</span>}
                  </div>

                  {player.scoutReport?.totalScore > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-32 sm:w-36 h-3 bg-white/[0.05] rounded-full overflow-hidden">
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
                      <span className="text-xs text-gray-500">{gStyle?.label}</span>
                    </div>
                  )}

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

            <div
              key={player?._id}
              className="bg-[#0B0B0D] border-b border-white/[0.07]"
            >
              <div className="max-w-6xl mx-auto">
                <TabBar active={activeTab} setActive={setActiveTab} />
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
            {activeTab === "overview" && (
              <OverviewTab
                player={player}
                onDownload={handleDownloadReport}
                onRegisterCompareOpener={(opener) => {
                  compareOpenerRef.current = opener;
                }}
              />
            )}

            <Suspense fallback={<TabFallback />}>
              {activeTab === "scout" && <ScoutReportTab player={player} />}
              {activeTab === "career" && <CareerTab player={player} />}
              {activeTab === "competitions" && (
                <CompetitionsTab player={player} />
              )}
              {activeTab === "analytics" && <AnalyticsTab player={player} />}
            </Suspense>
          </div>

          <div
            className={`sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0B0D]/96 backdrop-blur-md border-t border-white/[0.09] px-4 py-3 grid ${mobileActionColumns} gap-2`}
          >
            <button
              onClick={handleOpenCompare}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-sm font-semibold transition-colors hover:bg-white/[0.1]"
            >
              <ScaleIcon className="w-4 h-4" />
              Compare
            </button>
            <button
              onClick={handleDownloadReport}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#C4161C] hover:bg-[#a81218] text-white text-sm font-semibold transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download
            </button>
            {player.email && (
              <a
                href={`mailto:${player.email}`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-gray-300 text-sm font-semibold transition-colors hover:bg-white/[0.08]"
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
