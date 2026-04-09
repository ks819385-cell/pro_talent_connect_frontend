import { Link } from "react-router-dom";

const LAST_UPDATED = "April 9, 2026";

const sectionTitleCls = "text-white font-semibold tracking-tight";
const sectionBodyCls = "text-sm md:text-base leading-7 text-white/65";

const CookiePolicy = () => {
  return (
    <div
      className="min-h-screen px-4 sm:px-6"
      style={{
        background: "linear-gradient(160deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0b 100%)",
        paddingTop: "120px",
        paddingBottom: "80px",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "900px" }}>
        <div
          className="rounded-2xl border border-white/10"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            padding: "clamp(24px, 4vw, 42px)",
          }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-red-400/90 mb-3">Legal</p>
          <h1 className="text-white font-bold" style={{ fontSize: "clamp(30px, 5vw, 44px)", lineHeight: 1.1 }}>
            Cookie Policy
          </h1>
          <p className="mt-4 text-white/55 text-sm">Last updated: {LAST_UPDATED}</p>

          <div className="mt-10 space-y-9">
            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>1. What Are Cookies</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                Cookies are small text files stored on your device that help websites remember preferences,
                improve performance, and understand usage patterns.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>2. How We Use Cookies</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                We use cookies for essential site functionality, security, performance analytics,
                and improving user experience across sessions.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>3. Cookie Types</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                Cookie categories may include strictly necessary cookies, preference cookies,
                analytics cookies, and service integration cookies.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>4. Managing Cookies</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                You can control cookies through browser settings and device preferences.
                Disabling some cookies may affect site functionality.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>5. Updates to This Policy</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                We may update this policy to reflect operational, legal, or technical changes.
                Material updates will be posted on this page.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4 text-sm">
            <Link to="/privacy-policy" className="text-red-400 hover:text-red-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/20">|</span>
            <Link to="/terms-of-service" className="text-red-400 hover:text-red-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;