import React from 'react';
import { Target, Zap, CheckCircle2 } from 'lucide-react';
import { ProgressItem } from './lesson-card';

interface LessonProgressProps {
  totalLessons: number;
  progressMap: Record<string, ProgressItem>;
}

export default function LessonProgress({ totalLessons, progressMap }: LessonProgressProps) {
  const completedList = Object.values(progressMap).filter((p) => p.completed);
  const completedCount = completedList.length;
  const completionPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Calculate Best WPM across completed lessons
  const bestWpm = completedCount > 0 
    ? Math.max(...completedList.map((p) => p.best_wpm ?? p.high_score_wpm ?? 0)) 
    : 0;

  // Calculate Average Accuracy across completed lessons
  const avgAccuracy = completedCount > 0
    ? Math.round(completedList.reduce((acc, p) => acc + (p.accuracy ?? 0), 0) / completedCount)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Completed Lessons Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-purple-400" />
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Lessons</p>
            <h3 className="mt-1 text-2xl font-bold text-white">
              {completedCount} <span className="text-sm font-normal text-slate-400">/ {totalLessons} ({completionPercentage}%)</span>
            </h3>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 h-16 w-16 opacity-5 bg-purple-400 rounded-full blur-xl"></div>
      </div>

      {/* Average Accuracy Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-emerald-400" />
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Accuracy</p>
            <h3 className="mt-1 text-2xl font-bold text-white">
              {completedCount > 0 ? `${avgAccuracy}%` : '0%'}
            </h3>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 h-16 w-16 opacity-5 bg-emerald-400 rounded-full blur-xl"></div>
      </div>

      {/* Best WPM Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-cyan-400" />
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Best WPM</p>
            <h3 className="mt-1 text-2xl font-bold text-white">
              {completedCount > 0 ? `${bestWpm} WPM` : '0 WPM'}
            </h3>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 h-16 w-16 opacity-5 bg-cyan-400 rounded-full blur-xl"></div>
      </div>
    </div>
  );
}
