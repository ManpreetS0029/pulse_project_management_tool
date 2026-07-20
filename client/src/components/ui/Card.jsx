import React from "react";

export default function Card({ title, action, children, className = "" }) {
  return (
    <div className={`bg-white border border-slate-100 rounded-xl shadow-xs shadow-slate-100/50 p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
              {title}
            </h3>
          )}
          {action && (
            <div className="text-sm">
              {action}
            </div>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
