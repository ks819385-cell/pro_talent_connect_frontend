import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Svg,
  Line,
  Polygon,
  Circle,
} from "@react-pdf/renderer";

const FALLBACK_TEXT = "N/A";

const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingHorizontal: 24,
    paddingBottom: 56,
    fontSize: 10,
    color: "#10141F",
    backgroundColor: "#F7F8FB",
  },
  header: {
    backgroundColor: "#0F1117",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  reportTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 0.25,
  },
  reportMeta: {
    marginTop: 4,
    color: "#B4BBCB",
    fontSize: 8,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    border: "1px solid #E5E7EE",
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  heroLeft: {
    flexGrow: 1,
    flexBasis: 0,
    gap: 4,
  },
  heroLabel: {
    color: "#5F6678",
    fontSize: 8,
    fontWeight: 600,
  },
  heroValue: {
    color: "#1B2130",
    fontSize: 10,
    fontWeight: 700,
  },
  overallBox: {
    minWidth: 120,
    borderRadius: 8,
    border: "1px solid #E5E7EE",
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: "center",
    gap: 4,
  },
  overallScore: {
    fontSize: 18,
    fontWeight: 800,
  },
  overallStatus: {
    fontSize: 8,
    color: "#5F6678",
    fontWeight: 700,
  },
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    backgroundColor: "#171A24",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 9,
    marginBottom: 6,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  sectionBody: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    border: "1px solid #E5E7EE",
    padding: 10,
  },
  dashboardGrid: {
    flexDirection: "row",
    gap: 10,
  },
  radarWrap: {
    width: 165,
    paddingTop: 2,
    gap: 4,
  },
  radarCaption: {
    color: "#5F6678",
    fontSize: 8,
    fontWeight: 700,
  },
  statWrap: {
    flexGrow: 1,
    flexBasis: 0,
    gap: 6,
  },
  statCard: {
    border: "1px solid #EEF0F5",
    borderRadius: 6,
    padding: 6,
    gap: 3,
    backgroundColor: "#FCFCFE",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 8,
    color: "#4D5466",
    fontWeight: 600,
  },
  statValue: {
    fontSize: 8,
    color: "#111827",
    fontWeight: 700,
  },
  barTrack: {
    height: 4,
    borderRadius: 6,
    backgroundColor: "#E8EAF0",
  },
  barFill: {
    height: 4,
    borderRadius: 6,
    backgroundColor: "#C4161C",
  },
  bodyText: {
    color: "#2D3342",
    fontSize: 9,
    lineHeight: 1.45,
  },
  projectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  projectionLevel: {
    fontSize: 8,
    color: "#5F6678",
    fontWeight: 700,
  },
  projectionScore: {
    fontSize: 11,
    color: "#111827",
    fontWeight: 800,
  },
  strengthRiskWrap: {
    flexDirection: "row",
    gap: 8,
  },
  columnCard: {
    flexGrow: 1,
    flexBasis: 0,
    borderRadius: 7,
    border: "1px solid #EBEDF3",
    padding: 8,
    gap: 4,
    minHeight: 84,
  },
  strengthCard: {
    backgroundColor: "#F1FCF5",
    borderColor: "#D8F4E2",
  },
  riskCard: {
    backgroundColor: "#FFF4F4",
    borderColor: "#FFDADF",
  },
  columnTitle: {
    fontSize: 8,
    fontWeight: 700,
  },
  strengthTitle: {
    color: "#0B7A34",
  },
  riskTitle: {
    color: "#B42332",
  },
  bullet: {
    fontSize: 8,
    color: "#3E4658",
    lineHeight: 1.35,
  },
  footer: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 16,
    borderTop: "1px solid #E5E7EE",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F7F8FB",
  },
  footerText: {
    fontSize: 7,
    color: "#8A90A2",
  },
});

const toText = (value) => {
  if (value == null) return FALLBACK_TEXT;
  const text = String(value).trim();
  return text || FALLBACK_TEXT;
};

const toPct = (score, max) => {
  if (score == null || max == null || max === 0) return 0;
  return Math.max(0, Math.min(100, Math.round((Number(score) / Number(max)) * 100)));
};

const getStatus = (overallScoreTen) => {
  if (overallScoreTen >= 8) return "SIGN TARGET";
  if (overallScoreTen >= 6.5) return "DEVELOPMENT PLAYER";
  return "MONITOR";
};

const buildReportPayload = (player, currentClub) => {
  const report = player?.scoutReport || {};
  const totalScore = Number(report.totalScore ?? 0);
  const overallScoreTen = Number((totalScore / 10).toFixed(1));
  const scoutingStatus = getStatus(overallScoreTen);

  const metrics = [
    { label: "Age", score: report.ageScore ?? 0, max: 5 },
    { label: "Physical", score: report.physicalScore ?? 0, max: 5 },
    { label: "Speed", score: report.speedScore ?? 0, max: 2 },
    { label: "Mentality", score: report.mentalityAssessment ?? 0, max: 2 },
    { label: "Club", score: report.clubReputationBonus ?? 0, max: 3 },
    { label: "Competition", score: report.competitionScore ?? 0, max: 50 },
  ].map((item) => ({ ...item, pct: toPct(item.score, item.max) }));

  const dashboardMetrics = [
    { label: "Physical", score: report.physicalScore ?? 0, max: 5 },
    { label: "Speed", score: report.speedScore ?? 0, max: 2 },
    { label: "Mentality", score: report.mentalityAssessment ?? 0, max: 2 },
    { label: "Competition", score: report.competitionScore ?? 0, max: 50 },
    { label: "Transfer Market", score: report.transferMarketScore ?? 0, max: 7.5 },
  ].map((item) => ({ ...item, pct: toPct(item.score, item.max) }));

  const analysisMetrics = [
    {
      label: "Physical profile",
      score: report.physicalScore ?? 0,
      max: 5,
      provided: player.height != null && player.weight != null,
    },
    {
      label: "Competition level",
      score: report.competitionScore ?? 0,
      max: 50,
      provided: Boolean(player.competitions?.length),
    },
    {
      label: "Speed",
      score: report.speedScore ?? 0,
      max: 2,
      provided: player.sprint30m != null,
    },
    {
      label: "Mentality",
      score: report.mentalityAssessment ?? 0,
      max: 2,
      provided: player.mentalityScore != null || report.mentalityAssessment != null,
    },
    {
      label: "Club reputation",
      score: report.clubReputationBonus ?? 0,
      max: 3,
      provided: Boolean(player.clubsPlayed?.length),
    },
  ].map((item) => ({ ...item, pct: toPct(item.score, item.max) }));

  const strengths = analysisMetrics
    .filter((item) => item.provided)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)
    .map((item) => `${item.label}: ${item.score}/${item.max}`);

  const risks = [
    ...analysisMetrics
      .filter((item) => item.provided && item.pct < 45)
      .sort((a, b) => a.pct - b.pct)
      .map((item) => `Low ${item.label} score (${item.score}/${item.max})`),
    ...(player.competitions?.length
      ? []
      : ["Competition history is limited in this profile"]),
    ...(player.sprint30m == null ? ["Sprint timing data is missing"] : []),
  ];

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

  const tacticalSummary = `${toText(player.name)} is profiled primarily as ${toText(
    player.playingPosition
  ).toLowerCase()}. Preferred foot: ${toText(player.preferredFoot)}.`;

  const projectionSummary = `${overallScoreTen.toFixed(1)}/10 current level to ${projectedScoreTen.toFixed(
    1
  )}/10 projected level over the next 12-18 months with focused development.`;

  return {
    generatedOn: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    reportId: toText(player.playerId),
    name: toText(player.name),
    position: toText(player.playingPosition),
    club: toText(currentClub),
    overallScoreTen,
    scoutingStatus,
    metrics,
    dashboardMetrics,
    tacticalSummary,
    projectionSummary,
    projectedScoreTen,
    strengths: strengths.length ? strengths : ["No dominant strength detected from current metrics"],
    risks: risks.length ? risks.slice(0, 3) : ["No immediate high-priority risk flagged in available data"],
  };
};

const RadarGraphic = ({ metrics }) => {
  const centerX = 64;
  const centerY = 58;
  const radius = 34;
  const levels = 4;
  const count = metrics.length;

  const point = (index, ratio) => {
    const angle = -Math.PI / 2 + (index * (Math.PI * 2)) / count;
    return {
      x: centerX + Math.cos(angle) * radius * ratio,
      y: centerY + Math.sin(angle) * radius * ratio,
    };
  };

  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const ratio = (level + 1) / levels;
    return metrics
      .map((_, idx) => {
        const p = point(idx, ratio);
        return `${p.x},${p.y}`;
      })
      .join(" ");
  });

  const dataPolygon = metrics
    .map((m, idx) => {
      const p = point(idx, Math.max(0.08, m.pct / 100));
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <Svg viewBox="0 0 128 120" style={{ width: 128, height: 120 }}>
      {gridPolygons.map((poly, idx) => (
        <Polygon
          key={`grid-${idx}`}
          points={poly}
          stroke="#DCE0E8"
          strokeWidth={0.8}
          fill="none"
        />
      ))}
      {metrics.map((_, idx) => {
        const p = point(idx, 1);
        return (
          <Line
            key={`line-${idx}`}
            x1={centerX}
            y1={centerY}
            x2={p.x}
            y2={p.y}
            stroke="#DCE0E8"
            strokeWidth={0.8}
          />
        );
      })}
      <Polygon points={dataPolygon} fill="#FAD7DB" stroke="#C4161C" strokeWidth={1.2} />
      {metrics.map((m, idx) => {
        const p = point(idx, Math.max(0.08, m.pct / 100));
        return <Circle key={`dot-${m.label}`} cx={p.x} cy={p.y} r={1.5} fill="#C4161C" />;
      })}
    </Svg>
  );
};

const ScoutReportDocument = ({ payload }) => (
  <Document title={`Scout Report - ${payload.name}`}>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.reportTitle}>FOOTBALL SCOUT REPORT</Text>
        <Text style={styles.reportMeta}>Generated on {payload.generatedOn}</Text>
        <Text style={styles.reportMeta}>Reference: {payload.reportId}</Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroLabel}>PLAYER</Text>
          <Text style={styles.heroValue}>{payload.name}</Text>
          <Text style={styles.heroLabel}>POSITION</Text>
          <Text style={styles.heroValue}>{payload.position}</Text>
          <Text style={styles.heroLabel}>CLUB</Text>
          <Text style={styles.heroValue}>{payload.club}</Text>
        </View>
        <View style={[styles.overallBox, { backgroundColor: "#FCF3F4" }]}>
          <Text style={[styles.heroLabel, { color: "#7B1320" }]}>OVERALL</Text>
          <Text style={[styles.overallScore, { color: "#C4161C" }]}>
            {payload.overallScoreTen.toFixed(1)} / 10
          </Text>
          <Text style={styles.overallStatus}>{payload.scoutingStatus}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PERFORMANCE DASHBOARD</Text>
        </View>
        <View style={styles.sectionBody}>
          <View style={styles.dashboardGrid}>
            <View style={styles.radarWrap}>
              <Text style={styles.radarCaption}>Skill Radar</Text>
              <RadarGraphic metrics={payload.metrics} />
            </View>
            <View style={styles.statWrap}>
              {payload.dashboardMetrics.map((metric) => (
                <View key={metric.label} style={styles.statCard}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>{metric.label}</Text>
                    <Text style={styles.statValue}>{metric.score}/{metric.max}</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${metric.pct}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TACTICAL PROFILE</Text>
        </View>
        <View style={styles.sectionBody}>
          <Text style={styles.bodyText}>{payload.tacticalSummary}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DEVELOPMENT PROJECTION</Text>
        </View>
        <View style={styles.sectionBody}>
          <View style={styles.projectionRow}>
            <Text style={styles.projectionLevel}>Current Level</Text>
            <Text style={styles.projectionScore}>{payload.overallScoreTen.toFixed(1)} / 10</Text>
            <Text style={styles.projectionLevel}>Projected Level</Text>
            <Text style={styles.projectionScore}>{payload.projectedScoreTen.toFixed(1)} / 10</Text>
          </View>
          <Text style={styles.bodyText}>{payload.projectionSummary}</Text>
        </View>
      </View>

      <View style={styles.section} wrap={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>STRENGTHS VS RISKS</Text>
        </View>
        <View style={[styles.sectionBody, styles.strengthRiskWrap]}>
          <View style={[styles.columnCard, styles.strengthCard]}>
            <Text style={[styles.columnTitle, styles.strengthTitle]}>Strengths</Text>
            {payload.strengths.map((item, idx) => (
              <Text key={`strength-${idx}`} style={styles.bullet}>- {item}</Text>
            ))}
          </View>
          <View style={[styles.columnCard, styles.riskCard]}>
            <Text style={[styles.columnTitle, styles.riskTitle]}>Risks</Text>
            {payload.risks.map((item, idx) => (
              <Text key={`risk-${idx}`} style={styles.bullet}>- {item}</Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>
          Pro Talent Connect | Confidential scouting report for authorized recruitment use
        </Text>
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </View>
    </Page>
  </Document>
);

export const buildScoutReportPdfBuffer = async ({ player, currentClub }) => {
  const payload = buildReportPayload(player, currentClub);
  const blob = await pdf(<ScoutReportDocument payload={payload} />).toBlob();
  return blob.arrayBuffer();
};
