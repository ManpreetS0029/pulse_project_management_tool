import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import ProjectCard from '../../components/ui/ProjectCard';
import CreateProjectModal from '../../components/ui/CreateProjectModal';
import { projects as initialProjects } from '../../data/mockAnalytics';

import { apiPrivate } from '../../api/axios';

const FILTERS = ['All', 'In Progress', 'Review', 'Planning', 'Completed'];

const statusCounts = (data) => ({
  All: data.length,
  'In Progress': data.filter((p) => p.status === 'In Progress').length,
  Review: data.filter((p) => p.status === 'Review').length,
  Planning: data.filter((p) => p.status === 'Planning').length,
  Completed: data.filter((p) => p.status === 'Completed').length,
});

const normalizeProject = (p) => ({
  id: p._id || p.id || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
  _id: p._id || p.id,
  name: p.name || 'Untitled Project',
  description: p.description || '',
  workspace:
    p.workspaceName ||
    (typeof p.workspace === 'string' ? p.workspace : '') ||
    'Pulse Dev Core',
  workspaceId: p.workspace?._id || p.workspace,
  status: p.status || 'In Progress',
  priority: p.priority || 'Medium',
  progress: p.progress ?? 0,
  dueDate: p.dueDate ? new Date(p.dueDate).toISOString().split('T')[0] : '',
  tasksTotal: p.tasksTotal ?? 0,
  tasksCompleted: p.tasksCompleted ?? 0,
});

export default function Projects() {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [isWsDropdownOpen, setIsWsDropdownOpen] = useState(false);

  const [projectList, setProjectList] = useState(
    initialProjects.map(normalizeProject),
  );
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch workspaces if user is authenticated
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
              membersCount: wsObj.membersCount || 10,
              projectsCount: wsObj.projectsCount || 5,
            };
          });
          setWorkspaces(normalized);
          setSelectedWorkspace(normalized[0]);
        }
      } catch (err) {
        console.error('Failed to fetch user workspaces:', err);
      }
    };

    fetchUserWorkspaces();
  }, []);

  // Fetch projects from backend
  useEffect(() => {
    const fetchBackendProjects = async () => {
      try {
        const response = await apiPrivate.get('/project');
        const rawProjects = response.data?.data || response.data;
        if (Array.isArray(rawProjects)) {
          const normalizedFetched = rawProjects.map(normalizeProject);
          setProjectList((prev) => {
            const fetchedIds = new Set(normalizedFetched.map((p) => p.id));
            const existingNonDuplicates = prev.filter(
              (p) => !fetchedIds.has(p.id) && !fetchedIds.has(p._id),
            );
            return [...normalizedFetched, ...existingNonDuplicates];
          });
        }
      } catch (err) {
        // Silent fallback
      }
    };

    fetchBackendProjects();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsWsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.search.includes('new=true') || location.state?.openNewModal) {
      setIsModalOpen(true);
    }
  }, [location]);

  // Filter projects by workspace if a specific workspace is chosen
  const workspaceFilteredProjects = projectList.filter((p) => {
    if (
      !selectedWorkspace ||
      selectedWorkspace.id === 'all' ||
      selectedWorkspace.name === 'All Workspaces'
    ) {
      return true;
    }

    const selName = (selectedWorkspace.name || '').toLowerCase();
    const selId = String(selectedWorkspace.id || selectedWorkspace._id || '');
    const projWs = (p.workspace || '').toLowerCase();
    const projWsId = String(p.workspaceId || p.workspace || '');

    // 1. Direct ID match
    if (selId && projWsId && selId === projWsId) {
      return true;
    }
    // 2. Direct Name match
    if (selName && projWs && projWs === selName) {
      return true;
    }
    // 3. Fallback for mock projects without explicit workspace property when main workspace selected
    if (
      (!p.workspace || p.workspace === 'Pulse Dev Core') &&
      (selName === 'pulse dev core' || !selectedWorkspace.name)
    ) {
      return true;
    }

    return false;
  });

  const counts = statusCounts(workspaceFilteredProjects);

  const filtered = workspaceFilteredProjects.filter((p) => {
    const matchFilter = activeFilter === 'All' || p.status === activeFilter;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleSaveProject = (newProject) => {
    const normalized = normalizeProject(newProject);
    setProjectList((prev) => [
      normalized,
      ...prev.filter((p) => p.id !== normalized.id && p._id !== normalized._id),
    ]);
    setActiveFilter('All');
    setSearch('');
    setIsModalOpen(false);
    triggerToast(`Project "${newProject.name}" created successfully!`);
    if (location.search.includes('new=true') || location.state?.openNewModal) {
      navigate('/dashboard/projects', { replace: true, state: {} });
    }
  };

  return (
    <MainLayout>
      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold toast-enter"
          style={{
            background: 'linear-gradient(135deg,#0f0e1a,#1e1b4b)',
            border: '1px solid rgba(99,102,241,0.3)',
          }}
        >
          <svg
            className="h-4 w-4 text-emerald-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="relative z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          {/* Workspace Selector Dropdown */}
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

            {/* Dropdown Menu */}
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
                  {/* Option for All Workspaces */}
                  <button
                    onClick={() => {
                      setSelectedWorkspace({
                        id: 'all',
                        name: 'All Workspaces',
                        logo: '🌐',
                      });
                      setIsWsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      selectedWorkspace.id === 'all'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-7 w-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs">
                        🌐
                      </span>
                      <div className="text-left">
                        <div className="font-bold text-slate-800">
                          All Workspaces
                        </div>
                        <div className="text-[10px] text-slate-400">
                          View projects from all spaces
                        </div>
                      </div>
                    </div>
                    {selectedWorkspace.id === 'all' && (
                      <svg
                        className="h-4 w-4 text-indigo-600 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  {workspaces.map((ws) => {
                    const isSelected =
                      (selectedWorkspace.id || selectedWorkspace._id) ===
                        (ws.id || ws._id) || selectedWorkspace.name === ws.name;
                    return (
                      <button
                        key={ws.id || ws._id || ws.name}
                        onClick={() => {
                          setSelectedWorkspace(ws);
                          setIsWsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="h-7 w-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                            {ws.logo || '⚡'}
                          </span>
                          <div className="text-left">
                            <div className="font-bold text-slate-800">
                              {ws.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {ws.projectsCount
                                ? `${ws.projectsCount} projects`
                                : 'Workspace'}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <svg
                            className="h-4 w-4 text-indigo-600 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Projects
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing projects in{' '}
            <span className="font-semibold text-slate-700">
              {selectedWorkspace?.name || 'Pulse Dev Core'}
            </span>{' '}
            · {counts['In Progress']} active · {counts.Review} in review ·{' '}
            {counts.Completed} completed
          </p>
        </div>

        <button
          id="projects-new-btn"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition cursor-pointer hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-px"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
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
          New Project
        </button>
      </div>

      {/* Search + Filters */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-in-up mt-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
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
              id={`filter-${f.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === f
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeFilter === f
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-200 text-slate-500'
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
          <h3 className="text-sm font-bold text-slate-700">
            No projects found
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search or selecting a different workspace
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 stagger mt-6">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Summary Bar */}
      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 animate-fade-in-up mt-6">
        {[
          { label: 'Total Projects', value: workspaceFilteredProjects.length },
          {
            label: 'Total Tasks',
            value: workspaceFilteredProjects.reduce(
              (a, p) => a + p.tasksTotal,
              0,
            ),
          },
          {
            label: 'Completed Tasks',
            value: workspaceFilteredProjects.reduce(
              (a, p) => a + p.tasksCompleted,
              0,
            ),
          },
          {
            label: 'Avg. Progress',
            value: `${Math.round(workspaceFilteredProjects.reduce((a, p) => a + p.progress, 0) / (workspaceFilteredProjects.length || 1))}%`,
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col">
            <span className="text-xl font-extrabold text-slate-800">
              {value}
            </span>
            <span className="text-xs text-slate-400 font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Create New Project Modal Form */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        defaultWorkspace={selectedWorkspace?.name || 'Pulse Dev Core'}
        workspaceList={workspaces.map((w) => w.name)}
      />
    </MainLayout>
  );
}
