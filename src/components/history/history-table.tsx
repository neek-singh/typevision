'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Target, AlertTriangle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export interface TypingResult {
  id: string;
  wpm: number;
  accuracy: number;
  mistakes: number;
  total_typed: number;
  duration: number;
  created_at: string;
  lessons: {
    id: string;
    title: string;
    language: 'English' | 'Hindi';
  } | null;
}

interface HistoryTableProps {
  currentItems: TypingResult[];
  totalPages: number;
  currentPage: number;
  totalTests: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  handlePrevPage: () => void;
  handleNextPage: () => void;
}

export const HistoryTable = React.memo(function HistoryTable({
  currentItems,
  totalPages,
  currentPage,
  totalTests,
  indexOfFirstItem,
  indexOfLastItem,
  handlePrevPage,
  handleNextPage,
}: HistoryTableProps) {
  return (
    <div className="space-y-6">
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-2xl border border-white/5 bg-slate-900/10 overflow-hidden shadow-xl backdrop-blur-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900/50 border-b border-white/5 text-slate-300 font-bold">
            <tr>
              <th className="px-6 py-4">Lesson / Source</th>
              <th className="px-6 py-4 text-center">Language</th>
              <th className="px-6 py-4 text-right">Speed (WPM)</th>
              <th className="px-6 py-4 text-right">Accuracy</th>
              <th className="px-6 py-4 text-right">Mistakes</th>
              <th className="px-6 py-4 text-right">Duration</th>
              <th className="px-6 py-4 text-right">Date & Time</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-400">
            {currentItems.map((r) => (
              <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-3.5 font-semibold text-white">
                  {r.lessons?.title || 'Quick Practice'}
                </td>
                <td className="px-6 py-3.5 text-center">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    r.lessons?.language === 'Hindi'
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {r.lessons?.language || 'English'}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right font-extrabold text-cyan-400">
                  {r.wpm} WPM
                </td>
                <td className="px-6 py-3.5 text-right font-bold text-emerald-400">
                  {r.accuracy}%
                </td>
                <td className="px-6 py-3.5 text-right text-rose-400 font-bold">
                  {r.mistakes}
                </td>
                <td className="px-6 py-3.5 text-right">
                  {r.duration}s
                </td>
                <td className="px-6 py-3.5 text-right text-[10px]">
                  {new Date(r.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-6 py-3.5 text-center">
                  <Link
                    href={`/results/${r.id}`}
                    prefetch={false}
                    className="rounded bg-slate-900 border border-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:text-white hover:border-white/20 transition-all"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile responsive Cards Grid */}
      <div className="block md:hidden space-y-4">
        {currentItems.map((r) => (
          <div key={r.id} className="rounded-xl border border-white/5 bg-slate-900/30 p-4 space-y-3.5">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-white">{r.lessons?.title || 'Quick Practice'}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {new Date(r.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold ${
                r.lessons?.language === 'Hindi'
                  ? 'bg-orange-500/10 text-orange-400'
                  : 'bg-cyan-500/10 text-cyan-400'
              }`}>
                {r.lessons?.language || 'English'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-y border-white/5 py-2.5">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span>Speed: <strong className="text-white">{r.wpm}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-emerald-400" />
                <span>Accuracy: <strong className="text-white">{r.accuracy}%</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                <span>Errors: <strong className="text-white">{r.mistakes}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-purple-400" />
                <span>Duration: <strong className="text-white">{r.duration}s</strong></span>
              </div>
            </div>

            <div className="text-right">
              <Link
                href={`/results/${r.id}`}
                prefetch={false}
                className="inline-flex w-full justify-center rounded-lg bg-slate-900 border border-white/5 py-2 text-xs font-bold text-slate-300 hover:text-white"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Navigation panel */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <span className="text-[11px] text-slate-400">
            Showing <strong className="text-slate-200">{indexOfFirstItem + 1}</strong> to{' '}
            <strong className="text-slate-200">{Math.min(indexOfLastItem, totalTests)}</strong> of{' '}
            <strong className="text-slate-200">{totalTests}</strong> results
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-300 font-semibold px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

HistoryTable.displayName = 'HistoryTable';
export default HistoryTable;
