import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  ArrowLeftIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { api } from "../services/api";
import FloatingShapes from "../components/common/FloatingShapes";
import LoadingSkeleton from "../components/common/LoadingSkeleton";

const BlogDetailPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getBlog(id);
      setBlog(response.data.blog || response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const getCategoryColor = (category) => {
    const colors = {
      Transfers: "bg-blue-500/20 text-blue-400 border-blue-500/40",
      Achievements: "bg-green-500/20 text-green-400 border-green-500/40",
      Announcements: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    };
    return (
      colors[category] || "bg-gray-500/20 text-gray-400 border-gray-500/40"
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 pt-32 px-4">
        <FloatingShapes />
        <div className="max-w-5xl mx-auto">
          <LoadingSkeleton count={1} type="article" />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 pt-32 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Article Not Found
            </h2>
            <p className="text-gray-400 mb-8">
              {error ||
                "The article you're looking for doesn't exist or has been removed."}
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 overflow-x-hidden">
      {/* Back Button */}
      <div className="pt-32 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Blog
          </Link>
        </div>
      </div>

      <FloatingShapes />

      {/* Article Content */}
      <article className="px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          {/* Category Badge */}
          <div className="mb-6">
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md border ${getCategoryColor(blog.category)}`}
            >
              {blog.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8 pb-8 border-b border-white/10">
            {blog.author && (
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                <span>
                  {typeof blog.author === "string"
                    ? blog.author
                    : blog.author.name || "Admin"}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              <span>{formatDate(blog.published_at || blog.createdAt)}</span>
            </div>
            {blog.readTime && (
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                <span>{blog.readTime} min read</span>
              </div>
            )}
          </div>

          {/* Featured Image */}
          {blog.image && (
            <div className="aspect-[16/9] overflow-hidden rounded-3xl mb-12 border border-white/10">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Body */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
              {blog.content}
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 flex-wrap">
                <TagIcon className="w-5 h-5 text-gray-400" />
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors duration-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog CTA */}
          <div className="mt-16 pt-16 border-t border-white/10 text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/50"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Explore More Articles
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetailPage;
