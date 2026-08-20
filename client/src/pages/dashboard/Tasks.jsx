import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Zap, Folder, Globe, X, Plus } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import CreateTaskModal from '../../components/ui/CreateTaskModal';
import { apiPrivate } from '../../api/axios';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from '../../components/ui/KanbanColumn';
import TaskCard from '../../components/ui/TaskCard';

const COLUMNS = [
  {
    id: 'todo',
    label: 'To Do',
    color: '#94a3b8',
    bg: 'bg-slate-100',
    dot: 'bg-slate-400',
    border: 'border-slate-200',
    headerBg: 'bg-slate-50',
  },
  {
    id: 'inProgress',
    label: 'In Progress',
    color: '#6366f1',
    bg: 'bg-indigo-50',
    dot: 'bg-indigo-500',
    border: 'border-indigo-100',
    headerBg: 'bg-indigo-50/60',
  },
  {
    id: 'inReview',
    label: 'In Review',
    color: '#f59e0b',
    bg: 'bg-amber-50',
    dot: 'bg-amber-500',
    border: 'border-amber-100',
    headerBg: 'bg-amber-50/60',
  },
  {
    id: 'done',
    label: 'Done',
    color: '#10b981',
    bg: 'bg-emerald-50',
    dot: 'bg-emerald-500',
    border: 'border-emerald-100',
    headerBg: 'bg-emerald-50/60',
  },
];

const EMPTY_BOARD = {
  todo: [],
  inProgress: [],
  inReview: [],
  done: [],
};

const DEFAULT_WORKSPACES = [
  {
    id: 'all',
    _id: 'all',
    name: 'All Workspaces',
    logo: '',
    color: 'from-indigo-600 to-purple-600',
  },
];

export default function Tasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectParam = searchParams.get('project') || '';
  const projectIdParam = searchParams.get('projectId') || '';

  const [board, setBoard] = useState(EMPTY_BOARD);
  const [toast, setToast] = useState('');
  const [view, setView] = useState('kanban');

  const dropdownRef = useRef(null);
  const projDropdownRef = useRef(null);
  const [workspaces, setWorkspaces] = useState(DEFAULT_WORKSPACES);
  const [selectedWorkspace, setSelectedWorkspace] = useState(
    DEFAULT_WORKSPACES[0],
  );
  const [isWsDropdownOpen, setIsWsDropdownOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState(projectParam || 'all');
  const [projectOptions, setProjectOptions] = useState([]);
  const [isProjDropdownOpen, setIsProjDropdownOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('todo');
  const [editingTask, setEditingTask] = useState(null);

  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findContainer = (id, currentBoard) => {
    if (!id || !currentBoard) return null;
    if (id in currentBoard) return id;
    return Object.keys(currentBoard).find((key) =>
      (currentBoard[key] || []).some(
        (task) =>
          String(task.id) === String(id) || String(task._id) === String(id),
      ),
    );
  };

  const initialContainerRef = useRef(null);

  const handleDragStart = (event) => {
    const { active } = event;
    const activeId = active.id;
    const container = findContainer(activeId, board);
    initialContainerRef.current = container;
    if (container) {
      const task = (board[container] || []).find(
        (t) =>
          String(t.id) === String(activeId) ||
          String(t._id) === String(activeId),
      );
      setActiveTask(task || null);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = findContainer(activeId, board);
    const overContainer = findContainer(overId, board);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setBoard((prev) => {
      const activeItems = prev[activeContainer] || [];
      const overItems = prev[overContainer] || [];

      const activeIndex = activeItems.findIndex(
        (i) =>
          String(i.id) === String(activeId) ||
          String(i._id) === String(activeId),
      );
      if (activeIndex === -1) return prev;

      const overIndex =
        overId in prev
          ? overItems.length
          : overItems.findIndex(
              (i) =>
                String(i.id) === String(overId) ||
                String(i._id) === String(overId),
            );

      const isBelowOverItem =
        over &&
        active.rect.current.translated &&
        overIndex >= 0 &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;
      const newIndex =
        overId in prev
          ? overItems.length
          : overIndex >= 0
            ? overIndex + modifier
            : overItems.length;

      const movedTask = {
        ...activeItems[activeIndex],
        status: overContainer,
      };

      return {
        ...prev,
        [activeContainer]: activeItems.filter((_, idx) => idx !== activeIndex),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          movedTask,
          ...overItems.slice(newIndex),
        ],
      };
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    const sourceContainer = initialContainerRef.current;
    initialContainerRef.current = null;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const currentContainer = findContainer(activeId, board);
    const overContainer = findContainer(overId, board);

    console.log('Drop End Event:', {
      taskId: activeId,
      sourceColumn: sourceContainer,
      destinationColumn: currentContainer || overContainer,
    });

    if (!currentContainer) return;

    const activeIndex = (board[currentContainer] || []).findIndex(
      (i) =>
        String(i.id) === String(activeId) || String(i._id) === String(activeId),
    );
    const overIndex =
      overId in board
        ? (board[currentContainer] || []).length - 1
        : (board[currentContainer] || []).findIndex(
            (i) =>
              String(i.id) === String(overId) ||
              String(i._id) === String(overId),
          );

    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      setBoard((prev) => ({
        ...prev,
        [currentContainer]: arrayMove(
          prev[currentContainer],
          activeIndex,
          overIndex,
        ),
      }));
    }

    if (
      sourceContainer &&
      currentContainer &&
      sourceContainer !== currentContainer
    ) {
      try {
        await apiPrivate.put(`/task/${activeId}`, {
          status: currentContainer,
        });
      } catch (err) {
        console.error('Failed to persist task status update:', err);
      }
    }
  };

  useEffect(() => {
    if (projectParam) {
      setSelectedProject(projectParam);
    } else {
      setSelectedProject('all');
    }
  }, [projectParam]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiPrivate.get('/project');
        const raw = response.data?.data || response.data;
        if (Array.isArray(raw)) {
          const list = raw.map((p) => ({
            id: p._id || p.id,
            name: p.name || 'Untitled Project',
          }));
          setProjectOptions(list);
        }
      } catch (err) {
        console.error(
          'Failed to fetch projects list for filter in Tasks:',
          err,
        );
      }
    };
    fetchProjects();
  }, []);

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
              logo: wsObj.logo || '',
              color: wsObj.color || 'from-indigo-600 to-purple-600',
            };
          });
          const allOption = {
            id: 'all',
            _id: 'all',
            name: 'All Workspaces',
            logo: '',
          };
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
        const params =
          targetWsId && targetWsId !== 'all' ? { workspaceId: targetWsId } : {};

        let response;

        if (selectedProject && selectedProject !== 'all') {
          response = await apiPrivate.get(`/task/${selectedProject}`);
          console.log('Tasks response:', response);
        } else {
          response = await apiPrivate.get('/task', { params });
          console.log('Tasks response:', response);
        }

        const rawTasks =
          response?.data?.data !== undefined
            ? response.data.data
            : response?.data !== undefined
              ? response.data
              : response;

        if (Array.isArray(rawTasks)) {
          const categorizedBoard = {
            todo: [],
            inProgress: [],
            inReview: [],
            done: [],
          };

          rawTasks.forEach((t) => {
            const rawStatus = t.status || 'todo';
            let statusKey = 'todo';
            const s = String(rawStatus).toLowerCase().replace(/[-_ ]/g, '');
            if (s === 'inprogress') statusKey = 'inProgress';
            else if (s === 'inreview') statusKey = 'inReview';
            else if (s === 'done' || s === 'completed') statusKey = 'done';
            else if (['todo', 'inProgress', 'inReview', 'done'].includes(rawStatus)) statusKey = rawStatus;

            const normalized = {
              id: t._id || t.id,
              _id: t._id || t.id,
              title: t.title,
              project:
                t.projectName ||
                (t.project && t.project.name) ||
                (typeof t.project === 'string' ? t.project : ''),
              projectId:
                (t.project && (t.project._id || t.project.id)) ||
                (typeof t.project === 'string' ? t.project : ''),
              projectColor: (t.project && t.project.color) || '#6366f1',
              workspace:
                t.workspaceName || (t.workspace && t.workspace.name) || '',
              workspaceId:
                (t.workspace && (t.workspace._id || t.workspace.id)) ||
                t.workspace,
              status: statusKey,
              priority: t.priority || 'Medium',
              assignees:
                Array.isArray(t.assignees) && t.assignees.length > 0
                  ? t.assignees
                  : [
                      {
                        name:
                          t.assigneeName ||
                          (t.assignee
                            ? `${t.assignee.firstName || ''} ${t.assignee.lastName || ''}`.trim()
                            : 'Unassigned'),
                        initials:
                          t.assigneeInitials ||
                          (t.assigneeName
                            ? t.assigneeName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()
                            : 'UA'),
                        bg: 'bg-indigo-100 text-indigo-700',
                      },
                    ],
              assignee: {
                name:
                  t.assigneeName ||
                  (t.assignee
                    ? `${t.assignee.firstName || ''} ${t.assignee.lastName || ''}`.trim()
                    : 'Unassigned'),
                initials:
                  t.assigneeInitials ||
                  (t.assigneeName
                    ? t.assigneeName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'UA'),
                bg: 'bg-indigo-100 text-indigo-700',
              },
              dueDate: t.dueDate
                ? new Date(t.dueDate).toISOString().split('T')[0]
                : null,
              tags: t.tags || [],
              notes: t.description || t.notes || '',
              subtasks: t.subtasks || [],
              files: t.attachments || t.files || [],
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

          setBoard(categorizedBoard);
        }
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };

    fetchTasks();
  }, [selectedWorkspace, selectedProject]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsWsDropdownOpen(false);
      }
      if (
        projDropdownRef.current &&
        !projDropdownRef.current.contains(e.target)
      ) {
        setIsProjDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProject = (projName, projId = '') => {
    setSelectedProject(projName);
    setIsProjDropdownOpen(false);
    const newParams = new URLSearchParams(searchParams);
    if (projName === 'all' || !projName) {
      newParams.delete('project');
      newParams.delete('projectId');
    } else {
      newParams.set('project', projName);
      if (projId) {
        newParams.set('projectId', projId);
      } else {
        newParams.delete('projectId');
      }
    }
    setSearchParams(newParams);
  };

  const displayBoard = useMemo(() => {
    let currentBoard = board;

    if (
      selectedWorkspace &&
      selectedWorkspace.id !== 'all' &&
      selectedWorkspace.name !== 'All Workspaces'
    ) {
      const selId = String(selectedWorkspace.id || selectedWorkspace._id || '');
      const selName = (selectedWorkspace.name || '').toLowerCase();

      const filtered = {};
      Object.keys(currentBoard).forEach((colKey) => {
        filtered[colKey] = (currentBoard[colKey] || []).filter((task) => {
          if (!task.workspaceId && !task.workspace) return true;
          const taskWsId = String(task.workspaceId || task.workspace || '');
          const taskWsName = (
            task.workspaceName ||
            task.workspace ||
            ''
          ).toLowerCase();
          return (
            (selId && taskWsId === selId) || (selName && taskWsName === selName)
          );
        });
      });
      currentBoard = filtered;
    }

    if (selectedProject && selectedProject !== 'all') {
      const selProjNameLower = selectedProject.toLowerCase();
      const filtered = {};
      Object.keys(currentBoard).forEach((colKey) => {
        filtered[colKey] = (currentBoard[colKey] || []).filter((task) => {
          const taskProjName = (task.project || '').toLowerCase();
          const taskProjId = String(task.projectId || task.project?._id || '');
          if (projectIdParam && taskProjId) {
            return (
              taskProjId === projectIdParam || taskProjName === selProjNameLower
            );
          }
          return taskProjName === selProjNameLower;
        });
      });
      currentBoard = filtered;
    }

    return currentBoard;
  }, [board, selectedWorkspace, selectedProject, projectIdParam]);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleOpenNewTaskModal = (statusId = 'todo') => {
    setEditingTask(null);
    setTargetStatus(statusId);
    setIsModalOpen(true);
  };

  const handleOpenEditTaskModal = (task) => {
    setEditingTask(task);
    setTargetStatus(task.status || 'todo');
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData) => {
    setBoard((prev) => {
      const newBoard = { ...prev };
      const statusKey = taskData.status || 'todo';

      if (editingTask) {
        Object.keys(newBoard).forEach((colKey) => {
          newBoard[colKey] = newBoard[colKey].filter(
            (t) => t.id !== taskData.id,
          );
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
        : `New task "${taskData.title}" added!`,
    );
  };

  const totalTasks = Object.values(displayBoard).flat().length;
  const doneTasks = (displayBoard.done || []).length;

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

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveTask={handleSaveTask}
        initialStatus={targetStatus}
        initialProject={selectedProject !== 'all' ? selectedProject : ''}
        existingTask={editingTask}
        selectedWorkspace={selectedWorkspace}
        workspaces={workspaces}
      />

      <div className="relative z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2 z-40">
            {/* Workspace Dropdown */}
            <div className="relative inline-block z-40" ref={dropdownRef}>
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
                          selectedWorkspace?.id === ws.id ||
                          selectedWorkspace?._id === ws._id
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
                          <span>{ws.name}</span>
                        </div>
                        {(selectedWorkspace?.id === ws.id ||
                          selectedWorkspace?._id === ws._id) && (
                          <span className="h-2 w-2 rounded-full bg-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative inline-block z-40" ref={projDropdownRef}>
              <button
                onClick={() => setIsProjDropdownOpen(!isProjDropdownOpen)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs transition-all cursor-pointer group ${
                  selectedProject !== 'all'
                    ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 hover:bg-indigo-100/80'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/30'
                }`}
              >
                <span className="h-5 w-5 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                  <Folder className="h-3.5 w-3.5" />
                </span>
                <span className="text-slate-400 font-normal">Project:</span>
                <span className="font-extrabold text-indigo-950 group-hover:text-indigo-600 transition-colors">
                  {selectedProject === 'all' ? 'All Projects' : selectedProject}
                </span>
                {selectedProject !== 'all' && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectProject('all');
                    }}
                    className="ml-1 h-4 w-4 rounded-full bg-white hover:bg-rose-100 hover:text-rose-600 text-slate-400 flex items-center justify-center transition shadow-xs cursor-pointer"
                    title="Clear project filter"
                  >
                    <X className="h-2.5 w-2.5" />
                  </span>
                )}
                <svg
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                    isProjDropdownOpen ? 'rotate-180 text-indigo-600' : ''
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

              {isProjDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-scale-up">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Filter by Project
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                      {projectOptions.length} Projects
                    </span>
                  </div>
                  <div className="py-1 space-y-1 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => handleSelectProject('all')}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedProject === 'all'
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          <Globe className="h-3.5 w-3.5" />
                        </span>
                        <span>All Projects</span>
                      </div>
                      {selectedProject === 'all' && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                      )}
                    </button>
                    {projectOptions.map((p) => (
                      <button
                        key={p.id || p.name}
                        onClick={() => handleSelectProject(p.name, p.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedProject === p.name
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="h-6 w-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Folder className="h-3.5 w-3.5" />
                          </span>
                          <span className="truncate max-w-[170px] text-left">
                            {p.name}
                          </span>
                        </div>
                        {selectedProject === p.name && (
                          <span className="h-2 w-2 rounded-full bg-indigo-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
            Project Tasks
            {selectedProject !== 'all' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                <span>Project:</span>
                <span className="text-indigo-900">{selectedProject}</span>
                <button
                  onClick={() => handleSelectProject('all')}
                  className="ml-1 hover:text-rose-600 transition flex items-center"
                  title="Clear project filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {doneTasks} of {totalTasks} tasks completed
            {selectedProject !== 'all' ? ` in ${selectedProject}` : ''} ·{' '}
            <span className="font-semibold text-indigo-600">
              {(displayBoard.inProgress || []).length} in progress
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              id="view-kanban"
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${view === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Kanban view"
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
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
            </button>
            <button
              id="view-list"
              onClick={() => setView('list')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${view === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="List view"
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
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          <button
            id="tasks-new-btn"
            onClick={() => handleOpenNewTaskModal('todo')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition cursor-pointer hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-px"
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
            Add Task to Project
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm animate-fade-in-up">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">
            Sprint Progress
          </span>
          <span className="text-xs font-bold text-slate-700">
            {totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%
            complete
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full progress-bar"
            style={{
              width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%`,
              background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
              '--progress-width': `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="flex items-center gap-6 mt-3">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex items-center gap-1.5 text-xs">
              <span className={`h-2 w-2 rounded-full ${col.dot}`} />
              <span className="text-slate-500">{col.label}</span>
              <span className="font-bold text-slate-700">
                {(displayBoard[col.id] || []).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {view === 'kanban' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start animate-fade-in">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                col={col}
                tasks={displayBoard[col.id] || []}
                onEditTask={handleOpenEditTaskModal}
                onAddTask={handleOpenNewTaskModal}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <div className="rotate-2 scale-105 shadow-2xl transition-transform cursor-grabbing opacity-95 pointer-events-none">
                <TaskCard task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="space-y-2 animate-fade-in">
          {COLUMNS.map((col) =>
            (displayBoard[col.id] || []).map((task) => (
              <div
                key={task.id}
                onClick={() => handleOpenEditTaskModal(task)}
                className="bg-white border border-slate-100 rounded-xl px-5 py-3.5 shadow-xs flex items-center gap-4 hover:shadow-sm hover:border-indigo-100 transition cursor-pointer group"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${col.dot} flex-shrink-0`}
                />
                <span className="flex-1 text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition">
                  {task.title}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {col.label}
                </span>
                <span className="text-xs text-slate-400 hidden sm:block">
                  {task.project}
                </span>
                {(() => {
                  const list =
                    Array.isArray(task.assignees) && task.assignees.length > 0
                      ? task.assignees
                      : task.assignee
                        ? [task.assignee]
                        : [];
                  return (
                    <div className="flex items-center -space-x-1.5 overflow-hidden flex-shrink-0">
                      {list.slice(0, 3).map((a, idx) => (
                        <div
                          key={a.id || a.name || idx}
                          title={a.name || 'Assignee'}
                          className={`h-6 w-6 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                            a.bg || 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {a.initials || '??'}
                        </div>
                      ))}
                      {list.length > 3 && (
                        <div className="h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                          +{list.length - 3}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )),
          )}
        </div>
      )}
    </MainLayout>
  );
}
