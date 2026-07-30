import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { apiPrivate } from '../../api/axios';
import RichTextEditor from './RichTextEditor';

const normalizeProject = (p) => ({
  id: p._id || p.id || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
  _id: p._id || p.id,
  name: p.name || 'Untitled Project',
  color: p.color || '#6366f1',
});

const STATUS_OPTIONS = [
  {
    id: 'todo',
    label: 'To Do',
    dotColor: 'bg-slate-400',
    badgeBg: 'bg-slate-100 text-slate-700',
  },
  {
    id: 'inProgress',
    label: 'In Progress',
    dotColor: 'bg-indigo-500',
    badgeBg: 'bg-indigo-50 text-indigo-700',
  },
  {
    id: 'inReview',
    label: 'In Review',
    dotColor: 'bg-amber-500',
    badgeBg: 'bg-amber-50 text-amber-700',
  },
  {
    id: 'done',
    label: 'Done',
    dotColor: 'bg-emerald-500',
    badgeBg: 'bg-emerald-50 text-emerald-700',
  },
];

const PRIORITY_OPTIONS = [
  {
    id: 'Low',
    label: 'Low',
    color: '#22c55e',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'Medium',
    label: 'Medium',
    color: '#eab308',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'High',
    label: 'High',
    color: '#f97316',
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    id: 'Critical',
    label: 'Critical',
    color: '#ef4444',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
  },
];

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSaveTask,
  initialProject = null,
  initialStatus = 'todo',
  existingTask = null,
  selectedWorkspace = null,
  workspaces = [],
}) {
  const fileInputRef = useRef(null);
  const commentInputRef = useRef(null);

  const [workspaceList, setWorkspaceList] = useState(workspaces);
  const [currentWorkspace, setCurrentWorkspace] = useState(selectedWorkspace);
  const [assigneesList, setAssigneesList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignee, setAssignee] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      project: '',
      status: initialStatus,
      priority: 'High',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    },
  });

  const watchProject = watch('project');
  const watchStatus = watch('status');
  const watchPriority = watch('priority');
  const watchDueDate = watch('dueDate');

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);

  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    if (!isOpen) return;

    if (workspaces && workspaces.length > 0) {
      const validSpaces = workspaces.filter(
        (w) => w.id !== 'all' && w._id !== 'all',
      );
      const activeSpaces = validSpaces.length > 0 ? validSpaces : workspaces;
      setWorkspaceList(activeSpaces);

      const preselectedWs =
        selectedWorkspace &&
        selectedWorkspace.id !== 'all' &&
        selectedWorkspace._id !== 'all'
          ? selectedWorkspace
          : activeSpaces[0];

      if (preselectedWs) {
        setCurrentWorkspace(preselectedWs);
      }
    } else {
      const fetchWorkspaces = async () => {
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
              };
            });
            setWorkspaceList(normalized);
            setCurrentWorkspace(normalized[0]);
          }
        } catch (err) {
          console.error('Failed to fetch workspaces in modal:', err);
        }
      };
      fetchWorkspaces();
    }
  }, [isOpen, workspaces, selectedWorkspace]);

  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      if (!isOpen || !currentWorkspace) return;

      const targetWsId = currentWorkspace?.id || currentWorkspace?._id;
      const targetWsName = currentWorkspace?.name;
      try {
        const response = await apiPrivate.get('/project');
        const rawProjects = response.data?.data || response.data;
        if (Array.isArray(rawProjects)) {
          let normalizedFetched = rawProjects.map(normalizeProject);
          if (targetWsId && targetWsId !== 'all') {
            const filteredByWs = normalizedFetched.filter((p) => {
              const projWsId = String(p.workspaceId || p.workspace || '');
              const projWsName = (p.workspace || '').toLowerCase();
              return (
                projWsId === String(targetWsId) ||
                (targetWsName && projWsName === targetWsName.toLowerCase())
              );
            });
            if (filteredByWs.length > 0) {
              normalizedFetched = filteredByWs;
            }
          }
          setProjects(normalizedFetched);
          if (normalizedFetched.length > 0) {
            const currentProjVal = watchProject;
            if (
              !currentProjVal ||
              !normalizedFetched.some((p) => p.name === currentProjVal)
            ) {
              setValue('project', normalizedFetched[0].name);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch backend projects:', err);
      }

      if (targetWsId && targetWsId !== 'all') {
        try {
          const response = await apiPrivate.get(
            `/workspaces/${targetWsId}/members`,
          );
          const rawMembers =
            response.data?.data || response.data?.members || response.data;
          if (Array.isArray(rawMembers) && rawMembers.length > 0) {
            const normalizedMembers = rawMembers.map((m) => {
              const userObj = m.user || m;
              const name =
                [userObj.firstName, userObj.lastName]
                  .filter(Boolean)
                  .join(' ') ||
                userObj.name ||
                userObj.username ||
                userObj.email ||
                'Workspace Member';
              const initials =
                name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase() || 'WM';
              return {
                id: userObj._id || userObj.id || m._id || m.id,
                initials,
                bg: 'bg-indigo-100 text-indigo-700',
                name,
                role: m.role || userObj.role || 'Member',
              };
            });
            setAssigneesList(normalizedMembers);
            if (normalizedMembers.length > 0) {
              setAssignee((prev) =>
                normalizedMembers.some((a) => a.name === prev.name)
                  ? prev
                  : normalizedMembers[0],
              );
            }
          }
        } catch (err) {
          console.error('Failed to fetch workspace members:', err);
        }
      }
    };

    fetchWorkspaceDetails();
  }, [isOpen, currentWorkspace]);

  useEffect(() => {
    if (isOpen) {
      if (existingTask) {
        reset({
          title: existingTask.title || '',
          project: existingTask.project || projects[0]?.name || '',
          status: existingTask.status || initialStatus,
          priority: existingTask.priority || 'Medium',
          dueDate:
            existingTask.dueDate ||
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
        });
        if (existingTask.assignee) setAssignee(existingTask.assignee);
        if (existingTask.tags) setTags(existingTask.tags);
        if (existingTask.notes) setNotes(existingTask.notes);
        if (existingTask.files) setFiles(existingTask.files);
        if (existingTask.comments) setComments(existingTask.comments);
        if (existingTask.subtasks) setSubtasks(existingTask.subtasks);
      } else {
        reset({
          title: '',
          project: projects[0]?.name || '',
          status: initialStatus,
          priority: 'High',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        });
        setAssignee(assigneesList[0] || null);
        setTags([]);
        setFiles([]);
        setComments([]);
        setSubtasks([]);
        setNotes('');
      }
    }
  }, [isOpen, existingTask, initialProject, initialStatus, projects, reset]);

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

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const toggleSubtask = (id) => {
    setSubtasks(
      subtasks.map((st) =>
        st.id === id ? { ...st, completed: !st.completed } : st,
      ),
    );
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSt = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSt]);
    setNewSubtaskTitle('');
    triggerToast('Subtask added!');
  };

  const handleDeleteSubtask = (id) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files || []);
    processUploadedFiles(uploadedFiles);
  };

  const processUploadedFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const newFileItems = fileList.map((file, idx) => {
      const isImg = file.type.startsWith('image/');
      const objectUrl = isImg ? URL.createObjectURL(file) : null;
      return {
        id: `file-${Date.now()}-${idx}`,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type || 'application/octet-stream',
        url: objectUrl,
        uploadedAt: 'Just now',
        uploader: assignee.name,
      };
    });

    setFiles((prev) => [...newFileItems, ...prev]);
    triggerToast(`${fileList.length} file(s) attached successfully!`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveFile = (fileId) => {
    setFiles(files.filter((f) => f.id !== fileId));
    triggerToast('File removed');
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newCommentObj = {
      id: `c-${Date.now()}`,
      user: {
        name: 'You (Manpreet)',
        initials: 'MS',
        bg: 'bg-indigo-600 text-white',
        role: 'Project Manager',
      },
      time: 'Just now',
      text: newCommentText.trim(),
      likes: 0,
      isLiked: false,
      attachments: [],
    };

    setComments([newCommentObj, ...comments]);
    setNewCommentText('');
    triggerToast('Comment added!');
  };

  const toggleCommentLike = (commentId) => {
    setComments(
      comments.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            isLiked: !c.isLiked,
            likes: c.isLiked ? c.likes - 1 : c.likes + 1,
          };
        }
        return c;
      }),
    );
  };

  const insertNoteFormat = (syntax) => {
    setNotes((prev) => prev + `\n${syntax}`);
  };
  const onSubmitTask = async (formData) => {
    setIsSubmitting(true);

    const selectedProjObj =
      projects.find((p) => p.name === formData.project) || projects[0];

    const payload = {
      title: formData.title.trim(),
      workspace:
        currentWorkspace?.id || currentWorkspace?._id || currentWorkspace?.name,
      workspaceName: currentWorkspace?.name,
      project: selectedProjObj?._id || selectedProjObj?.id || formData.project,
      projectName: formData.project || selectedProjObj?.name,
      description: notes,
      status: formData.status,
      priority: formData.priority,
      assignee: assignee?.id || assignee?._id,
      assigneeName: assignee?.name || '',
      assigneeInitials: assignee?.initials || '',
      dueDate: formData.dueDate,
      tags,
      subtasks,
      attachments: files,
      comments,
    };

    try {
      let savedTask;
      if (existingTask && (existingTask._id || existingTask.id)) {
        const taskId = existingTask._id || existingTask.id;
        const res = await apiPrivate.put(`/tasks/${taskId}`, payload);
        savedTask = res.data?.data || res.data;
      } else {
        const res = await apiPrivate.post('/tasks', payload);
        savedTask = res.data?.data || res.data;
      }

      const normalizedTask = {
        id:
          savedTask._id ||
          savedTask.id ||
          `TSK-${Math.floor(100 + Math.random() * 900)}`,
        _id: savedTask._id || savedTask.id,
        title: savedTask.title || formData.title.trim(),
        project: savedTask.projectName || formData.project,
        projectColor: selectedProjObj?.color,
        workspace: savedTask.workspaceName || currentWorkspace?.name,
        workspaceId:
          savedTask.workspace || currentWorkspace?.id || currentWorkspace?._id,
        status: savedTask.status || formData.status,
        priority: savedTask.priority || formData.priority,
        assignee: assignee || {
          name: savedTask.assigneeName,
          initials: savedTask.assigneeInitials,
          bg: 'bg-indigo-100 text-indigo-700',
        },
        dueDate: savedTask.dueDate
          ? new Date(savedTask.dueDate).toISOString().split('T')[0]
          : formData.dueDate,
        tags: savedTask.tags || tags,
        notes: savedTask.description || notes,
        subtasks: savedTask.subtasks || subtasks,
        files: savedTask.attachments || files,
        commentsCount: (savedTask.comments || comments).length,
        comments: savedTask.comments || comments,
        updatedAt: savedTask.updatedAt || new Date().toISOString(),
      };

      if (onSaveTask) {
        onSaveTask(normalizedTask);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save task to backend:', err);
      triggerToast('Failed to save task to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProjObj =
    projects.find((p) => p.name === watchProject) || projects[0];
  const completedSubtasksCount = subtasks.filter((st) => st.completed).length;

  return (
    <>
      {/* 100% Full Screen Backdrop Blur Overlay */}
      <div
        className="fixed inset-0 w-screen h-screen min-h-screen bg-slate-950/75 backdrop-blur-md z-[999] animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Dialog Content Centered Container */}
      <div className="fixed inset-0 z-[1000] overflow-y-auto flex items-center justify-center p-3 sm:p-4 md:p-6 pointer-events-none">
        {/* Toast message in modal */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-[1010] flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-indigo-500/30 toast-enter pointer-events-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            {toastMessage}
          </div>
        )}

        {/* Media Preview Modal */}
        {previewMedia && (
          <div className="fixed inset-0 z-[1010] flex items-center justify-center p-6 bg-black/85 backdrop-blur-lg animate-fade-in pointer-events-auto">
            <div className="relative max-w-4xl max-h-[85vh] bg-slate-900 rounded-2xl p-4 overflow-hidden flex flex-col items-center">
              <button
                onClick={() => setPreviewMedia(null)}
                className="absolute top-3 right-3 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full cursor-pointer"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <p className="text-sm font-semibold text-white mb-3">
                {previewMedia.name}
              </p>
              {previewMedia.url ? (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.name}
                  className="max-h-[70vh] object-contain rounded-lg"
                />
              ) : (
                <div className="p-12 text-center text-slate-300">
                  <p className="text-4xl mb-3">📄</p>
                  <p className="text-sm">
                    Document preview is available for downloading.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Modal Box */}
        <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] pointer-events-auto animate-fade-in">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-xs"
                style={{
                  backgroundColor: (selectedProjObj?.color || '#6366f1') + '20',
                  color: selectedProjObj?.color || '#6366f1',
                }}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {existingTask ? 'Edit Task Details' : 'Create New Task'}
                  </h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                    UI Only Demo
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add rich notes, attachments, subtasks, and discussion
                  comments.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
              title="Close modal"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Form Left Side (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Task Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title', {
                    required: 'Task title is required',
                    minLength: {
                      value: 2,
                      message: 'Title must be at least 2 characters',
                    },
                  })}
                  placeholder="e.g. Implement OAuth2 refresh token logic & UI state"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition shadow-xs ${
                    errors.title
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-rose-500 font-bold mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {errors.title.message}
                  </p>
                )}
              </div>

              {/* Quick Navigation Tabs: Notes | Checklist | File Uploads | Discussion Comments */}
              <div className="border-b border-slate-200 flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 ${
                    activeTab === 'notes'
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📝 Notes & Specs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('checklist')}
                  className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'checklist'
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ✅ Subtasks
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                    {completedSubtasksCount}/{subtasks.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('files')}
                  className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'files'
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📎 Files & Attachments
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                    {files.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('comments')}
                  className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'comments'
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  💬 Comments
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-extrabold">
                    {comments.length}
                  </span>
                </button>
              </div>

              {/* TAB 1: Notes & Specs (WYSIWYG Rich Text Description Editor) */}
              {activeTab === 'notes' && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Task Description & Specifications
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-600">
                      WYSIWYG Rich Text Editor
                    </span>
                  </div>

                  <RichTextEditor
                    value={notes}
                    onChange={(html) => setNotes(html)}
                    placeholder="Write detailed task specifications, requirements, or formatted implementation notes..."
                    minHeight="240px"
                  />
                </div>
              )}

              {/* TAB 2: Subtasks / Checklist */}
              {activeTab === 'checklist' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Progress bar */}
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Subtask Completion</span>
                      <span>
                        {subtasks.length > 0
                          ? Math.round(
                              (completedSubtasksCount / subtasks.length) * 100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                        style={{
                          width: `${subtasks.length > 0 ? (completedSubtasksCount / subtasks.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* List of subtasks */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {subtasks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-4">
                        No subtasks added yet.
                      </p>
                    ) : (
                      subtasks.map((st) => (
                        <div
                          key={st.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition ${
                            st.completed
                              ? 'bg-slate-50/60 border-slate-100 text-slate-400 line-through'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200'
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={st.completed}
                              onChange={() => toggleSubtask(st.id)}
                              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span className="text-sm font-semibold">
                              {st.title}
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubtask(st.id)}
                            className="text-slate-300 hover:text-rose-500 p-1 transition cursor-pointer"
                            title="Remove subtask"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Subtask Form */}
                  <form onSubmit={handleAddSubtask} className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add a new subtask..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                    >
                      + Add
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: File Uploads & Attachments */}
              {activeTab === 'files' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-indigo-500 bg-indigo-50/70 scale-[0.99]'
                        : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                    />
                    <div className="h-12 w-12 mx-auto rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 shadow-xs">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      Drag and drop files here, or{' '}
                      <span className="text-indigo-600 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports Images, PDFs, Zip files, CSVs & Documentation (up
                      to 25MB each)
                    </p>
                  </div>

                  {/* Uploaded Files Gallery */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                      <span>Attached Files ({files.length})</span>
                      <span className="text-indigo-600">Drag to reorder</span>
                    </div>

                    {files.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-6">
                        No files uploaded yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                        {files.map((file) => (
                          <div
                            key={file.id}
                            className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 hover:shadow-md hover:border-indigo-200 transition group relative"
                          >
                            {/* File Icon / Thumbnail */}
                            {file.url ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="h-10 w-10 object-cover rounded-lg border border-slate-100 flex-shrink-0 cursor-pointer"
                                onClick={() => setPreviewMedia(file)}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                {file.name.endsWith('.pdf')
                                  ? 'PDF'
                                  : file.name.endsWith('.zip')
                                    ? 'ZIP'
                                    : 'DOC'}
                              </div>
                            )}

                            {/* File Details */}
                            <div className="flex-1 min-w-0">
                              <p
                                onClick={() => setPreviewMedia(file)}
                                className="text-xs font-bold text-slate-800 truncate cursor-pointer hover:text-indigo-600"
                                title={file.name}
                              >
                                {file.name}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {file.size} · {file.uploadedAt}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setPreviewMedia(file)}
                                className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                                title="Preview file"
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
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(file.id)}
                                className="p-1 text-slate-300 hover:text-rose-500 transition cursor-pointer"
                                title="Delete file"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: Discussion & Comments */}
              {activeTab === 'comments' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Comment composer */}
                  <form
                    onSubmit={handlePostComment}
                    className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                        MS
                      </div>
                      <textarea
                        ref={commentInputRef}
                        rows={2}
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Write a comment or update... Use @ to mention team members"
                        className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-1 hover:text-indigo-600 transition cursor-pointer"
                          title="Attach File to Comment"
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
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setNewCommentText(
                              (prev) => prev + ' @Elena Rostova ',
                            )
                          }
                          className="p-1 hover:text-indigo-600 text-xs font-bold transition cursor-pointer"
                          title="Mention user"
                        >
                          @
                        </button>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                      >
                        Post Comment
                      </button>
                    </div>
                  </form>

                  {/* Comment Stream */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${c.user.bg}`}
                            >
                              {c.user.initials}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800">
                                {c.user.name}
                              </span>
                              <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                                {c.user.role}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {c.time}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-normal">
                          {c.text}
                        </p>

                        {/* Attachments inside comment */}
                        {c.attachments && c.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {c.attachments.map((att, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-semibold text-indigo-600 border border-slate-200"
                              >
                                📎 {att.name} ({att.size})
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Like & Reply action */}
                        <div className="flex items-center gap-4 pt-1 border-t border-slate-50">
                          <button
                            type="button"
                            onClick={() => toggleCommentLike(c.id)}
                            className={`flex items-center gap-1 text-[11px] font-semibold cursor-pointer transition ${
                              c.isLiked
                                ? 'text-indigo-600 font-bold'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              fill={c.isLiked ? 'currentColor' : 'none'}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2"
                              />
                            </svg>
                            {c.likes > 0 ? c.likes : ''} Like
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setNewCommentText(`@${c.user.name} `)
                            }
                            className="text-[11px] font-semibold text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metadata Right Sidebar (4 Columns) */}
            <div className="lg:col-span-4 bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-5">
              {/* Workspace Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Workspace
                </label>
                <select
                  value={currentWorkspace?.id || currentWorkspace?._id || ''}
                  onChange={(e) => {
                    const sel = workspaceList.find(
                      (w) => String(w.id || w._id) === String(e.target.value),
                    );
                    if (sel) setCurrentWorkspace(sel);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {workspaceList.map((w) => (
                    <option key={w.id || w._id} value={w.id || w._id}>
                      {w.logo || '📁'} {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Project
                </label>
                <select
                  {...register('project')}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setValue('status', st.id)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        watchStatus === st.id
                          ? `${st.badgeBg} border-indigo-300 ring-2 ring-indigo-500/20`
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${st.dotColor}`} />
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRIORITY_OPTIONS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setValue('priority', p.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        watchPriority === p.id
                          ? `${p.bg} ring-2 ring-offset-1`
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Assignee
                </label>
                <select
                  value={assignee.name}
                  onChange={(e) => {
                    const sel = assigneesList.find(
                      (a) => a.name === e.target.value,
                    );
                    if (sel) setAssignee(sel);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {assigneesList.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 mt-2 p-2 bg-white rounded-xl border border-slate-200">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${assignee.bg}`}
                  >
                    {assignee.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {assignee.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {assignee.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Due Date & Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  {...register('dueDate')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 mb-2"
                />
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        'dueDate',
                        new Date().toISOString().split('T')[0],
                      )
                    }
                    className="flex-1 py-1 px-2 rounded-lg bg-slate-200/60 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 3);
                      setValue('dueDate', d.toISOString().split('T')[0]);
                    }}
                    className="flex-1 py-1 px-2 rounded-lg bg-slate-200/60 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                  >
                    +3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setValue('dueDate', d.toISOString().split('T')[0]);
                    }}
                    className="flex-1 py-1 px-2 rounded-lg bg-slate-200/60 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                  >
                    +1 Week
                  </button>
                </div>
              </div>

              {/* Tags / Labels */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tags & Labels
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-500 transition cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag and press Enter..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-semibold hidden sm:block">
              {files.length} attachment(s) · {subtasks.length} subtask(s)
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmitTask)}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                }}
              >
                {isSubmitting
                  ? 'Saving...'
                  : existingTask
                    ? 'Save Task Changes'
                    : 'Create & Add Task'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
