/**
 * DOBCalendarPicker
 * Premium self-contained Date-of-Birth calendar picker.
 * No external date library required.
 *
 * Props:
 *   value       - YYYY-MM-DD string (or "")
 *   onChange    - (YYYY-MM-DD: string) => void
 *   placeholder - string  (default "Select date of birth")
 *   minYear     - number  (default 1940)
 *   maxYear     - number  (default current year)
 *   className   - string
 *   error       - bool
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_LONG  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_HEADER  = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function parseValue(val) {
  if (!val) return null;
  const [y, m, d] = val.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m - 1, day: d };
}

function toISOString({ year, month, day }) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDisplay({ year, month, day }) {
  return `${String(day).padStart(2, "0")} ${MONTHS_SHORT[month]} ${year}`;
}

function computeCalendarGrid(year, month) {
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startWD   = new Date(year, month, 1).getDay();
  const prevTotal = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = startWD - 1; i >= 0; i--) cells.push({ day: prevTotal - i, cur: false });
  for (let d = 1; d <= totalDays; d++)    cells.push({ day: d, cur: true });
  const rem = 42 - cells.length;
  for (let d = 1; d <= rem; d++)          cells.push({ day: d, cur: false });
  return cells;
}

export default function DOBCalendarPicker({
  value       = "",
  onChange,
  placeholder = "Select date of birth",
  minYear     = 1940,
  maxYear,
  className   = "",
  error       = false,
}) {
  const todayDate  = new Date();
  const maxYearFin = maxYear ?? todayDate.getFullYear();
  const today      = { year: todayDate.getFullYear(), month: todayDate.getMonth(), day: todayDate.getDate() };

  const parsed = parseValue(value);

  const [viewYear,    setViewYear]    = useState(parsed?.year  ?? 2005);
  const [viewMonth,   setViewMonth]   = useState(parsed?.month ?? 6);
  const [viewMode,    setViewMode]    = useState("days");
  const [decadeStart, setDecadeStart] = useState(() => Math.floor((parsed?.year ?? 2005) / 10) * 10);
  const [open,        setOpen]        = useState(false);
  const [animating,   setAnimating]   = useState(false);
  const [panelStyle,  setPanelStyle]  = useState({});

  const wrapperRef = useRef(null);
  const panelRef   = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
      setDecadeStart(Math.floor(parsed.year / 10) * 10);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Outside click - must check BOTH trigger wrapper AND portal panel
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const inWrapper = wrapperRef.current?.contains(e.target);
      const inPanel   = panelRef.current?.contains(e.target);
      if (!inWrapper && !inPanel) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Recalculate portal position
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const updatePos = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const flipUp = window.innerHeight - rect.bottom < 400;
      setPanelStyle({
        position: "fixed",
        left: rect.left,
        width: Math.max(rect.width, 300),
        zIndex: 99999,
        ...(flipUp ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
      });
    };
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open]);

  const openPicker = () => {
    setViewMode("days");
    setOpen(true);
    setTimeout(() => setAnimating(true), 10);
  };

  const close = useCallback(() => {
    setAnimating(false);
    setTimeout(() => { setOpen(false); setViewMode("days"); }, 200);
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const prevDecade = () => setDecadeStart((d) => Math.max(d - 10, Math.floor(minYear / 10) * 10));
  const nextDecade = () => setDecadeStart((d) => Math.min(d + 10, Math.floor(maxYearFin / 10) * 10));

  const openYearPicker = () => {
    setDecadeStart(Math.floor(viewYear / 10) * 10);
    setViewMode("years");
  };

  const selectYear = (y) => {
    setViewYear(y);
    setViewMode("days");
  };

  const selectDay = (cell) => {
    if (!cell.cur) return;
    if (new Date(viewYear, viewMonth, cell.day) > todayDate) return;
    onChange(toISOString({ year: viewYear, month: viewMonth, day: cell.day }));
    close();
  };

  const grid = computeCalendarGrid(viewYear, viewMonth);

  const decadeYears = [];
  for (let y = decadeStart; y < decadeStart + 10; y++) {
    if (y >= minYear && y <= maxYearFin) decadeYears.push(y);
  }

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>

      {/* Trigger */}
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex items-center justify-between px-4 h-[44px] w-full rounded-[10px] border text-sm cursor-pointer select-none transition-all duration-150 ${
          error
            ? "border-red-500/60 bg-[#1a0a0a]"
            : open
            ? "border-blue-500/70 bg-[#0F172A] ring-2 ring-blue-500/20"
            : "border-[#334155] bg-[#0F172A] hover:border-[#475569]"
        }`}
        onClick={open ? close : openPicker}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (open ? close() : openPicker())}
      >
        <span className={`flex-1 truncate ${parsed ? "text-[#E2E8F0]" : "text-[#64748B]"}`}>
          {parsed ? formatDisplay(parsed) : placeholder}
        </span>
        {parsed ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Clear date"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] hover:text-[#94A3B8] transition-colors shrink-0"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
          >
            <XIcon />
          </button>
        ) : (
          <span className="flex items-center justify-center w-8 h-8 text-[#64748B] shrink-0">
            <CalendarIcon />
          </span>
        )}
      </div>

      {/* Portal panel */}
      {open && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Date picker"
          style={panelStyle}
          className={`rounded-[12px] border border-[#334155] bg-[#1E293B] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-200 origin-top ${
            animating ? "opacity-100 scale-y-100" : "opacity-0 scale-y-95 pointer-events-none"
          }`}
        >
          {/* --- DAYS VIEW --- */}
          {viewMode === "days" && (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155]">
                <button
                  type="button"
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-[#94A3B8] hover:bg-white/8 hover:text-[#E2E8F0] transition-all active:scale-90"
                  onClick={prevMonth}
                  aria-label="Previous month"
                >
                  <ChevLeft />
                </button>

                <button
                  type="button"
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#E2E8F0] hover:text-[#3B82F6] transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                  onClick={openYearPicker}
                  aria-label="Select year"
                >
                  <span>{MONTHS_LONG[viewMonth]}</span>
                  <span>{viewYear}</span>
                  <ChevDown />
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-[#94A3B8] hover:bg-white/8 hover:text-[#E2E8F0] transition-all active:scale-90"
                  onClick={nextMonth}
                  aria-label="Next month"
                >
                  <ChevRight />
                </button>
              </div>

              <div className="grid grid-cols-7 px-3 pt-2">
                {DAYS_HEADER.map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-[#64748B] py-2">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-0.5 px-3 pb-4 pt-1">
                {grid.map((cell, i) => {
                  const isSel      = cell.cur && parsed?.year === viewYear && parsed?.month === viewMonth && parsed?.day === cell.day;
                  const isToday    = cell.cur && today.year === viewYear && today.month === viewMonth && today.day === cell.day;
                  const isDisabled = cell.cur && new Date(viewYear, viewMonth, cell.day) > todayDate;

                  let cls = "flex items-center justify-center h-9 w-full rounded-[8px] text-sm font-medium transition-all duration-100 select-none ";
                  if (!cell.cur)       cls += "text-[#1E3A5F] cursor-default";
                  else if (isDisabled) cls += "text-[#334155] cursor-not-allowed";
                  else if (isSel)      cls += "bg-[#3B82F6] text-white shadow-[0_0_12px_rgba(59,130,246,0.4)] cursor-pointer";
                  else if (isToday)    cls += "text-[#3B82F6] ring-1 ring-[#3B82F6]/40 hover:bg-[#1E3A5F] cursor-pointer";
                  else                 cls += "text-[#CBD5E1] hover:bg-[#293548] hover:text-[#E2E8F0] active:scale-95 cursor-pointer";

                  return (
                    <div
                      key={i}
                      role={cell.cur && !isDisabled ? "button" : undefined}
                      tabIndex={cell.cur && !isDisabled ? 0 : -1}
                      aria-selected={isSel}
                      className={cls}
                      onClick={() => !isDisabled && selectDay(cell)}
                      onKeyDown={(e) => e.key === "Enter" && !isDisabled && selectDay(cell)}
                    >
                      {cell.day}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[#334155] px-4 py-2.5 flex items-center justify-end">
                <button
                  type="button"
                  className="text-xs text-[#3B82F6] hover:text-[#60A5FA] transition-colors font-medium"
                  onClick={() => { setViewYear(today.year); setViewMonth(today.month); setDecadeStart(Math.floor(today.year / 10) * 10); }}
                >
                  Today
                </button>
              </div>
            </>
          )}

          {/* --- YEAR PICKER VIEW --- */}
          {viewMode === "years" && (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155]">
                <button
                  type="button"
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-[#94A3B8] hover:bg-white/8 hover:text-[#E2E8F0] transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={prevDecade}
                  disabled={decadeStart <= Math.floor(minYear / 10) * 10}
                  aria-label="Previous decade"
                >
                  <ChevLeft />
                </button>

                <span className="text-sm font-semibold text-[#E2E8F0]">
                  {decadeStart} &ndash; {decadeStart + 9}
                </span>

                <button
                  type="button"
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-[#94A3B8] hover:bg-white/8 hover:text-[#E2E8F0] transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={nextDecade}
                  disabled={decadeStart >= Math.floor(maxYearFin / 10) * 10}
                  aria-label="Next decade"
                >
                  <ChevRight />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4">
                {decadeYears.map((y) => {
                  const isSelected = y === viewYear;
                  const isThisYear = y === today.year;
                  return (
                    <button
                      key={y}
                      type="button"
                      className={`h-10 w-full rounded-[8px] text-sm font-semibold transition-all duration-100 active:scale-95 ${
                        isSelected
                          ? "bg-[#3B82F6] text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                          : isThisYear
                          ? "text-[#3B82F6] ring-1 ring-[#3B82F6]/40 hover:bg-[#1E3A5F]"
                          : "text-[#CBD5E1] hover:bg-[#293548] hover:text-[#E2E8F0]"
                      }`}
                      onClick={() => selectYear(y)}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-[#334155] px-4 py-2.5 flex justify-end">
                <button
                  type="button"
                  className="text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  onClick={() => setViewMode("days")}
                >
                  Back to calendar
                </button>
              </div>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function ChevLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function ChevRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

function ChevDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
