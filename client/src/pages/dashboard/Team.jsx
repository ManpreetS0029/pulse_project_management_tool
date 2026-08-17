import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { apiPrivate } from '../../api/axios';

export default function Team() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await apiPrivate.get('/workspaces/my-workspaces');
        const rawData = response.data?.data || response.data;
        if (Array.isArray(rawData) && rawData.length > 0) {
          const firstWs = rawData[0]?.workspace || rawData[0];
          const wsId = firstWs._id || firstWs.id;
          if (wsId) {
            const membersRes = await apiPrivate.get(
              `/workspaces/${wsId}/members`,
            );
            const rawMembers =
              membersRes.data?.data ||
              membersRes.data?.members ||
              membersRes.data;
            if (Array.isArray(rawMembers)) {
              const normalized = rawMembers.map((m, idx) => {
                const userObj = m.user || m;
                const name =
                  [userObj.firstName, userObj.lastName]
                    .filter(Boolean)
                    .join(' ') ||
                  userObj.name ||
                  userObj.username ||
                  userObj.email ||
                  'Team Member';
                const initials =
                  name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'TM';
                return {
                  id: userObj._id || userObj.id || `mem-${idx}`,
                  name,
                  initials,
                  role: m.role || userObj.role || 'Member',
                  department: m.department || userObj.department || '',
                  email: userObj.email || '',
                  activeTasks: 0,
                  completedTasks: 0,
                  projects: [],
                  avatarBg: '#6366f1, #8b5cf6',
                };
              });
              setTeamMembers(normalized);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch team members:', err);
      }
    };

    fetchTeamMembers();
  }, []);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = teamMembers.filter((m) => {
    const query = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.role.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query)
    );
  });

  const totalTasks = teamMembers.reduce((a, m) => a + m.activeTasks, 0);

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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Team
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {teamMembers.length} total members · {totalTasks} active tasks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up stagger">
        {[
          { label: 'Total Members', value: teamMembers.length, icon: '👥' },
          { label: 'Active Tasks', value: totalTasks, icon: '📋' },
          {
            label: 'Avg. Completed',
            value:
              teamMembers.length > 0
                ? Math.round(
                    teamMembers.reduce((a, m) => a + m.completedTasks, 0) /
                      teamMembers.length,
                  )
                : 0,
            icon: '✅',
          },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-extrabold text-slate-800">
              {value}
            </div>
            <div className="text-xs text-slate-400 font-medium">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-in-up">
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
            id="team-search"
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-sm font-bold text-slate-700">No members found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 stagger">
          {filtered.map((member, idx) => (
            <div
              key={member.id}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group animate-fade-in-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-white text-sm"
                      style={{
                        background: `linear-gradient(135deg, ${member.avatarBg})`,
                      }}
                    >
                      {member.initials}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>
                {member.department && (
                  <span className="text-[11px] font-medium px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100/50">
                    {member.department}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="truncate">{member.email}</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-slate-50 rounded-xl p-2.5 text-center">
                  <div className="text-lg font-extrabold text-slate-800">
                    {member.activeTasks}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Active
                  </div>
                </div>
                <div className="flex-1 bg-emerald-50 rounded-xl p-2.5 text-center">
                  <div className="text-lg font-extrabold text-emerald-700">
                    {member.completedTasks}
                  </div>
                  <div className="text-[10px] text-emerald-500 font-medium">
                    Completed
                  </div>
                </div>
                <div className="flex-1 bg-indigo-50 rounded-xl p-2.5 text-center">
                  <div className="text-lg font-extrabold text-indigo-700">
                    {member.projects.length}
                  </div>
                  <div className="text-[10px] text-indigo-400 font-medium">
                    Projects
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {member.projects.slice(0, 2).map((proj) => (
                  <span
                    key={proj}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600"
                  >
                    {proj}
                  </span>
                ))}
                {member.projects.length > 2 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    +{member.projects.length - 2} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
