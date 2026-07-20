import React from "react";

export default function ChartMini({ data = [] }) {
  // Define colors for each progress line to represent different channels
  const barColors = [
    "bg-indigo-600",
    "bg-sky-500",
    "bg-purple-500",
    "bg-amber-500",
  ];

  return (
    <div className="w-full">
      <div>
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
          Conversions by Source
        </h4>
        <p className="text-xs text-slate-400 font-medium mb-4">
          Top channels contributing to active signups
        </p>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const colorClass = barColors[index % barColors.length];
          return (
            <div key={item.source} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">
                  {item.source}
                </span>
                <div className="space-x-1.5">
                  <span className="font-bold text-slate-800">
                    {item.conversions.toLocaleString()}
                  </span>
                  <span className="text-slate-400 font-medium">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
