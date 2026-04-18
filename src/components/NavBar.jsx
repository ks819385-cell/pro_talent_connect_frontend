import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/Logo@pro_talent_connect.png";

/* ── SVG icons for bottom tab bar ──────────────────────────── */
const IconHome = ({ active }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12L12 3l9 9v9a1 1 0 01-1 1h-5v-5H9v5H4a1 1 0 01-1-1z"
      fill={active ? "currentColor" : "none"}
    />
  </svg>
);

const IconPlayers = ({ active }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="9"
      cy="7"
      r="3"
      fill={active ? "currentColor" : "none"}
      strokeWidth={active ? 0 : 1.8}
    />
    <circle
      cx="17"
      cy="8"
      r="2.5"
      fill={active ? "currentColor" : "none"}
      strokeWidth={active ? 0 : 1.8}
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2 21c0-3.866 3.134-7 7-7s7 3.134 7 7"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 21c0-2.761-1.343-5-3-5.5"
    />
  </svg>
);

const IconBlog = ({ active }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="4"
      y="3"
      width="16"
      height="18"
      rx="2"
      fill={active ? "currentColor" : "none"}
      strokeWidth={active ? 0 : 1.8}
    />
    <line
      x1="8"
      y1="9"
      x2="16"
      y2="9"
      stroke="currentColor"
      strokeOpacity={active ? 0.35 : 1}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="8"
      y1="13"
      x2="16"
      y2="13"
      stroke="currentColor"
      strokeOpacity={active ? 0.35 : 1}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="8"
      y1="17"
      x2="12"
      y2="17"
      stroke="currentColor"
      strokeOpacity={active ? 0.35 : 1}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const IconServices = ({ active }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2l2.09 6.43H21l-5.47 3.97 2.09 6.43L12 14.86l-5.62 4.07 2.09-6.43L3 8.43h6.91L12 2z"
      fill={active ? "currentColor" : "none"}
    />
  </svg>
);

const IconContact = ({ active }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
      fill={active ? "currentColor" : "none"}
    />
  </svg>
);

const IconAbout = ({ active }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      fill={active ? "currentColor" : "none"}
      strokeWidth={active ? 0 : 1.8}
    />
    <path
      d="M12 10.3v5"
      stroke={active ? "#0f0f12" : "currentColor"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <circle cx="12" cy="7.4" r="1" fill={active ? "#0f0f12" : "currentColor"} />
  </svg>
);

const IconLegal = ({ active }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"
      fill={active ? "currentColor" : "none"}
      strokeWidth={active ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 13h6M9 17h6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDashboard = ({ active }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="3"
      width="8"
      height="8"
      rx="1"
      fill={active ? "currentColor" : "none"}
      strokeWidth={active ? 0 : 1.8}
    />
    <rect
      x="13"
      y="3"
      width="8"
      height="8"
      rx="1"
      fill={active ? "currentColor" : "none"}
      strokeWidth={active ? 0 : 1.8}
    />
    <rect
      x="3"
      y="13"
      width="8"
      height="8"
      rx="1"
      fill={active ? "currentColor" : "none"}
      strokeWidth={active ? 0 : 1.8}
    />
    <rect
      x="13"
      y="13"
      width="8"
      height="8"
      rx="1"
      fill={active ? "currentColor" : "none"}
      strokeWidth={active ? 0 : 1.8}
    />
  </svg>
);

const IconLogin = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"
    />
    <polyline
      points="10 17 15 12 10 7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="15" y1="12" x2="3" y2="12" strokeLinecap="round" />
  </svg>
);

/* Three-dot ••• More icon — cleaner than hamburger for bottom nav */
const IconMore = ({ active }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="5" cy="12" r={active ? 2.2 : 2} />
    <circle cx="12" cy="12" r={active ? 2.2 : 2} />
    <circle cx="19" cy="12" r={active ? 2.2 : 2} />
  </svg>
);

/* Standard person / profile icon — replaces Login in mobile tab bar */
const IconProfile = ({ active }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="8"
      r="4"
      fill={active ? "currentColor" : "none"}
      strokeWidth={active ? 0 : 1.8}
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 20c0-4 3.582-7 8-7s8 3 8 7"
      strokeWidth={active ? 2 : 1.8}
    />
  </svg>
);

const NavBar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const isLoggedIn = !!localStorage.getItem("adminSession");
  const [pressedTab, setPressedTab] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreSheetRef = useRef(null);
  const moreTriggerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* desktop links (includes About) */
  const desktopLinks = useMemo(() => [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Players", path: "/players" },
    { name: "Blog", path: "/blog" },
    { name: "Services", path: "/services" },
    { name: "Contact", path: "/contact" },
    ...(isLoggedIn
      ? [{ name: "Dashboard", path: "/admin" }]
      : [{ name: "Login", path: "/login" }]),
  ], [isLoggedIn]);

  /* mobile bottom tab links — Home in center for faster thumb access */
  const bottomTabs = useMemo(() => [
    { name: "Players", path: "/players", Icon: IconPlayers },
    { name: "Blog", path: "/blog", Icon: IconBlog },
    { name: "Home", path: "/", Icon: IconHome },
    ...(isLoggedIn
      ? [{ name: "Dashboard", path: "/admin", Icon: IconDashboard }]
      : [{ name: "Profile", path: "/login", Icon: IconProfile }]),
    { name: "More", path: null, Icon: IconMore },
  ], [isLoggedIn]);

  /* secondary links shown in the More sheet */
  const moreLinks = useMemo(() => [
    {
      name: "About",
      path: "/about",
      Icon: IconAbout,
      desc: "Our story and mission",
    },
    {
      name: "Services",
      path: "/services",
      Icon: IconServices,
      desc: "What we offer",
    },
    {
      name: "Contact Us",
      path: "/contact",
      Icon: IconContact,
      desc: "Get in touch",
    },
    {
      name: "Privacy Policy",
      path: "/privacy-policy",
      Icon: IconLegal,
      desc: "How we handle your data",
    },
    {
      name: "Terms of Service",
      path: "/terms-of-service",
      Icon: IconLegal,
      desc: "Platform usage terms",
    },
    {
      name: "Cookie Policy",
      path: "/cookie-policy",
      Icon: IconLegal,
      desc: "Cookie and tracking details",
    },
  ], []);

  const getIsActive = useCallback((path) => {
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }, [location.pathname]);

  useEffect(() => {
    if (!moreOpen) return undefined;

    const sheet = moreSheetRef.current;
    const trigger = moreTriggerRef.current;
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const getFocusableElements = () =>
      Array.from(sheet?.querySelectorAll(focusableSelector) || []).filter(
        (element) => !element.hasAttribute("disabled"),
      );

    const focusableElements = getFocusableElements();
    focusableElements[0]?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMoreOpen(false);
        trigger?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstElement || !sheet?.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
      } else if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [moreOpen]);

  return (
    <>
      {/* ── Top navbar ──────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-black/80 shadow-lg shadow-black/50 border-b border-white/20"
            : "bg-black/40 border-b border-white/10"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Liquid glass border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-red-500/50 to-transparent" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="shrink-0">
              <Link
                to="/"
                className="flex items-center hover:opacity-80 transition-opacity duration-300"
                aria-label="Pro Talent Connect Home"
              >
                <img
                  src={logo}
                  alt="Pro Talent Connect"
                  className="h-10 sm:h-12 w-auto"
                />
              </Link>
            </div>

            {/* Desktop links */}
            <div className="hidden md:block">
              <ul className="flex items-center gap-2" role="menubar">
                {desktopLinks.map((link) => {
                  const isActive = getIsActive(link.path);
                  return (
                    <li key={link.name} role="none">
                      <Link
                        to={link.path}
                        role="menuitem"
                        tabIndex={0}
                        className={`
                          relative px-5 py-2 font-semibold text-base
                          transition-all duration-300 group overflow-hidden rounded-lg
                          ${isActive ? "text-red-500" : "text-white hover:text-red-500"}
                          ${
                            link.name === "Login" || link.name === "Dashboard"
                              ? "ml-4 bg-red-500 hover:bg-red-600 text-white hover:text-white border-none"
                              : ""
                          }
                        `}
                      >
                        <span className="absolute inset-0 bg-linear-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <span
                          className={`absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 transition-transform duration-300 origin-left ${
                            isActive
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100"
                          }`}
                        />
                        <span className="relative z-10">{link.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Top animated red line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden">
          <div
            className={`h-full bg-linear-to-r from-transparent via-red-500 to-transparent animate-pulse ${
              isScrolled ? "opacity-100" : "opacity-50"
            }`}
          />
        </div>
      </nav>

      {/* ── Bottom tab bar — reduced visual noise, center Home ────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
        aria-label="Mobile navigation"
      >
        <ul
          className="flex h-[60px] rounded-2xl border border-white/[0.07] bg-[#0f0f12]/92"
          style={{
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.42)",
          }}
        >
          {bottomTabs.map(({ name, path, Icon }) => {
            const isMore = name === "More";
            const isActive = isMore ? moreOpen : getIsActive(path);
            const isPressed = pressedTab === name;
            const isCenterHome = name === "Home";

            const inner = (
              <>
                {/* Icon — pill highlight when active */}
                <span
                  className="relative flex items-center justify-center"
                  style={{ width: 48, height: 30 }}
                >
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full bg-red-500/14"
                      style={{
                        transition: "opacity 200ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
                        transform: isCenterHome ? "scale(1.08)" : "scale(1)",
                      }}
                    />
                  )}
                  <span
                    className="relative transition-all duration-200"
                    style={{
                      color: isActive ? "#e63a3a" : "rgba(255,255,255,0.55)",
                      transform: isActive ? "translateY(-0.5px)" : "translateY(0)",
                    }}
                  >
                    {Icon({ active: isActive })}
                  </span>
                </span>
                {/* Label */}
                <span
                  className="text-[11px] font-medium leading-none transition-all duration-200"
                  style={{
                    color: isActive ? "#e63a3a" : "rgba(255,255,255,0.43)",
                    opacity: isActive ? 1 : 0.72,
                  }}
                >
                  {name}
                </span>
              </>
            );

            const sharedStyle = {
              transform: isPressed
                ? "scale(0.94)"
                : isActive
                  ? "translateY(-1px)"
                  : "translateY(0)",
              transition: "transform 200ms cubic-bezier(0.22, 1, 0.36, 1), color 200ms ease",
            };
            const sharedEvents = {
              onPointerDown: () => setPressedTab(name),
              onPointerUp: () => setPressedTab(null),
              onPointerLeave: () => setPressedTab(null),
              onPointerCancel: () => setPressedTab(null),
            };

            if (isMore) {
              return (
                <li key={name} className="flex-1 flex">
                  <button
                    type="button"
                    ref={moreTriggerRef}
                    {...sharedEvents}
                    onClick={() => setMoreOpen((v) => !v)}
                    className="flex flex-1 flex-col items-center justify-center gap-1 select-none outline-none"
                    style={sharedStyle}
                    aria-expanded={moreOpen}
                    aria-label="More options"
                  >
                    {inner}
                  </button>
                </li>
              );
            }

            return (
              <li key={name} className="flex-1 flex">
                <Link
                  to={path}
                  {...sharedEvents}
                  onClick={() => setMoreOpen(false)}
                  className="flex flex-1 flex-col items-center justify-center gap-1 select-none outline-none"
                  style={sharedStyle}
                  aria-current={isActive ? "page" : undefined}
                >
                  {inner}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── More bottom sheet ────────────────────────────────── */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet */}
          <div
            className="md:hidden fixed left-0 right-0 z-40 bg-[#16161a] rounded-t-[20px] shadow-[0_-8px_32px_rgba(0,0,0,0.5)] animate-slide-up-sheet"
            style={{ bottom: "calc(64px + max(6px, env(safe-area-inset-bottom)))" }}
            role="dialog"
            aria-modal="true"
            aria-label="More options"
            ref={moreSheetRef}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-0.5">
              <div className="w-8 h-1 rounded-full bg-white/25" />
            </div>

            {/* Section label */}
            <p className="px-4 pt-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30">
              More
            </p>

            {/* Rows */}
            <ul className="px-3 pb-4 space-y-1">
              {moreLinks.map(({ name, path, Icon, desc }) => {
                const active = getIsActive(path);
                return (
                  <li key={name}>
                    <Link
                      to={path}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-3 w-full px-3 py-3.5 rounded-2xl transition-all duration-200"
                      style={{
                        background: active
                          ? "rgba(230,58,58,0.10)"
                          : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) e.currentTarget.style.transform = "translateX(2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                      onPointerDown={(e) =>
                        !active && ((e.currentTarget.style.background = "rgba(255,255,255,0.04)"), (e.currentTarget.style.transform = "scale(0.99)"))
                      }
                      onPointerUp={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.transform = "translateX(2px)";
                        }
                      }}
                      onPointerLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.transform = "translateX(0)";
                        }
                      }}
                    >
                      {/* Icon badge */}
                      <span
                        className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                        style={{
                          background: active
                            ? "rgba(230,58,58,0.14)"
                            : "rgba(255,255,255,0.07)",
                          color: active ? "#e63a3a" : "rgba(255,255,255,0.75)",
                        }}
                      >
                        {Icon({ active })}
                      </span>

                      {/* Text */}
                      <span className="flex flex-col min-w-0">
                        <span
                          className="text-[15px] font-semibold leading-snug"
                          style={{
                            color: active
                              ? "#e63a3a"
                              : "rgba(255,255,255,0.90)",
                          }}
                        >
                          {name}
                        </span>
                        <span
                          className="text-[13px] leading-snug mt-0.5"
                          style={{ color: "rgba(255,255,255,0.50)" }}
                        >
                          {desc}
                        </span>
                      </span>

                      {/* Chevron */}
                      <svg
                        className="ml-auto shrink-0 w-4 h-4"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </>
  );
};

export default NavBar;
