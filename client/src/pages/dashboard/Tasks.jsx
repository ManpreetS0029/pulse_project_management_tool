import React, { useState, useEffect, useRef, useMemo } from "react";
import MainLayout from "../../components/layout/MainLayout";
import TaskCard from "../../components/ui/TaskCard";
import CreateTaskModal from "../../components/ui/CreateTaskModal";
import { apiPrivate } from "../../api/axios";
import { taskService } from "../../services/taskService";

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

const EMPTY_BOARD = {
  todo: [],
  inProgress: [],
  inReview: [],
  done: [],
};

const DEFAULT_WORKSPACES = [
  { id: 'all', _id: 'all', name: 'All Workspaces', logo: '⚡', color: 'from-indigo-600 to-purple-600' },
];

export default function Tasks() {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [toast, setToast] = useState("");
  const [view, setView] = useState("kanban");

  const dropdownRef = useRef(null);
  const [workspaces, setWorkspaces] = useState(DEFAULT_WORKSPACES);
  const [selectedWorkspace, setSelectedWorkspace] = useState(DEFAULT_WORKSPACES[0]);
  const [isWsDropdownOpen, setIsWsDropdownOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState("todo");
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const fetchUserWorkspaces = async () => {
      try {
        const response = await apiPrivate.get('/workspaces/my-workspaces');
        const rawData = response.data?.data || response.data;
        if (Array.isArray(rawData) && rawData.length > 0) {
          const normalized = rawData.map((item) => {
            const wsObj = item.workspace || item;
            return {
              id: wsObj._id || wsObj.id,
              _id: wsObj._id || wsObj.id,
              name: wsObj.name || 'Untitled Workspace',
              logo: wsObj.logo || '📁',
              color: wsObj.color || 'from-indigo-600 to-purple-600',
            };
          });
          const allOption = { id: 'all', _id: 'all', name: 'All Workspaces', logo: '⚡' };
          setWorkspaces([allOption, ...normalized]);
        }
      } catch (err) {
        console.error('Failed to fetch user workspaces in Tasks:', err);
      }
    };

    fetchUserWorkspaces();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const targetWsId = selectedWorkspace?.id || selectedWorkspace?._id;
        const params = targetWsId && targetWsId !== 'all' ? { workspaceId: targetWsId } : {};
        const response = await taskService.getTasks(params);
        const rawTasks = response?.data || response;
        if (Array.isArray(rawTasks) && rawTasks.length > 0) {
          const categorizedBoard = {
            todo: [],
            inProgress: [],
            inReview: [],
            done: [],
          };

          rawTasks.forEach((t) => {
            const statusKey = t.status || 'todo';
            const normalized = {
              id: t._id || t.id,
              _id: t._id || t.id,
              title: t.title,
              project: t.projectName || (t.project && t.project.name) || '',
              projectColor: (t.project && t.project.color) || '#6366f1',
              workspace: t.workspaceName || (t.workspace && t.workspace.name) || '',
              workspaceId: (t.workspace && (t.workspace._id || t.workspace.id)) || t.workspace,
              status: statusKey,
              priority: t.priority || 'Medium',
              assignee: {
                name: t.assigneeName || (t.assignee ? `${t.assignee.firstName || ''} ${t.assignee.lastName || ''}`.trim() : 'Unassigned'),
                initials: t.assigneeInitials || (t.assigneeName ? t.assigneeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'UA'),
                bg: 'bg-indigo-100 text-indigo-700',
              },
              dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : null,
              tags: t.tags || [],
              notes: t.description || '',
              subtasks: t.subtasks || [],
              files: t.attachments || [],
              commentsCount: (t.comments || []).length,
              comments: t.comments || [],
              updatedAt: t.updatedAt,
            };

            if (categorizedBoard[statusKey]) {
              categorizedBoard[statusKey].push(normalized);
            } else {
              categorizedBoard.todo.push(normalized);
            }
          });

          setBoard((prev) => ({
            ...prev,
            ...categorizedBoard,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };

    fetchTasks();
  }, [selectedWorkspace]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsWsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayBoard = useMemo(() => {
    if (!selectedWorkspace || selectedWorkspace.id === 'all' || selectedWorkspace.name === 'All Workspaces') {
      return board;
    }

    const selId = String(selectedWorkspace.id || selectedWorkspace._id || '');
    const selName = (selectedWorkspace.name || '').toLowerCase();

    const filtered = {};
    Object.keys(board).forEach((colKey) => {
      filtered[colKey] = (board[colKey] || []).filter((task) => {
        if (!task.workspaceId && !task.workspace) return true;
        const taskWsId = String(task.workspaceId || task.workspace || '');
        const taskWsName = (task.workspaceName || task.workspace || '').toLowerCase();
        return (selId && taskWsId === selId) || (selName && taskWsName === selName);
      });
    });
    return filtered;
  }, [board, selectedWorkspace]);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleOpenNewTaskModal = (statusId = "todo") => {
    setEditingTask(null);
    setTargetStatus(statusId);
    setIsModalOpen(true);
  };

  const handleOpenEditTaskModal = (task) => {
    setEditingTask(task);
    setTargetStatus(task.status || "todo");
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData) => {
    setBoard((prev) => {
      const newBoard = { ...prev };
      const statusKey = taskData.status || "todo";

      if (editingTask) {
        Object.keys(newBoard).forEach((colKey) => {
          newBoard[colKey] = newBoard[colKey].filter((t) => t.id !== taskData.id);
        });
      }

      if (!newBoard[statusKey]) {
        newBoard[statusKey] = [];
      }
      newBoard[statusKey] = [taskData, ...newBoard[statusKey]];

      return newBoard;
    });

    triggerToast(
      editingTask
        ? `Task "${taskData.title}" updated!`
        : `New task "${taskData.title}" added!`
    );
  };

  const totalTasks = Object.values(displayBoard).flat().length;
  const doneTasks = (displayBoard.done || []).length;

  return (
    <MainLayout>
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

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveTask={handleSaveTask}
        initialStatus={targetStatus}
        existingTask={editingTask}
        selectedWorkspace={selectedWorkspace}
        workspaces={workspaces}
      />

      <div className="relative z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="relative inline-block mb-2 z-40" ref={dropdownRef}>
            <button
              onClick={() => setIsWsDropdownOpen(!isWsDropdownOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-xs hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
            >
              <span className="h-5 w-5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                {selectedWorkspace?.logo || '⚡'}
              </span>
              <span className="text-slate-400 font-normal">Workspace:</span>
              <span className="font-extrabold text-indigo-950 group-hover:text-indigo-600 transition-colors">
                {selectedWorkspace?.name || 'Pulse Dev Core'}
              </span>
              <svg
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                  isWsDropdownOpen ? 'rotate-180 text-indigo-600' : ''
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

            {isWsDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-scale-up">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Select Workspace
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                    {workspaces.length} Spaces
                  </span>
                </div>
                <div className="py-1 space-y-1 max-h-60 overflow-y-auto">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id || ws._id}
                      onClick={() => {
                        setSelectedWorkspace(ws);
                        setIsWsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedWorkspace?.id === ws.id || selectedWorkspace?._id === ws._id
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs">
                          {ws.logo || '📁'}
                        </span>
                        <span>{ws.name}</span>
                      </div>
                      {(selectedWorkspace?.id === ws.id || selectedWorkspace?._id === ws._id) && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Project Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">
            {doneTasks} of {totalTasks} tasks completed ·{" "}
            <span className="font-semibold text-indigo-600">{(displayBoard.inProgress || []).length} in progress</span>
          </p>
        </div>
        <div className="flex items-center gap-2.5">
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
            id="tasks-new-btn"
            onClick={() => handleOpenNewTaskModal("todo")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition cursor-pointer hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-px"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Task to Project
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm animate-fade-in-up">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">Sprint Progress</span>
          <span className="text-xs font-bold text-slate-700">
            {totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}% complete
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full progress-bar"
            style={{
              width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%`,
              background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
              "--progress-width": `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="flex items-center gap-6 mt-3">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex items-center gap-1.5 text-xs">
              <span className={`h-2 w-2 rounded-full ${col.dot}`} />
              <span className="text-slate-500">{col.label}</span>
              <span className="font-bold text-slate-700">{(displayBoard[col.id] || []).length}</span>
            </div>
          ))}
        </div>
      </div>

      {view === "kanban" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start animate-fade-in">
          {COLUMNS.map((col) => {
            const columnTasks = displayBoard[col.id] || [];
            return (
              <div
                key={col.id}
                className={`flex flex-col rounded-2xl border ${col.border} overflow-hidden`}
                style={{ minHeight: "400px" }}
              >
                <div className={`${col.headerBg} px-4 py-3 border-b ${col.border} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                    <span className="text-xs font-bold text-slate-700">{col.label}</span>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 border text-slate-600"
                    style={{ borderColor: col.color + "40" }}
                  >
                    {columnTasks.length}
                  </span>
                </div>

                <div className="flex-1 p-3 space-y-3 bg-slate-50/50">
                  {columnTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="text-2xl mb-2">✨</div>
                      <p className="text-xs text-slate-400 font-medium">No tasks in {col.label}</p>
                    </div>
                  ) : (
                    <div className="space-y-3 stagger">
                      {columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={() => handleOpenEditTaskModal(task)}
                        />
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleOpenNewTaskModal(col.id)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition cursor-pointer mt-2"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add task to {col.label}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in">
          {COLUMNS.map((col) =>
            (displayBoard[col.id] || []).map((task) => (
              <div
                key={task.id}
                onClick={() => handleOpenEditTaskModal(task)}
                className="bg-white border border-slate-100 rounded-xl px-5 py-3.5 shadow-xs flex items-center gap-4 hover:shadow-sm hover:border-indigo-100 transition cursor-pointer group"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${col.dot} flex-shrink-0`} />
                <span className="flex-1 text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition">
                  {task.title}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {col.label}
                </span>
                <span className="text-xs text-slate-400 hidden sm:block">{task.project}</span>
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                    task.assignee?.bg || "bg-indigo-100 text-indigo-700"
                  }`}
                >
                  {task.assignee?.initials || "PM"}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </MainLayout>
  );
}
