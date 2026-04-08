import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [demoteConfirm, setDemoteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Admin",
  });

  const currentAdmin = JSON.parse(localStorage.getItem("adminData") || "{}");

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.is_active = statusFilter;

      const res = await api.getAdmins(params);
      setAdmins(res.data?.admins || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const openCreateModal = () => {
    setEditingAdmin(null);
    setFormData({ name: "", email: "", password: "", role: "Admin" });
    setShowModal(true);
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role,
      is_active: admin.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (editingAdmin) {
        const updateData = { name: formData.name, email: formData.email, role: formData.role, is_active: formData.is_active };
        await api.updateAdmin(editingAdmin._id, updateData);
      } else {
        if (!formData.name || !formData.email || !formData.password) {
          setError("Name, email, and password are required");
          setSaving(false);
          return;
        }
        await api.createAdmin(formData);
      }

      setShowModal(false);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save admin");
    } finally {
      setSaving(false);
    }
  };

  const handleDemote = async (id) => {
    try {
      setError(null);
      await api.demoteAdmin(id);
      setDemoteConfirm(null);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to demote admin");
      setDemoteConfirm(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError(null);
      await api.deleteAdmin(id);
      setDeleteConfirm(null);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete admin");
      setDeleteConfirm(null);
    }
  };

  const roleBadge = (role) => {
    if (role === "Super Admin") return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
    return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
  };

  const statusBadge = (active) => {
    if (active) return "bg-green-500/20 text-green-400";
    return "bg-red-500/20 text-red-400";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Admin Management</h3>
        <button onClick={openCreateModal} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-all text-sm">
          + New Admin
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:flex-1 sm:min-w-[160px] px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 text-sm"
        />
        <Select
          value={roleFilter || "all"}
          onValueChange={(value) => {
            setRoleFilter(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-auto px-4 py-2 text-sm">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Super Admin">Super Admin</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => {
            setStatusFilter(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-auto px-4 py-2 text-sm">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Admin List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading admins...</div>
      ) : admins.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No admins found.</div>
      ) : (
        <div className="space-y-3">
          {admins.map((admin) => (
            <div key={admin._id} className="bg-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-white/[0.07] transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-semibold truncate">{admin.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${roleBadge(admin.role)}`}>
                    {admin.role}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusBadge(admin.is_active)}`}>
                    {admin.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-400 truncate">{admin.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Created: {new Date(admin.createdAt).toLocaleDateString()} 
                  {admin.last_login && ` • Last login: ${new Date(admin.last_login).toLocaleDateString()}`}
                </p>
              </div>

              {admin._id !== currentAdmin?._id && (
                <div className="flex items-center flex-wrap gap-2">
                  <button
                    onClick={() => openEditModal(admin)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all border border-white/10"
                  >
                    Edit
                  </button>
                  {admin.is_active && (
                    <button
                      onClick={() => setDemoteConfirm(admin)}
                      className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg text-sm transition-all"
                    >
                      Demote
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirm(admin)}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm transition-all"
                  >
                    Delete
                  </button>
                </div>
              )}
              {admin._id === currentAdmin?._id && (
                <span className="text-xs text-gray-500 italic">You</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editingAdmin ? "Edit Admin" : "Create Admin"}</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500/50 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500/50 text-sm"
                />
              </div>
              {!editingAdmin && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500/50 text-sm"
                    placeholder="Min 6 characters"
                  />
                </div>
              )}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Role</label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger className="w-full px-3 py-2 text-sm">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingAdmin && (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-400">Active</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`relative w-11 h-6 rounded-full transition-all ${formData.is_active ? "bg-green-500" : "bg-gray-600"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${formData.is_active ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-all text-sm border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-all text-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : editingAdmin ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-red-500 mb-3">Delete Admin</h3>
            <p className="text-gray-300 text-sm mb-1">
              Are you sure you want to permanently delete <strong>{deleteConfirm.name}</strong>?
            </p>
            <p className="text-gray-500 text-xs mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium text-sm border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium text-sm transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demote Confirmation Modal */}
      {demoteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDemoteConfirm(null)}>
          <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-yellow-500 mb-3">Demote Admin</h3>
            <p className="text-gray-300 text-sm mb-1">
              Demote <strong>{demoteConfirm.name}</strong> and deactivate their account?
            </p>
            <p className="text-gray-500 text-xs mb-4">They will be set to Admin role and marked inactive.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDemoteConfirm(null)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium text-sm border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDemote(demoteConfirm._id)}
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-medium text-sm transition-all"
              >
                Demote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
