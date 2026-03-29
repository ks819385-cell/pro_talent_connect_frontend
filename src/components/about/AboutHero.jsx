import { Link } from "react-router-dom";

const AboutHero = ({ orgName }) => {
  return (
    <section className="relative pt-36 pb-24 px-4 overflow-hidden">
      {/* Subtle radial glow — no neon */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-160 h-95 rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(196,22,28,0.22) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-300 mx-auto text-center">
        {/* Eyebrow — Caption 14px */}
        <p
          className="mb-6 font-normal uppercase tracking-widest"
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.16em",
          }}
        >
          Pro Talent Connect
        </p>

        {/* H1 — 48–56px / 600 weight */}
        <h1
          className="font-semibold text-white mb-6"
          style={{
            fontSize: "clamp(40px, 5.5vw, 56px)",
            lineHeight: "1.15",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Connecting Football Talent
          <br />
          With{" "}
          <span className="relative inline-block">
            Global Opportunities
            <span
              className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
              style={{ background: "#C4161C", opacity: 0.85 }}
            />
          </span>
        </h1>

        {/* Body — 16px / 400 / line-height 1.7 */}
        <p
          className="font-normal mx-auto mb-10"
          style={{
            fontSize: "16px",
            lineHeight: "1.7",
            color: "rgba(255,255,255,0.52)",
            maxWidth: "520px",
          }}
        >
          {orgName
            ? `${orgName} connects elite players to scouts, clubs and academies worldwide through data-driven discovery.`
            : "We connect elite players to scouts, clubs and academies worldwide through data-driven discovery."}
        </p>

        {/* CTAs — Fitts's Law: min 48px height */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
          <Link
            to="/players"
            className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98] w-full sm:w-auto"
            style={{
              fontSize: "16px",
              height: "52px",
              padding: "0 28px",
              backgroundColor: "#C4161C",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(196,22,28,0.28)",
              minWidth: "168px",
            }}
          >
            Explore Players
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 hover:bg-white/10 w-full sm:w-auto"
            style={{
              fontSize: "16px",
              height: "52px",
              padding: "0 28px",
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(12px)",
              minWidth: "168px",
            }}
          >
            Partner With Us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
