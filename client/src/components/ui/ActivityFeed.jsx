import React from "react";

const activityIcons = {
  task_complete: {
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
    bg: "bg-emerald-100",
    color: "text-emerald-600",
  },
  task_move: {
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    bg: "bg-indigo-100",
    color: "text-indigo-600",
  },
  comment: {
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    bg: "bg-sky-100",
    color: "text-sky-600",
  },
  project_create: {
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    bg: "bg-violet-100",
    color: "text-violet-600",
  },
  file_upload: {
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    bg: "bg-amber-100",
    color: "text-amber-600",
  },
};

export default function ActivityFeed({ activities = [] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Team Activity</h3>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      <div className="space-y-4">
        {activities.map((item, idx) => {
          const iconCfg = activityIcons[item.type] || activityIcons.task_complete;
          return (
            <div key={item.id} className="flex items-start gap-3 animate-fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
              {/* User avatar */}
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-white"
                style={{ background: `linear-gradient(135deg, ${item.user.bg.split(' ')[0]})` }}
              >
                {item.user.initials}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">{item.user.name}</span>{" "}
                  {item.action}{" "}
                  <span className="font-semibold text-indigo-700">"{item.subject}"</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center justify-center h-4 w-4 rounded-full ${iconCfg.bg} ${iconCfg.color} flex-shrink-0`}
                  >
                    {iconCfg.icon}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 truncate">{item.project}</span>
                  <span className="text-[10px] text-slate-300">·</span>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">{item.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View all link */}
      <button className="w-full mt-4 pt-4 border-t border-slate-50 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 transition cursor-pointer">
        View all activity
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
