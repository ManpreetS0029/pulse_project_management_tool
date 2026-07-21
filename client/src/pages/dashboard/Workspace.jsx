import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import {
  mockWorkspaces,
  mockWorkspaceMembers,
  mockWorkspaceActivity,
  mockWorkspaceProjects,
} from '../../data/mockWorkspace';

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

export default function Workspace() {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(mockWorkspaces[0]);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

  // Tabs: overview, members, projects, settings
  const [activeTab, setActiveTab] = useState('overview');

  // Members state
  const [members, setMembers] = useState(mockWorkspaceMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modals state
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);

  // Form inputs for Invite Member
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');

  // Toast
  const [toast, setToast] = useState('');

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
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
            return {
              id: wsObj._id || wsObj.id,
              _id: wsObj._id || wsObj.id,
              name: wsObj.name || 'Untitled Workspace',
              description: wsObj.description || '',
              owner: wsObj.owner || '',
              role: item.role || wsObj.role || 'Member',
              status: wsObj.status || 'Active',
              color: wsObj.color || 'from-indigo-600 to-purple-600',
            };
          });
          setWorkspaces(normalized);
          setActiveWorkspace(normalized[0]);
        }
      } catch (err) {
        console.error('Failed to fetch workspaces:', err);
      }
    };
    getWorkspaceData();
  }, [auth?.token]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await apiPrivate.post('/workspace', data);
      const rawNewWs = response.data?.data || response.data;
      if (rawNewWs) {
        const wsObj = rawNewWs.workspace || rawNewWs;
        const newWs = {
          id: wsObj._id || wsObj.id,
          _id: wsObj._id || wsObj.id,
          name: wsObj.name || 'Untitled Workspace',
          description: wsObj.description || '',
          owner: wsObj.owner || '',
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

  // Workspace Switch
  const handleSwitchWorkspace = (ws) => {
    setActiveWorkspace(ws);
    setIsWorkspaceDropdownOpen(false);
    triggerToast(`Switched workspace to "${ws.name}"`);
  };

  // Invite Member Submit
  const handleInviteMember = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const initials = inviteEmail.substring(0, 2).toUpperCase();
    const newMember = {
      id: `mem-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: initials,
      bgGradient: 'from-purple-500 to-indigo-500',
      department: 'Team Member',
      joinedDate: 'Just Now',
      status: 'Pending Invite',
      tasksCompleted: 0,
    };

    setMembers([newMember, ...members]);
    setIsInviteMemberOpen(false);
    setInviteEmail('');
    triggerToast(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
  };

  // Role Change handler
  const handleRoleChange = (memberId, newRole) => {
    setMembers(
      members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
    );
    triggerToast(`Member role updated to ${newRole}`);
  };

  // Member Search & Filter
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <MainLayout>
      {/* Toast Notification */}
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

      {/* HEADER & WORKSPACE SWITCHER */}
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
          {/* Workspace Info & Switcher Button */}
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

                  {/* Dropdown Menu */}
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
                            const activeId = activeWorkspace?.id || activeWorkspace?._id;
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
                                    10 members
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

          {/* Action Buttons */}
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

        {/* Workspace Quick Stats Row */}
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
              {mockWorkspaceProjects.length}
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

      {/* NAVIGATION TABS */}
      <div className="flex items-center border-b border-slate-200 space-x-8">
        {[
          { id: 'overview', label: 'Overview' },
          {
            id: 'members',
            label: `Members & Roles (${members.length})`,
          },
          {
            id: 'projects',
            label: `Projects (${mockWorkspaceProjects.length})`,
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

      {/* TAB CONTENT */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity Timeline */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-800">
                  Workspace Activity Feed
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  Real-time updates
                </span>
              </div>

              <div className="space-y-4">
                {mockWorkspaceActivity.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl hover:bg-slate-50 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">
                        <span className="font-bold text-slate-900">
                          {act.user}
                        </span>{' '}
                        {act.action}{' '}
                        <span className="font-semibold text-indigo-600">
                          {act.target}
                        </span>
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {act.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Breakdown Widget */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3">
                Role Distribution
              </h3>

              <div className="space-y-3">
                {[
                  {
                    role: 'Owner',
                    count: members.filter((m) => m.role === 'Owner').length,
                    color: 'bg-indigo-500',
                  },
                  {
                    role: 'Admin',
                    count: members.filter((m) => m.role === 'Admin').length,
                    color: 'bg-purple-500',
                  },
                  {
                    role: 'Member',
                    count: members.filter((m) => m.role === 'Member').length,
                    color: 'bg-blue-500',
                  },
                  {
                    role: 'Guest',
                    count: members.filter((m) => m.role === 'Guest').length,
                    color: 'bg-amber-500',
                  },
                ].map((item) => (
                  <div
                    key={item.role}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span className="font-semibold text-slate-700">
                        {item.role}s
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 mt-4">
                <p className="text-xs font-bold text-indigo-900">
                  💡 Role-Based Authorization
                </p>
                <p className="text-xs text-indigo-700/80 mt-1">
                  Extensible RBAC allows workspace admins to configure
                  fine-grained permissions per project.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEMBERS & ROLES TAB */}
      {activeTab === 'members' && (
        <div className="space-y-5 animate-fade-in">
          {/* Controls: Search + Role Filters */}
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

          {/* Members Table */}
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
                      {/* Name & Avatar */}
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

                      {/* Department */}
                      <td className="py-4 px-5 text-slate-600 font-medium">
                        {m.department}
                      </td>

                      {/* Role Selector Badge */}
                      <td className="py-4 px-5">
                        {m.role === 'Owner' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border bg-indigo-100 text-indigo-700 border-indigo-200">
                            👑 Owner
                          </span>
                        ) : (
                          <select
                            id={`role-select-${m.id}`}
                            value={m.role}
                            onChange={(e) =>
                              handleRoleChange(m.id, e.target.value)
                            }
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                              ROLE_BADGES[m.role] || 'bg-slate-100'
                            }`}
                          >
                            <option value="Admin">Admin</option>
                            <option value="Member">Member</option>
                            <option value="Guest">Guest</option>
                          </select>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-5 text-xs text-slate-500 font-medium">
                        {m.joinedDate}
                      </td>

                      {/* Status */}
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

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        {m.role !== 'Owner' && (
                          <button
                            onClick={() => {
                              setMembers(
                                members.filter((item) => item.id !== m.id),
                              );
                              triggerToast(`Removed ${m.name} from workspace`);
                            }}
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

      {/* PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {mockWorkspaceProjects.map((p) => (
              <div
                key={p.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {p.status}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {p.updatedAt}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900">
                  {p.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                  {p.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Completion Rate</span>
                    <span className="text-indigo-600">{p.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                  <span className="font-semibold text-slate-500">
                    {p.tasksCount} Tasks
                  </span>
                  <div className="flex -space-x-2 pl-2 pr-1">
                    {p.members.map((m, idx) => {
                      const memberObj = members.find((mem) => mem.avatar === m);
                      const bgGradient =
                        memberObj?.bgGradient ||
                        'from-indigo-500 to-purple-600';
                      return (
                        <div
                          key={idx}
                          title={
                            memberObj
                              ? `${memberObj.name} (${memberObj.email})`
                              : m
                          }
                          className={`h-7 w-7 rounded-full ring-2 ring-white bg-gradient-to-tr ${bgGradient} text-white font-extrabold flex items-center justify-center text-[10px] flex-shrink-0 shadow-sm transition-transform hover:z-10 hover:scale-110`}
                        >
                          {m}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
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

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                defaultValue={activeWorkspace.name}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                defaultValue={activeWorkspace.description}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => triggerToast('Workspace settings saved!')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Save Changes
            </button>
          </div>

          {/* Danger Zone */}
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
                onClick={() =>
                  triggerToast('Delete workspace requires owner verification')
                }
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
              >
                Delete Space
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE WORKSPACE MODAL */}
      {isCreateWorkspaceOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
      )}

      {/* INVITE MEMBER MODAL */}
      {isInviteMemberOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
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

            <form onSubmit={handleInviteMember} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  id="invite-email-input"
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign Initial Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer font-semibold"
                >
                  <option value="Admin">
                    Admin (Full project & member controls)
                  </option>
                  <option value="Member">
                    Member (Can edit tasks & projects)
                  </option>
                  <option value="Guest">Guest (Read-only access)</option>
                </select>
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
      )}
    </MainLayout>
  );
}
