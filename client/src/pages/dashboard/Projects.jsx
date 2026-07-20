import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import ProjectCard from "../../components/ui/ProjectCard";
import { projects } from "../../data/mockAnalytics";

const FILTERS = ["All", "In Progress", "Review", "Planning", "Completed"];

const statusCounts = (data) => ({
  All: data.length,
  "In Progress": data.filter((p) => p.status === "In Progress").length,
  Review: data.filter((p) => p.status === "Review").length,
  Planning: data.filter((p) => p.status === "Planning").length,
  Completed: data.filter((p) => p.status === "Completed").length,
});

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const counts = statusCounts(projects);

  const filtered = projects.filter((p) => {
    const matchFilter = activeFilter === "All" || p.status === activeFilter;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <MainLayout>
      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold toast-enter"
          style={{ background: "linear-gradient(135deg,#0f0e1a,#1e1b4b)", border: "1px solid rgba(99,102,241,0.3)" }}
        >
          <svg className="h-4 w-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            {counts["In Progress"]} active · {counts.Review} in review · {counts.Completed} completed
          </p>
        </div>
        <button
          id="projects-new-btn"
          onClick={() => triggerToast("New project dialog opened")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition cursor-pointer hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-px"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-in-up">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="projects-search"
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
          {FILTERS.map((f) => (
            <button
              key={f}
              id={`filter-${f.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === f
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeFilter === f ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"
                }`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-4">
            🔍
          </div>
          <h3 className="text-sm font-bold text-slate-700">No projects found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 stagger">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Summary Bar */}
      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 animate-fade-in-up">
        {[
          { label: "Total Projects", value: projects.length },
          { label: "Total Tasks", value: projects.reduce((a, p) => a + p.tasksTotal, 0) },
          { label: "Completed Tasks", value: projects.reduce((a, p) => a + p.tasksCompleted, 0) },
          {
            label: "Avg. Progress",
            value: `${Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length)}%`,
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col">
            <span className="text-xl font-extrabold text-slate-800">{value}</span>
            <span className="text-xs text-slate-400 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
