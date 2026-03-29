import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

const inputCls = "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none text-sm text-white";

const AboutManagement = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const res = await api.getAbout();
      setData(res.data.about || res.data);
    } catch (err) {
      console.error("Error fetching about:", err);
      setError("Failed to load about data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.updateAbout({
        org_name: data.org_name,
        mission: data.mission,
        history: data.history,
        credentials: data.credentials,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        location: data.location,
        pro_talent_plus: data.pro_talent_plus,
        social_links: data.social_links,
      });
      setSuccess("About page updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const addImage = async () => {
    if (!newImageUrl.trim()) return;
    try {
      await api.addAboutImages([newImageUrl.trim()]);
      setNewImageUrl("");
      fetchAbout();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add image");
    }
  };

  const update = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateSocial = (field, value) => {
    setData(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [field]: value },
    }));
  };

  const updatePlus = (field, value) => {
    setData(prev => ({
      ...prev,
      pro_talent_plus: { ...prev.pro_talent_plus, [field]: value },
    }));
  };

  if (loading) {
    return <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto" /></div>;
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-400">No about data found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">About Page Management</h3>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
          <CheckIcon className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {success && <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">{success}</div>}
      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

      {/* Organization Details */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Organization Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Organization Name</label>
            <input value={data.org_name || ""} onChange={e => update("org_name", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Location</label>
            <input value={data.location || ""} onChange={e => update("location", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Contact Email</label>
            <input type="email" value={data.contact_email || ""} onChange={e => update("contact_email", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Contact Phone</label>
            <input value={data.contact_phone || ""} onChange={e => update("contact_phone", e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Content</h4>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Mission</label>
          <textarea rows={3} value={data.mission || ""} onChange={e => update("mission", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">History</label>
          <textarea rows={4} value={data.history || ""} onChange={e => update("history", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Credentials</label>
          <textarea rows={3} value={data.credentials || ""} onChange={e => update("credentials", e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Pro Talent Connect Plus */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Pro Talent Connect Plus</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Title</label>
            <input value={data.pro_talent_plus?.title || ""} onChange={e => updatePlus("title", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Logo URL</label>
            <input value={data.pro_talent_plus?.logo_url || ""} onChange={e => updatePlus("logo_url", e.target.value)} className={inputCls} placeholder="https://example.com/logo.png" />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Description</label>
          <textarea rows={3} value={data.pro_talent_plus?.description || ""} onChange={e => updatePlus("description", e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Social Links</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["instagram", "facebook", "twitter", "youtube"].map(platform => (
            <div key={platform}>
              <label className="text-xs text-gray-400 mb-1 block capitalize">{platform}</label>
              <input
                value={data.social_links?.[platform] || ""}
                onChange={e => updateSocial(platform, e.target.value)}
                className={inputCls}
                placeholder={`https://${platform}.com/...`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Image Gallery ({data.images?.length || 0})</h4>
        <div className="flex gap-2">
          <input
            value={newImageUrl}
            onChange={e => setNewImageUrl(e.target.value)}
            placeholder="Enter image URL..."
            className={inputCls + " flex-1"}
          />
          <button onClick={addImage} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-all">Add</button>
        </div>
        {data.images?.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {data.images.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img} alt="" className="w-full h-24 object-cover rounded-lg border border-white/10" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <span className="text-[10px] text-gray-300 px-2 truncate">{img}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutManagement;
