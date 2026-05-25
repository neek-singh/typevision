'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/utils/supabase';
import { ArrowLeft, Clock, Zap, Target, AlertTriangle, RefreshCw, BarChart2, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface TypingResult {
  id: string;
  wpm: number;
  accuracy: number;
  mistakes: number;
  total_typed: number;
  duration: number;
  created_at: string;
  lesson_id: string | null;
  lessons: {
    id: string;
    title: string;
    language: 'English' | 'Hindi';
  } | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResultDetails({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const { user, loading: authLoading, initialize, initialized } = useAuthStore();
  const [result, setResult] = useState<TypingResult | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Route guarding
  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [user, initialized, router]);

  // Fetch results detail record
  useEffect(() => {
    const fetchResultDetail = async () => {
      if (!user || !id) return;
      setDataLoading(true);
      try {
        let resultData: any = null;
        const { data: tryData, error: tryError } = await supabase
          .from('typing_results')
          .select(`
            id, wpm, accuracy, mistakes, total_typed, duration, created_at, lesson_id,
            lessons ( id, title, language )
          `)
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (tryError) {
          console.warn('Failing back to querying typing_result detail without lessons join:', tryError);
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('typing_results')
            .select('id, wpm, accuracy, mistakes, total_typed, duration, created_at, lesson_id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

          if (fallbackError) throw fallbackError;
          resultData = fallbackData || null;

          if (resultData && resultData.lesson_id) {
            try {
              const { data: lessonData } = await supabase
                .from('lessons')
                .select('id, title, language')
                .eq('id', resultData.lesson_id)
                .maybeSingle();

              if (lessonData) {
                resultData.lessons = {
                  id: lessonData.id,
                  title: lessonData.title,
                  language: lessonData.language
                };
              }
            } catch (e) {
              console.error('Error fetching lesson fallback mapping in detail:', e);
            }
          }
        } else {
          resultData = tryData;
        }

        setResult((resultData as unknown as TypingResult) || null);
      } catch (err) {
        console.error('Failed to query single result detail record:', err);
        router.push('/dashboard');
      } finally {
        setDataLoading(false);
      }
    };

    if (initialized && user && id) {
      fetchResultDetail();
    }
  }, [user, initialized, id, router]);

  // Loader screen
  if (authLoading || !initialized || dataLoading || !result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-slate-950 min-h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-[0_0_15px_rgba(34,211,238,0.2)]"></div>
        <p className="text-xs text-slate-400 font-semibold tracking-wider animate-pulse">Syncing practice attempt telemetry...</p>
      </div>
    );
  }

  // Visual SVG Circular Telemetry Calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  
  // WPM gauge clamp (capped at 120 WPM for maximum visual range)
  const wpmPercent = Math.min((result.wpm / 120) * 100, 100);
  const wpmStrokeDashoffset = circumference - (wpmPercent / 100) * circumference;

  // Accuracy stroke
  const accuracyStrokeDashoffset = circumference - (result.accuracy / 100) * circumference;

  // Performance Speed Description Tiers
  const getSpeedClassification = (speed: number) => {
    if (speed >= 80) return { name: 'Tactile Legend', style: 'text-rose-400', desc: 'Absolute mechanical mastery. Your fingers move at typing exam peak speeds.' };
    if (speed >= 60) return { name: 'Professional Typist', style: 'text-purple-400', desc: 'Flawless touch layouts. Ready for advanced administrative examinations.' };
    if (speed >= 40) return { name: 'Intermediate tactile', style: 'text-cyan-400', desc: 'Good rhythmic typing capabilities. Keep building finger coordination.' };
    return { name: 'Novice typist', style: 'text-slate-400', desc: 'Concentrate on accuracy over pure speed. Speed will naturally accelerate.' };
  };

  const speedClass = getSpeedClassification(result.wpm);

  return (
    <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 min-h-screen">
      {/* Decorative Background spot */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]"></div>

      {/* Navigation Headers */}
      <div className="space-y-1">
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to History</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Attempt Telemetry</h1>
        <p className="text-xs text-slate-400">
          Completed {new Date(result.created_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Split visual elements grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core telemetry circles dial panel */}
        <div className="md:col-span-1 rounded-2xl border border-white/5 bg-slate-900/30 p-6 flex flex-col items-center justify-center space-y-6 shadow-xl backdrop-blur-sm text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Performance Dial</span>

          {/* SVG Dials */}
          <div className="flex gap-4 sm:flex-col sm:gap-6 items-center justify-center">
            
            {/* Speed Gauge Dial */}
            <div className="relative h-32 w-32">
              <svg className="h-full w-full -rotate-90">
                {/* Track */}
                <circle cx="64" cy="64" r={radius} className="stroke-white/5 fill-none" strokeWidth="8" />
                {/* Indicator */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="stroke-cyan-400 fill-none transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={wpmStrokeDashoffset}
                  strokeLinecap="round"
                  filter="url(#neonGlowWpmDetail)"
                />
                
                {/* Neon blur filter definition */}
                <defs>
                  <filter id="neonGlowWpmDetail" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white">{result.wpm}</span>
                <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">WPM</span>
              </div>
            </div>

            {/* Accuracy Gauge Dial */}
            <div className="relative h-32 w-32">
              <svg className="h-full w-full -rotate-90">
                {/* Track */}
                <circle cx="64" cy="64" r={radius} className="stroke-white/5 fill-none" strokeWidth="8" />
                {/* Indicator */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="stroke-emerald-400 fill-none transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={accuracyStrokeDashoffset}
                  strokeLinecap="round"
                  filter="url(#neonGlowAccDetail)"
                />
                
                <defs>
                  <filter id="neonGlowAccDetail" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white">{result.accuracy}%</span>
                <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">Accuracy</span>
              </div>
            </div>

          </div>
        </div>

        {/* Telemetry statistics grids and details */}
        <div className="md:col-span-2 space-y-6 text-left">
          
          {/* Detailed numbers block */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-5">
            <h3 className="text-base font-bold text-white border-b border-white/5 pb-3">Session Breakdown</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Target language */}
              <div className="rounded-xl bg-slate-950/60 p-4 border border-white/5">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Lesson / Source</span>
                <span className="block text-sm font-semibold text-white mt-1 truncate">
                  {result.lessons?.title || 'Quick Practice'}
                </span>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-4 border border-white/5">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Language</span>
                <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold mt-1 ${
                  result.lessons?.language === 'Hindi'
                    ? 'bg-orange-500/10 text-orange-400'
                    : 'bg-cyan-500/10 text-cyan-400'
                }`}>
                  {result.lessons?.language || 'English'}
                </span>
              </div>

              {/* Total characters typed */}
              <div className="rounded-xl bg-slate-950/60 p-4 border border-white/5">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Characters Typed</span>
                <span className="block text-lg font-extrabold text-white mt-1">{result.total_typed} chars</span>
              </div>

              {/* Mistakes */}
              <div className="rounded-xl bg-slate-950/60 p-4 border border-white/5">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Mistakes</span>
                <span className="block text-lg font-extrabold text-rose-400 mt-1">{result.mistakes} errors</span>
              </div>

              {/* Practice duration */}
              <div className="rounded-xl bg-slate-950/60 p-4 border border-white/5">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Practice Time</span>
                <span className="block text-lg font-extrabold text-white mt-1">{result.duration} seconds</span>
              </div>

              {/* speed classification */}
              <div className="rounded-xl bg-slate-950/60 p-4 border border-white/5 flex items-center gap-2">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Speed Class</span>
                  <span className={`block text-xs font-bold mt-1 ${speedClass.style}`}>
                    {speedClass.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Analysis card details */}
            <div className="rounded-xl border border-white/5 bg-slate-900/30 p-4 space-y-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Performance Evaluation</span>
              <p className="text-[11px] leading-relaxed text-slate-400">{speedClass.desc}</p>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                href={result.lesson_id ? `/lessons/${result.lesson_id}` : '/practice'}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs font-bold text-white hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/25"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-5 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <BarChart2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>View Dashboard</span>
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
