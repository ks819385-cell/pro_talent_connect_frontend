import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useFeedback } from "../../context/FeedbackContext";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const ICONS = ["ShieldCheckIcon", "UserGroupIcon", "GlobeAltIcon", "ChartBarIcon", "AcademicCapIcon", "TrophyIcon", "other"];
const COLORS = ["red", "blue", "green", "yellow", "purple", "pink", "orange"];
const HIW_ICONS = ["UserPlusIcon", "CheckBadgeIcon", "MagnifyingGlassIcon", "RocketLaunchIcon", "other"];

const inputCls = "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none text-sm text-white";

const sortItems = (list = [], section = "services") =>
  [...list].sort((a, b) => {
    const orderA = Number.isFinite(a?.order) ? a.order : Number.MAX_SAFE_INTEGER;
    const orderB = Number.isFinite(b?.order) ? b.order : Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;

    if (section === "hiw") {
      const stepA = Number.isFinite(a?.stepNumber)
        ? a.stepNumber
        : Number.MAX_SAFE_INTEGER;
      const stepB = Number.isFinite(b?.stepNumber)
        ? b.stepNumber
        : Number.MAX_SAFE_INTEGER;
      if (stepA !== stepB) return stepA - stepB;
    }

    return (a?.title || "").localeCompare(b?.title || "");
  });

const ServiceManagement = () => {
  const { showToast, confirm } = useFeedback();
  const [services, setServices] = useState([]);
  const [howItWorks, setHowItWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("services");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const emptyService = { title: "", description: "", icon: "ShieldCheckIcon", customIcon: "", color: "red", order: 0, isActive: true };
  const emptyHIW = { title: "", description: "", stepNumber: 1, icon: "UserPlusIcon", customIcon: "", color: "blue", order: 0, isActive: true };
  const [formData, setFormData] = useState({ ...emptyService });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const cacheBuster = { _t: Date.now() };
      const [sRes, hRes] = await Promise.all([
        api.getServices(cacheBuster),
        api.getHowItWorks(cacheBuster),
      ]);

      const serviceList = Array.isArray(sRes.data)
        ? sRes.data
        : sRes.data?.services || [];
      const stepList = Array.isArray(hRes.data)
        ? hRes.data
        : hRes.data?.steps || [];

      setServices(sortItems(serviceList, "services"));
      setHowItWorks(sortItems(stepList, "hiw"));
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(activeSection === "services" ? { ...emptyService } : { ...emptyHIW });
    setError("");
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    if (activeSection === "services") {
      setFormData({
        title: item.title || "", description: item.description || "",
        icon: item.icon || "ShieldCheckIcon", customIcon: item.customIcon || "",
        color: item.color || "red", order: item.order || 0, isActive: item.isActive !== false,
      });
    } else {
      setFormData({
        title: item.title || "", description: item.description || "",
        stepNumber: item.stepNumber || 1, icon: item.icon || "UserPlusIcon",
        customIcon: item.customIcon || "", color: item.color || "blue",
        order: item.order || 0, isActive: item.isActive !== false,
      });
    }
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (activeSection === "services") {
        if (editing) await api.updateService(editing._id, formData);
        else await api.createService(formData);
      } else {
        if (editing) await api.updateHowItWork(editing._id, formData);
        else await api.createHowItWork(formData);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const itemType = activeSection === "services" ? "service" : "step";
    const shouldDelete = await confirm({
      title: "Delete Item",
      message: `Are you sure you want to delete this ${itemType}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      tone: "danger",
    });

    if (!shouldDelete) return;

    try {
      if (activeSection === "services") await api.deleteService(id);
      else await api.deleteHowItWork(id);
      showToast(`${itemType[0].toUpperCase()}${itemType.slice(1)} deleted successfully`, { type: "success" });
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", { type: "error" });
    }
  };

  const items = activeSection === "services" ? services : howItWorks;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveSection("services")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === "services" ? "bg-red-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
            Services ({services.length})
          </button>
          <button onClick={() => setActiveSection("hiw")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === "hiw" ? "bg-red-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
            How It Works ({howItWorks.length})
          </button>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-all">
          <PlusIcon className="w-4 h-4" /> Add {activeSection === "services" ? "Service" : "Step"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No {activeSection} found</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {activeSection === "hiw" && (
                    <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold">{item.stepNumber}</span>
                  )}
                  <h4 className="font-semibold text-white">{item.title}</h4>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color || "gray" }} />
                  <span className="text-xs text-gray-500">Order: {item.order}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${item.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <button onClick={() => openEdit(item)} className="p-2 hover:bg-white/10 rounded-lg transition-all"><PencilSquareIcon className="w-4 h-4 text-gray-400" /></button>
                <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-red-500/20 rounded-lg transition-all"><TrashIcon className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{editing ? "Edit" : "Add"} {activeSection === "services" ? "Service" : "Step"}</h3>
              <button onClick={() => setShowModal(false)}><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Title *</label>
                <input required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Description *</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className={inputCls} />
              </div>
              {activeSection === "hiw" && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Step Number *</label>
                  <input type="number" min="1" required value={formData.stepNumber} onChange={e => setFormData(p => ({ ...p, stepNumber: Number(e.target.value) }))} className={inputCls} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Icon</label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) =>
                      setFormData((p) => ({ ...p, icon: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {(activeSection === "services" ? ICONS : HIW_ICONS).map(
                        (icon) => (
                          <SelectItem key={icon} value={icon}>
                            {icon}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Color</label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) =>
                      setFormData((p) => ({ ...p, color: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLORS.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Order</label>
                  <input type="number" value={formData.order} onChange={e => setFormData(p => ({ ...p, order: Number(e.target.value) }))} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Active</label>
                  <Select
                    value={formData.isActive ? "true" : "false"}
                    onValueChange={(value) =>
                      setFormData((p) => ({ ...p, isActive: value === "true" }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Active" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
