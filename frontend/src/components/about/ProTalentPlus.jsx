import { useState, useEffect } from "react";

const glass = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

/**
 * Converts any Google Drive share/view link to a direct CDN thumbnail URL.
 * For all other links, returns them unchanged.
 * Google's lh3 CDN serves images directly in <img> tags — no CORS, no redirects.
 */
const resolveImageUrl = (url) => {
  if (!url) return null;
  const match = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([A-Za-z0-9_-]+)/);
  if (match) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return url;
};

const ProTalentPlus = ({ data }) => {
  const title = data?.title || "Pro Talent Connect Plus";
  const description =
    data?.description ||
    "An exclusive program designed to elevate elite football talent through advanced scouting, personalised development plans, and direct connections with top-tier clubs and agencies worldwide.";
  const logoSrc = resolveImageUrl(data?.logo_url);
  const [imgError, setImgError] = useState(false);

  // Reset error flag when URL changes
  useEffect(() => {
    setImgError(false);
  }, [logoSrc]);

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
          Exclusive Program
        </p>

        {/* H2 */}
        <h2
          className="text-center font-semibold text-white mb-12"
          style={{
            fontSize: "clamp(28px, 3.5vw, 36px)",
            lineHeight: "1.25",
          }}
        >
          {title}
        </h2>

        {/* Horizontal card */}
        <div
          className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-10 rounded-2xl p-6 sm:p-8 mx-auto max-w-3xl"
          style={glass}
        >
          {/* Top red accent */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, #C4161C, transparent)",
            }}
          />

          {/* Logo */}
          <div className="shrink-0 w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center rounded-xl overflow-hidden"
            style={{ background: "rgba(0,0,0,0.3)" }}
          >
            {logoSrc && !imgError ? (
              <img
                src={logoSrc}
                alt={title}
                className="w-full h-full object-contain p-2"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-white/40 font-semibold text-sm text-center px-3">
                {title}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="flex-1 text-center sm:text-left">
            <h3
              className="font-semibold text-white mb-3"
              style={{ fontSize: "22px", lineHeight: "1.3" }}
            >
              {title}
            </h3>
            <p
              className="font-normal"
              style={{
                fontSize: "15px",
                lineHeight: "1.75",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProTalentPlus;
