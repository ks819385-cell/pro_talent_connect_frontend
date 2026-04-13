import { Link } from "react-router-dom";
import { useAbout } from "../context/AboutContext";
import AboutHero from "../components/about/AboutHero";
import MissionVision from "../components/about/MissionVision";
import ImpactStats from "../components/about/ImpactStats";
import CoreValues from "../components/about/CoreValues";
import Partners from "../components/about/Partners";
import ProTalentPlus from "../components/about/ProTalentPlus";

/* ── Thin rule between sections ── */
const Divider = () => (
  <div className="max-w-300 mx-auto px-4">
    <div
      className="h-px"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
      }}
    />
  </div>
);

/* ── Bold centered CTA section ── */
const CTASection = () => (
  <section className="relative py-24 px-4">
    <div className="max-w-300 mx-auto">
      <div
        className="relative rounded-2xl px-8 py-16 text-center overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Red accent top border */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{
            background:
              "linear-gradient(90deg, transparent, #C4161C, transparent)",
          }}
        />

        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(196,22,28,0.1) 0%, transparent 65%)",
          }}
        />

        <div className="relative z-10">
          {/* H2 — 32–36px / 600 */}
          <h2
            className="font-semibold text-white mb-4"
            style={{
              fontSize: "clamp(28px, 3.5vw, 40px)",
              lineHeight: "1.2",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Ready to Be Discovered?
          </h2>

          {/* Body — 16px / 400 */}
          <p
            className="font-normal mx-auto mb-10"
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "rgba(255,255,255,0.52)",
              maxWidth: "440px",
            }}
          >
            Join thousands of players already connecting with clubs and scouts
            worldwide.
          </p>

          {/* Primary CTA — Fitts's Law: large, high-contrast */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
            <Link
              to="/players"
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98] w-full sm:w-auto"
              style={{
                fontSize: "16px",
                height: "52px",
                padding: "0 32px",
                backgroundColor: "#C4161C",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(196,22,28,0.3)",
                minWidth: "180px",
              }}
            >
              Browse Players
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
              className="font-semibold transition-all duration-200 hover:opacity-80"
              style={{
                fontSize: "16px",
                color: "rgba(255,255,255,0.55)",
                textDecoration: "underline",
                textUnderlineOffset: "4px",
              }}
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const About = () => {
  const aboutData = useAbout();

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 via-black to-gray-950 text-white relative overflow-x-hidden">
      {/* Fixed ambient background — subtle, not neon */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-0 right-0 w-125 h-125 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-100 h-100 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Jakob's Law: familiar SaaS layout order */}
      <main>
        <AboutHero orgName={aboutData?.org_name} />
        <Divider />
        <MissionVision mission={aboutData?.mission} />
        <Divider />
        <ImpactStats />
        <Divider />
        <CoreValues credentials={aboutData?.credentials} />
        <Divider />
        <ProTalentPlus data={aboutData?.pro_talent_plus} />
        <Divider />
        <Partners />
        <Divider />
        <CTASection />
      </main>
    </div>
  );
};

export default About;
