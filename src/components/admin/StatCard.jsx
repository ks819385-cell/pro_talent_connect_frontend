/**
 * Compact KPI stat card — 8pt spacing, no blur, subtle border.
 * Props: icon (component), title, value, color ("blue"|"green"|"purple"|"red"), trend (optional string e.g. "+2 today")
 */
const StatCard = ({ icon: Icon, title, value, color = "blue", trend }) => {
  const colorClasses = {
    blue: { icon: "text-blue-400", bg: "bg-blue-500/10" },
    green: { icon: "text-green-400", bg: "bg-green-500/10" },
    purple: { icon: "text-purple-400", bg: "bg-purple-500/10" },
    red: { icon: "text-red-400", bg: "bg-red-500/10" },
  };
  const a = colorClasses[color] ?? colorClasses.blue;

  return (
    <div className="bg-gray-900 border border-white/8 rounded-xl p-5 flex items-center gap-4">
      <div className={`${a.bg} ${a.icon} rounded-lg p-2.5 shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white leading-none mb-0.5">
          {value}
        </p>
        <p className="text-xs text-gray-500 truncate">{title}</p>
        {trend && <p className="text-xs text-gray-600 mt-0.5">{trend}</p>}
      </div>
    </div>
  );
};

export default StatCard;
