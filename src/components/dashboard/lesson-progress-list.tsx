'use client';

import React, { useState } from 'react';
import { BookOpen, CheckCircle, Zap, Play } from 'lucide-react';
import Link from 'next/link';

interface Lesson {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  language: 'English' | 'Hindi';
  content?: string;
}

interface ProgressRecord {
  lesson_id: string;
  completed: boolean;
  high_score_wpm: number;
  best_wpm?: number;
  accuracy?: number;
  updated_at: string;
}

interface LessonProgressListProps {
  lessons: Lesson[];
  progressList: ProgressRecord[];
}

export default function LessonProgressList({ lessons, progressList }: LessonProgressListProps) {
  const [filterLevel, setFilterLevel] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');

  // Map progress lists into dictionary for fast access
  const progressMap = progressList.reduce<Record<string, ProgressRecord>>((acc, item) => {
    acc[item.lesson_id] = item;
    return acc;
  }, {});

  // Calculate Aggregates
  const totalLessons = lessons.length;
  const completedLessons = Object.values(progressMap).filter((p) => p.completed).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Filter lessons
  const filteredLessons = lessons.filter((lesson) => {
    if (filterLevel === 'All') return true;
    return lesson.level === filterLevel;
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">Lesson Progression</h3>
        </div>

        {/* Level Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/60 p-1 border border-white/5 rounded-xl">
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                filterLevel === lvl
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Completion Progress Indicator */}
      <div className="rounded-xl border border-white/5 bg-slate-900/20 p-4 space-y-2">
        <div className="flex justify-between text-xs text-slate-400 font-bold">
          <span>Overall Course Completion</span>
          <span className="text-purple-400">{completedLessons} / {totalLessons} ({progressPercent}%)</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-white/5 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${Math.max(progressPercent, 3)}%` }}
          ></div>
        </div>
      </div>

      {/* Lessons List Scrollable */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {filteredLessons.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No lessons found for this difficulty tier.
          </div>
        ) : (
          filteredLessons.map((lesson) => {
            const prog = progressMap[lesson.id];
            const isCompleted = prog?.completed || false;
            const score = prog?.best_wpm ?? prog?.high_score_wpm ?? 0;
            const accuracy = prog?.accuracy ?? 0;

            return (
              <div
                key={lesson.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/30 p-3.5 hover:border-white/10 hover:bg-slate-900/50 transition-all duration-200 group"
              >
                <div className="space-y-1.5 pr-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-slate-200 text-sm leading-snug group-hover:text-purple-400 transition-colors">
                      {lesson.title}
                    </h4>
                    <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      lesson.level === 'Advanced'
                        ? 'bg-purple-950/20 text-purple-400 border border-purple-500/20'
                        : lesson.level === 'Intermediate'
                        ? 'bg-blue-950/20 text-blue-400 border border-blue-500/20'
                        : 'bg-cyan-950/20 text-cyan-400 border border-cyan-500/20'
                    } border`}>
                      {lesson.level}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {lesson.language}
                    </span>
                  </div>

                  {isCompleted ? (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle className="h-3 w-3" />
                        Completed
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-cyan-400">
                        <Zap className="h-3 w-3" />
                        {Math.round(score)} WPM
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400">{Math.round(accuracy)}% Acc</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 font-medium">Not completed yet</p>
                  )}
                </div>

                <Link
                  href={`/lessons/${lesson.id}`}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                    isCompleted
                      ? 'border-white/10 bg-slate-900 hover:border-purple-500/40 hover:bg-purple-500/10 text-slate-400 hover:text-purple-400'
                      : 'border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                  } transition-all duration-200`}
                  title="Practice Lesson"
                >
                  <Play className="h-4 w-4 fill-current" />
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
