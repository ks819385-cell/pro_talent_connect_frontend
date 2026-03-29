import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { T, card, tH, tD, tDW, gradeStyle } from "./tokens";
import { Badge } from "./primitives";

const ScoutReportTab = ({ player }) => {
  const report = player.scoutReport;

  if (!report) {
    return (
      <div className={card + " p-16 text-center"}>
        <ExclamationCircleIcon className="w-10 h-10 text-gray-700 mx-auto mb-3" />
        <p className="text-gray-500">
          No scout report available for this player.
        </p>
      </div>
    );
  }

  const gStyle = gradeStyle(report.grade);

  const breakdown = [
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
      label: "Speed (Sprint 30m)",
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
  ];

  const provided = breakdown.filter((b) => !b.missing).length;
  const completeness = Math.round((provided / breakdown.length) * 100);

  return (
    <div className="space-y-5">
      {/* Summary hero */}
      <div className={card + " p-6"}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <p className={T.labelText}>Overall Score</p>
            <div className="flex items-end gap-2 mt-2">
              <span
                className={`text-[56px] leading-none font-black tabular-nums ${gStyle.color}`}
              >
                {report.totalScore}
              </span>
              <span className="text-gray-600 text-xl mb-2">/100</span>
            </div>
          </div>
          <div>
            <p className={T.labelText}>Grade</p>
            <div className="mt-2">
              <span
                className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-bold border ${gStyle.bg} ${gStyle.color} ${gStyle.border}`}
              >
                Grade {report.grade} — {gStyle.label}
              </span>
            </div>
          </div>
          <div>
            <p className={T.labelText}>Profile Completeness</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-2xl font-black tabular-nums text-white">
                {completeness}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full rounded-full bg-blue-500/80"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${report.totalScore}%`,
              backgroundColor: gStyle.bar,
            }}
          />
        </div>
      </div>

      {/* Breakdown table */}
      <div className={card + " overflow-hidden"}>
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <p className={T.sectionTitle}>Score Breakdown</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Individual metric scores contributing to total
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className={tH}>Metric</th>
                <th className={tH + " hidden sm:table-cell"}>Progress</th>
                <th className={tH + " text-right"}>Score</th>
                <th className={tH + " text-right"}>Max</th>
                <th className={tH + " text-right"}>%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {breakdown.map((b, i) => {
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
                    <td className="px-4 py-3 hidden sm:table-cell">
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
    </div>
  );
};

export default ScoutReportTab;
