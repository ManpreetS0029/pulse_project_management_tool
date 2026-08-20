import React, { useEffect, useState } from 'react';
import { Crown, Folder, AlertTriangle, Trash2 } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import ProjectCard from '../../components/ui/ProjectCard';
import CreateProjectModal from '../../components/ui/CreateProjectModal';

import { useForm } from 'react-hook-form';
import { apiPrivate } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ROLES = ['All', 'Owner', 'Admin', 'Member', 'Guest'];

const ROLE_BADGES = {
  Owner: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Admin: 'bg-purple-100 text-purple-700 border-purple-200',
  Member: 'bg-blue-100 text-blue-700 border-blue-200',
  Guest: 'bg-amber-100 text-amber-700 border-amber-200',
};

const normalizeRole = (role) => {
  if (!role) return 'Member';
  const r = String(role).trim().toUpperCase();
  if (r === 'ADMIN' || r === 'PROJECT_MANAGER') return 'Admin';
  if (r === 'OWNER') return 'Owner';
  if (r === 'GUEST') return 'Guest';
  if (r === 'MEMBER') return 'Member';
  if (['Owner', 'Admin', 'Member', 'Guest'].includes(role)) return role;
  return 'Member';
};

const normalizeProject = (p) => ({
  id: p._id || p.id || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
  _id: p._id || p.id,
  name: p.name || 'Untitled Project',
  description: p.description || '',
  workspace:
    p.workspaceName ||
    (typeof p.workspace === 'string' ? p.workspace : '') ||
    '',
  workspaceId: p.workspace?._id || p.workspace,
  status: p.status || 'In Progress',
  priority: p.priority || 'Medium',
  progress: p.progress ?? 0,
  dueDate: p.dueDate ? new Date(p.dueDate).toISOString().split('T')[0] : '',
  tasksTotal: p.tasksTotal ?? (p.tasksCount || 0),
  tasksCompleted:
    p.tasksCompleted ??
    Math.round(((p.progress || 0) / 100) * (p.tasksCount || 0)),
  color: p.color || 'indigo',
});

export default function Workspace() {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState([]);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [workspaceProjects, setWorkspaceProjects] = useState([]);

  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [isDeleteWorkspaceOpen, setIsDeleteWorkspaceOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRole, setEditRole] = useState('Member');
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleOpenEditProject = (proj) => {
    setEditingProject(proj);
    setIsProjectModalOpen(true);
  };

  const handleOpenDeleteProject = (proj) => {
    setProjectToDelete(proj);
  };

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeletingProject(true);
    const targetId = projectToDelete._id || projectToDelete.id;

    try {
      await apiPrivate.delete(`/project/${targetId}`);
      setWorkspaceProjects((prev) =>
        prev.filter(
          (p) =>
            p.id !== targetId &&
            p._id !== targetId &&
            p.id !== projectToDelete.id &&
            p._id !== projectToDelete._id,
        ),
      );
      triggerToast(`Project "${projectToDelete.name}" deleted successfully!`);
    } catch (err) {
      console.error('Failed to delete project:', err);
      setWorkspaceProjects((prev) =>
        prev.filter(
          (p) =>
            p.id !== targetId &&
            p._id !== targetId &&
            p.id !== projectToDelete.id &&
            p._id !== projectToDelete._id,
        ),
      );
      triggerToast(`Project "${projectToDelete.name}" deleted`);
    } finally {
      setIsDeletingProject(false);
      setProjectToDelete(null);
    }
  };

  const handleSaveProject = (savedProj, isEdit) => {
    const normalized = normalizeProject(savedProj);
    if (isEdit || editingProject) {
      setWorkspaceProjects((prev) =>
        prev.map((p) =>
          p.id === normalized.id || (normalized._id && p._id === normalized._id)
            ? { ...p, ...normalized }
            : p,
        ),
      );
      triggerToast(`Project "${savedProj.name}" updated successfully!`);
    }
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const { auth } = useAuth();

  useEffect(() => {
    const getWorkspaceData = async () => {
      if (!auth?.token) return;
      try {
        const response = await apiPrivate.get('/workspaces/my-workspaces');
        const rawData = response.data?.data || response.data;
        if (Array.isArray(rawData) && rawData.length > 0) {
          const normalized = rawData.map((item) => {
            const wsObj = item.workspace || item;
            const ownerObj =
              typeof wsObj.owner === 'object' ? wsObj.owner : null;
            const ownerName = ownerObj
              ? `${ownerObj.firstName || ''} ${ownerObj.lastName || ''}`.trim() ||
                ownerObj.username ||
                ''
              : typeof wsObj.owner === 'string'
                ? wsObj.owner
                : '';
            const ownerId = ownerObj
              ? ownerObj._id
              : typeof wsObj.owner === 'string'
                ? wsObj.owner
                : null;

            return {
              id: wsObj._id || wsObj.id,
              _id: wsObj._id || wsObj.id,
              name: wsObj.name || 'Untitled Workspace',
              description: wsObj.description || '',
              owner: ownerName,
              ownerId: ownerId,
              role: item.role || wsObj.role || 'Member',
              status: wsObj.status || 'Active',
              color: wsObj.color || 'from-indigo-600 to-purple-600',
            };
          });
          setWorkspaces(normalized);
          setActiveWorkspace((prev) => {
            if (!prev || !prev._id) {
              return normalized[0];
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Failed to fetch workspaces:', err);
      }
    };

    getWorkspaceData();
  }, [auth?.token]);

  useEffect(() => {
    const getWorkspaceMembers = async () => {
      const wsId =
        activeWorkspace?._id ||
        (activeWorkspace?.id && !String(activeWorkspace.id).startsWith('ws-')
          ? activeWorkspace.id
          : null);

      if (!auth?.token || !wsId || wsId === 'undefined') {
        setMembers([]);
        return;
      }

      try {
        const response = await apiPrivate.get(`/workspaces/${wsId}/members`);
        const rawData = response.data?.data || response.data;
        if (Array.isArray(rawData)) {
          const normalized = rawData.map((item) => {
            const userObj =
              typeof item.user === 'object' && item.user ? item.user : {};
            const fullName =
              `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() ||
              userObj.username ||
              userObj.email?.split('@')[0] ||
              'Workspace Member';
            const initials =
              fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase() || 'WM';

            let roleName = normalizeRole(item.role);

            if (
              activeWorkspace?.ownerId &&
              userObj._id &&
              String(userObj._id) === String(activeWorkspace.ownerId)
            ) {
              roleName = 'Owner';
            }

            return {
              id: item._id || item.id || `mem-${Date.now()}`,
              _id: item._id || item.id,
              userId: userObj._id || userObj.id,
              name: fullName,
              email: userObj.email || '',
              role: roleName,
              avatar: initials,
              bgGradient: 'from-indigo-500 to-violet-600',
              department: userObj.department || '',
              joinedDate: item.joinedAt
                ? new Date(item.joinedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '',
              status:
                item.status === 'Active' || item.status === 'ACTIVE'
                  ? 'Active'
                  : 'Pending Invite',
              tasksCompleted: 0,
            };
          });
          setMembers(normalized);
        }
      } catch (err) {
        console.error('Failed to fetch workspace members:', err);
      }
    };

    getWorkspaceMembers();
  }, [auth?.token, activeWorkspace?._id, activeWorkspace?.id]);

  useEffect(() => {
    const getWorkspaceProjectsData = async () => {
      const wsId =
        activeWorkspace?._id ||
        (activeWorkspace?.id && !String(activeWorkspace.id).startsWith('ws-')
          ? activeWorkspace.id
          : null);
      const wsName = activeWorkspace?.name;

      if (!auth?.token) {
        setWorkspaceProjects([]);
        return;
      }

      try {
        const response = await apiPrivate.get('/project', {
          params: {
            workspaceId: wsId || undefined,
            workspaceName: wsName || undefined,
          },
        });
        const rawData = response.data?.data || response.data;
        if (Array.isArray(rawData)) {
          const normalized = rawData.map(normalizeProject);
          setWorkspaceProjects(normalized);
        } else {
          setWorkspaceProjects([]);
        }
      } catch (err) {
        console.error('Failed to fetch workspace projects:', err);
        setWorkspaceProjects([]);
      }
    };

    getWorkspaceProjectsData();
  }, [
    auth?.token,
    activeWorkspace?._id,
    activeWorkspace?.id,
    activeWorkspace?.name,
  ]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await apiPrivate.post('/workspaces', data);
      const rawNewWs = response.data?.data || response.data;
      if (rawNewWs) {
        const wsObj = rawNewWs.workspace || rawNewWs;
        const ownerObj = typeof wsObj.owner === 'object' ? wsObj.owner : null;
        const ownerName = ownerObj
          ? `${ownerObj.firstName || ''} ${ownerObj.lastName || ''}`.trim() ||
            ownerObj.username ||
            ''
          : typeof wsObj.owner === 'string'
            ? wsObj.owner
            : auth?.user?.firstName
              ? `${auth.user.firstName} ${auth.user.lastName || ''}`.trim()
              : auth?.user?.username || '';
        const ownerId = ownerObj
          ? ownerObj._id
          : typeof wsObj.owner === 'string'
            ? wsObj.owner
            : auth?.user?._id || auth?.user?.id;

        const newWs = {
          id: wsObj._id || wsObj.id,
          _id: wsObj._id || wsObj.id,
          name: wsObj.name || 'Untitled Workspace',
          description: wsObj.description || '',
          owner: ownerName,
          ownerId: ownerId,
          role: rawNewWs.role || wsObj.role || 'Owner',
          status: wsObj.status || 'Active',
          color: wsObj.color || 'from-indigo-600 to-purple-600',
        };
        setWorkspaces((prev) => [newWs, ...prev]);
        setActiveWorkspace(newWs);
        triggerToast(`Workspace "${newWs.name}" created successfully!`);
      }
      reset();
      setIsCreateWorkspaceOpen(false);
    } catch (err) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Failed to create workspace');
    }
  };

  const onWorkspaceSettingsSubmit = async (data) => {
    try {
      if (!activeWorkspace?._id) return;
      const response = await apiPrivate.put(
        `/workspaces/${activeWorkspace._id}`,
        data,
      );
      const rawNewWs = response.data?.data || response.data;
      if (rawNewWs) {
        const wsObj = rawNewWs.workspace || rawNewWs;
        const updatedWs = {
          ...activeWorkspace,
          name: wsObj.name || activeWorkspace.name,
          description:
            wsObj.description !== undefined
              ? wsObj.description
              : activeWorkspace.description,
        };
        setActiveWorkspace(updatedWs);
        setWorkspaces((prev) =>
          prev.map((w) => ((w._id || w.id) === updatedWs._id ? updatedWs : w)),
        );
        triggerToast(`Workspace updated successfully!`);
      }
      reset();
    } catch (err) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Failed to update workspace');
    }
  };

  const onInviteMemberSubmit = async (data) => {
    try {
      if (!activeWorkspace?._id) {
        triggerToast('Please select a valid workspace first');
        return;
      }
      await apiPrivate.post(`/workspaces/${activeWorkspace._id}/invite`, {
        email: data.email,
        role: data.role || 'Member',
        workspaceName: activeWorkspace.name,
      });
      triggerToast(`Invitation sent to ${data.email}!`);
      reset();
      setIsInviteMemberOpen(false);
    } catch (err) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Failed to invite member');
      setIsInviteMemberOpen(false);
    }
  };

  const deleteWorkspace = async () => {
    try {
      const response = await apiPrivate.delete(
        `/workspaces/${activeWorkspace._id}`,
      );
      const remaining = workspaces.filter(
        (w) => (w._id || w.id) !== (activeWorkspace._id || activeWorkspace.id),
      );
      setWorkspaces(remaining);
      if (remaining.length > 0) {
        setActiveWorkspace(remaining[0]);
      }
      triggerToast(`Workspace "${activeWorkspace.name}" deleted successfully!`);
      setIsDeleteWorkspaceOpen(false);
      reset();
    } catch (err) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Failed to delete workspace');
      setIsDeleteWorkspaceOpen(false);
    }
  };

  const handleSwitchWorkspace = (ws) => {
    setActiveWorkspace(ws);
    setIsWorkspaceDropdownOpen(false);
    triggerToast(`Switched workspace to "${ws.name}"`);
  };

  const handleOpenEditMember = (member) => {
    setEditingMember(member);
    setEditName(member.name || '');
    setEditEmail(member.email || '');
    setEditDepartment(member.department || '');
    setEditRole(member.role || 'Member');
    setIsEditMemberOpen(true);
  };

  const handleEditMemberSubmit = (e) => {
    e.preventDefault();
    if (!editingMember) return;

    const initials = (editName.trim() || editEmail)
      .substring(0, 2)
      .toUpperCase();
    setMembers(
      members.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              name: editName.trim() || m.name,
              email: editEmail.trim() || m.email,
              department: editDepartment.trim() || m.department,
              role: editRole,
              avatar: initials,
            }
          : m,
      ),
    );

    setIsEditMemberOpen(false);
    setEditingMember(null);
    triggerToast(
      `Updated member details for ${editName || editingMember.name}`,
    );
  };

  const handleConfirmDeleteMember = () => {
    if (!memberToDelete) return;
    setMembers(members.filter((item) => item.id !== memberToDelete.id));
    triggerToast(`Removed ${memberToDelete.name} from workspace`);
    setMemberToDelete(null);
  };

  const handleRoleChange = (memberId, newRole) => {
    setMembers(
      members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
    );
    triggerToast(`Member role updated to ${newRole}`);
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase());
    const normRole = normalizeRole(m.role);
    const matchesRole = roleFilter === 'All' || normRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <MainLayout>
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold animate-bounce"
          style={{
            background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
            border: '1px solid rgba(99,102,241,0.35)',
          }}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 relative z-20">
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 right-0 w-96 h-full opacity-10"
            style={{
              background:
                'radial-gradient(circle, rgba(99,102,241,1) 0%, rgba(255,255,255,0) 70%)',
            }}
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className={`h-16 w-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg bg-gradient-to-br ${activeWorkspace.color} text-white font-extrabold flex-shrink-0`}
            >
              {activeWorkspace.name?.charAt(0).toUpperCase() || 'W'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <button
                    id="workspace-switcher-btn"
                    onClick={() =>
                      setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)
                    }
                    className="flex items-center gap-2 text-2xl font-black text-slate-900 tracking-tight hover:text-indigo-600 transition cursor-pointer group"
                  >
                    <span>{activeWorkspace.name}</span>
                    <svg
                      className={`h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-transform duration-200 ${
                        isWorkspaceDropdownOpen
                          ? 'rotate-180 text-indigo-600'
                          : ''
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

                  {isWorkspaceDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsWorkspaceDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Switch Workspace
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {workspaces.length} spaces
                          </span>
                        </div>

                        <div className="max-h-64 overflow-y-auto py-1">
                          {workspaces.map((ws) => {
                            const wsId = ws.id || ws._id;
                            const activeId =
                              activeWorkspace?.id || activeWorkspace?._id;
                            const isSelected = wsId === activeId;
                            return (
                              <button
                                key={wsId}
                                onClick={() => handleSwitchWorkspace(ws)}
                                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                                    : ''
                                }`}
                              >
                                <div
                                  className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-extrabold text-white bg-gradient-to-br ${
                                    ws.color || 'from-indigo-600 to-purple-600'
                                  } flex-shrink-0`}
                                >
                                  {ws.name?.charAt(0).toUpperCase() || 'W'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-800 truncate">
                                    {ws.name || 'Untitled Workspace'}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {members.length} members
                                  </p>
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

                        <div className="p-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setIsWorkspaceDropdownOpen(false);
                              setIsCreateWorkspaceOpen(true);
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
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
                            Create New Workspace
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 max-w-xl">
                {activeWorkspace.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="invite-member-header-btn"
              onClick={() => setIsInviteMemberOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              <svg
                className="h-4 w-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Invite Member
            </button>

            <button
              id="create-workspace-header-btn"
              onClick={() => setIsCreateWorkspaceOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-indigo-500/25 transition cursor-pointer hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              }}
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
              New Workspace
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">
              Total Members
            </span>
            <p className="text-lg font-extrabold text-slate-800">
              {members.length}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">
              Active Projects
            </span>
            <p className="text-lg font-extrabold text-slate-800">
              {workspaceProjects.length}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">
              Workspace Owner
            </span>
            <p className="text-sm font-bold text-indigo-600 truncate">
              {activeWorkspace.owner}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center border-b border-slate-200 space-x-8">
        {[
          {
            id: 'members',
            label: `Members & Roles (${members.length})`,
          },
          {
            id: 'projects',
            label: `Projects (${workspaceProjects.length})`,
          },
          { id: 'settings', label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'members' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <svg
                className="h-4 w-4 absolute left-3.5 top-3 text-slate-400"
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
              <input
                id="member-search-input"
                type="text"
                placeholder="Search member by name, email or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-400 mr-1">
                Filter:
              </span>
              {ROLES.map((r) => (
                <button
                  key={r}
                  id={`role-filter-${r.toLowerCase()}`}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    roleFilter === r
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                    <th className="py-3.5 px-5">Member</th>
                    <th className="py-3.5 px-5">Department</th>
                    <th className="py-3.5 px-5">Current Role</th>
                    <th className="py-3.5 px-5">Joined</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-xl flex items-center justify-center font-extrabold text-white text-xs bg-gradient-to-br ${m.bgGradient}`}
                          >
                            {m.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-none">
                              {m.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {m.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-slate-600 font-medium">
                        {m.department}
                      </td>

                      <td className="py-4 px-5">
                        {normalizeRole(m.role) === 'Owner' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border bg-indigo-100 text-indigo-700 border-indigo-200">
                            <Crown className="h-3.5 w-3.5 text-amber-500" />
                            <span>Owner</span>
                          </span>
                        ) : (
                          <select
                            id={`role-select-${m.id}`}
                            value={normalizeRole(m.role)}
                            onChange={(e) =>
                              handleRoleChange(m.id, e.target.value)
                            }
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                              ROLE_BADGES[normalizeRole(m.role)] ||
                              'bg-slate-100'
                            }`}
                          >
                            <option value="Admin">Admin</option>
                            <option value="Member">Member</option>
                            <option value="Guest">Guest</option>
                          </select>
                        )}
                      </td>

                      <td className="py-4 px-5 text-xs text-slate-500 font-medium">
                        {m.joinedDate}
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            m.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        {m.role !== 'Owner' && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditMember(m)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                              title="Edit member"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => setMemberToDelete(m)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Remove member"
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
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-6 animate-fade-in">
          {workspaceProjects.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
              <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Folder className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No projects in this workspace
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                There are currently no active projects created under this
                workspace.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workspaceProjects.map((p) => (
                <ProjectCard
                  key={p.id || p._id}
                  project={p}
                  onEdit={handleOpenEditProject}
                  onDelete={handleOpenDeleteProject}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 animate-fade-in max-w-3xl">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Workspace General Settings
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your workspace metadata, URL, and branding.
            </p>
          </div>

          <form onSubmit={handleSubmit(onWorkspaceSettingsSubmit)}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  defaultValue={activeWorkspace.name}
                  className={`w-full px-4 py-2 border rounded-xl text-sm bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${errors.name ? 'border-red-500' : 'border-slate-200'}`}
                  {...register('name', {
                    required: 'Name is required',
                  })}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  defaultValue={activeWorkspace.description}
                  className={`w-full px-4 py-2 border rounded-xl text-sm bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${errors.description ? 'border-red-500' : 'border-slate-200'}`}
                  {...register('description', {
                    required: 'Description is required',
                  })}
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>

          <div className="pt-6 border-t border-slate-200/80 space-y-3">
            <h4 className="text-sm font-extrabold text-rose-600">
              Danger Zone
            </h4>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-rose-900">
                  Delete Workspace
                </p>
                <p className="text-[11px] text-rose-700/80">
                  Permanently delete this workspace and all associated projects
                  and tasks.
                </p>
              </div>
              <button
                onClick={() => setIsDeleteWorkspaceOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
              >
                Delete Space
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateWorkspaceOpen && (
        <>
          <div
            className="fixed inset-0 w-screen h-screen min-h-screen bg-slate-950/75 backdrop-blur-md z-[999] animate-fade-in cursor-pointer"
            onClick={() => setIsCreateWorkspaceOpen(false)}
          />
          <div className="fixed inset-0 z-[1000] overflow-y-auto flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 pointer-events-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900">
                  Create New Workspace
                </h3>
                <button
                  onClick={() => setIsCreateWorkspaceOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
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

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 mt-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Workspace Name *
                  </label>
                  <input
                    id="new-workspace-name-input"
                    type="text"
                    placeholder="e.g. NextGen Web Team"
                    {...register('name', {
                      required: 'Name is required',
                    })}
                    className={`w-full px-4 py-2.5 border ${
                      errors.name
                        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30`}
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief summary of what this workspace is dedicated to..."
                    {...register('description', {
                      required: false,
                    })}
                    className={`w-full px-4 py-2 border ${
                      errors.description
                        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30`}
                  />
                  {errors.description && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateWorkspaceOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-create-workspace-btn"
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md cursor-pointer"
                  >
                    Create Workspace
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {isInviteMemberOpen && (
        <>
          <div
            className="fixed inset-0 w-screen h-screen min-h-screen bg-slate-950/75 backdrop-blur-md z-[999] animate-fade-in cursor-pointer"
            onClick={() => setIsInviteMemberOpen(false)}
          />
          <div className="fixed inset-0 z-[1000] overflow-y-auto flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 pointer-events-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900">
                  Invite Team Member
                </h3>
                <button
                  onClick={() => setIsInviteMemberOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
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

              <form
                onSubmit={handleSubmit(onInviteMemberSubmit)}
                className="space-y-4 mt-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="invite-name-input"
                    type="text"
                    placeholder="e.g. Jane Doe"
                    className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                      errors.name
                        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    {...register('name', {
                      required: {
                        value: true,
                        message: 'Name is required',
                      },
                    })}
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="invite-email-input"
                    type="email"
                    placeholder="colleague@company.com"
                    className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                      errors.email
                        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    {...register('email', {
                      required: {
                        value: true,
                        message: 'Email is required',
                      },
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department / Job Title
                  </label>
                  <input
                    id="invite-department-input"
                    type="text"
                    placeholder="e.g. Frontend Engineering"
                    className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                      errors.department
                        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    {...register('department', {
                      required: {
                        value: true,
                        message: 'Department is required',
                      },
                    })}
                  />
                  {errors.department && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.department.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assign Initial Role
                  </label>
                  <select
                    className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer font-semibold ${
                      errors.role
                        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    {...register('role', {
                      required: {
                        value: true,
                        message: 'Role is required',
                      },
                    })}
                  >
                    <option value="Admin">
                      Admin (Full project & member controls)
                    </option>
                    <option value="Member">
                      Member (Can edit tasks & projects)
                    </option>
                    <option value="Guest">Guest (Read-only access)</option>
                  </select>
                  {errors.role && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInviteMemberOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-invite-member-btn"
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md cursor-pointer"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {isEditMemberOpen && (
        <>
          <div
            className="fixed inset-0 w-screen h-screen min-h-screen bg-slate-950/75 backdrop-blur-md z-[999] animate-fade-in cursor-pointer"
            onClick={() => {
              setIsEditMemberOpen(false);
              setEditingMember(null);
            }}
          />
          <div className="fixed inset-0 z-[1000] overflow-y-auto flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 pointer-events-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900">
                  Edit Member Details
                </h3>
                <button
                  onClick={() => {
                    setIsEditMemberOpen(false);
                    setEditingMember(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
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

              <form
                onSubmit={handleEditMemberSubmit}
                className="space-y-4 mt-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="edit-member-name-input"
                    type="text"
                    required
                    placeholder="e.g. Sarah Lin"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="edit-member-email-input"
                    type="email"
                    required
                    placeholder="sarah@pulse.io"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department / Job Title
                  </label>
                  <input
                    id="edit-member-department-input"
                    type="text"
                    placeholder="e.g. Product Design"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Workspace Role
                  </label>
                  <select
                    value={normalizeRole(editRole)}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer font-semibold"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                    <option value="Guest">Guest</option>
                  </select>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMemberOpen(false);
                      setEditingMember(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-edit-member-btn"
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {isDeleteWorkspaceOpen && (
        <>
          <div
            className="fixed inset-0 w-screen h-screen min-h-screen bg-slate-950/75 backdrop-blur-md z-[999] animate-fade-in cursor-pointer"
            onClick={() => setIsDeleteWorkspaceOpen(false)}
          />
          <div className="fixed inset-0 z-[1000] overflow-y-auto flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-rose-100 animate-scale-up pointer-events-auto">
              <div className="flex items-center gap-3.5 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Delete Workspace
                  </h3>
                  <p className="text-xs text-slate-500">
                    This action is permanent
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Are you completely sure you want to delete{' '}
                <span className="font-bold text-slate-900">
                  {activeWorkspace?.name}
                </span>
                ? All associated projects, task boards, and member permissions
                will be removed immediately.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteWorkspaceOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-delete-workspace-btn"
                  type="button"
                  onClick={handleConfirmDeleteWorkspace}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md cursor-pointer"
                >
                  Delete Workspace
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        onDelete={handleOpenDeleteProject}
        defaultWorkspace={activeWorkspace?.name || ''}
        workspaceList={workspaces.map((w) => w.name)}
        existingProject={editingProject}
      />

      {projectToDelete && (
        <>
          <div
            className="fixed inset-0 w-screen h-screen min-h-screen bg-slate-950/75 backdrop-blur-md z-[999] animate-fade-in cursor-pointer"
            onClick={() => setProjectToDelete(null)}
          />
          <div className="fixed inset-0 z-[1000] overflow-y-auto flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-rose-100 animate-scale-up pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Delete Project
                  </h3>
                  <p className="text-xs text-slate-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-bold text-slate-900">
                  "{projectToDelete.name}"
                </span>
                ? All associated progress and data will be permanently removed.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProjectToDelete(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-delete-ws-project-btn"
                  type="button"
                  disabled={isDeletingProject}
                  onClick={handleConfirmDeleteProject}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {isDeletingProject ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {memberToDelete && (
        <>
          <div
            className="fixed inset-0 w-screen h-screen min-h-screen bg-slate-950/75 backdrop-blur-md z-[999] animate-fade-in cursor-pointer"
            onClick={() => setMemberToDelete(null)}
          />
          <div className="fixed inset-0 z-[1000] overflow-y-auto flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 pointer-events-auto">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
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
                      d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Remove Team Member
                  </h3>
                  <p className="text-xs text-slate-500">
                    Revoke workspace access
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Are you sure you want to remove{' '}
                <span className="font-bold text-slate-900">
                  {memberToDelete.name}
                </span>{' '}
                ({memberToDelete.email}) from this workspace?
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMemberToDelete(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-remove-member-btn"
                  type="button"
                  onClick={handleConfirmDeleteMember}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md cursor-pointer"
                >
                  Remove Member
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}
