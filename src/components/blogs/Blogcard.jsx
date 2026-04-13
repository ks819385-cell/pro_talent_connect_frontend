import { useState } from "react";
import { Link } from "react-router-dom";

// Shared design tokens
const GLASS = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.08)",
};
const GLASS_HOVER = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.14)",
};

const catStyle = (category) => {
  const map = {
    Transfers: {
      color: "rgba(96,165,250,0.9)",
      bg: "rgba(59,130,246,0.12)",
      border: "rgba(59,130,246,0.25)",
    },
    Achievements: {
      color: "rgba(74,222,128,0.9)",
      bg: "rgba(34,197,94,0.12)",
      border: "rgba(34,197,94,0.25)",
    },
    Announcements: {
      color: "rgba(196,167,255,0.9)",
      bg: "rgba(139,92,246,0.12)",
      border: "rgba(139,92,246,0.25)",
    },
  };
  return (
    map[category] || {
      color: "rgba(255,255,255,0.55)",
      bg: "rgba(255,255,255,0.07)",
      border: "rgba(255,255,255,0.12)",
    }
  );
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getBlogImage = (blog) =>
  blog.image ||
  blog.cover_image ||
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80";

const stripMarkdown = (text = "") =>
  text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const getExcerpt = (blog) => stripMarkdown(blog.excerpt || blog.content || "");

const getAuthor = (blog) => {
  const a = blog.author || blog.author_id;
  if (!a) return null;
  return typeof a === "string" ? a : a?.name || "Admin";
};

const BlogCard = ({ blog }) => {
  const cs = catStyle(blog.category);
  const author = getAuthor(blog);
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/blog/${blog._id}`}
      className="group block h-full"
      style={{ textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article
        className="h-full rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
        style={{
          ...(hovered ? GLASS_HOVER : GLASS),
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          boxShadow: hovered
            ? "0 16px 48px rgba(0,0,0,0.35)"
            : "0 2px 16px rgba(0,0,0,0.18)",
        }}
      >
        {/* 16:9 image */}
        <div
          className="relative w-full overflow-hidden"
          style={{ paddingTop: "56.25%" }}
        >
          <img
            src={getBlogImage(blog)}
            alt={blog.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
            style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 rounded-full font-medium"
              style={{
                fontSize: "11px",
                letterSpacing: "0.03em",
                color: cs.color,
                background: cs.bg,
                border: `1px solid ${cs.border}`,
                backdropFilter: "blur(8px)",
              }}
            >
              {blog.category}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col p-5 gap-2.5">
          {/* Date + read time */}
          <div
            className="flex items-center gap-2"
            style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}
          >
            <span>{formatDate(blog.createdAt || blog.published_at)}</span>
            {blog.readTime && (
              <>
                <span>|</span>
                <span>{blog.readTime} min read</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3
            className="text-white font-semibold line-clamp-2"
            style={{
              fontSize: "18px",
              lineHeight: "1.4",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {blog.title}
          </h3>

          {/* Excerpt - max 2 lines */}
          <p
            className="line-clamp-2 flex-1"
            style={{
              fontSize: "14px",
              lineHeight: "1.65",
              color: "rgba(255,255,255,0.42)",
            }}
          >
            {getExcerpt(blog)}
          </p>

          {/* Author */}
          {author && (
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.26)",
                marginTop: "4px",
              }}
            >
              By {author}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
