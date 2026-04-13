import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, fetchCsrfToken } from "../services/api";
import {
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  EnvelopeIcon,
  UserCircleIcon,
  TrophyIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  LockClosedIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  UsersIcon,
  ClockIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import logoImg from "../assets/Logo@pro_talent_connect.png";
import BlogManagement from "../components/blogs/BlogManagement";
import PlayerManagement from "../components/admin/PlayerManagement";
import LeagueManagement from "../components/admin/LeagueManagement";
import ServiceManagement from "../components/admin/ServiceManagement";
import AboutManagement from "../components/admin/AboutManagement";
import AdminManagement from "../components/admin/AdminManagement";
import PartnerManagement from "../components/admin/PartnerManagement";

/* --- Design tokens --- */
const card = "bg-gray-900 border border-white/8 rounded-xl";
const inputCls =
  "w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors";

/* --- Status badge --- */
const STATUS_STYLES = {
  pending: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  "in-progress": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  reviewing: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  resolved: "bg-green-500/10 text-green-400 border border-green-500/20",
  approved: "bg-green-500/10 text-green-400 border border-green-500/20",
  closed: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
};
const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${STATUS_STYLES[status] || STATUS_STYLES.closed}`}
  >
    {status}
  </span>
);

/* --- Compact KPI card --- */
const KpiCard = ({ icon: Icon, label, value, accent }) => {
  const accents = {
    blue: { icon: "text-blue-400", bg: "bg-blue-500/10" },
    green: { icon: "text-green-400", bg: "bg-green-500/10" },
    red: { icon: "text-red-400", bg: "bg-red-500/10" },
    purple: { icon: "text-purple-400", bg: "bg-purple-500/10" },
  };
  const a = accents[accent] ?? accents.blue;
  return (
    <div className={`${card} p-5 flex items-center gap-4`}>
      <div className={`${a.bg} ${a.icon} rounded-lg p-2.5 shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white leading-none mb-1">
          {value}
        </p>
        <p className="text-xs text-gray-500 truncate">{label}</p>
      </div>
    </div>
  );
};

/* --- Sidebar nav config --- */
const NAV_GROUPS = [
  {
    label: "Core",
    items: [
      { id: "overview", label: "Overview", icon: ChartBarIcon },
      { id: "players", label: "Players", icon: TrophyIcon },
      { id: "leagues", label: "Leagues", icon: TrophyIcon },
      { id: "enquiries", label: "Enquiries", icon: EnvelopeIcon },
      { id: "profiles", label: "Profile Requests", icon: UserCircleIcon },
    ],
  },
  {
    label: "Content",
    items: [
      { id: "blogs", label: "Blogs", icon: DocumentTextIcon },
      { id: "services", label: "Services", icon: Cog6ToothIcon },
      { id: "about", label: "About", icon: InformationCircleIcon },
      { id: "partners", label: "Partners", icon: UserGroupIcon },
    ],
  },
];

const SYSTEM_ITEMS = [
  { id: "admins", label: "Admins", icon: ShieldCheckIcon, superOnly: true },
  { id: "settings", label: "Settings", icon: LockClosedIcon },
];

/* --- Sidebar --- */
const Sidebar = ({ activeTab, setActiveTab, isSuperAdmin, onLogout }) => (
  <aside className="hidden md:flex w-56 shrink-0 flex-col bg-gray-900 border-r border-white/8 min-h-screen">
    {/* Logo */}
    <div className="px-4 py-5 border-b border-white/8">
      <Link to="/" className="flex items-center gap-2 group" tabIndex={-1}>
        <img src={logoImg} alt="Pro Talent Connect" className="h-7 w-auto object-contain" />
        <span className="text-sm font-semibold text-white">Pro Talent Connect</span>
      </Link>
    </div>

    {/* Nav groups */}
    <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                      active
                        ? "bg-red-500/15 text-red-400"
                        : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${active ? "text-red-400" : ""}`}
                    />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* System group */}
      <div>
        <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          System
        </p>
        <ul className="space-y-0.5">
          {SYSTEM_ITEMS.filter((i) => !i.superOnly || isSuperAdmin).map(
            ({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                      active
                        ? "bg-red-500/15 text-red-400"
                        : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${active ? "text-red-400" : ""}`}
                    />
                    {label}
                  </button>
                </li>
              );
            },
          )}
        </ul>
      </div>
    </nav>

    {/* Logout */}
    <div className="px-2 py-4 border-t border-white/8">
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <ArrowRightOnRectangleIcon className="w-4 h-4 shrink-0" />
        Logout
      </button>
    </div>
  </aside>
);

/* --- Top header --- */
const BREADCRUMB_LABELS = {
  overview: "Overview",
  players: "Players",
  enquiries: "Enquiries",
  profiles: "Profile Requests",
  blogs: "Blogs",
  services: "Services",
  about: "About",
  partners: "Partners",
  admins: "Admins",
  settings: "Settings",
};

const TopHeader = ({ activeTab, adminData, isSuperAdmin }) => {
  const [open, setOpen] = useState(false);
  return (
    <header className="hidden md:flex h-14 shrink-0 items-center justify-between px-6 border-b border-white/8 bg-gray-950">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Dashboard</span>
        <span className="text-gray-700">/</span>
        <span className="text-white font-medium">
          {BREADCRUMB_LABELS[activeTab] ?? activeTab}
        </span>
      </div>

      {/* Avatar dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/8 border border-white/10 transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <UserCircleIcon className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-gray-300 max-w-30 truncate">
            {adminData?.name}
          </span>
          {isSuperAdmin && (
            <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded">
              Super
            </span>
          )}
          <ChevronDownIcon
            className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-48 rounded-xl py-1 z-30 ptc-dropdown-panel">
            <div className="px-3 py-2 border-b border-white/8">
              <p className="text-xs text-gray-500">Signed in as</p>
              <p className="text-sm font-medium text-white truncate">
                {adminData?.email}
              </p>
            </div>
            <Link
              to="/"
              className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 ptc-dropdown-item"
              onClick={() => setOpen(false)}
            >
              Go to site
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

/* --- Enquiries Section --- */
/* ── Mobile header (mobile only) ───────────────────────────── */
const MobileHeader = ({ activeTab, onOpenDrawer }) => (
  <header className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between px-4 bg-gray-950 border-b border-white/8 shrink-0">
    <button
      type="button"
      onClick={onOpenDrawer}
      className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:bg-white/6 transition-colors focus:outline-none"
      aria-label="Open navigation"
    >
      <Bars3Icon className="w-5 h-5" />
    </button>
    <div className="flex items-center gap-1.5">
      <img src={logoImg} alt="Pro Talent Connect" className="h-5 w-auto object-contain" />
      <span className="text-sm font-semibold text-white">
        {BREADCRUMB_LABELS[activeTab] ?? "Dashboard"}
      </span>
    </div>
    <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
      <UserCircleIcon className="w-5 h-5 text-red-400" />
    </div>
  </header>
);

/* ── Mobile slide-in nav drawer ────────────────────────────── */
const MobileDrawer = ({
  open,
  onClose,
  activeTab,
  setActiveTab,
  isSuperAdmin,
  adminData,
  onLogout,
}) => {
  if (!open) return null;
  const select = (id) => {
    setActiveTab(id);
    onClose();
  };
  return (
    <>
      <div
        className="md:hidden fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col bg-[#111116] shadow-2xl"
        style={{ animation: "slideInLeft 220ms ease-out both" }}
        role="dialog"
        aria-label="Dashboard navigation"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/8">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logoImg} alt="Pro Talent Connect" className="h-7 w-auto object-contain" />
            <span className="text-sm font-semibold text-white">Pro Talent Connect</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-white/6 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="px-3 py-3 border-b border-white/8">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/4 border border-white/8">
            <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
              <UserCircleIcon className="w-6 h-6 text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {adminData?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {adminData?.email}
              </p>
            </div>
            {isSuperAdmin && (
              <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded">
                Super
              </span>
            )}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(({ id, label, icon: Icon }) => {
                  const active = activeTab === id;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => select(id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${active ? "bg-red-500/12 text-red-400" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"}`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${active ? "text-red-400" : ""}`}
                        />
                        {label}
                        {active && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div>
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
              System
            </p>
            <ul className="space-y-0.5">
              {SYSTEM_ITEMS.filter((i) => !i.superOnly || isSuperAdmin).map(
                ({ id, label, icon: Icon }) => {
                  const active = activeTab === id;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => select(id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${active ? "bg-red-500/12 text-red-400" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"}`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${active ? "text-red-400" : ""}`}
                        />
                        {label}
                      </button>
                    </li>
                  );
                },
              )}
            </ul>
          </div>
        </nav>
        <div className="px-3 py-4 border-t border-white/8">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-red-400 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 shrink-0" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

/* ── Mobile horizontal section tab rail ────────────────────── */
const ALL_TABS_FLAT = [...NAV_GROUPS.flatMap((g) => g.items), ...SYSTEM_ITEMS];

const MobileTabRail = ({ activeTab, setActiveTab, isSuperAdmin }) => (
  <div className="md:hidden shrink-0 border-b border-white/8 bg-gray-950">
    <div className="flex overflow-x-auto no-scrollbar px-3 py-2 gap-1.5">
      {ALL_TABS_FLAT.filter((t) => !t.superOnly || isSuperAdmin).map(
        ({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 border ${
                active
                  ? "bg-red-500/12 text-red-400 border-red-500/25"
                  : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              {label}
            </button>
          );
        },
      )}
    </div>
  </div>
);

const EnquiriesSection = ({ enquiries, updateEnquiryStatus }) => {
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const FILTERS = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "in-progress", label: "In Progress" },
    { id: "resolved", label: "Resolved" },
    { id: "closed", label: "Closed" },
  ];

  const filtered =
    filter === "all" ? enquiries : enquiries.filter((e) => e.status === filter);

  return (
    <div className="space-y-4">
      {/* Filter row */}
      <div className={`${card} px-4 py-3 flex flex-wrap items-center gap-2`}>
        <span className="text-xs text-gray-500 font-medium mr-1">Filter:</span>
        {FILTERS.map(({ id, label }) => {
          const count =
            id === "all"
              ? enquiries.length
              : enquiries.filter((e) => e.status === id).length;
          return (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === id
                  ? "bg-red-500/15 text-red-400 border border-red-500/20"
                  : "text-gray-400 hover:bg-white/5"
              }`}
            >
              {label} <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className={`${card} overflow-hidden`}>
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-12">
            No {filter === "all" ? "" : filter} enquiries found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">
                    Subject
                  </th>
                  <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((enq) => (
                  <React.Fragment key={enq._id}>
                    <tr className="hover:bg-white/3 transition-colors group">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-white">{enq.name}</p>
                        <p className="text-xs text-gray-500">{enq.email}</p>
                        <p className="text-xs text-gray-500 md:hidden mt-1">
                          {enq.subject}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <p className="text-gray-300 truncate max-w-50">
                          {enq.subject}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-gray-500 text-xs">
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={enq.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(
                                expandedId === enq._id ? null : enq._id,
                              )
                            }
                            aria-expanded={expandedId === enq._id}
                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                          >
                            {expandedId === enq._id ? "Hide" : "View"}
                          </button>
                          {enq.status === "pending" && (
                            <button
                              onClick={() =>
                                updateEnquiryStatus(enq._id, "in-progress")
                              }
                              className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                            >
                              In Progress
                            </button>
                          )}
                          {(enq.status === "pending" ||
                            enq.status === "in-progress") && (
                            <button
                              onClick={() =>
                                updateEnquiryStatus(enq._id, "resolved")
                              }
                              className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                          {enq.status !== "closed" && (
                            <button
                              onClick={() =>
                                updateEnquiryStatus(enq._id, "closed")
                              }
                              className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 transition-colors"
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === enq._id && (
                      <tr className="bg-white/2">
                        <td colSpan={5} className="px-5 py-4">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">
                                Subject
                              </p>
                              <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">
                                {enq.subject || "No subject provided."}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">
                                Message
                              </p>
                              <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">
                                {enq.message || "No message provided."}
                              </p>
                            </div>
                            {enq.phone && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">
                                  Phone
                                </p>
                                <p className="text-sm text-gray-200">
                                  {enq.phone}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- Profile Requests Section --- */
const ProfileRequestsSection = ({ profileRequests, updateProfileStatus }) => {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [viewRequest, setViewRequest] = useState(null);

  const FILTERS = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "reviewing", label: "Reviewing" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
  ];

  const filtered =
    filter === "all"
      ? profileRequests
      : profileRequests.filter((p) => p.status === filter);

  return (
    <div className="space-y-4">
      {/* Filter row */}
      <div className={`${card} px-4 py-3 flex flex-wrap items-center gap-2`}>
        <span className="text-xs text-gray-500 font-medium mr-1">Filter:</span>
        {FILTERS.map(({ id, label }) => {
          const count =
            id === "all"
              ? profileRequests.length
              : profileRequests.filter((p) => p.status === id).length;
          return (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === id
                  ? "bg-red-500/15 text-red-400 border border-red-500/20"
                  : "text-gray-400 hover:bg-white/5"
              }`}
            >
              {label} <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className={`${card} overflow-hidden`}>
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-12">
            No {filter === "all" ? "" : filter} profile requests found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">
                    Position
                  </th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">
                    Location
                  </th>
                  <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((p) => (
                  <React.Fragment key={p._id}>
                    <tr
                      className="hover:bg-white/3 transition-colors cursor-pointer"
                      onClick={() =>
                        setExpanded(expanded === p._id ? null : p._id)
                      }
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-white">{p.fullName}</p>
                        <p className="text-xs text-gray-500">{p.email}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell text-gray-300">
                        {p.playingPosition}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-gray-500 text-xs">
                        {p.city}, {p.nationality}
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-gray-500 text-xs">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                      <td
                        className="px-5 py-3.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            onClick={() => setViewRequest(p)}
                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/10 text-gray-200 hover:bg-white/20 transition-colors"
                          >
                            View
                          </button>
                          {p.status === "pending" && (
                            <button
                              onClick={() =>
                                updateProfileStatus(p._id, "reviewing")
                              }
                              className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                            >
                              Review
                            </button>
                          )}
                          {(p.status === "pending" ||
                            p.status === "reviewing") && (
                            <>
                              <button
                                onClick={() =>
                                  updateProfileStatus(p._id, "approved")
                                }
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  updateProfileStatus(p._id, "rejected")
                                }
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded === p._id && (
                      <tr key={`${p._id}-exp`} className="bg-gray-900/50">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            {[
                              ["Preferred Foot", p.preferredFoot],
                              ["Height", p.height ? `${p.height} cm` : "-"],
                              ["Weight", p.weight ? `${p.weight} kg` : "-"],
                              [
                                "Experience",
                                p.yearsOfExperience
                                  ? `${p.yearsOfExperience} yrs`
                                  : "-",
                              ],
                            ].map(([k, v]) => (
                              <div
                                key={k}
                                className="bg-gray-800/60 rounded-lg p-2.5"
                              >
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
                                  {k}
                                </p>
                                <p className="text-sm font-medium text-white">
                                  {v || "-"}
                                </p>
                              </div>
                            ))}
                          </div>
                          {p.currentClub && (
                            <p className="text-xs text-gray-400 mb-1">
                              Club:{" "}
                              <span className="text-gray-200">
                                {p.currentClub}
                              </span>
                            </p>
                          )}
                          {p.achievements && (
                            <p className="text-xs text-gray-400 mb-1">
                              Achievements:{" "}
                              <span className="text-gray-200">
                                {p.achievements}
                              </span>
                            </p>
                          )}
                          {p.videoLink && (
                            <a
                              href={p.videoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                              <EyeIcon className="w-3.5 h-3.5" />
                              Open highlight video
                            </a>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Request View Modal */}
      {viewRequest && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setViewRequest(null);
          }}
        >
          <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto bg-gray-900 border border-white/10 rounded-2xl shadow-2xl">
            <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-white/10 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{viewRequest.fullName}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Complete profile request details</p>
              </div>
              <button
                onClick={() => setViewRequest(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close request view"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  ["Status", viewRequest.status],
                  ["Playing Position", viewRequest.playingPosition],
                  ["Preferred Foot", viewRequest.preferredFoot],
                  ["Date of Birth", viewRequest.dateOfBirth ? new Date(viewRequest.dateOfBirth).toLocaleDateString() : "-"],
                  ["Nationality", viewRequest.nationality],
                  ["City", viewRequest.city],
                  ["Phone", viewRequest.phone],
                  ["Email", viewRequest.email],
                  ["Current Club", viewRequest.currentClub || "-"],
                  ["Height", viewRequest.height ? `${viewRequest.height} cm` : "-"],
                  ["Weight", viewRequest.weight ? `${viewRequest.weight} kg` : "-"],
                  ["Experience", viewRequest.yearsOfExperience ? `${viewRequest.yearsOfExperience} years` : "-"],
                  ["Submitted On", viewRequest.createdAt ? new Date(viewRequest.createdAt).toLocaleString() : "-"],
                  ["Last Updated", viewRequest.updatedAt ? new Date(viewRequest.updatedAt).toLocaleString() : "-"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-3">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm text-white break-words">{value || "-"}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="bg-white/5 border border-white/8 rounded-xl p-3">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Achievements</p>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{viewRequest.achievements || "-"}</p>
                </div>

                {viewRequest.videoLink && (
                  <div className="bg-white/5 border border-white/8 rounded-xl p-3">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Highlight Video</p>
                    <a
                      href={viewRequest.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-red-400 hover:underline break-all"
                    >
                      {viewRequest.videoLink}
                    </a>
                  </div>
                )}

                {viewRequest.adminNotes && (
                  <div className="bg-white/5 border border-white/8 rounded-xl p-3">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Admin Notes</p>
                    <p className="text-sm text-gray-200 whitespace-pre-wrap">{viewRequest.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- Overview pane --- */
const OverviewPane = ({ stats, enquiries, profileRequests, setActiveTab }) => (
  <div className="space-y-6">
    {/* KPI row */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        icon={TrophyIcon}
        label="Total Players"
        value={stats?.totalPlayers || 0}
        accent="blue"
      />
      <KpiCard
        icon={DocumentTextIcon}
        label="Blog Posts"
        value={stats?.totalBlogs || 0}
        accent="green"
      />
      <KpiCard
        icon={EnvelopeIcon}
        label="Enquiries"
        value={enquiries.length}
        accent="red"
      />
      <KpiCard
        icon={UserCircleIcon}
        label="Profile Requests"
        value={profileRequests.length}
        accent="purple"
      />
    </div>

    {/* Pending summary */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        {
          label: "Pending Enquiries",
          value: enquiries.filter((e) => e.status === "pending").length,
          color: "text-yellow-400",
        },
        {
          label: "Pending Profile Requests",
          value: profileRequests.filter((p) => p.status === "pending").length,
          color: "text-orange-400",
        },
        {
          label: "Published Blogs",
          value: stats?.publishedBlogs ?? stats?.totalBlogs ?? 0,
          color: "text-green-400",
        },
      ].map(({ label, value, color }) => (
        <div
          key={label}
          className={`${card} px-5 py-4 flex items-center gap-4`}
        >
          <ClockIcon className="w-4 h-4 text-gray-600 shrink-0" />
          <div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Recent tables */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Recent Enquiries */}
      <div className={`${card} overflow-hidden`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">Recent Enquiries</h3>
          <button
            onClick={() => setActiveTab("enquiries")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-red-300 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            <EyeIcon className="w-3.5 h-3.5" />
            Open all enquiries
          </button>
        </div>
        {enquiries.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No enquiries yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-white/5">
              {enquiries.slice(0, 5).map((e) => (
                <tr key={e._id} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-white text-sm">{e.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-35">
                      {e.subject}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <StatusBadge status={e.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Profile Requests */}
      <div className={`${card} overflow-hidden`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">
            Recent Profile Requests
          </h3>
          <button
            onClick={() => setActiveTab("profiles")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-red-300 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            <EyeIcon className="w-3.5 h-3.5" />
            Open all profile requests
          </button>
        </div>
        {profileRequests.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No profile requests yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-white/5">
              {profileRequests.slice(0, 5).map((p) => (
                <tr key={p._id} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-white text-sm">
                      {p.fullName}
                    </p>
                    <p className="text-xs text-gray-500">{p.playingPosition}</p>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
);

/* --- Settings pane --- */
const SettingsPane = ({ adminData }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPwFields, setShowPwFields] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [pwOtpSent, setPwOtpSent] = useState(false);
  const [pwOtpVerified, setPwOtpVerified] = useState(false);
  const [pwOtpValue, setPwOtpValue] = useState("");
  const [pwOtpLoading, setPwOtpLoading] = useState(false);
  const [pwOtpError, setPwOtpError] = useState("");
  const [pwOtpSuccess, setPwOtpSuccess] = useState("");

  const pwCriteria = {
    length: passwordData.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(passwordData.newPassword),
    lowercase: /[a-z]/.test(passwordData.newPassword),
    number: /\d/.test(passwordData.newPassword),
    special: /[@$!%*?&]/.test(passwordData.newPassword),
  };

  const handleSendPasswordOtp = async () => {
    setPwOtpLoading(true);
    setPwOtpError("");
    setPwOtpSuccess("");
    try {
      await api.sendPasswordOtp();
      setPwOtpSent(true);
      setPwOtpSuccess("OTP sent to your email.");
    } catch (err) {
      setPwOtpError(err.response?.data?.message || "Failed to send OTP.");
      setPwOtpSent(true);
    } finally {
      setPwOtpLoading(false);
    }
  };

  const handleVerifyPasswordOtp = async () => {
    if (!pwOtpValue || pwOtpValue.length !== 6) {
      setPwOtpError("Enter a valid 6-digit OTP");
      return;
    }
    setPwOtpLoading(true);
    setPwOtpError("");
    try {
      await api.verifyPasswordOtp(pwOtpValue);
      setPwOtpVerified(true);
      setPwOtpSuccess("OTP verified!");
      setPwOtpError("");
    } catch (err) {
      setPwOtpError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setPwOtpLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (!pwOtpVerified) {
      setPasswordError("Verify your email OTP first");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    try {
      setChangingPassword(true);
      await api.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPwOtpSent(false);
      setPwOtpVerified(false);
      setPwOtpValue("");
      setPwOtpError("");
      setPwOtpSuccess("");
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Failed to change password",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      {/* Account info */}
      <div className={`${card} p-6`}>
        <h3 className="text-sm font-semibold text-white mb-4">
          Account Information
        </h3>
        <dl className="space-y-3">
          {[
            ["Name", adminData?.name],
            ["Email", adminData?.email],
            ["Role", adminData?.role],
          ].map(([k, v]) => (
            <div key={k} className="flex items-start gap-4">
              <dt className="text-xs text-gray-500 w-12 pt-0.5 shrink-0">
                {k}
              </dt>
              <dd className="text-sm text-white font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Change password */}
      <div className={`${card} p-6`}>
        <h3 className="text-sm font-semibold text-white mb-5">
          Change Password
        </h3>
        {passwordError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs">
            {passwordSuccess}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPwFields.current ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className={`${inputCls} pr-9`}
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPwFields((p) => ({ ...p, current: !p.current }))
                }
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
              >
                {showPwFields.current ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPwFields.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className={`${inputCls} pr-9`}
                placeholder="Min 8 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwFields((p) => ({ ...p, new: !p.new }))}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
              >
                {showPwFields.new ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwordData.newPassword.length > 0 && (
              <div className="mt-2 p-3 bg-gray-800/60 border border-white/8 rounded-lg space-y-1">
                {[
                  { key: "length", label: "At least 8 characters" },
                  { key: "uppercase", label: "One uppercase letter" },
                  { key: "lowercase", label: "One lowercase letter" },
                  { key: "number", label: "One number" },
                  { key: "special", label: "One special character (@$!%*?&)" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    {pwCriteria[key] ? (
                      <CheckCircleIcon className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    ) : (
                      <XCircleIcon className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                    )}
                    <span
                      className={`text-xs ${pwCriteria[key] ? "text-green-400" : "text-gray-500"}`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPwFields.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className={`${inputCls} pr-9`}
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPwFields((p) => ({ ...p, confirm: !p.confirm }))
                }
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
              >
                {showPwFields.confirm ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwordData.confirmPassword.length > 0 && (
              <p
                className={`text-xs mt-1 flex items-center gap-1 ${passwordData.newPassword === passwordData.confirmPassword ? "text-green-400" : "text-red-400"}`}
              >
                {passwordData.newPassword === passwordData.confirmPassword ? (
                  <>
                    <CheckCircleIcon className="w-3.5 h-3.5" /> Passwords match
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-3.5 h-3.5" /> Passwords do not
                    match
                  </>
                )}
              </p>
            )}
          </div>

          {/* OTP */}
          <div className="p-3 rounded-lg border border-white/8 bg-gray-800/40">
            <p className="text-xs text-gray-500 mb-2 font-medium">
              Email OTP Verification
            </p>
            {pwOtpError && (
              <p className="text-xs text-red-400 mb-2">{pwOtpError}</p>
            )}
            {pwOtpSuccess && (
              <p className="text-xs text-green-400 mb-2">{pwOtpSuccess}</p>
            )}
            {!pwOtpVerified ? (
              <div className="flex items-center gap-2 flex-wrap">
                {!pwOtpSent ? (
                  <button
                    type="button"
                    onClick={handleSendPasswordOtp}
                    disabled={pwOtpLoading}
                    className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {pwOtpLoading ? "Sending..." : "Send OTP to Email"}
                  </button>
                ) : (
                  <>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit OTP"
                      value={pwOtpValue}
                      onChange={(e) =>
                        setPwOtpValue(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-32 px-3 py-1.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm tracking-widest text-center focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyPasswordOtp}
                      disabled={pwOtpLoading || pwOtpValue.length !== 6}
                      className="px-3 py-1.5 bg-green-700/80 hover:bg-green-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {pwOtpLoading ? "Verifying..." : "Verify"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSendPasswordOtp}
                      disabled={pwOtpLoading}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 transition-colors disabled:opacity-50"
                    >
                      Resend
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-green-400">
                <CheckCircleIcon className="w-4 h-4" />
                <span className="text-xs font-medium">OTP verified</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={changingPassword || !pwOtpVerified}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {changingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

/* --- Content wrapper --- */
const ContentPanel = ({ activeTab }) => (
  <div className={`${card} p-4 sm:p-6 overflow-x-hidden`}>
    {activeTab === "players" && <PlayerManagement />}
    {activeTab === "leagues" && <LeagueManagement />}
    {activeTab === "blogs" && <BlogManagement />}
    {activeTab === "services" && <ServiceManagement />}
    {activeTab === "about" && <AboutManagement />}
    {activeTab === "partners" && <PartnerManagement />}
    {activeTab === "admins" && <AdminManagement />}
  </div>
);

const DASHBOARD_AUTO_REFRESH_MS = 20000;

/* === MAIN COMPONENT === */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [profileRequests, setProfileRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isSuperAdmin = adminData?.role === "Super Admin";

  /* Fetch CSRF token on mount */
  useEffect(() => {
    fetchCsrfToken();
  }, []);

  /* Auth guard */
  useEffect(() => {
    const session = localStorage.getItem("adminSession");
    const admin = localStorage.getItem("adminData");
    if (!session || !admin || admin === "undefined") {
      navigate("/login");
      return;
    }
    try {
      const parsedAdmin = JSON.parse(admin);
      if (parsedAdmin?.activation_required || parsedAdmin?.is_password_set === false) {
        if (parsedAdmin?.email) {
          localStorage.setItem("pendingActivationEmail", parsedAdmin.email);
        }
        navigate("/admin-activate", {
          state: { email: parsedAdmin?.email || "" },
        });
        return;
      }

      setAdminData(parsedAdmin);
    } catch {
      localStorage.removeItem("adminSession");
      localStorage.removeItem("adminData");
      navigate("/login");
    }
  }, [navigate]);

  /* Cross-tab logout sync */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "adminSession" && !e.newValue) navigate("/login");
      if (e.key === "adminData" && e.newValue && e.newValue !== "undefined") {
        try {
          const parsedAdmin = JSON.parse(e.newValue);
          if (parsedAdmin?.activation_required || parsedAdmin?.is_password_set === false) {
            if (parsedAdmin?.email) {
              localStorage.setItem("pendingActivationEmail", parsedAdmin.email);
            }
            navigate("/admin-activate", {
              state: { email: parsedAdmin?.email || "" },
            });
            return;
          }
          setAdminData(parsedAdmin);
        } catch {
          /* noop */
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [navigate]);

  const fetchDashboardData = useCallback(async ({ signal, silent = false, force = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }

      if (force) {
        api.invalidateCache("/dashboard");
        api.invalidateCache("/contact");
      }

      const requestOptions = signal ? { signal } : {};

      const [statsRes, enquiriesRes, profilesRes] = await Promise.all([
        api.getDashboardStats(requestOptions),
        api.getEnquiries(requestOptions),
        api.getProfileRequests(requestOptions),
      ]);

      if (!signal || !signal.aborted) {
        setStats(statsRes.data || {});
        const enqData = enquiriesRes.data?.enquiries || enquiriesRes.data;
        setEnquiries(Array.isArray(enqData) ? enqData : []);
        const profData = profilesRes.data?.requests || profilesRes.data;
        setProfileRequests(Array.isArray(profData) ? profData : []);
      }
    } catch (err) {
      if (!signal || !signal.aborted) {
        console.error(err);
        setError("Failed to load dashboard data");
      }
    } finally {
      if ((!signal || !signal.aborted) && !silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    if (adminData) fetchDashboardData({ signal: ctrl.signal, force: true });
    return () => ctrl.abort();
  }, [adminData, fetchDashboardData]);

  useEffect(() => {
    if (!adminData) return;

    const refreshVisibleData = () => {
      if (document.visibilityState !== "visible") return;
      fetchDashboardData({ silent: true, force: true });
    };

    const intervalId = window.setInterval(refreshVisibleData, DASHBOARD_AUTO_REFRESH_MS);
    window.addEventListener("focus", refreshVisibleData);
    document.addEventListener("visibilitychange", refreshVisibleData);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshVisibleData);
      document.removeEventListener("visibilitychange", refreshVisibleData);
    };
  }, [adminData, fetchDashboardData]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      /* noop */
    } finally {
      localStorage.removeItem("adminSession");
      localStorage.removeItem("adminData");
      navigate("/login");
    }
  };

  const updateEnquiryStatus = async (id, status) => {
    try {
      await api.updateEnquiryStatus(id, status);
      const res = await api.getEnquiries();
      const enqData = res.data?.enquiries || res.data;
      setEnquiries(Array.isArray(enqData) ? enqData : []);
    } catch (err) {
      console.error(err);
    }
  };

  const updateProfileStatus = async (id, status) => {
    try {
      await api.updateProfileStatus(id, status);
      const res = await api.getProfileRequests();
      const profData = res.data?.requests || res.data;
      setProfileRequests(Array.isArray(profData) ? profData : []);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const PANEL_TABS = [
    "players",
    "leagues",
    "blogs",
    "services",
    "about",
    "partners",
    "admins",
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSuperAdmin={isSuperAdmin}
        onLogout={handleLogout}
      />

      {/* Mobile drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSuperAdmin={isSuperAdmin}
        adminData={adminData}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top header */}
        <MobileHeader
          activeTab={activeTab}
          adminData={adminData}
          onOpenDrawer={() => setDrawerOpen(true)}
        />

        {/* Desktop top header */}
        <TopHeader
          activeTab={activeTab}
          adminData={adminData}
          isSuperAdmin={isSuperAdmin}
        />

        {/* Mobile horizontal tab rail */}
        <MobileTabRail
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSuperAdmin={isSuperAdmin}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {activeTab === "overview" && (
            <OverviewPane
              stats={stats}
              enquiries={enquiries}
              profileRequests={profileRequests}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === "enquiries" && (
            <EnquiriesSection
              enquiries={enquiries}
              updateEnquiryStatus={updateEnquiryStatus}
            />
          )}
          {activeTab === "profiles" && (
            <ProfileRequestsSection
              profileRequests={profileRequests}
              updateProfileStatus={updateProfileStatus}
            />
          )}
          {activeTab === "settings" && <SettingsPane adminData={adminData} />}
          {PANEL_TABS.includes(activeTab) &&
            !(activeTab === "admins" && !isSuperAdmin) && (
              <ContentPanel activeTab={activeTab} />
            )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
