import {
  SparklesIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

const glass = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

const values = [
  {
    Icon: SparklesIcon,
    title: "Excellence",
    desc: "We deliver the highest standard of player representation and platform quality.",
  },
  {
    Icon: ShieldCheckIcon,
    title: "Transparency",
    desc: "Honest, ethical operations — no hidden fees, no gatekeeping.",
  },
  {
    Icon: UserGroupIcon,
    title: "Community",
    desc: "A global network of players, scouts, coaches and clubs — all in one place.",
  },
  {
    Icon: TrophyIcon,
    title: "Merit",
    desc: "Talent wins. Every profile is judged on ability, not connections.",
  },
];

const CoreValues = ({ credentials }) => (
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
        What We Stand For
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
        Core{" "}
        <span className="relative inline-block">
          Values
          <span
            className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
            style={{ background: "#C4161C", opacity: 0.8 }}
          />
        </span>
      </h2>

      {/* 4 value cards — Miller's Law */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="relative rounded-2xl p-8 flex flex-col gap-4 transition-all duration-300 hover:border-white/22 group"
            style={glass}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
              }}
            />

            {/* Icon */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>

            {/* H3 — 20–22px / 600 */}
            <h3
              className="font-semibold text-white"
              style={{
                fontSize: "20px",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {title}
            </h3>

            {/* Caption — 14px / 400 */}
            <p
              className="font-normal"
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {desc}
            </p>
          </div>
        ))}
      </div>

      {/* Credentials from Admin — merged into Values section (Miller's Law) */}
      {credentials && (
        <div
          className="mt-6 relative rounded-2xl p-8 text-center transition-all duration-300 hover:border-white/20"
          style={glass}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(196,22,28,0.4), transparent)",
            }}
          />
          <h3
            className="font-semibold text-white mb-3"
            style={{
              fontSize: "20px",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Our Credentials
          </h3>
          <p
            className="font-normal mx-auto"
            style={{
              fontSize: "14px",
              lineHeight: "1.7",
              color: "rgba(255,255,255,0.5)",
              maxWidth: "600px",
            }}
          >
            {credentials}
          </p>
        </div>
      )}
    </div>
  </section>
);

export default CoreValues;
