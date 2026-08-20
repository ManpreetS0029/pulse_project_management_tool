import React from 'react';
import { Paperclip, MessageSquare, CheckSquare, Calendar } from 'lucide-react';

const priorityConfig = {
  Critical: {
    label: 'Critical',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: '#fecaca',
  },
  High: {
    label: 'High',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.1)',
    border: '#fed7aa',
  },
  Medium: {
    label: 'Medium',
    color: '#eab308',
    bg: 'rgba(234,179,8,0.1)',
    border: '#fef08a',
  },
  Low: {
    label: 'Low',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: '#bbf7d0',
  },
};

const projectColorMap = {
  indigo: '#6366f1',
  violet: '#8b5cf6',
  sky: '#0ea5e9',
  emerald: '#10b981',
  pink: '#ec4899',
  amber: '#f59e0b',
};

export default function TaskCard({ task, onClick }) {
  const {
    id,
    title,
    priority,
    project,
    projectColor,
    dueDate,
    assignee,
    tags = [],
    files = [],
    commentsCount = 0,
    subtasks = [],
  } = task;
  const pCfg = priorityConfig[priority] || priorityConfig.Medium;
  const projColor = projectColorMap[projectColor] || '#6366f1';

  const today = new Date();
  const due = dueDate ? new Date(dueDate) : null;
  const daysLeft = due ? Math.ceil((due - today) / (1000 * 60 * 60 * 24)) : null;
  const isOverdue = due && daysLeft < 0;
  const isDueSoon = due && daysLeft >= 0 && daysLeft <= 1;

  const filesLength = Array.isArray(files)
    ? files.length
    : task.attachmentsCount || 0;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
    >
      {/* Priority bar */}
      <div
        className="w-full h-0.5 rounded-full mb-3 opacity-60"
        style={{ background: pCfg.color }}
      />

      {/* Task ID + Priority */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: pCfg.bg, color: pCfg.color }}
        >
          {pCfg.label}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-slate-700 leading-snug mb-3 group-hover:text-indigo-700 transition-colors">
        {title}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Indicator Icons (Files, Comments, Subtasks) */}
      {(filesLength > 0 || commentsCount > 0 || subtasks.length > 0) && (
        <div className="flex items-center gap-3 mb-3 text-[11px] font-semibold text-slate-400">
          {filesLength > 0 && (
            <span
              className="flex items-center gap-1 text-slate-500"
              title="Attachments"
            >
              <Paperclip className="h-3 w-3" />
              <span>{filesLength}</span>
            </span>
          )}
          {commentsCount > 0 && (
            <span
              className="flex items-center gap-1 text-slate-500"
              title="Comments"
            >
              <MessageSquare className="h-3 w-3" />
              <span>{commentsCount}</span>
            </span>
          )}
          {subtasks.length > 0 && (
            <span
              className="flex items-center gap-1 text-slate-500"
              title="Subtasks"
            >
              <CheckSquare className="h-3 w-3" />
              <span>
                {subtasks.filter((s) => s.completed).length}/{subtasks.length}
              </span>
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        {/* Project label */}
        <span
          className="flex items-center gap-1 text-[10px] font-semibold truncate max-w-[120px]"
          style={{ color: projColor }}
        >
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ background: projColor }}
          />
          {project}
        </span>

        <div className="flex items-center gap-2">
          {/* Due date */}
          {dueDate && (
            <span
              className={`flex items-center gap-1 text-[10px] font-semibold ${
                isOverdue
                  ? 'text-rose-500'
                  : isDueSoon
                    ? 'text-amber-500'
                    : 'text-slate-400'
              }`}
            >
              <Calendar className="h-3 w-3" />
              {isOverdue ? 'Overdue' : daysLeft === 0 ? 'Today' : `${daysLeft}d`}
            </span>
          )}

          {/* Assignees */}
          {(() => {
            const list =
              Array.isArray(task.assignees) && task.assignees.length > 0
                ? task.assignees
                : assignee
                  ? [assignee]
                  : [];
            if (list.length === 0) return null;
            return (
              <div className="flex items-center -space-x-1.5 overflow-hidden flex-shrink-0">
                {list.slice(0, 3).map((a, idx) => (
                  <div
                    key={a.id || a.name || idx}
                    title={a.name || 'Assignee'}
                    className={`h-6 w-6 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                      a.bg || 'bg-slate-100 text-slate-700'
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
      </div>
    </div>
  );
}
