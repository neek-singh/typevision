import React from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle } from 'lucide-react';
import LessonLevelBadge from './lesson-level-badge';

export interface Lesson {
  id: string;
  title: string;
  content: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  language: 'English' | 'Hindi';
}

export interface ProgressItem {
  lesson_id: string;
  completed: boolean;
  accuracy?: number;
  best_wpm?: number;
  high_score_wpm?: number;
}

interface LessonCardProps {
  lesson: Lesson;
  progress?: ProgressItem;
  lessonNumber?: number;
}

export default function LessonCard({ lesson, progress, lessonNumber }: LessonCardProps) {
  const isCompleted = progress?.completed || false;
  const bestWpm = progress?.best_wpm ?? progress?.high_score_wpm ?? 0;
  const accuracy = progress?.accuracy ?? 0;

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-4 sm:p-4.5 shadow-lg hover:border-cyan-500/30 hover:shadow-cyan-900/5 transition-all duration-300 group">
      <div className="space-y-3">
        {/* Lesson Number + Language badge row */}
        <div className="flex items-center justify-between">
          {lessonNumber !== undefined ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-xs font-bold text-cyan-400">
              Lesson {lessonNumber}
            </span>
          ) : (
            <LessonLevelBadge level={lesson.level} />
          )}
          <span className="inline-flex items-center rounded bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-slate-400 border border-white/5">
            {lesson.language === 'Hindi' ? 'Hindi' : 'English QWERTY'}
          </span>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
            {lesson.title}
          </h3>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        {/* Completion Status */}
        <div className="min-h-[32px] flex items-center">
          {isCompleted ? (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Completed</span>
              </div>
              <div className="text-[9px] text-slate-400 font-medium">
                WPM: <span className="text-cyan-400 font-bold">{bestWpm}</span> • Acc: <span className="text-emerald-400 font-bold">{accuracy}%</span>
              </div>
            </div>
          ) : (
            <span className="text-[10px] font-semibold text-slate-500">Not attempted</span>
          )}
        </div>

        {/* CTA button */}
        <Link
          href={`/lessons/${lesson.id}`}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/10 px-4 py-2 text-xs font-bold text-white hover:text-cyan-400 transition-all duration-200"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Start Lesson
        </Link>
      </div>
    </div>
  );
}

