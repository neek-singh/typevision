import React, { useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import LessonCard, { Lesson, ProgressItem } from './lesson-card';

interface LessonListProps {
  lessons: Lesson[];
  progressMap: Record<string, ProgressItem>;
}

export default function LessonList({ lessons, progressMap }: LessonListProps) {
  const [activeLang, setActiveLang] = useState<'English' | 'Hindi'>('English');
  const [activeLevel, setActiveLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesLang = lesson.language === activeLang;
      const matchesLevel = lesson.level === activeLevel;
      return matchesLang && matchesLevel;
    });
  }, [lessons, activeLang, activeLevel]);

  return (
    <div className="space-y-6">
      {/* Filters Hub */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-slate-900/30 p-4 backdrop-blur-sm">
        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/5">
          {(['English', 'Hindi'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeLang === lang
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Level Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/5">
          {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeLevel === level
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Lessons */}
      {filteredLessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/5 bg-slate-900/10 text-slate-400 space-y-2">
          <AlertCircle className="h-8 w-8 text-slate-500" />
          <p className="text-sm font-semibold">No lessons match your active filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map((lesson, idx) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              progress={progressMap[lesson.id]}
              lessonNumber={idx + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
