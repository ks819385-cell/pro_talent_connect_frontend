import { TrophyIcon } from "@heroicons/react/24/outline";
import { T, card, tH, tD, tDW } from "./tokens";
import { Badge } from "./primitives";

const CareerTab = ({ player }) => {
  const clubs = [...(player.clubsPlayed || [])].reverse();
  const hasClubs = clubs.length > 0;

  return (
    <div className="space-y-5">
      {/* Club History */}
      <div className={card + " overflow-hidden"}>
        <div className="px-5 py-4 border-b border-white/[0.07]">
          <h2 className={T.sectionTitle}>Club History</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Career timeline — most recent first
          </p>
        </div>
        {!hasClubs ? (
          <p className="text-gray-600 text-sm text-center py-10">
            No club history recorded.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className={tH}>#</th>
                  <th className={tH}>Club</th>
                  <th className={tH + " text-right"}>Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {clubs.map((club, i) => (
                  <tr
                    key={i}
                    className="hover:bg-white/[0.025] transition-colors"
                  >
                    <td className="px-4 py-3.5 text-sm text-gray-600 w-10 tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0 overflow-hidden">
                          {club.clubLogo ? (
                            <img
                              src={club.clubLogo}
                              alt={club.clubName}
                              className="w-full h-full object-contain"
                              onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
                            />
                          ) : null}
                          <TrophyIcon
                            className="w-3.5 h-3.5 text-gray-600"
                            style={{ display: club.clubLogo ? "none" : "block" }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-100">
                          {club.clubName}
                        </span>
                        {i === 0 && <Badge label="Current" variant="green" />}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-400 text-right tabular-nums">
                      {club.duration || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Competitions Summary */}
      {player.competitions?.length > 0 && (
        <div className={card + " overflow-hidden"}>
          <div className="px-5 py-4 border-b border-white/[0.07]">
            <h2 className={T.sectionTitle}>Competition History</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {player.competitions.length} competition
              {player.competitions.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
          <div className="overflow-x-auto">
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
                {player.competitions.map((c, i) => (
                  <tr
                    key={i}
                    className="hover:bg-white/[0.025] transition-colors"
                  >
                    <td className={tDW}>{c.name}</td>
                    <td className={tD + " hidden sm:table-cell text-gray-500"}>
                      {c.type}
                    </td>
                    <td
                      className={tD + " text-center text-gray-500 tabular-nums"}
                    >
                      {c.year}
                    </td>
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
    </div>
  );
};

export default CareerTab;
