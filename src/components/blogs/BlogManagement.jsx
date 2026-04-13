import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../services/api";
import { useFeedback } from "../../context/FeedbackContext";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const BlogManagement = () => {
  const { showToast, confirm } = useFeedback();
  const AUTO_REFRESH_MS = 20000;
  const BLOG_PAGE_SIZE = 50;
  const DEFAULT_CARDS_PER_PAGE = 9;
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(DEFAULT_CARDS_PER_PAGE);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "Announcements",
    image: "",
    readTime: 5,
  });

  const fetchBlogs = useCallback(async ({ silent = false, force = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      if (force) {
        api.invalidateCache("/blogs");
      }

      const firstPageResponse = await api.getAllBlogs({ page: 1, limit: BLOG_PAGE_SIZE });
      const firstPageBlogs = firstPageResponse.data?.blogs || firstPageResponse.data || [];
      const totalPages = firstPageResponse.data?.totalPages || 1;

      if (totalPages <= 1) {
        setBlogs(firstPageBlogs);
        return;
      }

      const remainingRequests = [];
      for (let page = 2; page <= totalPages; page += 1) {
        remainingRequests.push(api.getAllBlogs({ page, limit: BLOG_PAGE_SIZE }));
      }

      const remainingResponses = await Promise.all(remainingRequests);
      const remainingBlogs = remainingResponses.flatMap(
        (res) => res.data?.blogs || res.data || [],
      );

      setBlogs([...firstPageBlogs, ...remainingBlogs]);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      if (!silent) {
        showToast(
          error.response?.data?.message || "Failed to load admin blog list",
          { type: "error" },
        );
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [showToast]);

  useEffect(() => {
    fetchBlogs({ force: true });
  }, [fetchBlogs]);

  useEffect(() => {
    const refreshBlogs = () => {
      if (document.visibilityState !== "visible") return;
      fetchBlogs({ silent: true, force: true });
    };

    const intervalId = window.setInterval(refreshBlogs, AUTO_REFRESH_MS);
    window.addEventListener("focus", refreshBlogs);
    document.addEventListener("visibilitychange", refreshBlogs);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshBlogs);
      document.removeEventListener("visibilitychange", refreshBlogs);
    };
  }, [fetchBlogs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const blogData = {
        ...formData,
        status: "PUBLISHED", // Auto-publish or make it a toggle
      };
      
      if (editingBlog) {
        await api.updateBlog(editingBlog._id, blogData);
        showToast("Blog updated successfully", { type: "success" });
      } else {
        await api.createBlog(blogData);
        showToast("Blog created successfully", { type: "success" });
      }
      fetchBlogs({ force: true });
      setCurrentPage(1);
      closeModal();
    } catch (error) {
      console.error("Error saving blog:", error);
      showToast(error.response?.data?.message || "Failed to save blog", {
        type: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    const shouldDelete = await confirm({
      title: "Delete Blog Post",
      message: "Are you sure you want to delete this blog post? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      tone: "danger",
    });

    if (!shouldDelete) return;
    
    try {
      await api.deleteBlog(id);
      showToast("Blog deleted successfully", { type: "success" });
      fetchBlogs({ force: true });
      if (currentPage > 1 && pageStart === pageEnd) {
        setCurrentPage((previousPage) => Math.max(previousPage - 1, 1));
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      showToast(error.response?.data?.message || "Failed to delete blog", {
        type: "error",
      });
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

  const totalCards = blogs.length;
  const totalCardPages = Math.max(1, Math.ceil(totalCards / cardsPerPage));

  const paginatedBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * cardsPerPage;
    return blogs.slice(startIndex, startIndex + cardsPerPage);
  }, [blogs, currentPage, cardsPerPage]);

  const pageStart = totalCards === 0 ? 0 : (currentPage - 1) * cardsPerPage + 1;
  const pageEnd = Math.min(currentPage * cardsPerPage, totalCards);

  useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalCardPages));
  }, [totalCardPages]);

  const goToPage = (nextPage) => {
    const boundedPage = Math.min(Math.max(nextPage, 1), totalCardPages);
    setCurrentPage(boundedPage);
  };

  const paginationItems = useMemo(() => {
    if (totalCardPages <= 1) {
      return [1];
    }

    if (totalCardPages <= 4) {
      return Array.from({ length: totalCardPages }, (_, index) => index + 1);
    }

    const leadStart = Math.max(currentPage - 1, 1);
    const leadPages = [leadStart, leadStart + 1].filter((page) => page <= totalCardPages);
    const trailingPages = [totalCardPages - 1, totalCardPages];

    const pageSet = new Set([
      ...leadPages,
      ...trailingPages,
    ]);

    const pages = Array.from(pageSet)
      .filter((page) => page >= 1 && page <= totalCardPages)
      .sort((a, b) => a - b);

    const items = [];

    pages.forEach((page, index) => {
      if (index === 0) {
        items.push(page);
        return;
      }

      const previousPage = pages[index - 1];
      if (page - previousPage > 1) {
        items.push(`ellipsis-${previousPage}-${page}`);
      }
      items.push(page);
    });

    return items;
  }, [currentPage, totalCardPages]);

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-1">
          <h3 className="text-xl font-bold">Blog Management</h3>
          <p className="text-sm text-gray-400">
            Manage your blog posts, announcements, and news articles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[170px]">
            <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
              Cards Per Page
            </p>
            <Select
              value={String(cardsPerPage)}
              onValueChange={(value) => {
                setCardsPerPage(Number.parseInt(value, 10) || DEFAULT_CARDS_PER_PAGE);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="Cards per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 per page</SelectItem>
                <SelectItem value="9">9 per page</SelectItem>
                <SelectItem value="12">12 per page</SelectItem>
                <SelectItem value="15">15 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-medium transition-all hover:bg-red-600"
          >
            <PlusIcon className="h-5 w-5" />
            New Post
          </button>
        </div>
      </div>

      {/* Blog List */}
      <div className="space-y-5">
        {totalCards === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
            <p className="text-gray-400">No blog posts yet. Create your first one!</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {paginatedBlogs.map((blog) => (
                <article
                  key={blog._id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-red-400/40 hover:shadow-red-500/10"
                >
                  {blog.image ? (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-44 items-end bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                        Pro Talent Connect
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getCategoryBadge(blog.category)}`}
                      >
                        {blog.category}
                      </span>
                      {blog.readTime ? (
                        <span className="text-xs text-gray-400">{blog.readTime} min read</span>
                      ) : null}
                    </div>

                    <h4 className="line-clamp-2 text-lg font-semibold leading-snug text-white">
                      {blog.title}
                    </h4>

                    <p className="line-clamp-3 text-sm leading-relaxed text-gray-300">
                      {blog.excerpt || blog.content}
                    </p>

                    <div className="text-xs text-gray-500">
                      By {typeof blog.author === "string" ? blog.author : blog.author?.name || "Admin"}
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-xs text-gray-500">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(blog)}
                          className="rounded-lg p-2 text-blue-400 transition-all hover:bg-blue-500/20"
                          title="Edit post"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="rounded-lg p-2 text-red-400 transition-all hover:bg-red-500/20"
                          title="Delete post"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-400">
                Showing {pageStart} to {pageEnd} of {totalCards} posts
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-200 transition-all hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {paginationItems.map((item) =>
                    typeof item === "string" ? (
                      <span
                        key={item}
                        className="px-2 py-1 text-sm text-gray-500"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => goToPage(item)}
                        aria-current={item === currentPage ? "page" : undefined}
                        className={`min-w-9 rounded-lg px-2.5 py-1.5 text-sm transition-all ${
                          item === currentPage
                            ? "border border-red-400/60 bg-red-500/20 text-red-200"
                            : "border border-white/10 text-gray-200 hover:border-white/30 hover:bg-white/10"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalCardPages}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-200 transition-all hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
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
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger size="lg" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Announcements">Announcements</SelectItem>
                    <SelectItem value="Transfers">Transfers</SelectItem>
                    <SelectItem value="Achievements">Achievements</SelectItem>
                  </SelectContent>
                </Select>
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
