/* ── Glass card shared style ── */
const glass = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

const DEFAULT_MISSION =
  "We build a transparent platform where professional football players showcase their talent to scouts, clubs and opportunities worldwide. Every player deserves visibility — regardless of location.";

const DEFAULT_VISION =
  "To be the world's leading platform for football talent discovery — where merit and data connect the right players to the right clubs, at every level of the game.";

/* ── Target icon ── */
const TargetIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6 text-white"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

/* ── Telescope icon ── */
const TelescopeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6 text-white"
  >
    <path d="M10 9H4L2 5l6 4" />
    <path d="M22 5l-6 4h-6l8-4z" />
    <path d="M12 13v8M9 21h6" />
    <path d="M10 9l4.5 4.5" />
  </svg>
);

const MissionVision = ({ mission }) => {
  const missionText = mission || DEFAULT_MISSION;

  return (
    <section className="relative py-24 px-4">
      <div className="max-w-300 mx-auto">
        {/* Section label */}
        <p
          className="text-center font-normal uppercase tracking-widest mb-4"
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.16em",
          }}
        >
          Who We Are
        </p>

        {/* H2 — 32–36px / 600 */}
        <h2
          className="text-center font-semibold text-white mb-12"
          style={{
            fontSize: "clamp(28px, 3.5vw, 36px)",
            lineHeight: "1.25",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Mission &amp;{" "}
          <span className="relative inline-block">
            Vision
            <span
              className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
              style={{ background: "#C4161C", opacity: 0.8 }}
            />
          </span>
        </h2>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mission */}
          <div
            className="group relative rounded-2xl p-8 flex flex-col gap-6 hover:border-white/20 transition-all duration-300"
            style={glass}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
              }}
            />

            <div className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <TargetIcon />
              </div>
              {/* H3 — 20–22px / 600 */}
              <h3
                className="font-semibold text-white"
                style={{
                  fontSize: "22px",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Our Mission
              </h3>
            </div>

            {/* Body — 16px / 400 / 1.7 */}
            <p
              className="font-normal"
              style={{
                fontSize: "16px",
                lineHeight: "1.7",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {missionText}
            </p>

            <ul className="space-y-3 mt-auto">
              {[
                "Transparent player profiles",
                "Global scout access",
                "Merit-based discovery",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "#C4161C" }}
                  />
                  <span
                    className="font-normal"
                    style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Vision */}
          <div
            className="group relative rounded-2xl p-8 flex flex-col gap-6 hover:border-white/20 transition-all duration-300"
            style={glass}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
              }}
            />

            <div className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <TelescopeIcon />
              </div>
              <h3
                className="font-semibold text-white"
                style={{
                  fontSize: "22px",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Our Vision
              </h3>
            </div>

            <p
              className="font-normal"
              style={{
                fontSize: "16px",
                lineHeight: "1.7",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {DEFAULT_VISION}
            </p>

            <ul className="space-y-3 mt-auto">
              {[
                "Data-driven talent discovery",
                "Cross-border club connections",
                "Career growth at every level",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "#C4161C" }}
                  />
                  <span
                    className="font-normal"
                    style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
