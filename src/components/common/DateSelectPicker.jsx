import { useMemo } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysInMonth(month, year) {
  if (!month) return 31;
  return new Date(year || 2000, parseInt(month, 10), 0).getDate();
}

/**
 * A custom date picker made of three <select> dropdowns (Day / Month / Year).
 * Works as a drop-in replacement for <input type="date">.
 *
 * Props:
 *   value      – YYYY-MM-DD string (or "")
 *   onChange   – called with YYYY-MM-DD string when all three are selected, "" when cleared
 *   className  – extra classes on the outer wrapper
 *   required   – passed through for native form validation hint
 *   minYear    – earliest year in the Year dropdown (default: 1950)
 *   maxYear    – latest  year in the Year dropdown (default: current year)
 *   selectCls  – override inner select classes (optional)
 */
export default function DateSelectPicker({
  value = "",
  onChange,
  className = "",
  required = false,
  minYear,
  maxYear,
  selectCls: outerSelectCls,
}) {
  const currentYear = new Date().getFullYear();
  const min = minYear ?? 1950;
  const max = maxYear ?? currentYear;

  const [year, month, day] = useMemo(() => {
    if (!value) return ["", "", ""];
    const parts = value.split("-");
    return [
      parts[0] ? String(parseInt(parts[0], 10)) : "",
      parts[1] ? String(parseInt(parts[1], 10)) : "",
      parts[2] ? String(parseInt(parts[2], 10)) : "",
    ];
  }, [value]);

  const maxDay = daysInMonth(month || null, year ? parseInt(year, 10) : null);

  const emit = (y, m, d) => {
    if (y && m && d) {
      onChange(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    } else {
      onChange("");
    }
  };

  const years = [];
  for (let y = max; y >= min; y--) years.push(y);

  const base =
    outerSelectCls ||
    "flex-1 px-2 py-2.5 bg-transparent text-white text-sm focus:outline-none cursor-pointer appearance-none text-center";

  /* Keep selected day in valid range when month/year changes */
  const clampDay = (d, newMonth, newYear) => {
    const limit = daysInMonth(newMonth || null, newYear ? parseInt(newYear, 10) : null);
    return d && parseInt(d, 10) > limit ? String(limit) : d;
  };

  return (
    <div
      className={`flex items-stretch border border-white/10 rounded-xl bg-white/5 overflow-hidden divide-x divide-white/10 ${className}`}
    >
      {/* Day */}
      <select
        value={day}
        required={required && !day}
        onChange={(e) => emit(year, month, e.target.value)}
        className={base}
        style={{ minWidth: 0 }}
      >
        <option value="" className="bg-gray-900 text-gray-400">Day</option>
        {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d} className="bg-gray-900">
            {d}
          </option>
        ))}
      </select>

      {/* Month */}
      <select
        value={month}
        onChange={(e) => {
          const newDay = clampDay(day, e.target.value, year);
          emit(year, e.target.value, newDay);
        }}
        className={base}
        style={{ minWidth: 0 }}
      >
        <option value="" className="bg-gray-900 text-gray-400">Month</option>
        {MONTHS.map((m, i) => (
          <option key={i + 1} value={i + 1} className="bg-gray-900">
            {m}
          </option>
        ))}
      </select>

      {/* Year */}
      <select
        value={year}
        onChange={(e) => {
          const newDay = clampDay(day, month, e.target.value);
          emit(e.target.value, month, newDay);
        }}
        className={base}
        style={{ minWidth: 0 }}
      >
        <option value="" className="bg-gray-900 text-gray-400">Year</option>
        {years.map((y) => (
          <option key={y} value={y} className="bg-gray-900">
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
