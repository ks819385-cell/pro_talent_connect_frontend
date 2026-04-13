import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";

const fmt = (d) => d.toISOString().slice(0, 10);
const today = () => fmt(new Date());
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return fmt(d); };
const firstOfMonth = () => { const d = new Date(); d.setDate(1); return fmt(d); };

const DATE_PRESETS = [
  { label: "Today",       start: () => today(),         end: () => today() },
  { label: "Yesterday",   start: () => daysAgo(1),      end: () => daysAgo(1) },
  { label: "Last 7 days", start: () => daysAgo(6),      end: () => today() },
  { label: "Last 30 days",start: () => daysAgo(29),     end: () => today() },
  { label: "This month",  start: () => firstOfMonth(),  end: () => today() },
];

const ACTION_COLORS = {
  CREATE: "bg-green-500/20 text-green-400",
  UPDATE: "bg-blue-500/20 text-blue-400",
  DELETE: "bg-red-500/20 text-red-400",
  LOGIN: "bg-cyan-500/20 text-cyan-400",
  LOGOUT: "bg-gray-500/20 text-gray-400",
  PASSWORD_CHANGE: "bg-yellow-500/20 text-yellow-400",
  ROLE_CHANGE: "bg-purple-500/20 text-purple-400",
};

const RESOURCE_ICONS = {
  Admin: "👤",
  Player: "⚽",
  Blog: "📝",
  About: "ℹ️",
  Auth: "🔐",
};

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Expanded log detail
  const [expandedLog, setExpandedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, limit: 20 };
      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource_type = resourceFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await api.getAuditLogs(params);
      setLogs(res.data?.logs || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalResults(res.data?.totalResults || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, resourceFilter, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const clearFilters = () => {
    setActionFilter("");
    setResourceFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasFilters = actionFilter || resourceFilter || startDate || endDate;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Audit Logs</h3>
          <p className="text-sm text-gray-500 mt-1">
            {totalResults} total log entries
          </p>
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all border border-white/10 text-gray-400"
          >
            Clear Filters
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50"
        >
          <option value="" className="bg-gray-900">All Actions</option>
          <option value="CREATE" className="bg-gray-900">Create</option>
          <option value="UPDATE" className="bg-gray-900">Update</option>
          <option value="DELETE" className="bg-gray-900">Delete</option>
          <option value="LOGIN" className="bg-gray-900">Login</option>
          <option value="LOGOUT" className="bg-gray-900">Logout</option>
          <option value="PASSWORD_CHANGE" className="bg-gray-900">Password Change</option>
          <option value="ROLE_CHANGE" className="bg-gray-900">Role Change</option>
        </select>
        <select
          value={resourceFilter}
          onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50"
        >
          <option value="" className="bg-gray-900">All Resources</option>
          <option value="Admin" className="bg-gray-900">Admin</option>
          <option value="Player" className="bg-gray-900">Player</option>
          <option value="Blog" className="bg-gray-900">Blog</option>
          <option value="About" className="bg-gray-900">About</option>
          <option value="Auth" className="bg-gray-900">Auth</option>
        </select>
        {/* Quick date presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {DATE_PRESETS.map((p) => {
            const active = startDate === p.start() && endDate === p.end();
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => { setStartDate(p.start()); setEndDate(p.end()); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  active
                    ? "bg-red-500/20 border-red-500/50 text-red-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            );
          })}
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => { setStartDate(""); setEndDate(""); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 bg-white/5 text-gray-500 hover:text-red-400 hover:border-red-500/40 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Log entries */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {hasFilters ? "No logs match the current filters." : "No audit logs found."}
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log._id} className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/[0.07] transition-all">
              <div
                className="p-4 cursor-pointer flex items-start gap-3"
                onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
              >
                {/* Resource icon */}
                <span className="text-lg shrink-0 mt-0.5">
                  {RESOURCE_ICONS[log.resource_type] || "📋"}
                </span>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[log.action] || "bg-gray-500/20 text-gray-400"}`}>
                      {log.action}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400 border border-white/10">
                      {log.resource_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${log.status === "SUCCESS" ? "text-green-400" : "text-red-400"}`}>
                      {log.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 truncate">{log.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{log.user_name} ({log.user_role})</span>
                    <span>•</span>
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Expand indicator */}
                <span className={`text-gray-500 transition-transform shrink-0 ${expandedLog === log._id ? "rotate-180" : ""}`}>
                  ▾
                </span>
              </div>

              {/* Expanded detail */}
              {expandedLog === log._id && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">User</p>
                      <p className="text-gray-300">{log.user_name} ({log.user_email})</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Resource ID</p>
                      <p className="text-gray-300 font-mono text-xs">{log.resource_id || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">IP Address</p>
                      <p className="text-gray-300 font-mono text-xs">{log.ip_address || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Timestamp</p>
                      <p className="text-gray-300">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {log.changes && (
                    <div className="mt-3">
                      <p className="text-gray-500 text-xs mb-1">Changes</p>
                      <pre className="text-xs text-gray-400 bg-black/30 rounded-lg p-3 overflow-x-auto max-h-40">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    </div>
                  )}

                  {log.user_agent && (
                    <div className="mt-3">
                      <p className="text-gray-500 text-xs mb-1">User Agent</p>
                      <p className="text-xs text-gray-500 truncate">{log.user_agent}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;
