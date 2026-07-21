import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/dashboard': 'Overview',
  '/dashboard/workspace': 'Workspace Management',
  '/dashboard/projects': 'Projects',
  '/dashboard/tasks': 'Tasks',
  '/dashboard/team': 'Team',
  '/dashboard/reports': 'Reports',
  '/dashboard/settings': 'Settings',
};

export default function Topbar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  const username = auth?.username || 'John Doe';
  const initials =
    username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'JD';

  const handleNewTask = () => {
    navigate('/dashboard/tasks');
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
    navigate('/login');
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
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="hidden md:block">
          <h2 className="text-lg font-bold text-slate-800 leading-none">
            {pageTitle}
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-xs hidden sm:block">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
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
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Task
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="topbar-notifications"
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            aria-label="Notifications"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"
              aria-hidden="true"
            />
          </button>

          {isNotificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-3 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Notifications
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                    3 New
                  </span>
                </div>
                <div className="divide-y divide-slate-100 text-xs max-h-60 overflow-y-auto">
                  <div className="p-3 hover:bg-slate-50 transition cursor-pointer">
                    <p className="font-bold text-slate-800">
                      Manpreet Singh invited you
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      To join "Pulse Dev Core" workspace
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      5m ago
                    </span>
                  </div>
                  <div className="p-3 hover:bg-slate-50 transition cursor-pointer">
                    <p className="font-bold text-slate-800">Task Assigned</p>
                    <p className="text-slate-500 mt-0.5">
                      RBAC authorization middleware
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      1h ago
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1" />

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            id="topbar-avatar"
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition cursor-pointer group"
          >
            <Avatar
              initials={initials}
              name={username}
              size="sm"
              bgClass="bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold"
              showStatus={true}
            />
            <div className="hidden lg:block text-left">
              <p className="text-sm font-bold text-slate-700 leading-none group-hover:text-indigo-600 transition">
                {username}
              </p>
              <p className="text-[10px] font-semibold text-indigo-600 mt-0.5">
                {auth?.role}
              </p>
            </div>
            <svg
              className={`hidden lg:block h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                isProfileOpen ? 'rotate-180 text-indigo-600' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Profile Dropdown Popover */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-slate-900 truncate">
                      {username}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      Administrator
                    </p>
                  </div>
                </div>

                {/* Navigation Options */}
                <div className="p-1 space-y-0.5">
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer"
                  >
                    <svg
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    My Profile
                  </Link>

                  <Link
                    to="/dashboard/workspace"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer"
                  >
                    <svg
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-6 0h6"
                      />
                    </svg>
                    Workspace Settings
                  </Link>
                </div>

                {/* Logout Action */}
                <div className="pt-1 mt-1 border-t border-slate-100 px-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <svg
                      className="h-4 w-4 text-rose-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
