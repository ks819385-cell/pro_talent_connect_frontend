import {
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { card } from "./tokens";
import { Badge, RadarChart } from "./primitives";

const AnalyticsTab = ({ player }) => {
  const report = player.scoutReport;

  const radarAxes = report
    ? [
        {
          label: "Age",
          value: Math.min(((report.ageScore ?? 0) / 5) * 100, 100),
        },
        {
          label: "Physical",
          value: Math.min(((report.physicalScore ?? 0) / 5) * 100, 100),
        },
        {
          label: "Speed",
          value: Math.min(((report.speedScore ?? 0) / 2) * 100, 100),
        },
        {
          label: "Mentality",
          value: Math.min(((report.mentalityAssessment ?? 0) / 2) * 100, 100),
        },
        {
          label: "Club",
          value: Math.min(((report.clubReputationBonus ?? 0) / 3) * 100, 100),
        },
        {
          label: "Competition",
          value: Math.min(((report.competitionScore ?? 0) / 50) * 100, 100),
        },
      ]
    : [];

  const attributes = report
    ? [
        {
          label: "Age Prospect",
          present: !!player.age,
          score: report.ageScore,
          max: 5,
        },
        {
          label: "Physical Build",
          present: !!(player.height && player.weight),
          score: report.physicalScore,
          max: 5,
        },
        {
          label: "Speed",
          present: !!player.sprint30m,
          score: report.speedScore,
          max: 2,
        },
        {
          label: "Mentality",
          present: player.mentalityScore != null,
          score: report.mentalityAssessment,
          max: 2,
        },
        {
          label: "Club Reputation",
          present: !!player.clubsPlayed?.length,
          score: report.clubReputationBonus,
          max: 3,
        },
        {
          label: "Competition Level",
          present: !!player.competitions?.length,
          score: report.competitionScore,
          max: 50,
        },
        {
          label: "Transfer Market",
          present: !!player.transferMarketLink,
          score: report.transferMarketScore,
          max: 7.5,
        },
        {
          label: "State League",
          present: !!player.stateLeague,
          score: report.stateLeagueBonus,
          max: 2,
        },
      ]
    : [];

  const strengths = attributes.filter(
    (a) => a.present && a.score / a.max >= 0.6,
  );
  const weaknesses = attributes.filter(
    (a) => !a.present || (a.present && a.score / a.max < 0.3),
  );

  if (!report) {
    return (
      <div className={card + " p-12 text-center"}>
        <ChartBarIcon className="w-10 h-10 text-gray-700 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No analytics data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Radar + attribute bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={card + " p-5"}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Skill Radar
          </h2>
          <RadarChart axes={radarAxes} />
        </div>

        <div className={card + " p-5"}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Attribute Breakdown
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "Age Prospect",
                val: Math.min(((report.ageScore ?? 0) / 5) * 100, 100),
              },
              {
                label: "Physical",
                val: Math.min(((report.physicalScore ?? 0) / 5) * 100, 100),
              },
              {
                label: "Competition Level",
                val: Math.min(((report.competitionScore ?? 0) / 50) * 100, 100),
              },
              {
                label: "Speed",
                val: Math.min(((report.speedScore ?? 0) / 2) * 100, 100),
              },
              {
                label: "Mentality",
                val: Math.min(
                  ((report.mentalityAssessment ?? 0) / 2) * 100,
                  100,
                ),
              },
              {
                label: "Club Reputation",
                val: Math.min(
                  ((report.clubReputationBonus ?? 0) / 3) * 100,
                  100,
                ),
              },
            ].map(({ label, val }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-semibold text-white">
                    {Math.round(val)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${val}%`,
                      backgroundColor:
                        val >= 70
                          ? "#34D399"
                          : val >= 40
                            ? "#FBBF24"
                            : "#F87171",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className={card + " p-5"}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Strengths
          </h2>
          <div className="space-y-2">
            {strengths.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircleIcon className="w-4 h-4 text-green-400 shrink-0" />
                <div className="flex flex-1 items-center justify-between">
                  <span className="text-sm text-gray-300">{s.label}</span>
                  <span className="text-xs font-semibold text-green-400">
                    {Math.round((s.score / s.max) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weaknesses / Gaps */}
      {weaknesses.length > 0 && (
        <div className={card + " p-5"}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Data Gaps & Weak Areas
          </h2>
          <div className="space-y-2">
            {weaknesses.map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <ExclamationCircleIcon className="w-4 h-4 text-orange-400 shrink-0" />
                <div className="flex flex-1 items-center justify-between">
                  <span className="text-sm text-gray-400">{w.label}</span>
                  {!w.present ? (
                    <Badge label="Missing data" variant="gray" />
                  ) : (
                    <span className="text-xs font-semibold text-orange-400">
                      {Math.round((w.score / w.max) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Readiness */}
      <div className={card + " p-5"}>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Comparison Readiness
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Profile Complete",
              ready: attributes.filter((a) => a.present).length >= 5,
            },
            { label: "Scout Score", ready: (report.totalScore ?? 0) > 0 },
            { label: "Club History", ready: !!player.clubsPlayed?.length },
            {
              label: "Competition Data",
              ready: !!player.competitions?.length,
            },
          ].map(({ label, ready }) => (
            <div
              key={label}
              className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 flex flex-col items-center gap-2"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${ready ? "bg-green-500/10" : "bg-gray-700/50"}`}
              >
                {ready ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                ) : (
                  <ExclamationCircleIcon className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <p className="text-[10px] text-center text-gray-500 leading-tight">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
