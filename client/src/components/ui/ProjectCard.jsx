import React from "react";

const priorityConfig = {
  Critical: { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.1)", dot: "bg-red-500" },
  High:     { label: "High",     color: "#f97316", bg: "rgba(249,115,22,0.1)", dot: "bg-orange-500" },
  Medium:   { label: "Medium",   color: "#eab308", bg: "rgba(234,179,8,0.1)",  dot: "bg-yellow-500" },
  Low:      { label: "Low",      color: "#22c55e", bg: "rgba(34,197,94,0.1)",  dot: "bg-green-500" },
};

const statusConfig = {
  "In Progress": { bg: "bg-indigo-50", text: "text-indigo-700", ring: "ring-indigo-200" },
  "Review":      { bg: "bg-amber-50",  text: "text-amber-700",  ring: "ring-amber-200" },
  "Planning":    { bg: "bg-slate-100", text: "text-slate-600",  ring: "ring-slate-200" },
  "Completed":   { bg: "bg-emerald-50",text: "text-emerald-700",ring: "ring-emerald-200" },
};

const colorMap = {
  indigo:  { bar: "linear-gradient(90deg,#6366f1,#8b5cf6)", icon: "rgba(99,102,241,0.12)", iconText: "#6366f1" },
  violet:  { bar: "linear-gradient(90deg,#8b5cf6,#a78bfa)", icon: "rgba(139,92,246,0.12)", iconText: "#8b5cf6" },
  sky:     { bar: "linear-gradient(90deg,#0ea5e9,#38bdf8)", icon: "rgba(14,165,233,0.12)", iconText: "#0ea5e9" },
  emerald: { bar: "linear-gradient(90deg,#10b981,#34d399)", icon: "rgba(16,185,129,0.12)", iconText: "#10b981" },
  pink:    { bar: "linear-gradient(90deg,#ec4899,#f472b6)", icon: "rgba(236,72,153,0.12)", iconText: "#ec4899" },
  amber:   { bar: "linear-gradient(90deg,#f59e0b,#fbbf24)", icon: "rgba(245,158,11,0.12)", iconText: "#f59e0b" },
};

export default function ProjectCard({ project }) {
  const { name, description, status, priority, progress, dueDate, tasksTotal, tasksCompleted, color } = project;
  const colors = colorMap[color] || colorMap.indigo;
  const pCfg = priorityConfig[priority] || priorityConfig.Medium;
  const sCfg = statusConfig[status] || statusConfig["In Progress"];

  const hasDueDate = Boolean(dueDate);
  const today = new Date();
  const due = hasDueDate ? new Date(dueDate) : null;
  const daysLeft = due && !isNaN(due.getTime()) ? Math.ceil((due - today) / (1000 * 60 * 60 * 24)) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

  return (
    <div className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-250 cursor-pointer flex flex-col gap-4 animate-fade-in-up relative overflow-hidden">
      {/* Top-right glow */}
      <div
        className="absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-[0.06] group-hover:opacity-[0.1] transition-opacity"
        style={{ background: `radial-gradient(circle, ${colors.iconText}, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-indigo-700 transition-colors">
            {name}
          </h3>
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 mt-1.5 ${sCfg.bg} ${sCfg.text} ${sCfg.ring}`}>
            {status}
          </span>
        </div>
        {/* Priority */}
        <span
          className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: pCfg.bg, color: pCfg.color }}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${pCfg.dot}`} />
          {pCfg.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{description}</p>

      {/* Progress */}
      <div>
        <div className="flex justify-between items-center mb-1.5 text-xs">
          <span className="font-semibold text-slate-500">Progress</span>
          <span className="font-bold text-slate-700">{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full progress-bar"
            style={{ width: `${progress}%`, background: colors.bar, "--progress-width": `${progress}%` }}
          />
        </div>
        <div className="text-[11px] text-slate-400 mt-1.5">{tasksCompleted} / {tasksTotal} tasks</div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
        <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[50%]">
          {project.workspace || ''}
        </span>

        {daysLeft !== null ? (
          <span
            className={`flex items-center gap-1 text-[11px] font-semibold ${
              isOverdue ? "text-rose-600" : isDueSoon ? "text-amber-600" : "text-slate-400"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {isOverdue
              ? `${Math.abs(daysLeft)}d overdue`
              : daysLeft === 0
              ? "Due today"
              : `${daysLeft}d left`}
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            No due date
          </span>
        )}
      </div>
    </div>
  );
}
