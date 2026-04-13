import { Link } from "react-router-dom";

const LAST_UPDATED = "April 9, 2026";

const sectionTitleCls = "text-white font-semibold tracking-tight";
const sectionBodyCls = "text-sm md:text-base leading-7 text-white/65";

const PrivacyPolicy = () => {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-white/55 text-sm">Last updated: {LAST_UPDATED}</p>

          <div className="mt-10 space-y-9">
            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>1. Information We Collect</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                We may collect contact details, account credentials, profile information, scouting-related submissions,
                usage analytics, and technical data required to operate and secure the platform.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>2. How We Use Information</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                We use personal information to provide platform features, process requests, improve services,
                communicate important updates, prevent abuse, and comply with legal obligations.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>3. Data Sharing</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                We do not sell personal data. We may share information with trusted service providers,
                authorized partners, and legal authorities when required by law or to protect rights and safety.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>4. Data Retention and Security</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                We retain data only as long as necessary for operational, legal, and contractual purposes.
                We apply reasonable safeguards to protect information from unauthorized access, loss, or misuse.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>5. Your Rights</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                Depending on your jurisdiction, you may have rights to access, correct, delete, restrict,
                or object to processing of your personal data. You may also withdraw consent where applicable.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>6. Contact</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                For privacy questions or requests, contact us through the contact page.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4 text-sm">
            <Link to="/terms-of-service" className="text-red-400 hover:text-red-300 transition-colors">
              Terms of Service
            </Link>
            <span className="text-white/20">|</span>
            <Link to="/cookie-policy" className="text-red-400 hover:text-red-300 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;