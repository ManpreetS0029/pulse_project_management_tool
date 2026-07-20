import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import KPI from "../../components/ui/KPI";
import ChartLine from "../../components/ui/ChartLine";
import ActivityFeed from "../../components/ui/ActivityFeed";
import {
  kpiData,
  projects,
  taskCompletionData,
  activityFeed,
  myTasksToday,
} from "../../data/mockAnalytics";

const priorityDot = {
  Critical: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-yellow-500",
  Low: "bg-green-500",
};

const colorBarMap = {
  indigo:  "linear-gradient(90deg,#6366f1,#8b5cf6)",
  violet:  "linear-gradient(90deg,#8b5cf6,#a78bfa)",
  sky:     "linear-gradient(90deg,#0ea5e9,#38bdf8)",
  emerald: "linear-gradient(90deg,#10b981,#34d399)",
  pink:    "linear-gradient(90deg,#ec4899,#f472b6)",
  amber:   "linear-gradient(90deg,#f59e0b,#fbbf24)",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(myTasksToday);
  const [toast, setToast] = useState("");

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const activeProjects = projects.filter((p) => p.status !== "Completed").slice(0, 4);
  const doneCount = tasks.filter((t) => t.done).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <MainLayout>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold toast-enter"
          style={{ background: "linear-gradient(135deg,#0f0e1a,#1e1b4b)", border: "1px solid rgba(99,102,241,0.3)" }}
        >
          <svg className="h-4 w-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, John 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            You have <span className="font-semibold text-indigo-600">{tasks.filter(t => !t.done).length} tasks</span> pending today across{" "}
            <span className="font-semibold text-indigo-600">{activeProjects.length} active projects</span>.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => triggerToast("Report exported successfully")}
            id="dashboard-export-btn"
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 shadow-sm transition cursor-pointer"
          >
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
          <button
            onClick={() => navigate("/dashboard/projects")}
            id="dashboard-new-project-btn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition cursor-pointer hover:shadow-md hover:-translate-y-px"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 stagger">
        {kpiData.map((kpi) => (
          <KPI
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            isPositive={kpi.isPositive}
            timeframe={kpi.timeframe}
            iconName={kpi.iconName}
          />
        ))}
      </div>

      {/* Active Projects Strip */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800">Active Projects</h2>
          <button
            onClick={() => navigate("/dashboard/projects")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition cursor-pointer"
          >
            View all
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
          {activeProjects.map((project) => {
            const bar = colorBarMap[project.color] || colorBarMap.indigo;
            return (
              <div
                key={project.id}
                className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                onClick={() => navigate("/dashboard/projects")}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-xl">{project.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                      {project.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {project.tasksCompleted}/{project.tasksTotal} tasks
                    </p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full progress-bar"
                    style={{ width: `${project.progress}%`, background: bar, "--progress-width": `${project.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">{project.progress}%</span>
                  <div className="flex -space-x-1.5">
                    {project.assignees.slice(0, 2).map((a, i) => (
                      <div
                        key={i}
                        title={a.name}
                        className={`h-5 w-5 rounded-full border border-white flex items-center justify-center text-[8px] font-bold ${a.bg}`}
                      >
                        {a.initials}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm animate-fade-in-up">
          <ChartLine data={taskCompletionData} />
        </div>
        {/* Activity Feed */}
        <div className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <ActivityFeed activities={activityFeed} />
        </div>
      </div>

      {/* My Tasks Today + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* My Tasks Today */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">My Tasks Today</h3>
              <p className="text-xs text-slate-400 mt-0.5">{doneCount} of {tasks.length} completed</p>
            </div>
            <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / tasks.length) * 100}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }}
              />
            </div>
          </div>
          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                id={`task-toggle-${task.id}`}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 text-left transition cursor-pointer group"
              >
                <div
                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    task.done
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-slate-300 group-hover:border-indigo-400"
                  }`}
                >
                  {task.done && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span
                  className={`flex-1 text-sm font-medium transition-all ${
                    task.done ? "line-through text-slate-400" : "text-slate-700 group-hover:text-indigo-700"
                  }`}
                >
                  {task.title}
                </span>
                <span
                  className={`flex-shrink-0 h-1.5 w-1.5 rounded-full ${priorityDot[task.priority] || "bg-slate-300"}`}
                  title={task.priority}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {[
              {
                label: "New Project",
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                hover: "hover:bg-indigo-100",
                action: () => navigate("/dashboard/projects"),
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />,
              },
              {
                label: "Add Task",
                color: "text-violet-600",
                bg: "bg-violet-50",
                hover: "hover:bg-violet-100",
                action: () => navigate("/dashboard/tasks"),
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
              },
              {
                label: "Invite Member",
                color: "text-sky-600",
                bg: "bg-sky-50",
                hover: "hover:bg-sky-100",
                action: () => { triggerToast("Invitation link copied to clipboard!"); },
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />,
              },
              {
                label: "Generate Report",
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                hover: "hover:bg-emerald-100",
                action: () => triggerToast("Report generated successfully"),
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
              },
            ].map(({ label, color, bg, hover, action, icon }) => (
              <button
                key={label}
                id={`quick-action-${label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={action}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 ${hover} text-sm font-semibold text-slate-700 transition cursor-pointer group`}
              >
                <span className={`h-8 w-8 rounded-lg ${bg} ${color} flex items-center justify-center flex-shrink-0 transition group-hover:scale-105`}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {icon}
                  </svg>
                </span>
                {label}
                <svg className="ml-auto h-4 w-4 text-slate-300 group-hover:text-slate-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          {/* System Status */}
          <div
            className="mt-4 rounded-xl p-4"
            style={{ background: "linear-gradient(135deg, #0f0e1a, #0d0f1e)", border: "1px solid rgba(99,102,241,0.15)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Status</span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All systems go
              </span>
            </div>
            {[
              { label: "API", value: 98, color: "#6366f1" },
              { label: "Database", value: 72, color: "#8b5cf6" },
              { label: "CDN", value: 99, color: "#0ea5e9" },
            ].map(({ label, value, color }) => (
              <div key={label} className="mb-2.5 last:mb-0">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-500 font-semibold">{label}</span>
                  <span className="font-bold" style={{ color }}>{value}%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
