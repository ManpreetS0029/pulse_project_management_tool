import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import TaskCard from "../../components/ui/TaskCard";
import { tasks } from "../../data/mockAnalytics";

const COLUMNS = [
  {
    id: "todo",
    label: "To Do",
    color: "#94a3b8",
    bg: "bg-slate-100",
    dot: "bg-slate-400",
    border: "border-slate-200",
    headerBg: "bg-slate-50",
  },
  {
    id: "inProgress",
    label: "In Progress",
    color: "#6366f1",
    bg: "bg-indigo-50",
    dot: "bg-indigo-500",
    border: "border-indigo-100",
    headerBg: "bg-indigo-50/60",
  },
  {
    id: "inReview",
    label: "In Review",
    color: "#f59e0b",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
    border: "border-amber-100",
    headerBg: "bg-amber-50/60",
  },
  {
    id: "done",
    label: "Done",
    color: "#10b981",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
    border: "border-emerald-100",
    headerBg: "bg-emerald-50/60",
  },
];

export default function Tasks() {
  const [board, setBoard] = useState(tasks);
  const [toast, setToast] = useState("");
  const [view, setView] = useState("kanban"); // "kanban" | "list"

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const totalTasks = Object.values(board).flat().length;
  const doneTasks = board.done.length;

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">
            {doneTasks} of {totalTasks} tasks completed ·{" "}
            <span className="font-semibold text-indigo-600">{board.inProgress.length} in progress</span>
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              id="view-kanban"
              onClick={() => setView("kanban")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${view === "kanban" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
              title="Kanban view"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </button>
            <button
              id="view-list"
              onClick={() => setView("list")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${view === "list" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
              title="List view"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          <button
            id="tasks-filter-btn"
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 shadow-sm transition cursor-pointer"
          >
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filter
          </button>
          <button
            id="tasks-new-btn"
            onClick={() => triggerToast("New task dialog opened")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition cursor-pointer hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-px"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm animate-fade-in-up">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">Sprint Progress</span>
          <span className="text-xs font-bold text-slate-700">{Math.round((doneTasks / totalTasks) * 100)}% complete</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full progress-bar"
            style={{
              width: `${(doneTasks / totalTasks) * 100}%`,
              background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
              "--progress-width": `${(doneTasks / totalTasks) * 100}%`,
            }}
          />
        </div>
        <div className="flex items-center gap-6 mt-3">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex items-center gap-1.5 text-xs">
              <span className={`h-2 w-2 rounded-full ${col.dot}`} />
              <span className="text-slate-500">{col.label}</span>
              <span className="font-bold text-slate-700">{board[col.id].length}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      {view === "kanban" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start animate-fade-in">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className={`flex flex-col rounded-2xl border ${col.border} overflow-hidden`}
              style={{ minHeight: "400px" }}
            >
              {/* Column Header */}
              <div className={`${col.headerBg} px-4 py-3 border-b ${col.border} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <span className="text-xs font-bold text-slate-700">{col.label}</span>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 border text-slate-600"
                  style={{ borderColor: col.color + "40" }}
                >
                  {board[col.id].length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-3 space-y-3 bg-slate-50/50">
                {board[col.id].length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="text-2xl mb-2">✨</div>
                    <p className="text-xs text-slate-400 font-medium">No tasks here</p>
                  </div>
                ) : (
                  <div className="space-y-3 stagger">
                    {board[col.id].map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}

                {/* Add card button */}
                <button
                  onClick={() => triggerToast(`New task added to ${col.label}`)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition cursor-pointer mt-2"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add task
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2 animate-fade-in">
          {COLUMNS.map((col) =>
            board[col.id].map((task) => (
              <div
                key={task.id}
                className="bg-white border border-slate-100 rounded-xl px-5 py-3.5 shadow-xs flex items-center gap-4 hover:shadow-sm hover:border-indigo-100 transition cursor-pointer group"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${col.dot} flex-shrink-0`} />
                <span className="flex-1 text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition">{task.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{col.label}</span>
                <span className="text-xs text-slate-400 hidden sm:block">{task.project}</span>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${task.assignee.bg}`}>
                  {task.assignee.initials}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </MainLayout>
  );
}
