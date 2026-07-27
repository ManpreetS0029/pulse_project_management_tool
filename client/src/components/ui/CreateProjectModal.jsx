import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { apiPrivate } from '../../api/axios';

const WORKSPACES = [
  'Pulse Dev Core',
  'Acme Product Suite',
  'Design System Studio',
  'Marketing & Growth',
  'Operations',
];

const STATUS_OPTIONS = [
  { id: 'In Progress', label: 'In Progress' },
  { id: 'Planning', label: 'Planning' },
  { id: 'Review', label: 'Review' },
  { id: 'Completed', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
  { id: 'Low', label: 'Low', color: '#22c55e' },
  { id: 'Medium', label: 'Medium', color: '#eab308' },
  { id: 'High', label: 'High', color: '#f97316' },
  { id: 'Critical', label: 'Critical', color: '#ef4444' },
];

const DEFAULT_ASSIGNEES = [
  { initials: 'SJ', bg: 'bg-blue-100 text-blue-700', name: 'Sarah Jenkins' },
  {
    initials: 'MA',
    bg: 'bg-purple-100 text-purple-700',
    name: 'Marcus Aurelius',
  },
  { initials: 'ER', bg: 'bg-amber-100 text-amber-700', name: 'Elena Rostova' },
  { initials: 'KS', bg: 'bg-rose-100 text-rose-700', name: 'Kenji Sato' },
  {
    initials: 'DM',
    bg: 'bg-emerald-100 text-emerald-700',
    name: 'David Miller',
  },
];

const getDefaultDueDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSave,
  defaultWorkspace = 'Pulse Dev Core',
  workspaceList = WORKSPACES,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      workspace: defaultWorkspace,
      description: '',
      status: 'In Progress',
      priority: 'Medium',
      dueDate: getDefaultDueDate(),
    },
  });

  const currentStatus = watch('status');
  const currentPriority = watch('priority');

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        workspace: defaultWorkspace,
        description: '',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: getDefaultDueDate(),
      });
    }
  }, [isOpen, defaultWorkspace, reset]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    const newProject = {
      id: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name.trim(),
      workspace: data.workspace,
      description: data.description.trim() || 'No description provided.',
      status: data.status,
      priority: data.priority,
      progress: 0,
      dueDate: data.dueDate,
      tasksTotal: 0,
      tasksCompleted: 0,
    };

    try {
      const res = await apiPrivate.post('/project/create', newProject);
      const returnedData = res.data?.data || res.data;
      const createdProject = {
        id: returnedData._id || returnedData.id || newProject.id,
        name: returnedData.name || newProject.name,
        workspace: returnedData.workspaceName || data.workspace,
        description: returnedData.description || newProject.description,
        status: returnedData.status || newProject.status,
        priority: returnedData.priority || newProject.priority,
        progress: returnedData.progress ?? 0,
        dueDate: returnedData.dueDate || newProject.dueDate,
        tasksTotal: returnedData.tasksTotal ?? 0,
        tasksCompleted: returnedData.tasksCompleted ?? 0,
      };
      onSave(createdProject);
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
              <svg
                className="h-5 w-5"
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
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Create New Project
              </h2>
              <p className="text-xs text-slate-500">
                Fill details to add a project into workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Project Name & Workspace */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('name', { required: 'Project name is required' })}
                placeholder="e.g., Website Overhaul v2"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                  errors.name
                    ? 'border-rose-400 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
              {errors.name && (
                <p className="text-[11px] font-semibold text-rose-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Workspace
              </label>
              <select
                {...register('workspace')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
              >
                {(Array.isArray(workspaceList) && workspaceList.length > 0
                  ? workspaceList
                  : WORKSPACES
                ).map((w) => {
                  const name = typeof w === 'string' ? w : w.name || w;
                  return (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              {...register('description')}
              placeholder="Outline project goal, deliverables, or scope..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* Status & Priority Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Initial Status
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {STATUS_OPTIONS.map((st) => (
                  <button
                    type="button"
                    key={st.id}
                    onClick={() => setValue('status', st.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-center transition cursor-pointer ${
                      currentStatus === st.id
                        ? 'border-indigo-500 bg-indigo-50/80 text-indigo-700 font-bold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRIORITY_OPTIONS.map((pr) => (
                  <button
                    type="button"
                    key={pr.id}
                    onClick={() => setValue('priority', pr.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      currentPriority === pr.id
                        ? 'border-slate-800 bg-slate-900 text-white shadow-sm font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: pr.color }}
                    />
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Due Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition cursor-pointer hover:-translate-y-px"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
