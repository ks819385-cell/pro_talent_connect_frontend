import { useEffect, useRef, useState } from "react";
import {
  UserGroupIcon,
  GlobeAltIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import HeroSection from "./home/HeroSection";
import FeaturedPlayers from "./home/Featuredplayers";

/* ─── Count-up hook ─────────────────────────────────────────── */
function useCountUp(target, duration = 1800, triggered = false) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!triggered) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, triggered]);

  return value;
}

/* ─── Single stat card ──────────────────────────────────────── */
const StatCard = ({
  Icon,
  rawValue,
  numericTarget,
  suffix,
  label,
  delay,
  triggered,
}) => {
  const count = useCountUp(numericTarget, 1800, triggered);
  const display = triggered ? `${count.toLocaleString()}${suffix}` : rawValue;

  return (
    <div
      className="stat-card flex flex-col items-center text-center gap-2 px-3 py-4 rounded-xl border border-white/8 backdrop-blur-md transition-all duration-300"
      style={{
        animationDelay: `${delay}s`,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        boxShadow:
          "0 4px 20px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Icon blob */}
      <div
        className="flex items-center justify-center rounded-full shrink-0 w-9.5 h-9.5"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(196,22,28,0.22) 0%, rgba(196,22,28,0.04) 100%)",
          border: "1px solid rgba(196,22,28,0.28)",
          animation: "liquidGlow 3s ease-in-out infinite",
        }}
      >
        <Icon className="text-red-500 w-4.5 h-4.5" style={{ strokeWidth: 1.6 }} />
      </div>

      {/* Count */}
      <div>
        <p
          className="text-white font-bold m-0 tracking-tight leading-none"
          style={{
            fontSize: "clamp(20px, 4.5vw, 26px)",
            animation: triggered ? "numberShimmer 0.6s ease forwards" : "none",
          }}
        >
          {display}
        </p>
        <p className="text-white/40 text-[11px] mt-1 leading-snug">{label}</p>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════ */
/*                       STATS SECTION                         */
/* ════════════════════════════════════════════════════════════ */
const StatsSection = () => {
  const sectionRef = useRef(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      Icon: UserGroupIcon,
      rawValue: "1,000+",
      numericTarget: 1000,
      suffix: "+",
      label: "Registered Players",
      delay: 0,
    },
    {
      Icon: GlobeAltIcon,
      rawValue: "50+",
      numericTarget: 50,
      suffix: "+",
      label: "Countries Covered",
      delay: 0.15,
    },
    {
      Icon: BuildingOffice2Icon,
      rawValue: "200+",
      numericTarget: 200,
      suffix: "+",
      label: "Clubs Worldwide",
      delay: 0.3,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0B0B0B] py-10 px-4 flex flex-col justify-center"
      aria-label="Platform statistics"
    >
      {/* Ambient blob background */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-75 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(196,22,28,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Section label */}
      <div className="text-center mb-6">
        <p className="text-red-500 font-semibold uppercase tracking-[0.14em] text-[10px] mb-1.5">
          By the Numbers
        </p>
        <h2
          className="text-white font-bold m-0 tracking-[-0.01em]"
          style={{ fontSize: "clamp(18px, 4vw, 24px)" }}
        >
          Global Reach. Real Impact.
        </h2>
      </div>

      {/* Stat grid */}
      <div
        className="grid gap-3 max-w-120 mx-auto"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))" }}
      >
        {stats.map((s) => (
          <StatCard key={s.label} {...s} triggered={triggered} />
        ))}
      </div>
    </section>
  );
};

export { HeroSection, StatsSection, FeaturedPlayers };
