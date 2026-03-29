import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

const TIERS = ["Tier 1", "Tier 2", "Tier 3", "Tier 4", "State Tier"];

const TIER_STYLES = {
  "Tier 1":    "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  "Tier 2":    "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Tier 3":    "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Tier 4":    "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "State Tier":"bg-green-500/15 text-green-400 border-green-500/30",
};

const inputCls = "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none text-sm text-white";
const selectCls = inputCls + " appearance-none";

const TierBadge = ({ tier }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${TIER_STYLES[tier] || "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}>
    {tier}
  </span>
);

export default function LeagueManagement() {
  const [leagues, setLeagues]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [editingId, setEditingId]   = useState(null);
  const [editForm, setEditForm]     = useState({ name: "", tier: "" });
  const [showAdd, setShowAdd]       = useState(false);
  const [addForm, setAddForm]       = useState({ name: "", tier: "State Tier" });
  const [saving, setSaving]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name }

  const fetchLeagues = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getLeagues();
      setLeagues(res.data || []);
    } catch (err) {
      setError("Failed to load leagues");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeagues(); }, [fetchLeagues]);

  // Group by tier for display
  const grouped = TIERS.map((tier) => ({
    tier,
    items: leagues.filter((l) => l.tier === tier),
  })).filter((g) => g.items.length > 0 || g.tier === "State Tier");

  const startEdit = (league) => {
    setEditingId(league._id);
    setEditForm({ name: league.name, tier: league.tier });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", tier: "" });
  };

  const handleUpdate = async (id) => {
    if (!editForm.name.trim()) return;
    setSaving(true);
    try {
      await api.updateLeague(id, editForm);
      setEditingId(null);
      fetchLeagues();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update league");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!addForm.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.createLeague(addForm);
      setAddForm({ name: "", tier: "State Tier" });
      setShowAdd(false);
      fetchLeagues();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add league");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.deleteLeague(deleteConfirm.id);
      fetchLeagues();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete league");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleToggleActive = async (league) => {
    try {
      await api.updateLeague(league._id, { active: !league.active });
      fetchLeagues();
    } catch (err) {
      setError("Failed to update league status");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">League Management</h3>
          <p className="text-sm text-gray-400">{leagues.length} leagues · Manage tiers and availability</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setError(""); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-all"
        >
          <PlusIcon className="w-4 h-4" /> Add League
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
          <button className="ml-2 text-red-300 hover:text-red-200" onClick={() => setError("")}>✕</button>
        </div>
      )}

      {/* Add league form */}
      {showAdd && (
        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
          <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">New League</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">League Name</label>
              <input
                value={addForm.name}
                onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="e.g. West Bengal Super League"
                className={inputCls}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tier</label>
              <select
                value={addForm.tier}
                onChange={(e) => setAddForm((p) => ({ ...p, tier: e.target.value }))}
                className={selectCls}
              >
                {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-3 justify-end">
            <button
              type="button"
              onClick={() => { setShowAdd(false); setAddForm({ name: "", tier: "State Tier" }); }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving || !addForm.name.trim()}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add League"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="space-y-6">
          {TIERS.map((tier) => {
            const items = leagues.filter((l) => l.tier === tier);
            if (items.length === 0) return null;
            return (
              <div key={tier}>
                <div className="flex items-center gap-3 mb-3">
                  <TierBadge tier={tier} />
                  <span className="text-xs text-gray-500">{items.length} league{items.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-2">
                  {items.map((league) => (
                    <div
                      key={league._id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                        league.active
                          ? "bg-white/3 border-white/8 hover:border-white/15"
                          : "bg-white/2 border-white/5 opacity-60"
                      }`}
                    >
                      {editingId === league._id ? (
                        /* Inline edit row */
                        <>
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(league._id); if (e.key === "Escape") cancelEdit(); }}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm text-white focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                          <select
                            value={editForm.tier}
                            onChange={(e) => setEditForm((p) => ({ ...p, tier: e.target.value }))}
                            className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm text-white focus:outline-none appearance-none"
                          >
                            {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <button
                            onClick={() => handleUpdate(league._id)}
                            disabled={saving}
                            className="p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-all"
                            title="Save"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-all"
                            title="Cancel"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        /* Normal row */
                        <>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${league.active ? "text-white" : "text-gray-500"}`}>
                              {league.name}
                            </p>
                          </div>
                          <TierBadge tier={league.tier} />
                          {/* Active toggle */}
                          <button
                            onClick={() => handleToggleActive(league)}
                            className={`text-xs px-2 py-0.5 rounded-md border transition-all ${
                              league.active
                                ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                                : "bg-gray-500/10 text-gray-500 border-gray-500/20 hover:bg-gray-500/20"
                            }`}
                            title={league.active ? "Click to deactivate" : "Click to activate"}
                          >
                            {league.active ? "Active" : "Inactive"}
                          </button>
                          <button
                            onClick={() => startEdit(league)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                            title="Edit"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(league._id, league.name)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 p-4 bg-white/3 rounded-xl border border-white/8">
        <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Tier Reference</p>
        <div className="flex flex-wrap gap-2">
          {[
            ["Tier 1", "Indian Super League level"],
            ["Tier 2", "I-League level"],
            ["Tier 3", "I-League 2 level"],
            ["Tier 4", "I-League 3 level"],
            ["State Tier", "State & regional leagues"],
          ].map(([t, desc]) => (
            <div key={t} className="flex items-center gap-1.5">
              <TierBadge tier={t} />
              <span className="text-xs text-gray-500">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-red-500 mb-3">Delete League</h3>
            <p className="text-gray-300 text-sm mb-1">
              Are you sure you want to permanently delete{" "}
              <strong>&ldquo;{deleteConfirm.name}&rdquo;</strong>?
            </p>
            <p className="text-gray-500 text-xs mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium text-sm border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium text-sm transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
