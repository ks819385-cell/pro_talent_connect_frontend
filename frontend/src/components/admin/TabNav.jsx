const TabNav = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <Icon className="w-5 h-5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabNav;
