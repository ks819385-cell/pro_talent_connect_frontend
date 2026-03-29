import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { T, card, tH, tD, tDW } from "./tokens";
import { Badge } from "./primitives";

const PAGE_SIZE = 10;

const CompetitionsTab = ({ player }) => {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("all");

  const all = player.competitions || [];
  const types = ["all", ...new Set(all.map((c) => c.type).filter(Boolean))];
  const filtered =
    filter === "all" ? all : all.filter((c) => c.type === filter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const current = filtered.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <div className="space-y-4">
      {/* Type filter controls */}
      <div className={card + " px-4 py-3 flex flex-wrap items-center gap-2"}>
        <span className={T.labelText + " mr-1"}>Type:</span>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => {
              setFilter(t);
              setPage(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === t
                ? "bg-[#C4161C]/10 text-red-400 border border-[#C4161C]/20"
                : "text-gray-400 hover:bg-white/[0.04]"
            }`}
          >
            {t === "all"
              ? `All (${all.length})`
              : `${t} (${all.filter((c) => c.type === t).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={card + " overflow-hidden"}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h2 className={T.sectionTitle}>Competitions</h2>
          <span className="text-xs text-gray-500">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        {current.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-10">
            No competitions found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className={tH}>#</th>
                  <th className={tH}>Competition</th>
                  <th className={tH + " hidden sm:table-cell"}>Type</th>
                  <th className={tH + " text-center"}>Year</th>
                  <th className={tH + " text-right"}>Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {current.map((c, i) => (
                  <tr
                    key={i}
                    className="hover:bg-white/[0.025] transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-gray-600 w-9 tabular-nums">
                      {page * PAGE_SIZE + i + 1}
                    </td>
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.07]">
            <p className="text-xs text-gray-500">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionsTab;
