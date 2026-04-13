import { useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  DEFAULT_PARTNERS,
  STORAGE_KEY,
  SOCIAL_CONFIG,
  loadPartners,
} from "../about/Partners";

/* ─── Colour scheme presets ─── */
const COLOR_PRESETS = [
  { label: "Red",    avatarColor: "from-red-500/30 to-red-900/30",       borderColor: "border-red-500/20",    accentColor: "text-red-400" },
  { label: "Blue",   avatarColor: "from-blue-500/30 to-blue-900/30",     borderColor: "border-blue-500/20",   accentColor: "text-blue-400" },
  { label: "Green",  avatarColor: "from-green-500/30 to-green-900/30",   borderColor: "border-green-500/20",  accentColor: "text-green-400" },
  { label: "Purple", avatarColor: "from-purple-500/30 to-purple-900/30", borderColor: "border-purple-500/20", accentColor: "text-purple-400" },
  { label: "Orange", avatarColor: "from-orange-500/30 to-orange-900/30", borderColor: "border-orange-500/20", accentColor: "text-orange-400" },
  { label: "Cyan",   avatarColor: "from-cyan-500/30 to-cyan-900/30",     borderColor: "border-cyan-500/20",   accentColor: "text-cyan-400" },
  { label: "Pink",   avatarColor: "from-pink-500/30 to-pink-900/30",     borderColor: "border-pink-500/20",   accentColor: "text-pink-400" },
  { label: "Yellow", avatarColor: "from-yellow-500/30 to-yellow-900/30", borderColor: "border-yellow-500/20", accentColor: "text-yellow-400" },
];

const SOCIAL_PLATFORMS = ["instagram", "twitter", "linkedin", "facebook", "youtube", "website"];

const EMPTY_FORM = {
  name: "",
  type: "",
  description: "",
  avatar: "",
  logoUrl: "",
  avatarColor: COLOR_PRESETS[0].avatarColor,
  borderColor: COLOR_PRESETS[0].borderColor,
  accentColor: COLOR_PRESETS[0].accentColor,
  social: {
    instagram: { handle: "", url: "" },
    twitter:   { handle: "", url: "" },
    linkedin:  { handle: "", url: "" },
    facebook:  { handle: "", url: "" },
    youtube:   { handle: "", url: "" },
    website:   { handle: "", url: "" },
  },
};

/* ─── persistence helpers ─── */
const savePartners = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("ptc_partners_updated"));
};

const getPartners = () => loadPartners() ?? DEFAULT_PARTNERS;

/* ─── social platform icons (tiny inline) ─── */
const PlatformIcon = ({ platform }) => {
  const icons = {
    instagram: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    twitter: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    linkedin: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    youtube: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    website: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
      </svg>
    ),
  };
  return icons[platform] ?? null;
};

/* ─── Form modal ─── */
const PartnerModal = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState(() => {
    if (!initial) return { ...EMPTY_FORM, social: { ...EMPTY_FORM.social } };
    return {
      ...initial,
      logoUrl: initial.logoUrl ?? "",
      social: {
        instagram: initial.social?.instagram ?? { handle: "", url: "" },
        twitter:   initial.social?.twitter   ?? { handle: "", url: "" },
        linkedin:  initial.social?.linkedin  ?? { handle: "", url: "" },
        facebook:  initial.social?.facebook  ?? { handle: "", url: "" },
        youtube:   initial.social?.youtube   ?? { handle: "", url: "" },
        website:   initial.social?.website   ?? { handle: "", url: "" },
      },
    };
  });

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const setSocial = (platform, field, val) =>
    setForm((f) => ({
      ...f,
      social: { ...f.social, [platform]: { ...f.social[platform], [field]: val } },
    }));

  const applyPreset = (preset) => {
    setForm((f) => ({
      ...f,
      avatarColor: preset.avatarColor,
      borderColor: preset.borderColor,
      accentColor: preset.accentColor,
    }));
  };

  const currentPreset = COLOR_PRESETS.find((p) => p.avatarColor === form.avatarColor) ?? COLOR_PRESETS[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Strip empty social entries
    const social = {};
    SOCIAL_PLATFORMS.forEach((p) => {
      if (form.social[p]?.url?.trim()) social[p] = form.social[p];
    });
    onSave({ ...form, social });
  };

  const inputCls = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50 placeholder-gray-600";
  const labelCls = "block text-xs text-gray-400 mb-1 font-medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gray-900/95 border-b border-white/10 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white">{initial ? "Edit Partner" : "Add Partner"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Partner Name *</label>
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Elite Scout Network" required />
            </div>
            <div>
              <label className={labelCls}>Type / Category *</label>
              <input className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)} placeholder="e.g. Scouting Agency" required />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description *</label>
            <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Short description of the partner…" required />
          </div>

          {/* Logo / Avatar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Logo Image URL</label>
              <input
                className={inputCls}
                value={form.logoUrl}
                onChange={(e) => set("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
                type="url"
              />
              {/* Live preview */}
              <div className={`mt-2 w-12 h-12 rounded-xl bg-gradient-to-br ${form.avatarColor} border ${form.borderColor} flex items-center justify-center overflow-hidden`}>
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo preview" className="w-full h-full object-contain rounded-xl" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                ) : null}
                <span className={`text-xs font-bold tracking-wide ${form.accentColor} ${form.logoUrl ? 'hidden' : ''}`} style={form.logoUrl ? { display: 'none' } : {}}>{form.avatar || "???"}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Paste an image URL for the partner logo. Falls back to initials if empty.</p>
            </div>
            <div>
              <label className={labelCls}>Avatar Initials (fallback)</label>
              <input
                className={inputCls}
                value={form.avatar}
                onChange={(e) => set("avatar", e.target.value.toUpperCase().slice(0, 4))}
                placeholder="e.g. ESN"
                maxLength={4}
              />
            </div>
          </div>

          {/* Colour scheme */}
          <div>
            <label className={labelCls}>Colour Scheme</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {COLOR_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    currentPreset.label === p.label
                      ? `bg-gradient-to-br ${p.avatarColor} ${p.borderColor} ${p.accentColor} border-opacity-60`
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Social links */}
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Social Links <span className="normal-case text-gray-600 font-normal">(leave blank to hide)</span></p>
            <div className="space-y-3">
              {SOCIAL_PLATFORMS.map((platform) => {
                const cfg = SOCIAL_CONFIG[platform];
                return (
                  <div key={platform} className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-gray-400 shrink-0">
                      <PlatformIcon platform={platform} />
                    </div>
                    <input
                      className={inputCls}
                      value={form.social[platform]?.handle ?? ""}
                      onChange={(e) => setSocial(platform, "handle", e.target.value)}
                      placeholder={`${cfg.label} handle`}
                    />
                    <input
                      className={inputCls}
                      value={form.social[platform]?.url ?? ""}
                      onChange={(e) => setSocial(platform, "url", e.target.value)}
                      placeholder={`${cfg.label} URL`}
                      type="url"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 transition-all">
              Cancel
            </button>
            <button type="submit" className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-medium text-white transition-all shadow-lg shadow-red-500/20">
              <CheckIcon className="w-4 h-4" />
              {initial ? "Save Changes" : "Add Partner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Compact partner row ─── */
const PartnerRow = ({ partner, onEdit, onDelete }) => {
  const socialCount = Object.values(partner.social ?? {}).filter((s) => s?.url).length;
  return (
    <div className="group flex items-center gap-4 p-4 bg-white/3 border border-white/8 rounded-xl hover:bg-white/5 hover:border-white/15 transition-all">
      {/* Avatar */}
      <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${partner.avatarColor} border ${partner.borderColor} flex items-center justify-center shrink-0 overflow-hidden`}>
        {partner.logoUrl ? (
          <img src={partner.logoUrl} alt={partner.name} className="w-full h-full object-contain rounded-lg" />
        ) : (
          <span className={`text-xs font-bold tracking-wide ${partner.accentColor}`}>{partner.avatar}</span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 grow">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white truncate">{partner.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${partner.accentColor}`}>{partner.type}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{partner.description}</p>
        <div className="flex items-center gap-1 mt-1.5">
          {SOCIAL_PLATFORMS.map((p) =>
            partner.social?.[p]?.url ? (
              <span key={p} className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/5 text-gray-500">
                <PlatformIcon platform={p} />
              </span>
            ) : null
          )}
          {socialCount === 0 && <span className="text-xs text-gray-600">No social links</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(partner)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          title="Edit"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(partner.id)}
          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
          title="Delete"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ─── Main management component ─── */
const PartnerManagement = () => {
  const [partners, setPartners] = useState(getPartners);
  const [modal, setModal] = useState(null); // null | { mode: "add" } | { mode: "edit", partner }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id to delete
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const persist = (updated) => {
    setPartners(updated);
    savePartners(updated);
  };

  const handleSave = (formData) => {
    if (modal?.mode === "edit") {
      const updated = partners.map((p) =>
        p.id === modal.partner.id ? { ...formData, id: p.id } : p
      );
      persist(updated);
      showToast("Partner updated successfully");
    } else {
      const newPartner = { ...formData, id: Date.now() };
      persist([...partners, newPartner]);
      showToast("Partner added successfully");
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    persist(partners.filter((p) => p.id !== id));
    setDeleteConfirm(null);
    showToast("Partner removed", "error");
  };

  const handleReset = () => {
    persist(DEFAULT_PARTNERS);
    showToast("Partners reset to defaults");
  };

  return (
    <div className="relative space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white border transition-all ${
          toast.type === "error"
            ? "bg-red-500/90 border-red-400/50"
            : "bg-green-600/90 border-green-400/50"
        }`}>
          {toast.type === "error" ? <TrashIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white">Partners &amp; Collaborators</h3>
          <p className="text-sm text-gray-400 mt-0.5">{partners.length} partner{partners.length !== 1 ? "s" : ""} listed</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="Reset to default sample partners"
          >
            Reset to Defaults
          </button>
          <button
            onClick={() => setModal({ mode: "add" })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-medium text-white transition-all shadow-lg shadow-red-500/20"
          >
            <PlusIcon className="w-4 h-4" />
            Add Partner
          </button>
        </div>
      </div>

      {/* Partners list */}
      {partners.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl">
          <p className="text-gray-500 mb-4">No partners yet.</p>
          <button
            onClick={() => setModal({ mode: "add" })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-medium text-white transition-all"
          >
            <PlusIcon className="w-4 h-4" /> Add first partner
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {partners.map((partner) => (
            <PartnerRow
              key={partner.id}
              partner={partner}
              onEdit={(p) => setModal({ mode: "edit", partner: p })}
              onDelete={(id) => setDeleteConfirm(id)}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Remove Partner?</h3>
            <p className="text-sm text-gray-400 mb-5">
              This partner will be removed from the About page. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-medium text-white transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {modal && (
        <PartnerModal
          initial={modal.mode === "edit" ? modal.partner : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default PartnerManagement;
