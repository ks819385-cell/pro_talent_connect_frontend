import { useState, useEffect } from "react";
import { api } from "../../services/api";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "Announcements",
    image: "",
    readTime: 5,
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.getAllBlogs();
      setBlogs(response.data.blogs || response.data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      // Fallback to public blogs if admin route fails
      try {
        const publicResponse = await api.getBlogs();
        setBlogs(publicResponse.data.blogs || publicResponse.data || []);
      } catch (err) {
        console.error("Error fetching public blogs:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const blogData = {
        ...formData,
        status: "PUBLISHED", // Auto-publish or make it a toggle
      };
      
      if (editingBlog) {
        await api.updateBlog(editingBlog._id, blogData);
      } else {
        await api.createBlog(blogData);
      }
      fetchBlogs();
      closeModal();
    } catch (error) {
      console.error("Error saving blog:", error);
      alert(error.response?.data?.message || "Failed to save blog");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    
    try {
      await api.deleteBlog(id);
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert(error.response?.data?.message || "Failed to delete blog");
    }
  };

  const openModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt || "",
        category: blog.category,
        image: blog.image || "",
        readTime: blog.readTime || 5,
      });
    } else {
      setEditingBlog(null);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        category: "Announcements",
        image: "",
        readTime: 5,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBlog(null);
  };

  const getCategoryBadge = (category) => {
    const colors = {
      Transfers: "bg-blue-500/20 text-blue-400",
      Achievements: "bg-green-500/20 text-green-400",
      Announcements: "bg-purple-500/20 text-purple-400",
    };
    return colors[category] || "bg-gray-500/20 text-gray-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-bold">Blog Management</h3>
          <p className="text-sm text-gray-400">
            Manage your blog posts, announcements, and news articles
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-all shrink-0"
        >
          <PlusIcon className="w-5 h-5" />
          New Post
        </button>
      </div>

      {/* Blog List */}
      <div className="space-y-4">
        {blogs.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
            <p className="text-gray-400">No blog posts yet. Create your first one!</p>
          </div>
        ) : (
          blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Image */}
                {blog.image && (
                  <div className="flex-shrink-0">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadge(blog.category)}`}
                        >
                          {blog.category}
                        </span>
                        {blog.readTime && (
                          <span className="text-xs text-gray-500">
                            {blog.readTime} min read
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-lg mb-1 line-clamp-1">
                        {blog.title}
                      </h4>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                        {blog.excerpt || blog.content}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>
                          By{" "}
                          {typeof blog.author === "string"
                            ? blog.author
                            : blog.author?.name || "Admin"}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(blog)}
                        className="p-2 hover:bg-blue-500/20 rounded-lg transition-all text-blue-400"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-all text-red-400"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/10 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder="Enter blog title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                >
                  <option value="Announcements">Announcements</option>
                  <option value="Transfers">Transfers</option>
                  <option value="Achievements">Achievements</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Excerpt (Short Description)
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                  placeholder="Brief summary (optional)..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={8}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                  placeholder="Write your blog content..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Featured Image
                </label>
                <div className="space-y-3">
                  {/* File Upload */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Upload Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, image: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-red-500/20 file:text-red-400 hover:file:bg-red-500/30"
                    />
                  </div>
                  {/* OR URL */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Or paste image URL</label>
                    <input
                      type="url"
                      value={formData.image?.startsWith("data:") ? "" : formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {/* Preview */}
                  {formData.image && (
                    <div className="relative">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="mt-1 w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute top-3 right-2 p-1 bg-black/70 rounded-full hover:bg-red-500/80 transition-all"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Read Time (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.readTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      readTime: parseInt(e.target.value) || 5,
                    })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-all"
                >
                  {editingBlog ? "Update Post" : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
