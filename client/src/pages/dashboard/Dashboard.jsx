import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  Globe,
  Zap,
  Calendar,
  Layers,
  Users,
  Briefcase,
  TrendingUp,
  Check,
  ChevronRight,
  ListTodo,
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import KPI from '../../components/ui/KPI';
import CreateProjectModal from '../../components/ui/CreateProjectModal';
import CreateTaskModal from '../../components/ui/CreateTaskModal';
import { useAuth } from '../../context/AuthContext';
import { apiPrivate } from '../../api/axios';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';

const priorityConfig = {
  Critical: { dot: 'bg-red-500', bg: 'bg-red-50 text-red-700 border-red-200' },
  High: {
    dot: 'bg-orange-500',
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  Medium: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  Low: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

const statusConfig = {
  'In Progress': { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  Planning: { bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  Review: { bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  Completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const colorBarMap = {
  indigo: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
  violet: 'linear-gradient(90deg,#8b5cf6,#a78bfa)',
  sky: 'linear-gradient(90deg,#0ea5e9,#38bdf8)',
  emerald: 'linear-gradient(90deg,#10b981,#34d399)',
  pink: 'linear-gradient(90deg,#ec4899,#f472b6)',
  amber: 'linear-gradient(90deg,#f59e0b,#fbbf24)',
};

const DEFAULT_WORKSPACES = [
  { id: 'all', _id: 'all', name: 'All Workspaces', logo: '' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState(DEFAULT_WORKSPACES);
  const [selectedWorkspace, setSelectedWorkspace] = useState(
    DEFAULT_WORKSPACES[0],
  );
  const [isWsDropdownOpen, setIsWsDropdownOpen] = useState(false);
  const wsDropdownRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [toast, setToast] = useState('');

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(e.target)) {
        setIsWsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wsRes, projRes, taskRes] = await Promise.allSettled([
        apiPrivate.get('/workspaces/my-workspaces'),
        projectService.getProjects(),
        taskService.getTasks(),
      ]);

      if (wsRes.status === 'fulfilled') {
        const rawWs = wsRes.value.data?.data || wsRes.value.data || [];
        if (Array.isArray(rawWs) && rawWs.length > 0) {
          const normalizedWs = rawWs.map((item) => {
            const w = item.workspace || item;
            return {
              id: w._id || w.id,
              _id: w._id || w.id,
              name: w.name || 'Untitled Workspace',
              logo: w.logo || '',
            };
          });
          setWorkspaces([DEFAULT_WORKSPACES[0], ...normalizedWs]);
        }
      }

      if (projRes.status === 'fulfilled') {
        const rawProj =
          projRes.value.data?.data || projRes.value.data || projRes.value || [];
        if (Array.isArray(rawProj)) {
          const normalizedProj = rawProj.map((p) => ({
            id: p._id || p.id,
            _id: p._id || p.id,
            name: p.name || 'Untitled Project',
            description: p.description || '',
            workspace:
              p.workspaceName ||
              (typeof p.workspace === 'string'
                ? p.workspace
                : p.workspace?.name) ||
              '',
            workspaceId:
              p.workspace?._id ||
              (typeof p.workspace === 'string' ? p.workspace : undefined),
            status: p.status || 'In Progress',
            priority: p.priority || 'Medium',
            progress: p.progress ?? 0,
            dueDate: p.dueDate
              ? new Date(p.dueDate).toISOString().split('T')[0]
              : '',
            tasksTotal: p.tasksTotal ?? 0,
            tasksCompleted: p.tasksCompleted ?? 0,
            color: p.color || 'indigo',
          }));
          setProjects(normalizedProj);
        }
      }

      if (taskRes.status === 'fulfilled') {
        const rawTasks =
          taskRes.value.data?.data || taskRes.value.data || taskRes.value || [];
        if (Array.isArray(rawTasks)) {
          const normalizedTasks = rawTasks.map((t) => ({
            id: t._id || t.id,
            _id: t._id || t.id,
            title: t.title || 'Untitled Task',
            status: t.status || 'todo',
            priority: t.priority || 'Medium',
            project:
              t.projectName ||
              (t.project && t.project.name) ||
              (typeof t.project === 'string' ? t.project : ''),
            projectId:
              (t.project && (t.project._id || t.project.id)) ||
              (typeof t.project === 'string' ? t.project : ''),
            workspace:
              t.workspaceName || (t.workspace && t.workspace.name) || '',
            workspaceId:
              (t.workspace && (t.workspace._id || t.workspace.id)) ||
              (typeof t.workspace === 'string' ? t.workspace : undefined),
            dueDate: t.dueDate
              ? new Date(t.dueDate).toISOString().split('T')[0]
              : null,
          }));
          setTasks(normalizedTasks);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProjects = useMemo(() => {
    if (
      !selectedWorkspace ||
      selectedWorkspace.id === 'all' ||
      selectedWorkspace.name === 'All Workspaces'
    ) {
      return projects;
    }
    const wsId = String(selectedWorkspace.id || selectedWorkspace._id || '');
    const wsName = (selectedWorkspace.name || '').toLowerCase();
    return projects.filter((p) => {
      const pWsId = String(p.workspaceId || '');
      const pWsName = (p.workspace || '').toLowerCase();
      return (wsId && pWsId === wsId) || (wsName && pWsName === wsName);
    });
  }, [projects, selectedWorkspace]);

  const filteredTasks = useMemo(() => {
    if (
      !selectedWorkspace ||
      selectedWorkspace.id === 'all' ||
      selectedWorkspace.name === 'All Workspaces'
    ) {
      return tasks;
    }
    const wsId = String(selectedWorkspace.id || selectedWorkspace._id || '');
    const wsName = (selectedWorkspace.name || '').toLowerCase();
    return tasks.filter((t) => {
      const tWsId = String(t.workspaceId || '');
      const tWsName = (t.workspace || '').toLowerCase();
      return (wsId && tWsId === wsId) || (wsName && tWsName === wsName);
    });
  }, [tasks, selectedWorkspace]);

  const totalProjectsCount = filteredProjects.length;
  const activeProjects = filteredProjects.filter(
    (p) => p.status !== 'Completed',
  );
  const activeProjectsCount = activeProjects.length;

  const totalTasksCount = filteredTasks.length;
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');
  const doneTasksCount = doneTasks.length;
  const pendingTasks = filteredTasks.filter((t) => t.status !== 'done');
  const pendingTasksCount = pendingTasks.length;
  const criticalPendingCount = pendingTasks.filter(
    (t) => t.priority === 'Critical' || t.priority === 'High',
  ).length;

  const completionRate =
    totalTasksCount > 0
      ? Math.round((doneTasksCount / totalTasksCount) * 100)
      : 0;

  const statusDistribution = useMemo(() => {
    const counts = {
      todo: filteredTasks.filter((t) => t.status === 'todo').length,
      inProgress: filteredTasks.filter((t) => t.status === 'inProgress').length,
      inReview: filteredTasks.filter((t) => t.status === 'inReview').length,
      done: filteredTasks.filter((t) => t.status === 'done').length,
    };
    return counts;
  }, [filteredTasks]);

  const toggleTaskDone = async (task) => {
    const isCurrentlyDone = task.status === 'done';
    const newStatus = isCurrentlyDone ? 'todo' : 'done';

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id || t._id === task._id
          ? { ...t, status: newStatus }
          : t,
      ),
    );

    try {
      await taskService.updateTask(task.id || task._id, { status: newStatus });
      triggerToast(
        newStatus === 'done'
          ? `Completed "${task.title}"`
          : `Marked "${task.title}" as to-do`,
      );
    } catch (err) {
      console.error('Failed to update task status:', err);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id || t._id === task._id
            ? { ...t, status: task.status }
            : t,
        ),
      );
      triggerToast('Failed to update task status');
    }
  };

  const handleSaveProject = async (projectData) => {
    try {
      const response = await projectService.createProject(projectData);
      const created = response?.data || response;
      if (created) {
        setProjects((prev) => [
          {
            id: created._id || created.id,
            _id: created._id || created.id,
            name: created.name || projectData.name,
            description: created.description || projectData.description || '',
            workspace: created.workspaceName || projectData.workspace || '',
            workspaceId: created.workspace || projectData.workspace,
            status: created.status || projectData.status || 'In Progress',
            priority: created.priority || projectData.priority || 'Medium',
            progress: created.progress ?? 0,
            dueDate: created.dueDate
              ? new Date(created.dueDate).toISOString().split('T')[0]
              : '',
            tasksTotal: 0,
            tasksCompleted: 0,
            color: 'indigo',
          },
          ...prev,
        ]);
        triggerToast(`Project "${projectData.name}" created!`);
      }
      setIsProjectModalOpen(false);
    } catch (err) {
      console.error('Failed to create project:', err);
      triggerToast('Failed to create project');
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      const created = await taskService.createTask(taskData);
      const realTask = created?.data || created;
      if (realTask) {
        const normalized = {
          id: realTask._id || realTask.id,
          _id: realTask._id || realTask.id,
          title: realTask.title || taskData.title,
          status: realTask.status || taskData.status || 'todo',
          priority: realTask.priority || taskData.priority || 'Medium',
          project:
            realTask.projectName ||
            taskData.projectName ||
            taskData.project ||
            '',
          projectId: realTask.project || taskData.project || '',
          workspace: realTask.workspaceName || taskData.workspaceName || '',
          workspaceId: realTask.workspace || taskData.workspace || '',
          dueDate: realTask.dueDate
            ? new Date(realTask.dueDate).toISOString().split('T')[0]
            : null,
        };
        setTasks((prev) => [normalized, ...prev]);
        triggerToast(`Task "${taskData.title}" created!`);
      }
      setIsTaskModalOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
      triggerToast('Failed to create task');
    }
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = auth?.username || 'Team';

  return (
    <MainLayout>
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold toast-enter"
          style={{
            background: 'linear-gradient(135deg,#0f0e1a,#1e1b4b)',
            border: '1px solid rgba(99,102,241,0.3)',
          }}
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <div className="relative inline-block z-40" ref={wsDropdownRef}>
              <button
                onClick={() => setIsWsDropdownOpen(!isWsDropdownOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-xs hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
              >
                <span className="h-5 w-5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                  {selectedWorkspace?.id === 'all' ? (
                    <Globe className="h-3.5 w-3.5" />
                  ) : (
                    <Zap className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="text-slate-400 font-normal">Workspace:</span>
                <span className="font-extrabold text-indigo-950 group-hover:text-indigo-600 transition-colors">
                  {selectedWorkspace?.name || 'All Workspaces'}
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
                      Filter by Workspace
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                      {workspaces.length} Spaces
                    </span>
                  </div>
                  <div className="py-1 space-y-1 max-h-60 overflow-y-auto">
                    {workspaces.map((ws) => {
                      const isSelected =
                        selectedWorkspace?.id === ws.id ||
                        selectedWorkspace?._id === ws._id;
                      return (
                        <button
                          key={ws.id || ws._id}
                          onClick={() => {
                            setSelectedWorkspace(ws);
                            setIsWsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-indigo-600">
                              {ws.id === 'all' ? (
                                <Globe className="h-3.5 w-3.5" />
                              ) : (
                                <Folder className="h-3.5 w-3.5" />
                              )}
                            </span>
                            <span className="truncate">{ws.name}</span>
                          </div>
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-indigo-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, {displayName} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            You have{' '}
            <span className="font-bold text-indigo-600">
              {pendingTasksCount} pending tasks
            </span>{' '}
            across{' '}
            <span className="font-bold text-indigo-600">
              {activeProjectsCount} active projects
            </span>
            {selectedWorkspace?.id !== 'all'
              ? ` in ${selectedWorkspace.name}`
              : ''}
            .
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsTaskModalOpen(true)}
            id="dashboard-new-task-btn"
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition cursor-pointer hover:border-slate-300 hover:-translate-y-px"
          >
            <ListTodo className="h-4 w-4 text-indigo-600" />+ Add Task
          </button>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            id="dashboard-new-project-btn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition cursor-pointer hover:shadow-md hover:shadow-indigo-500/20 hover:-translate-y-px"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 stagger">
        <KPI
          title="Active Projects"
          value={String(activeProjectsCount)}
          change={
            totalProjectsCount > 0
              ? `${Math.round((activeProjectsCount / totalProjectsCount) * 100)}% active`
              : null
          }
          isPositive={true}
          timeframe={`of ${totalProjectsCount} total`}
          iconName="folder"
          onClick={() => navigate('/dashboard/projects')}
        />
        <KPI
          title="Pending Tasks"
          value={String(pendingTasksCount)}
          change={
            criticalPendingCount > 0
              ? `${criticalPendingCount} high priority`
              : null
          }
          isPositive={criticalPendingCount === 0}
          timeframe="needs attention"
          iconName="clock"
          onClick={() => navigate('/dashboard/tasks')}
        />
        <KPI
          title="Completed Tasks"
          value={String(doneTasksCount)}
          change={
            totalTasksCount > 0 ? `${doneTasksCount}/${totalTasksCount}` : null
          }
          isPositive={true}
          timeframe="tasks finished"
          iconName="check-circle"
          onClick={() => navigate('/dashboard/tasks')}
        />
        <KPI
          title="Completion Rate"
          value={`${completionRate}%`}
          change={completionRate >= 70 ? 'On Track' : 'In Progress'}
          isPositive={completionRate >= 50}
          timeframe="overall progress"
          iconName="percent"
        />
      </div>

      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">
              Active Projects
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {activeProjects.length}
            </span>
          </div>
          <button
            onClick={() => navigate('/dashboard/projects')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition cursor-pointer group"
          >
            View all projects
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {activeProjects.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3">
              <Folder className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              No active projects
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Get started by creating your first project to organize tasks and
              track progress.
            </p>
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
            {activeProjects.slice(0, 4).map((project) => {
              const bar = colorBarMap[project.color] || colorBarMap.indigo;
              const pConfig =
                priorityConfig[project.priority] || priorityConfig.Medium;
              const sBadge =
                statusConfig[project.status] || statusConfig['In Progress'];

              return (
                <div
                  key={project.id || project._id}
                  className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  onClick={() =>
                    navigate(
                      `/dashboard/tasks?project=${encodeURIComponent(project.name)}&projectId=${project._id || project.id}`,
                    )
                  }
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sBadge.bg}`}
                        >
                          {project.status}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pConfig.bg}`}
                        >
                          {project.priority}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 mb-3">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-semibold text-slate-500">
                        Progress
                      </span>
                      <span className="font-bold text-slate-800">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full progress-bar"
                        style={{
                          width: `${project.progress}%`,
                          background: bar,
                          '--progress-width': `${project.progress}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[10px] text-slate-400">
                      <span className="font-medium truncate max-w-[120px]">
                        {project.workspace || 'Workspace'}
                      </span>
                      {project.dueDate ? (
                        <span className="flex items-center gap-1 font-semibold text-slate-500">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {project.dueDate}
                        </span>
                      ) : (
                        <span>No due date</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm animate-fade-in-up">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-indigo-600" />
                Tasks Focus
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {doneTasksCount} of {filteredTasks.length} tasks completed
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-28 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${completionRate}%`,
                    background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                  }}
                />
              </div>
              <button
                onClick={() => navigate('/dashboard/tasks')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition cursor-pointer"
              >
                View all
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center">
              <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                No tasks created yet
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add tasks to track your daily progress.
              </p>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add First Task
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredTasks.slice(0, 7).map((task) => {
                const isDone = task.status === 'done';
                const pConfig =
                  priorityConfig[task.priority] || priorityConfig.Medium;

                return (
                  <div
                    key={task.id || task._id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition group"
                  >
                    <button
                      onClick={() => toggleTaskDone(task)}
                      id={`task-toggle-${task.id || task._id}`}
                      className={`h-5 w-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                        isDone
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                          : 'border-slate-300 bg-white hover:border-indigo-400 group-hover:border-indigo-500'
                      }`}
                      title={
                        isDone ? 'Mark as incomplete' : 'Mark as completed'
                      }
                    >
                      {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold truncate transition-all ${
                          isDone
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 group-hover:text-indigo-700'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.project && (
                          <span className="text-[10px] font-medium text-slate-400 truncate max-w-[140px]">
                            📁 {task.project}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5 text-slate-300" />
                            {task.dueDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${pConfig.bg}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm animate-fade-in-up">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span>Task Breakdown</span>
              <span className="text-slate-600 font-extrabold">
                {totalTasksCount} Total
              </span>
            </h3>

            <div className="space-y-3">
              {[
                {
                  label: 'To Do',
                  count: statusDistribution.todo,
                  color: '#94a3b8',
                  bg: 'bg-slate-100',
                },
                {
                  label: 'In Progress',
                  count: statusDistribution.inProgress,
                  color: '#6366f1',
                  bg: 'bg-indigo-500',
                },
                {
                  label: 'In Review',
                  count: statusDistribution.inReview,
                  color: '#f59e0b',
                  bg: 'bg-amber-500',
                },
                {
                  label: 'Done',
                  count: statusDistribution.done,
                  color: '#10b981',
                  bg: 'bg-emerald-500',
                },
              ].map((item) => {
                const pct =
                  totalTasksCount > 0
                    ? Math.round((item.count / totalTasksCount) * 100)
                    : 0;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: item.color }}
                        />
                        {item.label}
                      </span>
                      <span className="font-bold text-slate-800">
                        {item.count}{' '}
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate('/dashboard/tasks')}
              className="w-full mt-4 pt-3 border-t border-slate-50 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 transition cursor-pointer"
            >
              Open Kanban Board
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm animate-fade-in-up"
            style={{ animationDelay: '60ms' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Quick Shortcuts
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: 'New Project',
                  desc: 'Create and configure a project',
                  icon: <Briefcase className="h-4 w-4 text-indigo-600" />,
                  bg: 'bg-indigo-50',
                  action: () => setIsProjectModalOpen(true),
                },
                {
                  label: 'Add Task',
                  desc: 'Create task with assignee & due date',
                  icon: <ListTodo className="h-4 w-4 text-violet-600" />,
                  bg: 'bg-violet-50',
                  action: () => setIsTaskModalOpen(true),
                },
                {
                  label: 'Workspace',
                  desc: 'Manage workspace & team invites',
                  icon: <Layers className="h-4 w-4 text-sky-600" />,
                  bg: 'bg-sky-50',
                  action: () => navigate('/dashboard/workspace'),
                },
                {
                  label: 'Team Directory',
                  desc: 'View members & workload stats',
                  icon: <Users className="h-4 w-4 text-emerald-600" />,
                  bg: 'bg-emerald-50',
                  action: () => navigate('/dashboard/team'),
                },
              ].map((shortcut) => (
                <button
                  key={shortcut.label}
                  onClick={shortcut.action}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/80 text-left transition cursor-pointer group"
                >
                  <span
                    className={`h-8 w-8 rounded-lg ${shortcut.bg} flex items-center justify-center flex-shrink-0 transition group-hover:scale-105`}
                  >
                    {shortcut.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {shortcut.label}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {shortcut.desc}
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        defaultWorkspace={
          selectedWorkspace?.name !== 'All Workspaces'
            ? selectedWorkspace?.name
            : ''
        }
        workspaceList={workspaces
          .filter((w) => w.id !== 'all')
          .map((w) => w.name)}
      />

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaveTask={handleSaveTask}
        initialStatus="todo"
        initialProject=""
        selectedWorkspace={
          selectedWorkspace?.id !== 'all' ? selectedWorkspace : undefined
        }
        workspaces={workspaces.filter((w) => w.id !== 'all')}
      />
    </MainLayout>
  );
}
