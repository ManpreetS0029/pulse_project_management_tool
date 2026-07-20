import React from "react";

const IconMap = {
  folder: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  ),
  "check-circle": (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  users: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  percent: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h.01M15 17h.01M16 6l-9 12m0-12a1 1 0 100 2 1 1 0 000-2zm9 10a1 1 0 100 2 1 1 0 000-2z" />
    </svg>
  ),
};

const iconGradients = {
  folder:          { from: "#6366f1", to: "#8b5cf6" },
  "check-circle":  { from: "#10b981", to: "#059669" },
  users:           { from: "#0ea5e9", to: "#0284c7" },
  percent:         { from: "#f59e0b", to: "#d97706" },
};

export default function KPI({ title, value, change, isPositive, timeframe, iconName }) {
  const icon = IconMap[iconName] || IconMap.folder;
  const grad = iconGradients[iconName] || iconGradients.folder;

  return (
    <div className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default animate-fade-in-up relative overflow-hidden">
      {/* Subtle gradient glow in corner */}
      <div
        className="absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-[0.07] transition-opacity group-hover:opacity-[0.12]"
        style={{ background: `radial-gradient(circle, ${grad.from}, transparent)` }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          {title}
        </span>
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="text-[1.75rem] font-extrabold text-slate-900 tracking-tight leading-none">
        {value}
      </div>

      {/* Delta */}
      <div className="flex items-center gap-2 mt-3">
        <span
          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs font-bold ${
            isPositive
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
          }`}
        >
          <svg
            className={`h-3 w-3 ${isPositive ? "" : "rotate-180"}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          {change}
        </span>
        <span className="text-xs text-slate-400 font-medium">{timeframe}</span>
      </div>
    </div>
  );
}
