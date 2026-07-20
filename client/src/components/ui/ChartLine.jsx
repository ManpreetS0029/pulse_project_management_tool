import React from "react";

export default function ChartLine({ data = [] }) {
  if (data.length === 0) return null;

  const width = 600;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = data.map((d) => d.value);
  const secondaryValues = data.map((d) => d.secondary);
  const maxValue = Math.max(...values, ...secondaryValues, 10) * 1.2;

  const getCoordinates = (dataset) =>
    dataset.map((val, index) => ({
      x: paddingLeft + (index / (data.length - 1)) * chartWidth,
      y: height - paddingBottom - (val / maxValue) * chartHeight,
    }));

  const points1 = getCoordinates(values);
  const points2 = getCoordinates(secondaryValues);

  const smoothPath = (pts) => {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cpX = (pts[i].x + pts[i + 1].x) / 2;
      d += ` C ${cpX} ${pts[i].y}, ${cpX} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
    }
    return d;
  };

  const getAreaD = (pts) => {
    if (pts.length === 0) return "";
    const linePath = smoothPath(pts);
    return `${linePath} L ${pts[pts.length - 1].x} ${height - paddingBottom} L ${pts[0].x} ${height - paddingBottom} Z`;
  };

  const lineD1 = smoothPath(points1);
  const areaD1 = getAreaD(points1);
  const lineD2 = smoothPath(points2);
  const areaD2 = getAreaD(points2);

  const gridLinesCount = 4;
  const gridLines = Array.from({ length: gridLinesCount }, (_, i) => {
    const val = (maxValue / gridLinesCount) * (i + 1);
    const y = height - paddingBottom - (val / maxValue) * chartHeight;
    return { y, label: Math.round(val) };
  });

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Task Completion</h4>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Tasks completed per day · this week vs last week
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold mt-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            />
            <span className="text-slate-600">This Week</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="text-slate-400">Last Week</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="gradSecondary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((line, idx) => (
            <g key={idx} className="opacity-50">
              <line
                x1={paddingLeft} y1={line.y}
                x2={width - paddingRight} y2={line.y}
                stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8} y={line.y + 4}
                textAnchor="end"
                fontSize={10}
                fill="#94a3b8"
                fontWeight={500}
              >
                {line.label}
              </text>
            </g>
          ))}

          {/* X Axis */}
          <line
            x1={paddingLeft} y1={height - paddingBottom}
            x2={width - paddingRight} y2={height - paddingBottom}
            stroke="#e2e8f0" strokeWidth={1.5}
          />

          {/* Areas */}
          <path d={areaD2} fill="url(#gradSecondary)" />
          <path d={areaD1} fill="url(#gradPrimary)" />

          {/* Lines */}
          <path d={lineD2} fill="none" stroke="#cbd5e1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <path d={lineD1} fill="none" stroke="url(#lineGrad)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {points1.map((p, idx) => (
            <g key={idx} className="cursor-pointer">
              <circle cx={p.x} cy={p.y} r={5} fill="white" stroke="#6366f1" strokeWidth={2.5} />
              <circle cx={p.x} cy={p.y} r={9} fill="transparent" className="hover:fill-indigo-50 transition" />
            </g>
          ))}

          {/* X Labels */}
          {data.map((d, idx) => {
            const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
            return (
              <text key={idx} x={x} y={height - paddingBottom + 18}
                textAnchor="middle" fontSize={11} fill="#94a3b8" fontWeight={600}
              >
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
