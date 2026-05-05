import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../../services/api";
import { useFeedback } from "../../context/FeedbackContext";
import DOBCalendarPicker from "../common/DOBCalendarPicker";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const POSITIONS = ["FORWARD", "MIDFIELD", "DEFENDER", "GOALKEEPER", "WINGER"];
const AGE_GROUPS = ["U13", "U15", "U17", "U19", "Senior"];
const GENDERS = ["Male", "Female", "Other"];
const FEET = ["Left", "Right", "Both"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COMP_RESULTS = ["Champion", "Runner-up", "Third", "Participant", ""];
const CLUB_TIERS = ["", "Tier 1", "Tier 2", "Tier 3"];
const MISSING_ID_LABEL = "Player Has No ID";

const gradeColors = {
  A: "bg-emerald-500/20 text-emerald-400", B: "bg-blue-500/20 text-blue-400",
  C: "bg-amber-500/20 text-amber-400", D: "bg-orange-500/20 text-orange-400",
  E: "bg-red-500/20 text-red-400", "N/A": "bg-gray-500/20 text-gray-400",
  INCOMPLETE: "bg-yellow-500/20 text-yellow-400",
};

const inputCls = "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none text-sm text-white";
const selectTriggerCls = inputCls;

const formatPlayerId = (playerId) => {
  if (!playerId) return "N/A";
  if (playerId.startsWith("PL_TEMP_")) return "Player Has No ID";
  if (playerId.startsWith("Player Has No ID")) return "Player Has No ID";
  return playerId;
};

const Field = ({ label, children, span = 1 }) => (
  <div className={span === 2 ? "col-span-2" : ""}>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    {children}
  </div>
);

const emptyForm = {
  name: "", age: "", age_group: "Senior", playingPosition: "FORWARD",
  alternativePosition: "", preferredFoot: "Right", transferMarketLink: "",
  playerId: "", dateOfBirth: "", nationality: "Indian", weight: "", height: "",
  gender: "Male", jersey_no: "", size: "M", state: "", address: "",
  mobileNumber: "", email: "", profileImage: "", scouting_notes: "",
  career_history: "", youtubeVideoUrl: "", videoThumbnail: "", videoTitle: "", videoDescription: "",
  currentLeague: "", stateLeague: "", clubTier: "",
  sprint30m: "", sprint50m: "", mentalityScore: 0, featured: false,
  competitions: [], clubsPlayed: [],
};

const PlayerManagement = () => {
  const { showToast, confirm } = useFeedback();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewPlayer, setViewPlayer] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [posFilter, setPosFilter] = useState("");
  const [leagues, setLeagues] = useState([]);
  const [showAllCompetitions, setShowAllCompetitions] = useState(false);
  const [showAllClubs, setShowAllClubs] = useState(false);
  const [expandCareerHistory, setExpandCareerHistory] = useState(false);
  const [showVideoDetails, setShowVideoDetails] = useState(false);

  // Refs for auto-scroll when adding competition/club rows
  const competitionsEndRef = useRef(null);
  const clubsEndRef = useRef(null);
  const competitionsContainerRef = useRef(null);
  const clubsContainerRef = useRef(null);



  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 18 };
      if (posFilter) params.playingPosition = posFilter;
      if (debouncedSearch) params.searchQuery = debouncedSearch;
      const res = await api.getPlayers(params);
      const data = res.data;
      const fetchedPlayers = data.players || data || [];
      const totalResults = Number(data.totalResults ?? data.pagination?.totalResults ?? 0);
      const totalPages = Math.max(1, Number(data.totalPages ?? data.pagination?.totalPages ?? 1));
      const requestedPage = Number(page) || 1;
      const serverCurrentPage = Number(data.currentPage ?? data.pagination?.currentPage ?? requestedPage);
      const safeCurrentPage = Math.min(Math.max(1, serverCurrentPage), totalPages);

      // Keep local page in sync with valid page bounds from API before rendering stale data.
      if (requestedPage !== safeCurrentPage) {
        setPage(safeCurrentPage);
        return;
      }

      // If current page becomes empty after a delete, go back one page.
      if (fetchedPlayers.length === 0 && requestedPage > 1 && totalResults > 0) {
        setPage(requestedPage - 1);
        return;
      }

      setPlayers(fetchedPlayers);
      setPagination({
        totalPages,
        currentPage: safeCurrentPage,
        totalResults,
        hasNextPage: safeCurrentPage < totalPages,
        hasPrevPage: safeCurrentPage > 1,
      });
    } catch (err) {
      console.error("Error fetching players:", err);
    } finally {
      setLoading(false);
    }
  }, [page, posFilter, debouncedSearch]);

  // Debounce player search to avoid request spam while typing.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  // Fetch dynamic leagues for dropdowns
  useEffect(() => {
    api.getLeagues().then((res) => setLeagues(res.data || [])).catch(() => {});
  }, []);

  const leagueOptions = leagues.filter((l) => l.active);
  const stateLeagueOptions = leagues.filter((l) => l.active && l.tier === "State Tier");

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setDebouncedSearch(search.trim());
  };

  const openCreate = () => {
    setEditingPlayer(null);
    setFormData({ ...emptyForm, playerId: MISSING_ID_LABEL });
    setError("");
    setShowAllCompetitions(false);
    setShowAllClubs(false);
    setExpandCareerHistory(false);
    setShowVideoDetails(false);
    setShowModal(true);
  };

  const openEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name || "",
      age: player.age || "",
      age_group: player.age_group || "Senior",
      playingPosition: player.playingPosition || "FORWARD",
      alternativePosition: player.alternativePosition || "",
      preferredFoot: player.preferredFoot || "Right",
      transferMarketLink: player.transferMarketLink || "",
      playerId: player.playerId || "",
      dateOfBirth: player.dateOfBirth ? player.dateOfBirth.slice(0, 10) : "",
      nationality: player.nationality || "Indian",
      weight: player.weight || "",
      height: player.height || "",
      gender: player.gender || "Male",
      jersey_no: player.jersey_no || "",
      size: player.size || "M",
      state: player.state || "",
      address: player.address || "",
      mobileNumber: player.mobileNumber || "",
      email: player.email || "",
      profileImage: player.profileImage || "",
      scouting_notes: player.scouting_notes || "",
      career_history: player.career_history || "",
      youtubeVideoUrl: player.youtubeVideoUrl || "",
      videoThumbnail: player.videoThumbnail || "",
      videoTitle: player.videoTitle || "",
      videoDescription: player.videoDescription || "",
      currentLeague: player.currentLeague || "",
      stateLeague: player.stateLeague || "",
      clubTier: player.clubTier || "",
      sprint30m: player.sprint30m || "",
      sprint50m: player.sprint50m || "",
      mentalityScore: player.mentalityScore || 0,
      featured: player.featured || false,
      competitions: player.competitions || [],
      clubsPlayed: player.clubsPlayed || [],
    });
    setError("");
    setShowAllCompetitions(false);
    setShowAllClubs(false);
    setExpandCareerHistory(false);
    setShowVideoDetails(false);
    setShowModal(true);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Client-side validation with clear error messages
    const missing = [];
    if (!formData.name?.trim())         missing.push("Full Name");
    if (!formData.dateOfBirth)          missing.push("Date of Birth");
    if (!formData.email?.trim())        missing.push("Email");
    if (!formData.mobileNumber?.trim()) missing.push("Mobile Number");

    if (missing.length > 0) {
      setError(`Please fill in the required fields: ${missing.join(", ")}`);
      setSaving(false);
      return;
    }


    try {
      // Auto-calculate age from dateOfBirth
      let calculatedAge = formData.age ? Number(formData.age) : undefined;
      if (formData.dateOfBirth && !calculatedAge) {
        const dob = new Date(formData.dateOfBirth);
        const today = new Date();
        calculatedAge = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) calculatedAge--;
      }

      const payload = {
        ...formData,
        age: calculatedAge,
        weight: formData.weight ? Number(formData.weight) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        jersey_no: formData.jersey_no ? Number(formData.jersey_no) : undefined,
        sprint30m: formData.sprint30m ? Number(formData.sprint30m) : undefined,
        sprint50m: formData.sprint50m ? Number(formData.sprint50m) : undefined,
        mentalityScore: Number(formData.mentalityScore),
        // Filter out incomplete competition and club entries
        competitions: (formData.competitions || []).filter((c) => c.name?.trim()),
        clubsPlayed: (formData.clubsPlayed || []).filter((c) => c.clubName?.trim()),
      };

      payload.playerId = formData.playerId?.trim() || MISSING_ID_LABEL;

      // Remove undefined/empty optional fields so Joi doesn't choke on them
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === "") delete payload[key];
      });
      // Restore required fields
      payload.name        = formData.name;
      payload.playerId    = formData.playerId?.trim() || MISSING_ID_LABEL;
      payload.email       = formData.email;
      payload.mobileNumber = formData.mobileNumber;
      payload.gender      = formData.gender;
      payload.age_group   = formData.age_group;
      payload.playingPosition = formData.playingPosition;
      payload.preferredFoot   = formData.preferredFoot;

      if (editingPlayer) {
        await api.updatePlayer(editingPlayer._id, payload);
      } else {
        await api.createPlayer(payload);
      }
      setShowModal(false);
      fetchPlayers();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const msgs = data.errors.map((e) => `${e.field}: ${e.message}`).join("\n");
        setError(msgs);
      } else {
        setError(data?.message || err.message || "Failed to save player");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const shouldDelete = await confirm({
      title: "Delete Player",
      message: `Delete player "${name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      tone: "danger",
    });

    if (!shouldDelete) return;

    try {
      await api.deletePlayer(id);
      showToast("Player deleted successfully", { type: "success" });
      if (players.length === 1 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        fetchPlayers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete player", {
        type: "error",
      });
    }
  };

  const addCompetition = () => {
    setFormData((prev) => ({
      ...prev,
      competitions: [...prev.competitions, { name: "", type: "", year: new Date().getFullYear(), result: "Participant" }],
    }));
    // Auto-scroll to bottom of competitions list after state update
    setTimeout(() => {
      competitionsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };

  const removeCompetition = (idx) => {
    setFormData(prev => ({
      ...prev,
      competitions: prev.competitions.filter((_, i) => i !== idx),
    }));
  };

  const updateCompetition = (idx, field, val) => {
    setFormData(prev => {
      const comps = [...prev.competitions];
      comps[idx] = { ...comps[idx], [field]: field === "year" ? Number(val) : val };
      return { ...prev, competitions: comps };
    });
  };

  const addClub = () => {
    setFormData((prev) => ({
      ...prev,
      clubsPlayed: [...prev.clubsPlayed, { clubName: "", clubLogo: "", duration: "" }],
    }));
    // Auto-scroll to bottom of clubs list after state update
    setTimeout(() => {
      clubsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };

  const removeClub = (idx) => {
    setFormData(prev => ({
      ...prev,
      clubsPlayed: prev.clubsPlayed.filter((_, i) => i !== idx),
    }));
  };

  const updateClub = (idx, field, val) => {
    setFormData(prev => {
      const clubs = [...prev.clubsPlayed];
      clubs[idx] = { ...clubs[idx], [field]: val };
      return { ...prev, clubsPlayed: clubs };
    });
  };

  const totalPages = pagination.totalPages || 1;
  const currentPage = pagination.currentPage || page;
  const compactPageItems = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items = [];
    const windowStart = Math.max(1, currentPage - 1);
    const windowEnd = Math.min(totalPages, currentPage + 1);
    const tailStart = Math.max(1, totalPages - 1);

    for (let p = windowStart; p <= windowEnd; p += 1) {
      items.push(p);
    }

    if (windowEnd < tailStart - 1) {
      items.push("...");
    }

    for (let p = Math.max(tailStart, windowEnd + 1); p <= totalPages; p += 1) {
      items.push(p);
    }

    if (windowStart > 1) {
      items.unshift("...");
    }

    return items;
  })();

  const previewCompetitions = showAllCompetitions
    ? formData.competitions
    : formData.competitions.slice(0, 3);
  const previewClubs = showAllClubs
    ? formData.clubsPlayed
    : formData.clubsPlayed.slice(0, 2);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold">Player Management</h3>
          <p className="text-sm text-gray-400">{pagination.totalResults || players.length} players total</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 min-w-0 sm:flex-none">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-red-500 text-white w-full sm:w-48"
            />
          </form>
          <Select
            value={posFilter || "all"}
            onValueChange={(value) => {
              setPosFilter(value === "all" ? "" : value);
              setPage(1);
            }}
          >
            <SelectTrigger className="flex-1 min-w-0 sm:flex-none px-3 py-2 text-sm">
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {POSITIONS.map((pos) => (
                <SelectItem key={pos} value={pos}>
                  {pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-all whitespace-nowrap">
            <PlusIcon className="w-4 h-4" /> Add Player
          </button>
        </div>
      </div>

      {/* Player Cards */}
      {loading ? (
        <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto" /></div>
      ) : players.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No players found</div>
      ) : (
        <div className="grid gap-3">
          {players.map((player) => {
            const grade = player.scoutReport?.grade || "N/A";
            const score = player.scoutReport?.totalScore || 0;

            return (
              <div key={player._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-sm transition-colors hover:bg-white/[0.05]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={player.profileImage || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100"}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                      alt=""
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-white truncate">{player.name}</p>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${gradeColors[grade] || gradeColors["N/A"]}`}>
                          {grade}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 break-all">{player.email}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-400">
                        <span className="px-2 py-1 rounded-full bg-white/[0.04] border border-white/5">{player.playingPosition || "N/A"}</span>
                        <span className="px-2 py-1 rounded-full bg-white/[0.04] border border-white/5">{formatPlayerId(player.playerId)}</span>
                        <span className="px-2 py-1 rounded-full bg-white/[0.04] border border-white/5">{player.state || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:text-right">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-500">Score</p>
                      <p className="text-2xl font-bold text-white leading-none">{score}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setViewPlayer(player); setShowViewModal(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-all" title="View">
                        <EyeIcon className="w-4 h-4 text-gray-400" />
                      </button>
                      <button onClick={() => openEdit(player)} className="p-2 hover:bg-white/10 rounded-lg transition-all" title="Edit">
                        <PencilSquareIcon className="w-4 h-4 text-gray-400" />
                      </button>
                      <button onClick={() => handleDelete(player._id, player.name)} className="p-2 hover:bg-red-500/20 rounded-lg transition-all" title="Delete">
                        <TrashIcon className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 gap-2">
          <p className="text-xs text-gray-400">{currentPage}/{totalPages}</p>
          <div className="flex items-center gap-1.5">
            <button disabled={!pagination.hasPrevPage} onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-8 px-3 text-xs font-medium bg-white/5 border border-white/10 rounded-md hover:bg-white/10 disabled:opacity-30 transition-all">
              Prev
            </button>
            <div className="flex items-center gap-1">
              {compactPageItems.map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs text-gray-500">...</span>
                ) : (
                  <button
                    key={`page-${item}`}
                    onClick={() => setPage(item)}
                    className={`h-8 min-w-8 px-2 rounded-md text-xs font-medium border transition-all ${item === currentPage
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                      }`}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
            <button disabled={!pagination.hasNextPage} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="h-8 px-3 text-xs font-medium bg-white/5 border border-white/10 rounded-md hover:bg-white/10 disabled:opacity-30 transition-all">
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewPlayer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowViewModal(false); }}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{viewPlayer.name}</h3>
              <button onClick={() => setShowViewModal(false)}><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  ["Position", viewPlayer.playingPosition],
                  ["Player ID", formatPlayerId(viewPlayer.playerId)],
                  ["Age", viewPlayer.age],
                  ["DOB", viewPlayer.dateOfBirth?.slice(0, 10)],
                  ["Height", viewPlayer.height ? `${viewPlayer.height} cm` : "N/A"],
                  ["Weight", viewPlayer.weight ? `${viewPlayer.weight} kg` : "N/A"],
                  ["State", viewPlayer.state],
                  ["Nationality", viewPlayer.nationality],
                  ["Email", viewPlayer.email],
                  ["Phone", viewPlayer.mobileNumber],
                  ["Grade", viewPlayer.scoutReport?.grade],
                  ["Score", viewPlayer.scoutReport?.totalScore],
                ].map(([l, v]) => (
                  <div key={l} className="bg-white/5 rounded-lg p-2">
                    <p className="text-xs text-gray-500">{l}</p>
                    <p className="text-white">{v || "N/A"}</p>
                  </div>
                ))}
              </div>
              {viewPlayer.clubsPlayed?.length > 0 && (
                <div>
                  <p className="text-gray-400 mb-1 font-medium">Clubs</p>
                  {viewPlayer.clubsPlayed.map((c, i) => (
                    <p key={i} className="text-gray-300">{c.clubName} ({c.duration})</p>
                  ))}
                </div>
              )}
              {viewPlayer.competitions?.length > 0 && (
                <div>
                  <p className="text-gray-400 mb-1 font-medium">Competitions ({viewPlayer.competitions.length})</p>
                  {viewPlayer.competitions.map((c, i) => (
                    <p key={i} className="text-gray-300">{c.name} — {c.type} ({c.year}) {c.result && `• ${c.result}`}</p>
                  ))}
                </div>
              )}
              {viewPlayer.career_history && (
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-gray-400 mb-2 font-medium">Career History</p>
                  <div className="bg-white/[0.02] rounded border border-white/5 p-3 text-sm leading-relaxed max-h-32 overflow-y-auto">
                    <p className="text-gray-200 whitespace-pre-wrap break-words">{viewPlayer.career_history}</p>
                  </div>
                </div>
              )}
              {(viewPlayer.youtubeVideoUrl || viewPlayer.videoTitle || viewPlayer.videoDescription || viewPlayer.videoThumbnail) && (
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-gray-400 mb-2 font-medium">Profile Video</p>
                  {viewPlayer.videoTitle && <p className="text-white text-sm font-semibold">{viewPlayer.videoTitle}</p>}
                  {viewPlayer.videoDescription && <p className="text-gray-300 text-xs mt-1">{viewPlayer.videoDescription}</p>}
                  {viewPlayer.youtubeVideoUrl && (
                    <p className="text-gray-400 text-xs mt-2 break-all">{viewPlayer.youtubeVideoUrl}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-2xl shadow-black/40">
            <div className="sticky top-0 bg-gray-950/95 backdrop-blur border-b border-white/10 p-4 flex items-start justify-between gap-4 z-10">
              <div>
                <h3 className="text-lg font-bold">{editingPlayer ? "Edit Player" : "Add New Player"}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {editingPlayer
                    ? "Adjust profile details, scout data, or identity fields."
                    : "Create a new player profile. Player ID should match PL0000000040 or use Player Has No ID if it is not assigned yet."}
                </p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${editingPlayer ? "bg-blue-500/15 text-blue-300 border border-blue-500/25" : "bg-yellow-500/15 text-yellow-300 border border-yellow-500/25"}`}>
                {editingPlayer ? "Editing" : "New entry"}
              </span>
              <button onClick={() => setShowModal(false)}><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

              {!editingPlayer && (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">No official player ID yet?</p>
                    <p className="text-xs text-yellow-100/80">Use the placeholder only when the player has no assigned ID.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, playerId: MISSING_ID_LABEL }))}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-yellow-400/30 bg-yellow-400/10 text-xs font-semibold text-yellow-50 hover:bg-yellow-400/20 transition-colors"
                  >
                    Use Player Has No ID
                  </button>
                </div>
              )}

              {/* Basic Info */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Basic Information</h4>
                    <p className="text-xs text-gray-400 mt-1">Identity and contact details that define the player profile.</p>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-wider text-gray-400">
                    Required first
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Full Name *" span={2}>
                    <input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label="Player ID">
                    <input value={formData.playerId} onChange={e => setFormData(p => ({ ...p, playerId: e.target.value }))} className={inputCls} />
                    <p className="mt-1 text-[11px] text-gray-500">Format: PL0000000040. This ID is assigned by the AIFF CRS system and is compulsory for organized football.</p>
                  </Field>
                  <Field label="Date of Birth *">
                    <DOBCalendarPicker
                      required
                      value={formData.dateOfBirth}
                      onChange={v => {
                        // Auto-calculate age from DOB
                        let age = "";
                        if (v) {
                          const dob = new Date(v);
                          const today = new Date();
                          age = today.getFullYear() - dob.getFullYear();
                          const m = today.getMonth() - dob.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
                        }
                        setFormData(p => ({ ...p, dateOfBirth: v, age: age !== "" ? String(age) : p.age }));
                      }}
                      minYear={1950}
                    />
                  </Field>
                  <Field label="Age">
                    <input type="number" value={formData.age} onChange={e => setFormData(p => ({ ...p, age: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label="Age Group">
                    <Select
                      value={formData.age_group}
                      onValueChange={(value) =>
                        setFormData((p) => ({ ...p, age_group: value }))
                      }
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {AGE_GROUPS.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Gender *">
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData((p) => ({ ...p, gender: value }))
                      }
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDERS.map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Nationality">
                    <input value={formData.nationality} onChange={e => setFormData(p => ({ ...p, nationality: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label="State">
                    <input value={formData.state} onChange={e => setFormData(p => ({ ...p, state: e.target.value }))} className={inputCls} />
                  </Field>
                </div>
              </div>

              {/* Physical & Position */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Position & Physical</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Field label="Playing Position *">
                    <Select
                      value={formData.playingPosition}
                      onValueChange={(value) =>
                        setFormData((p) => ({ ...p, playingPosition: value }))
                      }
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITIONS.map((pos) => (
                          <SelectItem key={pos} value={pos}>
                            {pos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Alt. Position">
                    <input value={formData.alternativePosition} onChange={e => setFormData(p => ({ ...p, alternativePosition: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label="Preferred Foot">
                    <Select
                      value={formData.preferredFoot}
                      onValueChange={(value) =>
                        setFormData((p) => ({ ...p, preferredFoot: value }))
                      }
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {FEET.map((foot) => (
                          <SelectItem key={foot} value={foot}>
                            {foot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Height (cm)">
                    <input type="number" value={formData.height} onChange={e => setFormData(p => ({ ...p, height: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label="Weight (kg)">
                    <input type="number" value={formData.weight} onChange={e => setFormData(p => ({ ...p, weight: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label="Jersey No">
                    <input type="number" min="0" max="99" value={formData.jersey_no} onChange={e => setFormData(p => ({ ...p, jersey_no: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label="Size">
                    <Select
                      value={formData.size}
                      onValueChange={(value) =>
                        setFormData((p) => ({ ...p, size: value }))
                      }
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Email *">
                    <input type="email" required value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label="Mobile Number *">
                    <input required value={formData.mobileNumber} onChange={e => setFormData(p => ({ ...p, mobileNumber: e.target.value }))} className={inputCls} />
                  </Field>


                  <Field label="Address" span={2}>
                    <input value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} className={inputCls} />
                  </Field>
                </div>
              </div>

              {/* Scout Report Inputs */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Scout Report Data</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Field label="Transfer Market Link">
                    <input value={formData.transferMarketLink} onChange={e => setFormData(p => ({ ...p, transferMarketLink: e.target.value }))} className={inputCls} placeholder="https://..." />
                  </Field>
                  <Field label="Current League">
                    <Select
                      value={formData.currentLeague || "none"}
                      onValueChange={(value) =>
                        setFormData((p) => ({
                          ...p,
                          currentLeague: value === "none" ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48 overflow-y-auto">
                        <SelectItem value="none">None</SelectItem>
                        {leagueOptions.map((league) => (
                          <SelectItem key={league._id} value={league.name}>
                            {league.name} ({league.tier})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="State / Previous League">
                    <Select
                      value={formData.stateLeague || "none"}
                      onValueChange={(value) =>
                        setFormData((p) => ({
                          ...p,
                          stateLeague: value === "none" ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48 overflow-y-auto">
                        <SelectItem value="none">None</SelectItem>
                        {stateLeagueOptions.map((league) => (
                          <SelectItem key={league._id} value={league.name}>
                            {league.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Club Tier">
                    <Select
                      value={formData.clubTier || "none"}
                      onValueChange={(value) =>
                        setFormData((p) => ({
                          ...p,
                          clubTier: value === "none" ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Auto-detect" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48 overflow-y-auto">
                        <SelectItem value="none">Auto-detect</SelectItem>
                        {CLUB_TIERS.filter(Boolean).map((tier) => (
                          <SelectItem key={tier} value={tier}>
                            {tier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Sprint 30m (sec)">
                    <input type="number" step="0.1" value={formData.sprint30m} onChange={e => setFormData(p => ({ ...p, sprint30m: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label="Sprint 50m (sec)">
                    <input type="number" step="0.1" value={formData.sprint50m} onChange={e => setFormData(p => ({ ...p, sprint50m: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label="Mentality Score">
                    <Select
                      value={String(formData.mentalityScore ?? 0)}
                      onValueChange={(value) =>
                        setFormData((p) => ({
                          ...p,
                          mentalityScore: Number(value),
                        }))
                      }
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48 overflow-y-auto">
                        <SelectItem value="0">0 - No data</SelectItem>
                        <SelectItem value="1">1 - Good</SelectItem>
                        <SelectItem value="2">2 - Strong</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              {/* Competitions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Competitions ({showAllCompetitions ? formData.competitions.length : Math.min(3, formData.competitions.length)} / {formData.competitions.length})
                  </h4>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={addCompetition} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                      <PlusIcon className="w-3 h-3" /> Add
                    </button>
                    {formData.competitions.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setShowAllCompetitions((prev) => !prev)}
                        className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1"
                      >
                        {showAllCompetitions ? "Show Less" : "View All ↓"}
                      </button>
                    )}
                  </div>
                </div>
                <div 
                  ref={competitionsContainerRef} 
                  className={`space-y-2 rounded-lg border border-white/5 p-2 ${showAllCompetitions ? "max-h-64 overflow-y-auto" : ""}`}
                >
                  {previewCompetitions.map((comp, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-white/5 rounded-lg p-2">
                      <div className="col-span-1 md:col-span-4">
                        <label className="text-[10px] text-gray-500">Name</label>
                        <input value={comp.name} onChange={e => updateCompetition(idx, "name", e.target.value)} className={inputCls} placeholder="Competition name" />
                      </div>
                      <div className="col-span-1 md:col-span-3">
                        <label className="text-[10px] text-gray-500">League / Type</label>
                        <Select
                          value={comp.type || "none"}
                          onValueChange={(value) =>
                            updateCompetition(
                              idx,
                              "type",
                              value === "none" ? "" : value,
                            )
                          }
                        >
                          <SelectTrigger className={selectTriggerCls}>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-48 overflow-y-auto">
                            <SelectItem value="none">Select...</SelectItem>
                            {leagueOptions.map((league) => (
                              <SelectItem key={league._id} value={league.name}>
                                {league.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="National Team">National Team</SelectItem>
                            <SelectItem value="Santosh Trophy">Santosh Trophy</SelectItem>
                            <SelectItem value="District League">District League</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="text-[10px] text-gray-500">Year</label>
                        <input type="number" value={comp.year} onChange={e => updateCompetition(idx, "year", e.target.value)} className={inputCls} />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="text-[10px] text-gray-500">Result</label>
                        <Select
                          value={comp.result || "none"}
                          onValueChange={(value) =>
                            updateCompetition(
                              idx,
                              "result",
                              value === "none" ? "" : value,
                            )
                          }
                        >
                          <SelectTrigger className={selectTriggerCls}>
                            <SelectValue placeholder="N/A" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">N/A</SelectItem>
                            {COMP_RESULTS.filter(Boolean).map((result) => (
                              <SelectItem key={result} value={result}>
                                {result}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button type="button" onClick={() => removeCompetition(idx)} className="p-1 hover:bg-red-500/20 rounded"><TrashIcon className="w-3.5 h-3.5 text-red-400" /></button>
                      </div>
                    </div>
                  ))}
                  {!showAllCompetitions && formData.competitions.length > 3 && (
                    <div className="px-2 py-1 text-[11px] text-gray-500 flex items-center justify-between">
                      <span>Showing 3 of {formData.competitions.length}</span>
                      <span>Tap View All to expand</span>
                    </div>
                  )}
                  <div ref={competitionsEndRef} />
                </div>
              </div>

              {/* Clubs Played */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Clubs Played ({showAllClubs ? formData.clubsPlayed.length : Math.min(2, formData.clubsPlayed.length)} / {formData.clubsPlayed.length})
                  </h4>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={addClub} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                      <PlusIcon className="w-3 h-3" /> Add
                    </button>
                    {formData.clubsPlayed.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setShowAllClubs((prev) => !prev)}
                        className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1"
                      >
                        {showAllClubs ? "Show Less" : "View All ↓"}
                      </button>
                    )}
                  </div>
                </div>
                <div 
                  ref={clubsContainerRef} 
                  className={`space-y-2 rounded-lg border border-white/5 p-2 ${showAllClubs ? "max-h-52 overflow-y-auto" : ""}`}
                >
                  {previewClubs.map((club, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-white/5 rounded-lg p-2">
                      <div className="col-span-1 md:col-span-5">
                        <label className="text-[10px] text-gray-500">Club Name</label>
                        <input value={club.clubName} onChange={e => updateClub(idx, "clubName", e.target.value)} className={inputCls} />
                      </div>
                      <div className="col-span-1 md:col-span-3">
                        <label className="text-[10px] text-gray-500">Duration</label>
                        <input value={club.duration} onChange={e => updateClub(idx, "duration", e.target.value)} className={inputCls} placeholder="2020-2022" />
                      </div>
                      <div className="col-span-1 md:col-span-3">
                        <label className="text-[10px] text-gray-500">Logo URL</label>
                        <input value={club.clubLogo} onChange={e => updateClub(idx, "clubLogo", e.target.value)} className={inputCls} />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button type="button" onClick={() => removeClub(idx)} className="p-1 hover:bg-red-500/20 rounded"><TrashIcon className="w-3.5 h-3.5 text-red-400" /></button>
                      </div>
                    </div>
                  ))}
                  {!showAllClubs && formData.clubsPlayed.length > 2 && (
                    <div className="px-2 py-1 text-[11px] text-gray-500 flex items-center justify-between">
                      <span>Showing 2 of {formData.clubsPlayed.length}</span>
                      <span>Tap View All to expand</span>
                    </div>
                  )}
                  <div ref={clubsEndRef} />
                </div>
              </div>

              {/* Extra */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Additional</h4>
                <div className="grid grid-cols-1 gap-3">
                  <Field label="Profile Image URL">
                    <input value={formData.profileImage} onChange={e => setFormData(p => ({ ...p, profileImage: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label="Scouting Notes">
                    <textarea
                      rows={3}
                      value={formData.scouting_notes}
                      onChange={e => setFormData(p => ({ ...p, scouting_notes: e.target.value }))}
                      className={`${inputCls} min-h-[88px] resize-y`}
                      placeholder="Short scouting summary, strengths, concerns, or observations"
                    />
                  </Field>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Career History</label>
                        <p className="text-[11px] text-gray-500 mt-1">{expandCareerHistory ? "Max 4-5 lines visible" : "Show only 4-5 lines"}</p>
                      </div>
                      <button type="button" onClick={() => setExpandCareerHistory((prev) => !prev)} className="text-xs text-gray-400 hover:text-gray-200">
                        {expandCareerHistory ? "Collapse ↑" : "Expand ↓"}
                      </button>
                    </div>
                    <textarea 
                      value={formData.career_history} 
                      onChange={e => setFormData(p => ({ ...p, career_history: e.target.value.slice(0, 1000) }))} 
                      maxLength={1000}
                      rows={expandCareerHistory ? 8 : 4}
                      aria-label="Career History"
                      placeholder="E.g., Started at youth academy in 2018, played for local clubs, joined ISL in 2021, national team debut in 2023..."
                      className={`w-full bg-white/[0.02] border border-white/5 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.04] transition-all resize-none ${inputCls}`}
                    />
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Video</p>
                        <p className="text-[11px] text-gray-500 mt-1">Keep the main link visible; reveal extra video details only if needed.</p>
                      </div>
                      <button type="button" onClick={() => setShowVideoDetails((prev) => !prev)} className="text-xs text-gray-400 hover:text-gray-200">
                        {showVideoDetails ? "Hide Details" : "More Details"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <Field label="YouTube Video URL">
                        <input
                          value={formData.youtubeVideoUrl}
                          onChange={e => setFormData(p => ({ ...p, youtubeVideoUrl: e.target.value }))}
                          className={inputCls}
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </Field>
                      <Field label="Video Title">
                        <input
                          value={formData.videoTitle}
                          onChange={e => setFormData(p => ({ ...p, videoTitle: e.target.value }))}
                          className={inputCls}
                          maxLength={120}
                          placeholder="Player Highlight Reel"
                        />
                      </Field>
                      {showVideoDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Field label="Thumbnail URL">
                            <input
                              value={formData.videoThumbnail}
                              onChange={e => setFormData(p => ({ ...p, videoThumbnail: e.target.value }))}
                              className={inputCls}
                              placeholder="https://images.unsplash.com/..."
                            />
                          </Field>
                          <Field label="Video Description">
                            <input
                              value={formData.videoDescription}
                              onChange={e => setFormData(p => ({ ...p, videoDescription: e.target.value }))}
                              className={inputCls}
                              maxLength={300}
                              placeholder="Short summary for profile view"
                            />
                          </Field>
                        </div>
                      )}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={formData.featured} onChange={e => setFormData(p => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 rounded bg-white/5 border-white/10 text-red-500" />
                    <span className="text-gray-300">Featured Player</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all">Cancel</button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingPlayer ? "Update Player" : "Create Player"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerManagement;
