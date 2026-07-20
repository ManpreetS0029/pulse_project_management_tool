import React from "react";

export default function Avatar({
  initials,
  name,
  src,
  size = "md",
  bgClass = "bg-gradient-to-br from-indigo-500 to-violet-600",
  showStatus = false,
  statusColor = "bg-emerald-500",
}) {
  const sizeClasses = {
    xs: "h-6 w-6 text-[9px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm font-semibold",
    lg: "h-12 w-12 text-base font-bold",
    xl: "h-14 w-14 text-lg font-bold",
  };

  return (
    <div className="relative inline-flex shrink-0">
      {src ? (
        <img
          className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 ring-2 ring-slate-50`}
          src={src}
          alt={name || "User Avatar"}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} ${bgClass} rounded-full flex items-center justify-center border border-transparent ring-2 ring-white tracking-wider font-bold text-white`}
        >
          {initials || "U"}
        </div>
      )}
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${statusColor} ring-2 ring-white`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
