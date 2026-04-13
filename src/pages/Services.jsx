import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  TrophyIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  LifebuoyIcon,
  UserPlusIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { api } from "../services/api";

// Design tokens
const GLASS = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.08)",
};
const GLASS_HOVER = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.13)",
};

// Icon map
const ICON_MAP = {
  MagnifyingGlassIcon,
  UserCircleIcon,
  TrophyIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  LifebuoyIcon,
  UserPlusIcon,
  CheckBadgeIcon,
};

// Static fallbacks (one per title � deduped)
const DEFAULT_SERVICES = [
  { _id: "s1", title: "Player Discovery", description: "Instantly search verified players by position, age, and performance metrics.", icon: "MagnifyingGlassIcon", group: "Discovery" },
  { _id: "s2", title: "Advanced Search", description: "Filter talent by region, club history, and scouting reports.", icon: "MagnifyingGlassIcon", group: "Discovery" },
  { _id: "s3", title: "Profile Management", description: "Build a dynamic profile with career history, highlights, and live stats.", icon: "UserCircleIcon", group: "Profile & Data" },
  { _id: "s4", title: "Achievement Tracking", description: "Showcase awards, milestones, and team accomplishments in one place.", icon: "TrophyIcon", group: "Profile & Data" },
  { _id: "s5", title: "Career Analytics", description: "Track performance trends and career progression with actionable data.", icon: "ChartBarIcon", group: "Analytics & Trust" },
  { _id: "s6", title: "Verified Profiles", description: "Every profile is verified for accuracy � scouts trust what they see.", icon: "ShieldCheckIcon", group: "Analytics & Trust" },
];

const DEFAULT_STEPS = [
  { _id: "h1", stepNumber: 1, title: "Create Your Profile", description: "Submit your career history, position details, and highlight reel.", icon: "UserPlusIcon" },
  { _id: "h2", stepNumber: 2, title: "Get Verified", description: "Our team reviews and authenticates every profile for credibility.", icon: "CheckBadgeIcon" },
  { _id: "h3", stepNumber: 3, title: "Get Discovered", description: "Your live profile reaches scouts and clubs worldwide instantly.", icon: "MagnifyingGlassIcon" },
];

const SERVICE_GROUPS = ["Discovery", "Profile & Data", "Analytics & Trust"];

// Deduplicate by title, keep first occurrence
const dedup = (arr) => {
  const seen = new Set();
  return arr.filter((item) => {
    if (seen.has(item.title)) return false;
    seen.add(item.title);
    return true;
  });
};

// Skeleton
const SkeletonCard = () => (
  <div style={GLASS} className="rounded-2xl p-6 space-y-4">
    <div className="w-11 h-11 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
    <div className="h-5 w-3/4 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.1)" }} />
    <div className="h-3 w-full rounded animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
    <div className="h-3 w-2/3 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
  </div>
);

// Service Card
const ServiceCard = ({ service }) => {
  const Icon = ICON_MAP[service.icon] || MagnifyingGlassIcon;
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 cursor-default"
      style={{
        ...(hovered ? GLASS_HOVER : GLASS),
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.15)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}
      >
        <Icon className="w-5 h-5" style={{ color: "rgba(255,255,255,0.65)" }} />
      </div>
      {/* Title */}
      <h3
        className="text-white font-semibold"
        style={{ fontSize: "18px", lineHeight: "1.4", fontFamily: "'Poppins', sans-serif" }}
      >
        {service.title}
      </h3>
      {/* Description */}
      <p
        className="flex-1 line-clamp-2"
        style={{ fontSize: "14px", lineHeight: "1.65", color: "rgba(255,255,255,0.42)" }}
      >
        {service.description}
      </p>
      {/* Learn more */}
      <p
        className="font-medium transition-colors duration-200"
        style={{ fontSize: "13px", color: hovered ? "rgba(255,120,120,0.85)" : "rgba(255,255,255,0.28)" }}
      >
        Learn more
      </p>
    </div>
  );
};

// How It Works Step
const StepCard = ({ step, isLast }) => {
  const Icon = ICON_MAP[step.icon] || UserPlusIcon;
  return (
    <div className="flex flex-col items-center text-center relative">
      {/* Connector line */}
      {!isLast && (
        <div
          className="hidden md:block absolute top-7 left-1/2 w-full"
          style={{ height: "1px", background: "linear-gradient(to right, rgba(196,22,28,0.35) 0%, rgba(255,255,255,0.08) 100%)", zIndex: 0 }}
        />
      )}
      {/* Circle */}
      <div
        className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center mb-5"
        style={{ background: "rgba(196,22,28,0.14)", border: "1px solid rgba(196,22,28,0.32)" }}
      >
        <span
          className="font-semibold text-white"
          style={{ fontSize: "18px", fontFamily: "'Poppins', sans-serif" }}
        >
          {step.stepNumber}
        </span>
      </div>
      {/* Icon row */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Icon className="w-5 h-5" style={{ color: "rgba(255,255,255,0.55)" }} />
      </div>
      {/* Title */}
      <h3
        className="text-white font-semibold mb-2"
        style={{ fontSize: "17px", fontFamily: "'Poppins', sans-serif", lineHeight: "1.4" }}
      >
        {step.title}
      </h3>
      {/* Description */}
      <p style={{ fontSize: "14px", lineHeight: "1.65", color: "rgba(255,255,255,0.4)", maxWidth: "200px" }}>
        {step.description}
      </p>
    </div>
  );
};

// Main
const Services = () => {
  const [services, setServices] = useState([]);
  const [howItWorks, setHowItWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, stepsRes] = await Promise.all([
        api.getServices(),
        api.getHowItWorks(),
      ]);
      const raw = servicesRes.data.services || [];
      setServices(dedup(raw.length > 0 ? raw : DEFAULT_SERVICES).slice(0, 6));
      const rawSteps = stepsRes.data.steps || [];
      setHowItWorks(dedup(rawSteps.length > 0 ? rawSteps : DEFAULT_STEPS).slice(0, 3));
    } catch {
      setServices(dedup(DEFAULT_SERVICES));
      setHowItWorks(DEFAULT_STEPS);
    } finally {
      setLoading(false);
    }
  };

  // Group services
  const grouped = SERVICE_GROUPS.reduce((acc, g) => {
    const items = services.filter((s) => s.group === g);
    if (items.length) acc[g] = items;
    return acc;
  }, {});
  const ungrouped = services.filter((s) => !s.group);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "linear-gradient(160deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0b 100%)" }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-160 h-95 rounded-full opacity-25"
          style={{ background: "radial-gradient(ellipse at center, rgba(196,22,28,0.22) 0%, transparent 70%)" }}
        />
      </div>

      {/* -- Hero --------------------------------------- */}
      <section className="relative pt-36 pb-16 px-4 sm:px-6" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <p className="uppercase tracking-widest mb-5" style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.28)", letterSpacing: "0.16em" }}>
          What We Offer
        </p>
        <h1
          className="font-semibold text-white mb-5"
          style={{ fontSize: "clamp(36px, 5vw, 52px)", lineHeight: "1.14", fontFamily: "'Poppins', sans-serif", maxWidth: "640px" }}
        >
          Professional Tools for{" "}
          <span className="relative inline-block">
            Talent & Scouts
            <span className="absolute -bottom-1 left-0 right-0 rounded-full" style={{ height: "2px", background: "#C4161C", opacity: 0.85 }} />
          </span>
        </h1>
        <p className="mb-10" style={{ fontSize: "15px", lineHeight: "1.7", color: "rgba(255,255,255,0.42)", maxWidth: "480px" }}>
          A data-driven platform connecting football talent with clubs and scouts worldwide.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            to="/players"
            className="inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98] w-full sm:w-auto"
            style={{ fontSize: "15px", height: "48px", padding: "0 26px", backgroundColor: "#C4161C", color: "#fff", boxShadow: "0 4px 18px rgba(196,22,28,0.28)", minWidth: "160px" }}
          >
            Explore Platform
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 hover:bg-white/10 w-full sm:w-auto"
            style={{ fontSize: "15px", height: "48px", padding: "0 26px", ...GLASS, color: "rgba(255,255,255,0.75)", minWidth: "160px" }}
          >
            Request Demo
          </Link>
        </div>
      </section>

      {/* -- Who We Serve ------------------------------- */}
      <section className="relative py-16 px-4 sm:px-6" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <p className="uppercase tracking-widest mb-8" style={{ fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.22)", letterSpacing: "0.16em" }}>
          Who We Serve
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Players */}
          <div className="rounded-2xl p-7" style={GLASS}>
            <p className="uppercase tracking-widest mb-4" style={{ fontSize: "11px", fontWeight: 600, color: "rgba(196,22,28,0.85)", letterSpacing: "0.14em" }}>
              For Players
            </p>
            <h3 className="text-white font-semibold mb-5" style={{ fontSize: "20px", fontFamily: "'Poppins', sans-serif", lineHeight: "1.35" }}>
              Build your profile. Get discovered.
            </h3>
            <ul className="space-y-3">
              {["Build a verified, data-rich profile", "Track performance with career analytics", "Connect with global clubs and scouts"].map((item) => (
                <li key={item} className="flex items-start gap-3" style={{ fontSize: "14px", lineHeight: "1.6", color: "rgba(255,255,255,0.5)" }}>
                  <span className="mt-1 w-4 h-4 shrink-0 rounded-full inline-flex items-center justify-center" style={{ background: "rgba(196,22,28,0.18)", border: "1px solid rgba(196,22,28,0.3)" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#C4161C", display: "block" }} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Clubs & Scouts */}
          <div className="rounded-2xl p-7" style={GLASS}>
            <p className="uppercase tracking-widest mb-4" style={{ fontSize: "11px", fontWeight: 600, color: "rgba(96,165,250,0.85)", letterSpacing: "0.14em" }}>
              For Clubs & Scouts
            </p>
            <h3 className="text-white font-semibold mb-5" style={{ fontSize: "20px", fontFamily: "'Poppins', sans-serif", lineHeight: "1.35" }}>
              Find the right talent, faster.
            </h3>
            <ul className="space-y-3">
              {["Discover verified players by position & region", "Advanced search with performance filters", "Access reliable, authenticated data"].map((item) => (
                <li key={item} className="flex items-start gap-3" style={{ fontSize: "14px", lineHeight: "1.6", color: "rgba(255,255,255,0.5)" }}>
                  <span className="mt-1 w-4 h-4 shrink-0 rounded-full inline-flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.28)" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(96,165,250,0.9)", display: "block" }} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* -- Core Services ------------------------------ */}
      <section className="relative py-16 px-4 sm:px-6" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <p className="uppercase tracking-widest mb-3" style={{ fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.22)", letterSpacing: "0.16em" }}>
          Core Services
        </p>
        <h2 className="font-semibold text-white mb-12" style={{ fontSize: "clamp(26px, 3.5vw, 34px)", fontFamily: "'Poppins', sans-serif", lineHeight: "1.25" }}>
          Everything You Need on One Platform
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "32px" }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : Object.keys(grouped).length > 0 ? (
          <div className="space-y-12">
            {SERVICE_GROUPS.filter((g) => grouped[g]).map((group) => (
              <div key={group}>
                {/* Group label */}
                <p
                  className="uppercase tracking-widest mb-6"
                  style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.22)", letterSpacing: "0.16em", borderLeft: "2px solid rgba(196,22,28,0.5)", paddingLeft: "10px" }}
                >
                  {group}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "24px" }}>
                  {grouped[group].map((service) => (
                    <ServiceCard key={service._id} service={service} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "32px" }}>
            {(ungrouped.length > 0 ? ungrouped : services).map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </section>

      {/* -- How It Works ------------------------------- */}
      <section className="relative py-16 px-4 sm:px-6" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <p className="uppercase tracking-widest mb-3" style={{ fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.22)", letterSpacing: "0.16em" }}>
          The Process
        </p>
        <h2 className="font-semibold text-white mb-14" style={{ fontSize: "clamp(26px, 3.5vw, 34px)", fontFamily: "'Poppins', sans-serif", lineHeight: "1.25" }}>
          How It Works
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "48px" }}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 relative" style={{ gap: "48px" }}>
            {howItWorks.map((step, i) => (
              <StepCard key={step._id} step={step} isLast={i === howItWorks.length - 1} />
            ))}
          </div>
        )}
      </section>

      {/* -- CTA ---------------------------------------- */}
      <section className="relative py-16 px-4 sm:px-6">
        <div
          className="rounded-2xl text-center"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "clamp(48px, 7vw, 72px) clamp(24px, 5vw, 64px)",
            background: "rgba(196,22,28,0.08)",
            border: "1px solid rgba(196,22,28,0.18)",
            backdropFilter: "blur(12px)",
          }}
        >
          <p className="uppercase tracking-widest mb-4" style={{ fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.26)", letterSpacing: "0.16em" }}>
            Get Started
          </p>
          <h2
            className="font-semibold text-white mb-4"
            style={{ fontSize: "clamp(28px, 4vw, 42px)", fontFamily: "'Poppins', sans-serif", lineHeight: "1.2" }}
          >
            Ready to Get Discovered?
          </h2>
          <p className="mb-10 mx-auto" style={{ fontSize: "15px", lineHeight: "1.7", color: "rgba(255,255,255,0.45)", maxWidth: "400px" }}>
            Create your profile today and connect with clubs and scouts worldwide.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ fontSize: "16px", height: "52px", padding: "0 32px", backgroundColor: "#C4161C", color: "#fff", boxShadow: "0 4px 22px rgba(196,22,28,0.32)", minWidth: "192px" }}
            >
              Create Free Profile
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 hover:bg-white/10"
              style={{ fontSize: "16px", height: "52px", padding: "0 32px", ...GLASS, color: "rgba(255,255,255,0.75)", minWidth: "192px" }}
            >
              Talk to Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* -- Newsletter ---------------------------------- */}
      <section className="relative px-4 sm:px-6" style={{ paddingTop: "32px", paddingBottom: "80px" }}>
        <div className="rounded-2xl" style={{ maxWidth: "1200px", margin: "0 auto", ...GLASS, padding: "clamp(28px, 5vw, 44px) clamp(24px, 5vw, 48px)" }}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-1">
              <p className="uppercase tracking-widest mb-3" style={{ fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.26)", letterSpacing: "0.15em" }}>
                Newsletter
              </p>
              <h2 className="font-semibold text-white mb-2" style={{ fontSize: "clamp(20px, 2.8vw, 26px)", fontFamily: "'Poppins', sans-serif", lineHeight: "1.3" }}>
                Stay Ahead of the Game
              </h2>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.38)", lineHeight: "1.6" }}>
                Transfer news, platform updates, and scouting insights � weekly.
              </p>
            </div>
            <div className="flex-1" style={{ maxWidth: "420px" }}>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="flex-1 rounded-xl outline-none px-4"
                  style={{ height: "48px", fontSize: "14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", minWidth: 0 }}
                />
                <button
                  type="submit"
                  className="shrink-0 font-semibold rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={{ height: "48px", padding: "0 22px", fontSize: "14px", backgroundColor: "#C4161C", color: "#fff", boxShadow: "0 4px 16px rgba(196,22,28,0.22)" }}
                >
                  Subscribe
                </button>
              </form>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.24)", marginTop: "10px" }}>
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;