import { Link } from "react-router-dom";

/* ─── Liquid ripple on touch / click ─────────────────────── */
const createRipple = (e) => {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2.5;
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  const ripple = document.createElement("span");
  ripple.style.cssText = `
    position:absolute;
    width:${size}px;height:${size}px;
    left:${x}px;top:${y}px;
    background:rgba(255,255,255,0.22);
    border-radius:50%;
    pointer-events:none;
    z-index:2;
    animation:liquidRipple 0.65s cubic-bezier(0.4,0,0.2,1) forwards;
  `;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
};

const HeroSection = () => {
  return (
    <section
      className="relative w-full flex items-center overflow-hidden"
      style={{
        minHeight: "100dvh",
        backgroundImage:
          "url('https://res.cloudinary.com/doakquevf/image/upload/v1770738571/gr3_tghmze.avif')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
      aria-label="Hero section"
    >
      {/* ── Multi-layer gradient overlay — bottom-heavy for max readability ── */}
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.48) 35%, rgba(0,0,0,0.80) 65%, rgba(11,11,11,0.97) 100%)",
        }}
      />

      {/* ── Floating red ambient blob ──────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          style={{
            position: "absolute",
            width: "360px",
            height: "360px",
            background:
              "radial-gradient(ellipse, rgba(196,22,28,0.14) 0%, transparent 68%)",
            top: "12%",
            right: "-80px",
            animation: "floatBlob 9s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "220px",
            height: "220px",
            background:
              "radial-gradient(ellipse, rgba(255,70,85,0.08) 0%, transparent 70%)",
            bottom: "30%",
            left: "-40px",
            animation: "floatBlob 12s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* ── Hero content ──────────────────────────────────────────────────── */}
      <div
        className="relative z-10 w-full text-center"
        style={{ padding: "64px 16px 32px" }}
      >
        {/* Platform badge */}
        <div
          className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full"
          style={{
            background: "rgba(196,22,28,0.15)",
            border: "1px solid rgba(196,22,28,0.35)",
            backdropFilter: "blur(10px)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full bg-red-500"
            style={{ animation: "liquidGlow 2s ease-in-out infinite" }}
          />
          <span
            className="text-red-400 font-semibold uppercase tracking-widest"
            style={{ fontSize: "11px" }}
          >
            Elite Scouting Platform
          </span>
        </div>

        {/* H1 — short, impactful (Hick's Law) */}
        <h1
          className="text-white font-bold"
          style={{
            fontSize: "clamp(28px, 8vw, 56px)",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            margin: "0 auto 16px",
            maxWidth: "480px",
          }}
        >
          Discover.&nbsp;Analyze.
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #C4161C 0%, #FF4655 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Connect.
          </span>
        </h1>

        {/* Subheadline — ≤ 2 lines */}
        <p
          className="text-white/65 mx-auto"
          style={{
            fontSize: "clamp(15px, 2.8vw, 17px)",
            lineHeight: 1.65,
            maxWidth: "300px",
            marginBottom: "28px",
          }}
        >
          Verified football talent.
          <br />
          Structured scouting. Faster recruitment.
        </p>

        {/* ── CTA Buttons — side by side ────────────────────────────────── */}
        <div
          className="flex flex-row flex-wrap mx-auto"
          style={{ gap: "12px", maxWidth: "360px", width: "100%" }}
        >
          {/* Primary — solid red */}
          <Link
            to="/players"
            onClick={createRipple}
            className="hero-btn-primary relative overflow-hidden flex items-center justify-center font-bold text-white rounded-2xl"
            style={{
              flex: 1,
              height: "52px",
              background:
                "linear-gradient(135deg, #C4161C 0%, #E8242B 55%, #C4161C 100%)",
              backgroundSize: "200% auto",
              fontSize: "15px",
              letterSpacing: "0.015em",
              boxShadow:
                "0 4px 28px rgba(196,22,28,0.45), 0 1px 4px rgba(0,0,0,0.4)",
              transition:
                "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Explore Players
          </Link>

          {/* Secondary — ghost outline */}
          <Link
            to="/blog"
            onClick={createRipple}
            className="hero-btn-secondary relative overflow-hidden flex items-center justify-center font-semibold text-white rounded-2xl"
            style={{
              flex: 1,
              height: "52px",
              background: "rgba(255,255,255,0.06)",
              border: "1.5px solid rgba(255,255,255,0.24)",
              backdropFilter: "blur(12px)",
              fontSize: "15px",
              letterSpacing: "0.015em",
              transition:
                "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), background 0.22s ease",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            View Insights
          </Link>
        </div>

        {/* ── Scroll hint ───────────────────────────────────────────────── */}
        <div
          className="flex flex-col items-center mx-auto"
          style={{ marginTop: "28px", gap: "4px", opacity: 0.35 }}
          aria-hidden="true"
        >
          <div
            style={{
              width: "1px",
              height: "32px",
              background:
                "linear-gradient(to bottom, transparent, rgba(255,255,255,0.7), transparent)",
              borderRadius: "1px",
              animation: "scrollPulse 2.2s ease-in-out infinite",
            }}
          />
          <span
            className="text-white"
            style={{
              fontSize: "10px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
