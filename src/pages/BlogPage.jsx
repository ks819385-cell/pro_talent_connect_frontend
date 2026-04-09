import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { api } from "../services/api";

// Design tokens
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
const CATEGORIES = ["All", "Transfers", "Achievements", "Announcements"];
const PAGE_SIZE = 9;
const MOBILE_PAGE_SIZE = 10;

// Helpers
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
const getBlogExcerpt = (blog) => stripMarkdown(blog.excerpt || blog.content || "");
const getAuthorName = (blog) => {
  const a = blog.author || blog.author_id;
  if (!a) return null;
  return typeof a === "string" ? a : a?.name || "Admin";
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

// Skeleton
const SkeletonCard = () => (
  <div style={GLASS} className="rounded-2xl overflow-hidden flex flex-col">
    <div
      className="w-full bg-white/5 animate-pulse"
      style={{ paddingTop: "56.25%" }}
    />
    <div className="p-5 space-y-3">
      <div
        className="h-3 w-24 rounded animate-pulse"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
      <div
        className="h-5 w-full rounded animate-pulse"
        style={{ background: "rgba(255,255,255,0.1)" }}
      />
      <div
        className="h-5 w-3/4 rounded animate-pulse"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
      <div
        className="h-3 w-1/2 rounded animate-pulse"
        style={{ background: "rgba(255,255,255,0.05)" }}
      />
    </div>
  </div>
);

/*
  -- Mobile Skeleton Row ------------------------------------------
  Mirrors MobileBlogCard proportions during loading.
*/
const MobileSkeletonRow = () => (
  <div
    className="flex items-center gap-3 px-4 py-3 rounded-2xl animate-pulse"
    style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.07)",
    }}
  >
    <div
      className="shrink-0 rounded-xl"
      style={{
        width: "80px",
        height: "80px",
        background: "rgba(255,255,255,0.09)",
      }}
    />
    <div className="flex-1 min-w-0 space-y-2">
      <div className="flex items-center gap-2">
        <div
          className="h-3.5 w-16 rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <div
          className="h-3 w-10 rounded"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />
      </div>
      <div
        className="h-4 w-full rounded"
        style={{ background: "rgba(255,255,255,0.1)" }}
      />
      <div
        className="h-4 w-4/5 rounded"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
    </div>
    <div
      className="w-4 h-4 rounded shrink-0"
      style={{ background: "rgba(255,255,255,0.05)" }}
    />
  </div>
);

/*
  -- Mobile Featured Hero Card ----------------------------------- 
  UX Laws:
  - Fitts's Law: full-width tappable card, 48px CTA
  - Serial Position: featured first, biggest visual weight
  - Von Restorff: "Featured" label + red overlay CTA stands out
  - Aesthetic-Usability: text overlaid on image = compact, no extra scroll
*/
const MobileFeaturedCard = ({ blog }) => {
  const cs = catStyle(blog.category);
  return (
    <Link
      to={`/blog/${blog._id}`}
      style={{ textDecoration: "none" }}
      className="block"
    >
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ height: "260px" }}
      >
        <img
          src={getBlogImage(blog)}
          alt={blog.title}
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Dark gradient overlay so text is readable */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)",
          }}
        />
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className="font-semibold rounded-full px-2.5 py-0.5"
            style={{
              fontSize: "10px",
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.55)",
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
            }}
          >
            FEATURED
          </span>
          <span
            className="font-medium rounded-full px-2.5 py-0.5"
            style={{
              fontSize: "10px",
              color: cs.color,
              background: cs.bg,
              border: `1px solid ${cs.border}`,
              backdropFilter: "blur(8px)",
            }}
          >
            {blog.category}
          </span>
        </div>
        {/* Bottom text overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <h2
            className="text-white font-semibold line-clamp-2 mb-2"
            style={{
              fontSize: "18px",
              lineHeight: 1.3,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {blog.title}
          </h2>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>
              {formatDate(blog.createdAt || blog.published_at)}
              {blog.readTime ? ` | ${blog.readTime} min read` : ""}
            </span>
            <span
              className="flex items-center gap-1 font-semibold rounded-xl px-3"
              style={{
                height: "32px",
                fontSize: "13px",
                background: "#C4161C",
                color: "#fff",
              }}
            >
              Read
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

/*
  -- Mobile Blog Card (horizontal row) -------------------------- 
  UX Laws:
  - Fitts's Law: full row tappable, min ~86px touch height
  - Miller's Law: title only (2 lines max) + date: 3 data points
  - Gestalt Proximity: category + date grouped in one meta row
  - Progressive Disclosure: no excerpt shown, detail revealed on tap
  - Aesthetic-Usability: tight spacing, clear hierarchy, press state
*/
const MobileBlogCard = ({ blog }) => {
  const cs = catStyle(blog.category);
  const [pressed, setPressed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      to={`/blog/${blog._id}`}
      style={{ textDecoration: "none" }}
      className="block"
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: pressed
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          transform: pressed ? "scale(0.984)" : "scale(1)",
          transition: "transform 0.1s ease, background 0.1s ease",
          WebkitTapHighlightColor: "transparent",
        }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
      >
        {/* Thumbnail */}
        <div
          className="relative shrink-0 rounded-xl overflow-hidden"
          style={{
            width: "80px",
            height: "80px",
            background: "rgba(255,255,255,0.08)",
          }}
        >
          {!imgLoaded && (
            <div
              className="absolute inset-0 animate-pulse"
              style={{ background: "rgba(255,255,255,0.09)" }}
            />
          )}
          <img
            src={getBlogImage(blog)}
            alt={blog.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className="w-full h-full object-cover"
            style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 0.25s" }}
          />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          {/* Meta row: category + date */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="shrink-0 font-medium rounded-full px-2 py-0.5"
              style={{
                fontSize: "10px",
                color: cs.color,
                background: cs.bg,
                letterSpacing: "0.03em",
              }}
            >
              {blog.category}
            </span>
            <span
              className="truncate"
              style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}
            >
              {formatDate(blog.createdAt || blog.published_at)}
              {blog.readTime ? ` | ${blog.readTime}m` : ""}
            </span>
          </div>
          {/* Title - 2 lines max */}
          <h3
            className="text-white font-semibold line-clamp-2"
            style={{ fontSize: "14px", lineHeight: 1.4 }}
          >
            {blog.title}
          </h3>
        </div>

        {/* Chevron affordance */}
        <ChevronRightIcon
          className="w-4 h-4 shrink-0"
          style={{ color: "rgba(255,255,255,0.2)" }}
        />
      </div>
    </Link>
  );
};

// Featured Article
const FeaturedCard = ({ blog }) => {
  const cs = catStyle(blog.category);
  return (
    <Link
      to={`/blog/${blog._id}`}
      className="group block"
      style={{ textDecoration: "none" }}
    >
      <div
        className="rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-2xl"
        style={{ ...GLASS, boxShadow: "0 2px 24px rgba(0,0,0,0.22)" }}
      >
        <div className="flex flex-col lg:flex-row">
          <div
            className="relative overflow-hidden"
            style={{ flexBasis: "60%", minHeight: "288px" }}
          >
            <img
              src={getBlogImage(blog)}
              alt={blog.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              loading="eager"
            />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-black/50 hidden lg:block" />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent lg:hidden" />
            <div className="absolute top-4 left-4">
              <span
                className="px-3 py-1 rounded-full font-semibold"
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.04em",
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
          <div
            className="flex flex-col justify-center gap-5 p-7"
            style={{ flexBasis: "40%" }}
          >
            <p
              className="uppercase tracking-widest"
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.26)",
                letterSpacing: "0.15em",
              }}
            >
              Featured Article
            </p>
            <h2
              className="text-white font-semibold"
              style={{
                fontSize: "clamp(20px, 2.4vw, 28px)",
                lineHeight: "1.3",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {blog.title}
            </h2>
            <p
              className="line-clamp-2"
              style={{
                fontSize: "15px",
                lineHeight: "1.65",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {getBlogExcerpt(blog)}
            </p>
            <div
              className="flex items-center gap-2"
              style={{ fontSize: "13px", color: "rgba(255,255,255,0.32)" }}
            >
              <span>{formatDate(blog.createdAt || blog.published_at)}</span>
              {blog.readTime && (
                <>
                  <span style={{ opacity: 0.4 }}>|</span>
                  <span>{blog.readTime} min read</span>
                </>
              )}
            </div>
            <div
              className="self-start inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                fontSize: "14px",
                height: "44px",
                padding: "0 22px",
                backgroundColor: "#C4161C",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(196,22,28,0.25)",
              }}
            >
              Read Article
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Blog Card
const BlogCard = ({ blog }) => {
  const cs = catStyle(blog.category);
  const author = getAuthorName(blog);
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
        <div className="flex-1 flex flex-col p-5 gap-2.5">
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
          <p
            className="line-clamp-2 flex-1"
            style={{
              fontSize: "14px",
              lineHeight: "1.65",
              color: "rgba(255,255,255,0.42)",
            }}
          >
            {getBlogExcerpt(blog)}
          </p>
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

// No Results
const NoResults = ({ category, onReset }) => (
  <div className="text-center py-24">
    <MagnifyingGlassIcon className="w-10 h-10 mx-auto mb-4 text-white/45" />
    <p
      className="font-semibold text-white mb-2"
      style={{ fontSize: "18px", fontFamily: "'Poppins', sans-serif" }}
    >
      No articles in &ldquo;{category}&rdquo;
    </p>
    <p
      className="mb-6"
      style={{
        fontSize: "14px",
        color: "rgba(255,255,255,0.38)",
        lineHeight: "1.6",
      }}
    >
      Check back soon or browse all articles.
    </p>
    <button
      onClick={onReset}
      className="inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 hover:opacity-90"
      style={{
        fontSize: "14px",
        height: "44px",
        padding: "0 22px",
        backgroundColor: "#C4161C",
        color: "#fff",
      }}
    >
      View All Articles
    </button>
  </div>
);

// Main
const BlogPage = () => {
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [mobilePage, setMobilePage] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.getBlogs({ limit: 100 });
      setAllBlogs(response.data.blogs || response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError(err.message);
      setAllBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = allBlogs.filter((b) => {
    const matchCat = activeFilter === "All" || b.category === activeFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (b.title || "").toLowerCase().includes(q) ||
      getBlogExcerpt(b).toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const counts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] =
      cat === "All"
        ? allBlogs.length
        : allBlogs.filter((b) => b.category === cat).length;
    return acc;
  }, {});

  const showFeatured = activeFilter === "All" && !search;
  const featured = showFeatured ? allBlogs[0] || null : null;
  const gridBlogs = showFeatured ? filtered.slice(1) : filtered;
  const totalPages = Math.ceil(gridBlogs.length / PAGE_SIZE);
  const paginated = gridBlogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const compactPageItems = (() => {
    if (totalPages <= 1) return [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items = [];
    const windowStart = Math.max(1, page - 1);
    const windowEnd = Math.min(totalPages, page + 1);
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

  // Mobile - show more on each "load more" tap
  const mobileTotalPages = Math.ceil(gridBlogs.length / MOBILE_PAGE_SIZE);
  const mobilePaginated = gridBlogs.slice(0, mobilePage * MOBILE_PAGE_SIZE);

  const handleFilter = (cat) => {
    setActiveFilter(cat);
    setPage(1);
    setMobilePage(1);
  };
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
    setMobilePage(1);
  };
  const resetFilters = () => {
    setActiveFilter("All");
    setSearch("");
    setPage(1);
    setMobilePage(1);
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background:
          "linear-gradient(160deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0b 100%)",
      }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-160 h-95 rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(196,22,28,0.22) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* -----------------------------------------------------------
           MOBILE LAYOUT  (< md)
           UX Laws applied across:
         - Fitts's Law: full-width tappables, 48px inputs
         - Miller's Law: max 3 data points per card
         - Serial Position: featured article anchors top
         - Jakob's Law: familiar sticky header + search bar
         - Aesthetic-Usability: compact, high contrast, no clutter
         - Hick's Law: 4 category chips (small choice set)
      ----------------------------------------------------------- */}
      <div className="md:hidden flex flex-col" style={{ minHeight: "100dvh" }}>
        {/* -- Sticky top bar -- */}
        <div
          className="sticky z-30 shrink-0"
          style={{
            top: 0,
            background: "rgba(10,10,15,0.93)",
            backdropFilter: "blur(18px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            paddingTop: "calc(64px + env(safe-area-inset-top))",
          }}
        >
          {/* Title + count */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div>
              <h1
                className="text-white font-bold leading-tight"
                style={{ fontSize: "22px" }}
              >
                Blog <span style={{ color: "#C4161C" }}>Articles</span>
              </h1>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.32)",
                  marginTop: "2px",
                }}
              >
                {loading
                  ? "Loading..."
                  : `${filtered.length} article${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {/* Search bar - Fitts's Law: 48px height, full width */}
          <div className="px-4 pb-2">
            <div className="relative">
              <MagnifyingGlassIcon
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                style={{ color: "rgba(255,255,255,0.3)" }}
              />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={handleSearch}
                style={{
                  width: "100%",
                  height: "48px",
                  paddingLeft: "42px",
                  paddingRight: search ? "42px" : "14px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "14px",
                  fontSize: "14px",
                  color: "#fff",
                  outline: "none",
                }}
                className="placeholder:text-white/25 transition-all"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setMobilePage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full active:bg-white/10 transition-colors"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  aria-label="Clear search"
                >
                  <XMarkIcon
                    className="w-4 h-4"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Horizontal scrollable category chips - Hick's Law: small choice set */}
          <div
            className="px-4 pb-3"
            style={{
              overflowX: "auto",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="flex gap-2" style={{ width: "max-content" }}>
              {CATEGORIES.map((cat) => {
                const isActive = activeFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleFilter(cat)}
                    className="inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-150"
                    style={{
                      fontSize: "13px",
                      height: "34px",
                      padding: "0 14px",
                      background: isActive
                        ? "rgba(196,22,28,0.18)"
                        : "rgba(255,255,255,0.05)",
                      border: isActive
                        ? "1px solid rgba(196,22,28,0.45)"
                        : "1px solid rgba(255,255,255,0.09)",
                      color: isActive
                        ? "rgba(255,130,130,0.95)"
                        : "rgba(255,255,255,0.52)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat}
                    <span
                      className="rounded-full"
                      style={{
                        fontSize: "11px",
                        padding: "1px 7px",
                        background: isActive
                          ? "rgba(196,22,28,0.25)"
                          : "rgba(255,255,255,0.07)",
                        color: isActive
                          ? "rgba(255,160,160,0.9)"
                          : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {counts[cat]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* -- Content list -- */}
        <div
          className="flex-1 px-4 pt-3 pb-28"
          style={{ overscrollBehavior: "contain" }}
        >
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <MobileSkeletonRow key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>
                Failed to load articles
              </p>
              <button
                onClick={fetchBlogs}
                className="mt-4"
                style={{
                  fontSize: "14px",
                  color: "#FCA5A5",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <NoResults category={activeFilter} onReset={resetFilters} />
          ) : (
            <>
              {/* Featured article - Serial Position: first = most weight */}
              {featured && (
                <div className="mb-4">
                  <MobileFeaturedCard blog={featured} />
                </div>
              )}

              {/* Article list */}
              {mobilePaginated.length > 0 && (
                <>
                  <p
                    className="uppercase mb-3"
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.22)",
                      letterSpacing: "0.14em",
                    }}
                  >
                    {activeFilter === "All" && !search
                      ? "All Articles"
                      : `${filtered.length - (featured ? 1 : 0)} results`}
                  </p>
                  <div className="space-y-2">
                    {mobilePaginated.map((blog) => (
                      <MobileBlogCard key={blog._id} blog={blog} />
                    ))}
                  </div>
                </>
              )}

              {/* Load more - avoids heavy pagination on mobile */}
              {mobilePage < mobileTotalPages && (
                <button
                  onClick={() => setMobilePage((p) => p + 1)}
                  className="w-full mt-4 flex items-center justify-center font-semibold rounded-2xl transition-all duration-150 active:opacity-75"
                  style={{
                    height: "52px",
                    fontSize: "14px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.65)",
                    cursor: "pointer",
                  }}
                >
                  Load More Articles
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* -----------------------------------------------------------
           DESKTOP LAYOUT  (= md)  - unchanged
      ----------------------------------------------------------- */}
      <div className="hidden md:block">
        {/* Hero */}
        <section
          className="relative pt-36 pb-14 px-4 sm:px-6"
          style={{ maxWidth: "1200px", margin: "0 auto" }}
        >
          <p
            className="uppercase tracking-widest mb-5"
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.28)",
              letterSpacing: "0.16em",
            }}
          >
            Latest Updates
          </p>
          <h1
            className="font-semibold text-white mb-5"
            style={{
              fontSize: "clamp(36px, 5vw, 52px)",
              lineHeight: "1.14",
              fontFamily: "'Poppins', sans-serif",
              maxWidth: "680px",
            }}
          >
            Insights, Transfers &{" "}
            <span className="relative inline-block">
              Platform News
              <span
                className="absolute -bottom-1 left-0 right-0 rounded-full"
                style={{ height: "2px", background: "#C4161C", opacity: 0.85 }}
              />
            </span>
          </h1>
          <p
            className="mb-8"
            style={{
              fontSize: "15px",
              lineHeight: "1.7",
              color: "rgba(255,255,255,0.42)",
              maxWidth: "520px",
            }}
          >
            Stay ahead with the latest football transfers, player milestones,
            and platform announcements.
          </p>

          {/* Search */}
          <div className="relative mb-6" style={{ maxWidth: "480px" }}>
            <MagnifyingGlassIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "rgba(255,255,255,0.28)" }}
            />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={handleSearch}
              className="w-full rounded-xl text-white outline-none"
              style={{
                height: "48px",
                fontSize: "14px",
                paddingLeft: "40px",
                paddingRight: search ? "36px" : "16px",
                ...GLASS,
                color: "rgba(255,255,255,0.85)",
              }}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(255,255,255,0.38)" }}
                aria-label="Clear search"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = activeFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleFilter(cat)}
                  className="inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 focus:outline-none"
                  style={{
                    fontSize: "13px",
                    height: "34px",
                    padding: "0 14px",
                    background: isActive
                      ? "rgba(196,22,28,0.18)"
                      : "rgba(255,255,255,0.05)",
                    border: isActive
                      ? "1px solid rgba(196,22,28,0.45)"
                      : "1px solid rgba(255,255,255,0.09)",
                    color: isActive
                      ? "rgba(255,130,130,0.95)"
                      : "rgba(255,255,255,0.52)",
                  }}
                >
                  {cat}
                  <span
                    className="rounded-full"
                    style={{
                      fontSize: "11px",
                      padding: "1px 7px",
                      background: isActive
                        ? "rgba(196,22,28,0.25)"
                        : "rgba(255,255,255,0.07)",
                      color: isActive
                        ? "rgba(255,160,160,0.9)"
                        : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {counts[cat]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Content */}
        <section
          className="relative pb-24 px-4 sm:px-6"
          style={{ maxWidth: "1200px", margin: "0 auto" }}
        >
          {loading ? (
            <div className="space-y-10">
              <div style={GLASS} className="rounded-2xl overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div
                    className="lg:w-3/5 bg-white/5 animate-pulse"
                    style={{ minHeight: "288px" }}
                  />
                  <div className="lg:w-2/5 p-7 space-y-4">
                    <div
                      className="h-3 w-28 rounded animate-pulse"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                    />
                    <div
                      className="h-7 w-full rounded animate-pulse"
                      style={{ background: "rgba(255,255,255,0.1)" }}
                    />
                    <div
                      className="h-7 w-4/5 rounded animate-pulse"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                    />
                    <div
                      className="h-4 w-1/2 rounded animate-pulse"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    />
                    <div
                      className="h-10 w-36 rounded-xl animate-pulse"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                    />
                  </div>
                </div>
              </div>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                style={{ gap: "32px" }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <ExclamationTriangleIcon className="w-10 h-10 mx-auto mb-4 text-amber-400" />
              <p
                className="font-semibold text-white mb-2"
                style={{
                  fontSize: "18px",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Failed to load articles
              </p>
              <p
                className="mb-6"
                style={{ fontSize: "14px", color: "rgba(255,255,255,0.38)" }}
              >
                {error}
              </p>
              <button
                onClick={fetchBlogs}
                className="inline-flex items-center font-semibold rounded-xl transition-all hover:opacity-90"
                style={{
                  fontSize: "14px",
                  height: "44px",
                  padding: "0 22px",
                  backgroundColor: "#C4161C",
                  color: "#fff",
                }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {featured && (
                <div className="mb-12">
                  <FeaturedCard blog={featured} />
                </div>
              )}
              {paginated.length === 0 ? (
                <NoResults category={activeFilter} onReset={resetFilters} />
              ) : (
                <>
                  {activeFilter === "All" && !search && (
                    <p
                      className="uppercase tracking-widest mb-6"
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.22)",
                        letterSpacing: "0.16em",
                      }}
                    >
                      All Articles
                    </p>
                  )}
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    style={{ gap: "32px" }}
                  >
                    {paginated.map((blog) => (
                      <BlogCard key={blog._id} blog={blog} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-12 flex-wrap">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-lg font-medium transition-all duration-200 disabled:opacity-30"
                        style={{
                          height: "34px",
                          padding: "0 12px",
                          fontSize: "12px",
                          ...GLASS,
                          color: "rgba(255,255,255,0.65)",
                        }}
                      >
                        Prev
                      </button>
                      {compactPageItems.map((pg, idx) =>
                        pg === "..." ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-1 text-xs"
                            style={{ color: "rgba(255,255,255,0.45)" }}
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={pg}
                            onClick={() => setPage(pg)}
                            className="rounded-lg font-medium transition-all duration-200"
                            aria-current={pg === page ? "page" : undefined}
                            style={{
                              minWidth: "34px",
                              height: "34px",
                              padding: "0 10px",
                              fontSize: "12px",
                              background:
                                pg === page
                                  ? "#C4161C"
                                  : "rgba(255,255,255,0.05)",
                              border:
                                pg === page
                                  ? "none"
                                  : "1px solid rgba(255,255,255,0.08)",
                              color:
                                pg === page ? "#fff" : "rgba(255,255,255,0.5)",
                            }}
                          >
                            {pg}
                          </button>
                        ),
                      )}
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="rounded-lg font-medium transition-all duration-200 disabled:opacity-30"
                        style={{
                          height: "34px",
                          padding: "0 12px",
                          fontSize: "12px",
                          ...GLASS,
                          color: "rgba(255,255,255,0.65)",
                        }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>

        {/* Newsletter */}
        <section
          className="relative px-4 sm:px-6"
          style={{ paddingTop: "64px", paddingBottom: "80px" }}
        >
          <div
            className="rounded-2xl"
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              ...GLASS,
              padding: "clamp(28px, 5vw, 44px) clamp(24px, 5vw, 48px)",
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex-1">
                <p
                  className="uppercase tracking-widest mb-3"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.26)",
                    letterSpacing: "0.15em",
                  }}
                >
                  Newsletter
                </p>
                <h2
                  className="font-semibold text-white mb-2"
                  style={{
                    fontSize: "clamp(20px, 2.8vw, 26px)",
                    fontFamily: "'Poppins', sans-serif",
                    lineHeight: "1.3",
                  }}
                >
                  Get Updates Straight to Your Inbox
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.38)",
                    lineHeight: "1.6",
                  }}
                >
                  Transfers, scouting news, and platform updates weekly, no
                  clutter.
                </p>
              </div>
              <div className="flex-1" style={{ maxWidth: "420px" }}>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="flex-1 rounded-xl text-white outline-none px-4"
                    style={{
                      height: "48px",
                      fontSize: "14px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.85)",
                      minWidth: 0,
                    }}
                  />
                  <button
                    type="submit"
                    className="shrink-0 font-semibold rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                    style={{
                      height: "48px",
                      padding: "0 22px",
                      fontSize: "14px",
                      backgroundColor: "#C4161C",
                      color: "#fff",
                      boxShadow: "0 4px 16px rgba(196,22,28,0.22)",
                    }}
                  >
                    Subscribe
                  </button>
                </form>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.24)",
                    marginTop: "10px",
                  }}
                >
                  No spam. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* end hidden md:block */}
    </div>
  );
};

export default BlogPage;
