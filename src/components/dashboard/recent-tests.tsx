'use client';

import React from 'react';
import { History, Keyboard } from 'lucide-react';

export interface TypingResult {
  id: string;
  wpm: number;
  accuracy: number;
  mistakes: number;
  total_typed: number;
  duration: number;
  created_at: string;
  lessons?: {
    id: string;
    title: string;
    language: string;
  } | null;
}

interface RecentTestsProps {
  results: TypingResult[];
}

export default function RecentTests({ results }: RecentTestsProps) {
  // Safe date formatter
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Reverse list to show newest tests first
  const sortedResults = [...results].reverse();

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl space-y-4">
      <div className="flex items-center gap-2 border-b border-white/5 pb-4">
        <History className="h-5 w-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white tracking-tight">Recent Attempts</h3>
      </div>

      {sortedResults.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">
          No attempts registered yet. Go practice some lessons!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pr-4">Lesson / Mode</th>
                <th className="pb-3 text-center pr-2">WPM</th>
                <th className="pb-3 text-center pr-2">Accuracy</th>
                <th className="pb-3 text-center pr-2">Mistakes</th>
                <th className="pb-3 text-center">Duration</th>
                <th className="pb-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedResults.slice(0, 10).map((result) => (
                <tr key={result.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-3.5 pr-4 flex items-center gap-2">
                    <span className="font-semibold text-slate-200">
                      {result.lessons?.title || 'Quick Practice'}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold border ${
                      result.lessons?.language === 'Hindi'
                        ? 'bg-purple-950/20 border-purple-500/25 text-purple-400'
                        : 'bg-cyan-950/20 border-cyan-500/25 text-cyan-400'
                    }`}>
                      <Keyboard className="h-2.5 w-2.5" />
                      {result.lessons?.language || 'Practice'}
                    </span>
                  </td>
                  <td className="py-3.5 text-center font-bold text-cyan-400 pr-2">
                    {Math.round(result.wpm)}
                  </td>
                  <td className="py-3.5 text-center font-bold text-emerald-400 pr-2">
                    {Math.round(result.accuracy)}%
                  </td>
                  <td className="py-3.5 text-center text-rose-400 pr-2">
                    {result.mistakes}
                  </td>
                  <td className="py-3.5 text-center text-slate-400 font-medium pr-2">
                    {result.duration}s
                  </td>
                  <td className="py-3.5 text-right text-slate-400 text-xs">
                    {formatDate(result.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
