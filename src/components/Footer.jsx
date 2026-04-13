import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/Logo@pro_talent_connect.png";
import { useAbout } from "../context/AboutContext";

/* ─── Ripple helper ─────────────────────────────────────────── */
const createRipple = (e) => {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  const r = document.createElement("span");
  r.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${x}px;top:${y}px;background:rgba(255,255,255,0.18);border-radius:50%;pointer-events:none;animation:liquidRipple 0.6s cubic-bezier(0.4,0,0.2,1) forwards;`;
  btn.appendChild(r);
  setTimeout(() => r.remove(), 650);
};

/* ─── Nav column — desktop only ─────────────────────────────── */
const NavColumn = ({ title, links }) => (
  <div className="w-full">
    <p
      className="text-white font-semibold uppercase tracking-widest"
      style={{ fontSize: "11px", marginBottom: "20px" }}
    >
      {title}
    </p>
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {links.map((link) => (
        <li key={link.name} style={{ marginBottom: "12px" }}>
          <Link
            to={link.to}
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.45)",
              textDecoration: "none",
              transition: "color 0.2s ease",
              display: "inline-block",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.9)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
            }
          >
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

/* ─── Social data ───────────────────────────────────────────── */
const SOCIAL_META = [
  {
    name: "Facebook",
    key: "facebook",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    name: "Twitter",
    key: "twitter",
    path: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
  },
  {
    name: "Instagram",
    key: "instagram",
    path: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
  },
  {
    name: "YouTube",
    key: "youtube",
    path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

/* ════════════════════════════════════════════════════════════ */
/*                          FOOTER                             */
/* ════════════════════════════════════════════════════════════ */
const Footer = () => {
  const aboutData = useAbout();
  const currentYear = new Date().getFullYear();

  const socialLinks = SOCIAL_META.map((s) => ({
    ...s,
    href: aboutData?.social_links?.[s.key] || "#",
  }));

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  const navSections = [
    {
      title: "Company",
      links: [
        { name: "About Us", to: "/about" },
        { name: "Blog", to: "/blog" },
        { name: "Contact", to: "/contact" },
      ],
    },
    {
      title: "Platform",
      links: [
        { name: "Players", to: "/players" },
        { name: "Services", to: "/services" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", to: "#" },
        { name: "Terms of Service", to: "#" },
        { name: "Cookie Policy", to: "#" },
      ],
    },
  ];

  return (
    <footer
      style={{
        position: "relative",
        background:
          "linear-gradient(to bottom, #0f0f0f 0%, #000 50%, #080808 100%)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}
    >
      {/* Top accent line */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(196,22,28,0.6) 50%, transparent 100%)",
        }}
      />

      {/* Ambient blob */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "340px",
          background:
            "radial-gradient(ellipse, rgba(196,22,28,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Outer container — full width with max-width cap ── */}
      <div
        className="mx-auto w-full"
        style={{ maxWidth: "1280px", padding: "0 24px" }}
      >
        {/* ══ NEWSLETTER — desktop only ════════════════════════════ */}
        <div
          className="hidden md:block mx-auto text-center"
          style={{
            maxWidth: "560px",
            padding: "56px 0 48px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 14px",
              borderRadius: "20px",
              background: "rgba(196,22,28,0.12)",
              border: "1px solid rgba(196,22,28,0.25)",
              marginBottom: "18px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#ef4444",
                animation: "liquidGlow 2s ease-in-out infinite",
              }}
            />
            <span
              className="text-red-400 font-semibold uppercase tracking-widest"
              style={{ fontSize: "10px" }}
            >
              Scouting Insider
            </span>
          </div>

          <h3
            className="text-white font-bold"
            style={{
              fontSize: "clamp(22px, 3vw, 30px)",
              lineHeight: 1.15,
              letterSpacing: "-0.015em",
              margin: "0 0 10px",
            }}
          >
            Stay Ahead of the Game
          </h3>
          <p
            className="text-white/45"
            style={{ fontSize: "15px", lineHeight: 1.65, margin: "0 0 28px" }}
          >
            Player spotlights, scouting trends, and recruitment insights —
            delivered to your inbox.
          </p>

          {submitted ? (
            <div
              style={{
                padding: "20px",
                borderRadius: "16px",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
              }}
            >
              <p
                className="text-emerald-400 font-semibold"
                style={{ margin: 0, fontSize: "15px" }}
              >
                ✓ You&apos;re in! Welcome to the inner circle.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row"
              style={{ gap: "10px" }}
            >
              {/* Input */}
              <div style={{ position: "relative", flex: 1 }}>
                <label
                  htmlFor="footer-email"
                  style={{
                    position: "absolute",
                    left: "20px",
                    top: inputFocused || email ? "8px" : "50%",
                    transform:
                      inputFocused || email
                        ? "translateY(0) scale(0.8)"
                        : "translateY(-50%) scale(1)",
                    transformOrigin: "left",
                    fontSize: inputFocused || email ? "11px" : "15px",
                    color: inputFocused
                      ? "rgba(239,68,68,0.9)"
                      : "rgba(255,255,255,0.35)",
                    transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
                    pointerEvents: "none",
                    zIndex: 1,
                    letterSpacing: "0.01em",
                  }}
                >
                  your@email.com
                </label>
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  required
                  className="newsletter-input w-full"
                  style={{
                    height: "52px",
                    padding: email || inputFocused ? "20px 20px 6px" : "0 20px",
                    borderRadius: "28px",
                    background: "rgba(255,255,255,0.05)",
                    border: `1.5px solid ${inputFocused ? "rgba(196,22,28,0.7)" : "rgba(255,255,255,0.1)"}`,
                    color: "#fff",
                    fontSize: "15px",
                    boxShadow: inputFocused
                      ? "0 0 0 3px rgba(196,22,28,0.12)"
                      : "none",
                    transition:
                      "border-color 0.22s ease, box-shadow 0.22s ease, padding 0.22s ease",
                  }}
                />
              </div>

              {/* CTA button */}
              <button
                type="submit"
                onClick={createRipple}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  height: "52px",
                  padding: "0 28px",
                  borderRadius: "28px",
                  background:
                    "linear-gradient(135deg, #C4161C 0%, #E8242B 55%, #C4161C 100%)",
                  border: "none",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow:
                    "0 4px 24px rgba(196,22,28,0.4), 0 1px 4px rgba(0,0,0,0.3)",
                  transition:
                    "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 32px rgba(196,22,28,0.55), 0 1px 4px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 24px rgba(196,22,28,0.4), 0 1px 4px rgba(0,0,0,0.3)";
                }}
              >
                Get Elite Insights
              </button>
            </form>
          )}

          {/* Trust note */}
          {!submitted && (
            <p
              className="text-white/30"
              style={{ fontSize: "12px", margin: "12px 0 0" }}
            >
              🔒 No spam. Only elite scouting insights.
            </p>
          )}
        </div>

        {/* ══ MOBILE FOOTER — Blinkit-style ══════════════════════ */}
        <div className="md:hidden" style={{ paddingTop: "32px" }}>
          {/* Row 1: Logo + Social icons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px 0 20px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Link to="/" style={{ display: "inline-flex" }}>
              <img
                src={logo}
                alt="Pro Talent Connect"
                style={{ height: "28px", width: "auto" }}
                loading="lazy"
              />
            </Link>
            <div style={{ display: "flex", gap: "6px" }}>
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Row 2: Flat 2-column nav grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "28px 16px",
              padding: "24px 0 26px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {navSections.map((sec) => (
              <div key={sec.title}>
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                    margin: "0 0 14px",
                  }}
                >
                  {sec.title}
                </p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {sec.links.map((link) => (
                    <li key={link.name} style={{ marginBottom: "10px" }}>
                      <Link
                        to={link.to}
                        style={{
                          fontSize: "14px",
                          color: "rgba(255,255,255,0.55)",
                          textDecoration: "none",
                          lineHeight: 1.4,
                          display: "inline-block",
                        }}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Row 3: Tagline */}
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.2)",
              textAlign: "center",
              padding: "16px 0 8px",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Connecting exceptional football talent with outstanding
            opportunities worldwide.
          </p>
        </div>

        {/* ══ MAIN COLUMNS — desktop only ═══════════════════════════ */}
        <div
          className="hidden md:grid md:grid-cols-4 gap-12"
          style={{
            padding: "48px 0",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link
              to="/"
              style={{ display: "inline-flex", marginBottom: "16px" }}
            >
              <img
                src={logo}
                alt="Pro Talent Connect"
                style={{ height: "36px", width: "auto" }}
                loading="lazy"
              />
            </Link>
            <p
              className="text-white/40"
              style={{
                fontSize: "13px",
                lineHeight: 1.7,
                margin: "0 0 20px",
                maxWidth: "240px",
              }}
            >
              Connecting exceptional football talent with outstanding
              opportunities worldwide.
            </p>

            {/* Social icons */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.45)",
                    textDecoration: "none",
                    flexShrink: 0,
                    transition:
                      "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.22s ease, box-shadow 0.22s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-3px) scale(1.1)";
                    e.currentTarget.style.background = "#C4161C";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(196,22,28,0.5)";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.border = "1px solid #C4161C";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                    e.currentTarget.style.border =
                      "1px solid rgba(255,255,255,0.1)";
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns — accordion on mobile, static on md+ */}
          {navSections.map((sec) => (
            <NavColumn key={sec.title} title={sec.title} links={sec.links} />
          ))}
        </div>

        {/* ══ BOTTOM BAR ══════════════════════════════════════════ */}
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between"
          style={{ padding: "20px 0 28px", gap: "10px" }}
        >
          <p className="text-white/25" style={{ fontSize: "12px", margin: 0 }}>
            © {currentYear} Pro Talent Connect. All rights reserved.
          </p>
          {/* Mobile: legal links row | Desktop: tagline */}
          <div className="flex items-center gap-4 md:hidden">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (label, i, arr) => (
                <span
                  key={label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <Link
                    to="#"
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.25)",
                      textDecoration: "none",
                    }}
                  >
                    {label}
                  </Link>
                  {i < arr.length - 1 && (
                    <span
                      style={{
                        width: "1px",
                        height: "10px",
                        background: "rgba(255,255,255,0.12)",
                        display: "inline-block",
                      }}
                    />
                  )}
                </span>
              ),
            )}
          </div>
          <p
            className="hidden md:block text-white/20"
            style={{ fontSize: "12px", margin: 0 }}
          >
            Built for athletes. Powered by passion.
          </p>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(196,22,28,0.25) 50%, transparent 100%)",
        }}
      />
    </footer>
  );
};

export default Footer;
