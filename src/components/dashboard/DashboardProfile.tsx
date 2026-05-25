'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/utils/supabase';
import { User, Zap, Target, BookOpen, Clock, Trophy, Calendar, Award } from 'lucide-react';
import { fetchWithCache } from '@/lib/cache/cache-utils';

interface TypingResult {
  wpm: number;
  accuracy: number;
  mistakes: number;
  total_typed: number;
  duration: number;
}

interface ProgressRecord {
  completed: boolean;
}

export default function DashboardProfile() {
  const { user, profile, initialized } = useAuthStore();
  const [results, setResults] = useState<TypingResult[]>([]);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch metrics data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      setDataLoading(true);
      try {
        // 1. Fetch typing results (shares cache key with dashboard)
        const resData = await fetchWithCache(`typing-results-${user.id}`, async () => {
          const { data, error } = await supabase
            .from('typing_results')
            .select(`
              id, wpm, accuracy, mistakes, total_typed, duration, created_at,
              lessons ( id, title, language )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });
          if (error) throw error;
          return data || [];
        }, 15000);
        setResults(resData as TypingResult[] || []);

        // 2. Fetch completed lessons counts (shares cache key with dashboard)
        const progData = await fetchWithCache(`progress-${user.id}`, async () => {
          const { data, error } = await supabase
            .from('progress')
            .select('id, lesson_id, completed, high_score_wpm, updated_at')
            .eq('user_id', user.id);
          if (error) throw error;
          return data || [];
        }, 15000);

        const mappedProgData = ((progData as any[]) || []).map((p) => ({
          ...p,
          best_wpm: p.high_score_wpm,
          accuracy: 0
        }));
        setProgress(mappedProgData as ProgressRecord[] || []);
      } catch (err) {
        console.error('Failed to query user telemetry:', err);
      } finally {
        setDataLoading(false);
      }
    };

    if (initialized && user) {
      fetchProfileData();
    }
  }, [user, initialized]);

  // High-fidelity loader screen
  if (dataLoading && results.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-12 text-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-[0_0_15px_rgba(34,211,238,0.2)] mx-auto"></div>
        <p className="text-xs text-slate-400 font-semibold tracking-wider animate-pulse">Syncing profile details...</p>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || 'N/A';
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  // Stats calculation
  const totalTests = results.length;
  const avgWpm = totalTests > 0 ? Math.round(results.reduce((acc, r) => acc + r.wpm, 0) / totalTests) : 0;
  const bestWpm = totalTests > 0 ? Math.max(...results.map((r) => r.wpm)) : 0;
  const avgAcc = totalTests > 0 ? Math.round(results.reduce((acc, r) => acc + r.accuracy, 0) / totalTests) : 0;
  const completedLessons = progress.filter((p) => p.completed).length;
  
  const totalPracticeSeconds = results.reduce((acc, r) => acc + r.duration, 0);
  const totalPracticeMinutes = Math.round(totalPracticeSeconds / 60);

  // Dynamic typing proficiency tiering
  const getProficiencyTier = (speed: number) => {
    if (speed >= 80) return { name: 'Keyboard Legend', style: 'text-rose-400 border-rose-500/20 bg-rose-950/20', desc: 'Absolute typing mastery' };
    if (speed >= 60) return { name: 'Professional Typist', style: 'text-purple-400 border-purple-500/20 bg-purple-950/20', desc: 'Fingers fly over characters' };
    if (speed >= 40) return { name: 'Intermediate Typist', style: 'text-cyan-400 border-cyan-500/20 bg-cyan-950/20', desc: 'Capable tactile coordination' };
    if (speed >= 25) return { name: 'Casual Keyboardist', style: 'text-indigo-400 border-indigo-500/20 bg-indigo-950/20', desc: 'Improving muscle memory' };
    return { name: 'Novice Finger', style: 'text-slate-400 border-white/5 bg-slate-900/30', desc: 'Starting your keyboard journey' };
  };

  const tier = getProficiencyTier(bestWpm);

  return (
    <div className="relative w-full space-y-8 text-left">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]"></div>

      {/* Title bar */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">My Profile</h2>
        <p className="text-xs text-slate-400 mt-1">Telemetry analytics and typing proficiency metrics.</p>
      </div>

      {/* Main Profile Header Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 shadow-xl backdrop-blur-sm text-center space-y-6">
            
            {/* Avatar plate */}
            <div className="relative mx-auto h-20 w-20 rounded-full border-2 border-cyan-400/25 bg-slate-950 flex items-center justify-center text-cyan-400">
              <User className="h-10 w-10" />
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-emerald-400">
                <Award className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Profile info */}
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white">{displayName}</h2>
              <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
            </div>

            {/* Proficiency Badge component */}
            <div className={`rounded-xl border p-3 space-y-1 ${tier.style}`}>
              <span className="block text-xs font-bold">{tier.name}</span>
              <span className="block text-[9px] opacity-75">{tier.desc}</span>
            </div>

            {/* Date signed up */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 border-t border-white/5 pt-4">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>Registered {joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Analytics Block */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-6 text-left">
            <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">Tactile Statistics</h3>
            
            {/* Quick stats items */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              
              {/* Avg Speed */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Zap className="h-4 w-4 text-cyan-400" />
                  <span>Average Speed</span>
                </div>
                <h4 className="text-2xl font-extrabold text-white">
                  {avgWpm} <span className="text-xs font-normal text-slate-400">WPM</span>
                </h4>
              </div>

              {/* Peak Speed */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Trophy className="h-4 w-4 text-indigo-400" />
                  <span>Personal Best</span>
                </div>
                <h4 className="text-2xl font-extrabold text-white">
                  {bestWpm} <span className="text-xs font-normal text-slate-400">WPM</span>
                </h4>
              </div>

              {/* Avg Accuracy */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <span>Accuracy Rate</span>
                </div>
                <h4 className="text-2xl font-extrabold text-white">{avgAcc}%</h4>
              </div>

              {/* Practice run counts */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Award className="h-4 w-4 text-purple-400" />
                  <span>Total Drills</span>
                </div>
                <h4 className="text-2xl font-extrabold text-white">{totalTests}</h4>
              </div>

              {/* Practice duration */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span>Time Practiced</span>
                </div>
                <h4 className="text-2xl font-extrabold text-white">
                  {totalPracticeMinutes} <span className="text-xs font-normal text-slate-400">MINS</span>
                </h4>
              </div>

              {/* Lessons Completed */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <BookOpen className="h-4 w-4 text-cyan-400" />
                  <span>Lessons Finished</span>
                </div>
                <h4 className="text-2xl font-extrabold text-white">{completedLessons}</h4>
              </div>

            </div>

            {/* Performance tip blocks */}
            <div className="rounded-xl border border-cyan-500/10 bg-cyan-950/10 p-4 mt-6">
              <p className="text-xs leading-relaxed text-cyan-300">
                🚀 {bestWpm > 0 
                  ? `Your highest speed record is currently ${bestWpm} WPM. Keep practicing harder advanced paragraphs to push your tactile limits towards a Legend status badge!` 
                  : 'Welcome to the platform! Run your first quick practice or start lesson home rows to generate performance telemetry statistics here.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
