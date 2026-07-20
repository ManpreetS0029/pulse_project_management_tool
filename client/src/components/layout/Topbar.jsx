import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar";

const pageTitles = {
  "/dashboard": "Overview",
  "/dashboard/projects": "Projects",
  "/dashboard/tasks": "Tasks",
  "/dashboard/team": "Team",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
};

export default function Topbar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  const handleNewTask = () => {
    navigate("/dashboard/tasks");
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100/80 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 gap-4">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          id="topbar-sidebar-toggle"
          className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:hidden cursor-pointer focus:outline-none transition flex-shrink-0"
          aria-label="Open navigation"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden md:block">
          <h2 className="text-lg font-bold text-slate-800 leading-none">{pageTitle}</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-xs hidden sm:block">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="topbar-search"
            type="text"
            placeholder="Search projects, tasks..."
            aria-label="Search"
            className="block w-full pl-9 pr-10 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/70 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* New Task Button */}
        <button
          id="topbar-new-task"
          onClick={handleNewTask}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-px"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>

        {/* Notifications */}
        <button
          id="topbar-notifications"
          type="button"
          className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          aria-label="Notifications"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" aria-hidden="true" />
        </button>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1" />

        {/* Avatar */}
        <button
          id="topbar-avatar"
          type="button"
          className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition cursor-pointer group"
        >
          <Avatar
            initials="JD"
            name="John Doe"
            size="sm"
            bgClass="text-white font-bold"
            showStatus={true}
          />
          <div className="hidden lg:block text-left">
            <p className="text-sm font-bold text-slate-700 leading-none group-hover:text-indigo-600 transition">
              John Doe
            </p>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Admin</p>
          </div>
          <svg className="hidden lg:block h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </header>
  );
}
