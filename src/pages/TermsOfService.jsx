import { Link } from "react-router-dom";

const LAST_UPDATED = "April 9, 2026";

const sectionTitleCls = "text-white font-semibold tracking-tight";
const sectionBodyCls = "text-sm md:text-base leading-7 text-white/65";

const TermsOfService = () => {
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
            Terms of Service
          </h1>
          <p className="mt-4 text-white/55 text-sm">Last updated: {LAST_UPDATED}</p>

          <div className="mt-10 space-y-9">
            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>1. Acceptance of Terms</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                By accessing or using Pro Talent Connect, you agree to these Terms of Service.
                If you do not agree, you should discontinue use of the platform.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>2. Accounts and Responsibilities</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                You are responsible for maintaining account security, ensuring submitted information is accurate,
                and complying with applicable laws and platform rules.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>3. Acceptable Use</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                You must not misuse the platform, attempt unauthorized access, upload unlawful content,
                or interfere with service integrity or other users.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>4. Intellectual Property</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                Platform code, branding, and original materials are protected by intellectual property laws.
                You retain ownership of content you submit, while granting necessary usage rights to operate services.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>5. Suspension and Termination</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                We may suspend or terminate access for violations of these terms, security threats,
                fraudulent behavior, or legal compliance reasons.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleCls} style={{ fontSize: "22px" }}>6. Limitation of Liability</h2>
              <p className={`${sectionBodyCls} mt-3`}>
                To the maximum extent permitted by law, services are provided on an "as available" basis,
                without guarantees of uninterrupted availability or specific outcomes.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4 text-sm">
            <Link to="/privacy-policy" className="text-red-400 hover:text-red-300 transition-colors">
              Privacy Policy
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

export default TermsOfService;