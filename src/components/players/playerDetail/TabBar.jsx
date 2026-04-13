const TABS = [
  { id: "overview",      label: "Overview",      short: "Overview"  },
  { id: "scout",         label: "Scout Report",  short: "Scout"     },
  { id: "career",        label: "Career",        short: "Career"    },
  { id: "competitions",  label: "Competitions",  short: "Comps"     },
  { id: "analytics",     label: "Analytics",     short: "Analytics" },
];

const TabBar = ({ active, setActive }) => (
  <nav className="flex overflow-x-auto gap-0 no-scrollbar">
    {TABS.map((t) => (
      <button
        key={t.id}
        onClick={() => setActive(t.id)}
        className={`
          px-3.5 sm:px-5 py-3 text-[12px] sm:text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px
          transition-colors duration-150 focus:outline-none
          ${
            active === t.id
              ? "border-[#C4161C] text-white"
              : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700"
          }
        `}
      >
        <span className="sm:hidden">{t.short}</span>
        <span className="hidden sm:inline">{t.label}</span>
      </button>
    ))}
  </nav>
);

export default TabBar;
