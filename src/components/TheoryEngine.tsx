'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/utils/supabase';
import { clearCache } from '@/lib/cache/cache-utils';
import { CheckCircle2, ArrowRight, ArrowLeft, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface TheoryEngineProps {
  lessonId: string;
  nextLessonId: string | null;
  title: string;
  content: string;
  language: 'English' | 'Hindi';
  level: string;
}

export default function TheoryEngine({
  lessonId,
  nextLessonId,
  title,
  content,
  language,
  level,
}: TheoryEngineProps) {
  const { user, initialize } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Check if student has already completed this theory lesson in database
  useEffect(() => {
    const checkCompletion = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('progress')
          .select('completed')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .maybeSingle();

        if (!error && data) {
          setIsCompleted(data.completed ?? false);
        }
      } catch (err) {
        console.error('Error checking theory completion:', err);
      }
    };
    checkCompletion();
  }, [user, lessonId]);

  const handleMarkAsRead = async () => {
    if (!user) {
      // For anonymous users, just set local state
      setIsCompleted(true);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      // Fetch existing progress
      const { data: currentProgress, error: fetchError } = await supabase
        .from('progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (currentProgress) {
        // Update progress
        const { error: updateErr } = await supabase
          .from('progress')
          .update({
            completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentProgress.id);

        if (updateErr) throw updateErr;
      } else {
        // Insert progress
        const { error: insertErr } = await supabase
          .from('progress')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            high_score_wpm: 0, // 0 since it is a theory lesson
          });

        if (insertErr) throw insertErr;
      }

      // Invalidate frontend cache to force fresh dashboard & lesson-list fetches
      clearCache(`typing-results-${user.id}`);
      clearCache(`progress-${user.id}`);

      setIsCompleted(true);
    } catch (err: any) {
      console.error('Failed to save theory progress:', err);
      setErrorMessage(err.message || 'Failed to register completion.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ambient glows */}
      <div className="absolute top-1/3 right-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[120px] opacity-40" />

      {/* Main Theory Lesson Container */}
      <div className="relative space-y-6 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">Theory Lesson</span>
              <h2 className="text-lg font-extrabold text-white leading-tight mt-0.5">{title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 capitalize">{level}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
            <span className="text-[10px] font-bold text-purple-400">{language}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          <div 
            className={`w-full min-h-[calc(100vh-280px)] overflow-y-auto text-sm sm:text-base leading-relaxed text-slate-300 tracking-wide select-text selection:bg-purple-500/20 selection:text-purple-300 pr-1 scrollbar-thin scrollbar-thumb-white/5 whitespace-pre-wrap ${
              language === 'Hindi' ? 'font-krutidev text-lg sm:text-xl md:text-2xl leading-loose' : 'font-sans'
            }`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Error notification if saving fails */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-950/20 p-4 text-xs font-semibold text-rose-450 animate-in fade-in">
            <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Bottom Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6">
          <Link
            href="/lessons"
            className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900 px-5 py-3 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Lessons</span>
          </Link>

          {isCompleted ? (
            <div className="flex items-center gap-3 animate-fade-in">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-4.5 w-4.5" />
                Lesson Completed!
              </span>
              {nextLessonId && (
                <Link
                  href={`/lessons/${nextLessonId}`}
                  className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg hover:from-purple-400 hover:to-indigo-500 transition-all"
                >
                  <span>Next Lesson</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ) : (
            <button
              onClick={handleMarkAsRead}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg hover:from-purple-450 hover:to-indigo-550 transition-all disabled:opacity-50 hover:shadow-purple-500/20 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Completion...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4.5 w-4.5 text-purple-200" />
                  <span>Complete &amp; Mark as Read</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
