'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTypingStore } from '@/store/useTypingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/utils/supabase';
import { RefreshCw, CheckCircle, AlertTriangle, Clock, Zap, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { clearCache } from '@/lib/cache/cache-utils';

interface CharacterSpanProps {
  char: string;
  isTyped: boolean;
  isCurrent: boolean;
  isWrong: boolean;
}

const CharacterSpan = React.memo(({ char, isTyped, isCurrent, isWrong }: CharacterSpanProps) => {
  let className = 'text-slate-500';

  if (isTyped) {
    className = isWrong
      ? 'text-rose-500 bg-rose-500/10 border-b border-rose-500'
      : 'text-emerald-400';
  } else if (isCurrent) {
    className = 'text-cyan-400 bg-cyan-400/20 animate-pulse rounded-sm px-0.5';
  }

  return (
    <span className={`${className} transition-all duration-100`}>
      {char}
    </span>
  );
});
CharacterSpan.displayName = 'CharacterSpan';

// Decoupled stats bar — re-renders only on timer ticks (once per second)
const TypingStatsBar = React.memo(() => {
  const duration = useTypingStore((state) => state.duration);
  const getStats = useTypingStore((state) => state.getStats);
  const stats = getStats();

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-6 border-b border-white/5 pb-2">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-cyan-400 shrink-0" />
        <span className="text-xs font-semibold text-slate-400">Speed</span>
        <span className="text-base font-bold text-white">
          {stats.wpm} <span className="text-xs font-normal text-slate-500">WPM</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-emerald-400 shrink-0" />
        <span className="text-xs font-semibold text-slate-400">Accuracy</span>
        <span className="text-base font-bold text-white">{stats.accuracy}%</span>
      </div>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
        <span className="text-xs font-semibold text-slate-400">Mistakes</span>
        <span className="text-base font-bold text-white">{stats.mistakes}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-purple-400 shrink-0" />
        <span className="text-xs font-semibold text-slate-400">Time</span>
        <span className="text-base font-bold text-white">{formatTime(duration)}</span>
      </div>
    </div>
  );
});
TypingStatsBar.displayName = 'TypingStatsBar';

// Decoupled playground — completely isolated from duration timer ticks
const TypingPlayground = React.memo(({ language }: { language: 'English' | 'Hindi' }) => {
  const text = useTypingStore((state) => state.text);
  const typedText = useTypingStore((state) => state.typedText);
  const wrongIndexes = useTypingStore((state) => state.wrongIndexes);
  const isActive = useTypingStore((state) => state.isActive);
  const isCompleted = useTypingStore((state) => state.isCompleted);

  return (
    <div className="relative min-h-[160px] py-4 transition-all duration-300">
      {!isActive && !isCompleted && typedText.length === 0 && (
        <div className="absolute top-1 right-0 z-10">
          <p className="animate-pulse text-xs font-semibold tracking-wide text-cyan-500/70">
            Start typing to begin...
          </p>
        </div>
      )}

      <div
        className={`select-none outline-none ${language === 'Hindi'
          ? 'font-krutidev text-xl sm:text-2xl md:text-4xl leading-loose tracking-normal'
          : 'font-sans text-xl sm:text-2xl md:text-4xl leading-relaxed tracking-wide'
          }`}
      >
        {text.split('').map((char, index) => (
          <CharacterSpan
            key={index}
            char={char}
            isTyped={index < typedText.length}
            isCurrent={index === typedText.length}
            isWrong={wrongIndexes.has(index)}
          />
        ))}
      </div>
    </div>
  );
});
TypingPlayground.displayName = 'TypingPlayground';

// Decoupled action tray & supabase saving logic
interface TypingActionsProps {
  lessonId?: string;
  nextLessonId?: string | null;
  handleRestart: () => void;
  onCompleteCallback?: (stats: { wpm: number; accuracy: number; mistakes: number }) => void;
}

const TypingActions = React.memo(({ lessonId, nextLessonId, handleRestart, onCompleteCallback }: TypingActionsProps) => {
  const isCompleted = useTypingStore((state) => state.isCompleted);
  const getStats = useTypingStore((state) => state.getStats);
  const { user } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const saveResults = async () => {
      if (isCompleted && !isSaving && !saveSuccess) {
        setIsSaving(true);
        const stats = getStats();

        if (onCompleteCallback) {
          onCompleteCallback(stats);
        }

        if (user) {
          try {
            const { error: resultError } = await supabase.from('typing_results').insert({
              user_id: user.id,
              lesson_id: lessonId || null,
              wpm: stats.wpm,
              accuracy: stats.accuracy,
              mistakes: stats.mistakes,
              total_typed: stats.totalTyped,
              duration: stats.duration,
            });

            if (resultError) throw resultError;

            if (lessonId) {
              const { data: currentProgress, error: fetchError } = await supabase
                .from('progress')
                .select('id, high_score_wpm')
                .eq('user_id', user.id)
                .eq('lesson_id', lessonId)
                .maybeSingle();

              if (fetchError) throw fetchError;

              if (currentProgress) {
                const updatePayload = {
                  high_score_wpm: Math.max(currentProgress.high_score_wpm || 0, stats.wpm),
                  updated_at: new Date().toISOString(),
                };

                const { error: updateErr } = await supabase
                  .from('progress')
                  .update(updatePayload)
                  .eq('id', currentProgress.id);

                if (updateErr) throw updateErr;
              } else {
                const insertPayload = {
                  user_id: user.id,
                  lesson_id: lessonId,
                  completed: true,
                  high_score_wpm: stats.wpm,
                };

                const { error: insertErr } = await supabase
                  .from('progress')
                  .insert(insertPayload);

                if (insertErr) throw insertErr;
              }
            }

            // Invalidate frontend cache to force fresh dashboard & lesson-list fetches
            clearCache(`typing-results-${user.id}`);
            clearCache(`progress-${user.id}`);

            setSaveSuccess(true);
          } catch (err) {
            console.error('Failed to save typing results:', err);
          }
        }
        setIsSaving(false);
      }
    };

    saveResults();
  }, [isCompleted, isSaving, saveSuccess, user, lessonId, getStats, onCompleteCallback]);

  // Clean success on restart
  useEffect(() => {
    if (!isCompleted) {
      setSaveSuccess(false);
    }
  }, [isCompleted]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <button
        onClick={handleRestart}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 hover:border-white/20 transition-all duration-200"
      >
        <RefreshCw className="h-4 w-4" />
        Restart Lesson
      </button>

      {isCompleted && (
        <div className="flex items-center gap-3 animate-fade-in">
          {user ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              {isSaving ? 'Saving attempt...' : 'Attempt saved to your profile!'}
            </span>
          ) : (
            <span className="text-xs font-semibold text-amber-400">
              Sign in to save your typing progress and track WPM history!
            </span>
          )}
          <Link
            href="/lessons"
            className="flex items-center gap-1 rounded-xl bg-slate-900 border border-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 hover:border-white/20 transition-all duration-200"
          >
            Back to Lessons
          </Link>

          {nextLessonId && (
            <Link
              href={`/lessons/${nextLessonId}`}
              className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 transition-all"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
});
TypingActions.displayName = 'TypingActions';

interface TypingEngineProps {
  lessonId?: string;
  nextLessonId?: string | null;
  initialText: string;
  language: 'English' | 'Hindi';
  onCompleteCallback?: (stats: { wpm: number; accuracy: number; mistakes: number }) => void;
}

export default function TypingEngine({ lessonId, nextLessonId, initialText, language, onCompleteCallback }: TypingEngineProps) {
  const initializeTest = useTypingStore((state) => state.initializeTest);
  const resetTest = useTypingStore((state) => state.resetTest);
  const isActive = useTypingStore((state) => state.isActive);
  const isCompleted = useTypingStore((state) => state.isCompleted);
  const tick = useTypingStore((state) => state.tick);
  const typeChar = useTypingStore((state) => state.typeChar);
  const deleteChar = useTypingStore((state) => state.deleteChar);
  const typedTextLength = useTypingStore((state) => state.typedText.length);

  const containerRef = useRef<HTMLDivElement>(null);
  const { initialize } = useAuthStore();

  // Initialize Auth store once
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Initialize test text
  useEffect(() => {
    initializeTest(initialText);
    return () => resetTest();
  }, [initialText, initializeTest, resetTest]);

  // Live Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isCompleted, tick]);

  // Keydown handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        deleteChar();
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
      }

      if (e.key.length === 1) {
        e.preventDefault();
        typeChar(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCompleted, typeChar, deleteChar]);

  const handleRestart = React.useCallback(() => {
    resetTest();
    initializeTest(initialText);
  }, [initialText, initializeTest, resetTest]);

  return (
    <div className="w-full space-y-3" ref={containerRef}>
      {/* Stats Bar — only re-renders on timer ticks */}
      <TypingStatsBar />

      {/* Typing Playground — does not re-render on timer ticks */}
      <TypingPlayground language={language} />

      {/* Action Tray & Telemetry Saver */}
      <TypingActions
        lessonId={lessonId}
        nextLessonId={nextLessonId}
        handleRestart={handleRestart}
        onCompleteCallback={onCompleteCallback}
      />
    </div>
  );
}
