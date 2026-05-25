'use client';

import React, { useState } from 'react';
import { LineChart, Zap, Target } from 'lucide-react';

interface ChartPoint {
  wpm: number;
  accuracy: number;
  date: string;
}

interface ProgressChartProps {
  data: ChartPoint[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
  const [view, setView] = useState<'combined' | 'wpm' | 'accuracy'>('combined');

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-white/5 bg-slate-950/40 p-6 text-center backdrop-blur-sm shadow-2xl">
        <LineChart className="h-10 w-10 text-slate-500 mb-2 animate-pulse" />
        <h4 className="font-bold text-white mb-1">No Practice History Yet</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Complete typing lessons or quick practice sessions to track your progression speed over time.
        </p>
      </div>
    );
  }

  // Configuration sizes
  const width = 600;
  const height = 260;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Scaling ranges
  const maxWpm = Math.max(...data.map((d) => d.wpm), 60);
  const maxAcc = 100;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number, max: number) => {
    return paddingTop + chartHeight - (val / max) * chartHeight;
  };

  // Build SVG Paths
  let wpmPath = '';
  let accPath = '';
  let wpmAreaPath = '';
  let accAreaPath = '';

  data.forEach((d, i) => {
    const x = getX(i);
    const yWpm = getY(d.wpm, maxWpm);
    const yAcc = getY(d.accuracy, maxAcc);

    if (i === 0) {
      wpmPath = `M ${x} ${yWpm}`;
      accPath = `M ${x} ${yAcc}`;
      wpmAreaPath = `M ${x} ${paddingTop + chartHeight} L ${x} ${yWpm}`;
      accAreaPath = `M ${x} ${paddingTop + chartHeight} L ${x} ${yAcc}`;
    } else {
      wpmPath += ` L ${x} ${yWpm}`;
      accPath += ` L ${x} ${yAcc}`;
    }

    if (i === data.length - 1) {
      wpmAreaPath += `${wpmPath.substring(1)} L ${x} ${paddingTop + chartHeight} Z`;
      accAreaPath += `${accPath.substring(1)} L ${x} ${paddingTop + chartHeight} Z`;
    }
  });

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl space-y-4">
      {/* Chart Headers and Toggles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Progression History</h3>
          <p className="text-xs text-slate-400 mt-0.5">Visualize your speed and accuracy trajectory</p>
        </div>

        {/* View toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setView('combined')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              view === 'combined'
                ? 'bg-white/10 text-white shadow-md'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            Combined View
          </button>
          <button
            onClick={() => setView('wpm')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              view === 'wpm'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Zap className="h-3 w-3" />
            WPM Curve
          </button>
          <button
            onClick={() => setView('accuracy')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              view === 'accuracy'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Target className="h-3 w-3" />
            Accuracy Curve
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto min-w-[500px] overflow-visible"
        >
          {/* Gradients and Filters */}
          <defs>
            <linearGradient id="wpmGlowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="accGlowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
            </linearGradient>
            <filter id="neonGlowWpm" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#22d3ee" floodOpacity="0.5" />
            </filter>
            <filter id="neonGlowAcc" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#34d399" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + ratio * chartHeight;
            return (
              <line
                key={ratio}
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                className="stroke-white/5 stroke-1"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Left Y-Axis labels (WPM - Cyan) */}
          {(view === 'combined' || view === 'wpm') && (
            <>
              <text x={paddingLeft - 10} y={getY(maxWpm, maxWpm) + 4} className="text-[9px] fill-cyan-400/70 font-bold text-right" textAnchor="end">
                {maxWpm}
              </text>
              <text x={paddingLeft - 10} y={getY(maxWpm / 2, maxWpm) + 4} className="text-[9px] fill-cyan-400/70 font-bold text-right" textAnchor="end">
                {Math.round(maxWpm / 2)}
              </text>
              <text x={paddingLeft - 10} y={getY(0, maxWpm) - 2} className="text-[9px] fill-cyan-400/70 font-bold text-right" textAnchor="end">
                0
              </text>
            </>
          )}

          {/* Right Y-Axis labels (Accuracy % - Emerald, only show when accuracy view is active and wpm is hidden) */}
          {view === 'accuracy' && (
            <>
              <text x={paddingLeft - 10} y={getY(100, maxAcc) + 4} className="text-[9px] fill-emerald-400/70 font-bold text-right" textAnchor="end">
                100%
              </text>
              <text x={paddingLeft - 10} y={getY(50, maxAcc) + 4} className="text-[9px] fill-emerald-400/70 font-bold text-right" textAnchor="end">
                50%
              </text>
              <text x={paddingLeft - 10} y={getY(0, maxAcc) - 2} className="text-[9px] fill-emerald-400/70 font-bold text-right" textAnchor="end">
                0%
              </text>
            </>
          )}

          {/* Render Area Paths */}
          {data.length > 1 && (
            <>
              {(view === 'combined' || view === 'wpm') && (
                <path d={wpmAreaPath} fill="url(#wpmGlowGrad)" />
              )}
              {(view === 'combined' || view === 'accuracy') && (
                <path d={accAreaPath} fill="url(#accGlowGrad)" />
              )}
            </>
          )}

          {/* Render Line Paths */}
          {data.length > 1 && (
            <>
              {(view === 'combined' || view === 'wpm') && (
                <path d={wpmPath} fill="none" stroke="#22d3ee" strokeWidth="2.5" filter="url(#neonGlowWpm)" strokeLinecap="round" strokeLinejoin="round" />
              )}
              {(view === 'combined' || view === 'accuracy') && (
                <path d={accPath} fill="none" stroke="#34d399" strokeWidth="2.5" filter="url(#neonGlowAcc)" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </>
          )}

          {/* Point markers & ticks */}
          {data.map((d, i) => {
            const x = getX(i);
            const yWpm = getY(d.wpm, maxWpm);
            const yAcc = getY(d.accuracy, maxAcc);

            return (
              <g key={i}>
                {/* WPM Dot */}
                {(view === 'combined' || view === 'wpm') && (
                  <circle
                    cx={x}
                    cy={yWpm}
                    r="4"
                    className="fill-slate-950 stroke-cyan-400 stroke-2 cursor-pointer hover:r-6 transition-all duration-200"
                  >
                    <title>{`WPM: ${d.wpm}`}</title>
                  </circle>
                )}

                {/* Accuracy Dot */}
                {(view === 'combined' || view === 'accuracy') && (
                  <circle
                    cx={x}
                    cy={yAcc}
                    r="4"
                    className="fill-slate-950 stroke-emerald-400 stroke-2 cursor-pointer hover:r-6 transition-all duration-200"
                  >
                    <title>{`Accuracy: ${d.accuracy}%`}</title>
                  </circle>
                )}

                {/* Date x-axis labeling */}
                {(data.length <= 8 || i % Math.ceil(data.length / 8) === 0) && (
                  <text
                    x={x}
                    y={height - paddingBottom + 20}
                    className="text-[9px] fill-slate-500 font-bold"
                    textAnchor="middle"
                  >
                    {d.date}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
