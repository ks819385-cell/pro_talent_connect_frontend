import { useState, useEffect, useRef } from "react";

/* ── Count-up hook ── */
const useCountUp = (target, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
};

/* Glass shared style */
const glass = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

const StatCard = ({ target, suffix, label, started }) => {
  const count = useCountUp(target, 2200, started);
  return (
    <div
      className="relative rounded-2xl p-8 text-center flex flex-col items-center gap-3 transition-all duration-300 hover:border-white/20"
      style={glass}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
        }}
      />

      {/* Number — 40px / 600 with red accent underline rather than full red */}
      <div className="relative">
        <span
          className="font-semibold text-white"
          style={{ fontSize: "clamp(36px, 4vw, 48px)", lineHeight: "1" }}
        >
          {count.toLocaleString()}
          {suffix}
        </span>
        <span
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
          style={{ width: "40px", background: "#C4161C", opacity: 0.8 }}
        />
      </div>

      {/* Label — Caption 14px */}
      <p
        className="font-normal mt-2"
        style={{
          fontSize: "14px",
          color: "rgba(255,255,255,0.5)",
          lineHeight: "1.5",
        }}
      >
        {label}
      </p>
    </div>
  );
};

const ImpactStats = () => {
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  /* Trigger animation on scroll into view */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { target: 1000, suffix: "+", label: "Registered Players" },
    { target: 50, suffix: "+", label: "Countries Represented" },
    { target: 200, suffix: "+", label: "Club Partnerships" },
  ];

  return (
    <section ref={ref} className="relative py-24 px-4">
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
          By the Numbers
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
          Our{" "}
          <span className="relative inline-block">
            Impact
            <span
              className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
              style={{ background: "#C4161C", opacity: 0.8 }}
            />
          </span>
        </h2>

        {/* 3 stat cards — Miller's Law: 3 is optimal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
