'use client';

import React from 'react';
import { BarChart2, Zap, Target } from 'lucide-react';

interface HistoryStatsProps {
  totalTests: number;
  avgWpm: number;
  bestWpm: number;
  avgAcc: number;
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
    </svg>
  );
}

export const HistoryStats = React.memo(function HistoryStats({
  totalTests,
  avgWpm,
  bestWpm,
  avgAcc,
}: HistoryStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Total Tests */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-purple-950/50 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tests</p>
            <h4 className="text-xl font-extrabold text-white mt-0.5">{totalTests}</h4>
          </div>
        </div>
      </div>

      {/* Avg WPM */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Speed</p>
            <h4 className="text-xl font-extrabold text-white mt-0.5">
              {avgWpm} <span className="text-[10px] font-normal text-slate-400">WPM</span>
            </h4>
          </div>
        </div>
      </div>

      {/* Peak WPM */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-950/50 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <TrophyIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personal Best</p>
            <h4 className="text-xl font-extrabold text-white mt-0.5">
              {bestWpm} <span className="text-[10px] font-normal text-slate-400">WPM</span>
            </h4>
          </div>
        </div>
      </div>

      {/* Avg Accuracy */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Accuracy</p>
            <h4 className="text-xl font-extrabold text-white mt-0.5">{avgAcc}%</h4>
          </div>
        </div>
      </div>
    </div>
  );
});

HistoryStats.displayName = 'HistoryStats';
export default HistoryStats;
