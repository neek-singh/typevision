'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { 
  Zap, Target, BookOpen, Clock, AlertCircle, School, Clipboard,
  Award, Trophy, ChevronRight, Play, Loader2
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCard from '@/components/dashboard/stats-card';

const ProgressChart = dynamic(() => import('@/components/dashboard/progress-chart'), {
  ssr: false,
  loading: () => <Skeleton className="h-[280px] w-full rounded-2xl animate-pulse" />
});

const PerformanceCard = dynamic(() => import('@/components/dashboard/performance-card'), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full rounded-2xl animate-pulse" />
});

const RecentTests = dynamic(() => import('@/components/dashboard/recent-tests'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-2xl animate-pulse" />
});

const LessonProgressList = dynamic(() => import('@/components/dashboard/lesson-progress-list'), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full rounded-2xl animate-pulse" />
});

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role?: string;
  organization_id?: string | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  created_at: string;
}

interface StudentDashboardProps {
  user: any;
  profile: UserProfile | null;
  isStudent?: boolean;
  onTabChange?: (tab: 'overview' | 'history' | 'profile' | 'settings' | 'subscription') => void;
}

interface TypingResult {
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
  };
}

interface ProgressRecord {
  id: string;
  lesson_id: string;
  completed: boolean;
  high_score_wpm: number;
  best_wpm?: number;
  accuracy?: number;
  updated_at: string;
}

interface Lesson {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  language: 'English' | 'Hindi';
}

interface OrgDetails {
  id: string;
  name: string;
  type: 'school' | 'institute';
  address?: string;
}

interface Assignment {
  id: string;
  class_id: string;
  lesson_id: string;
  title: string;
  target_wpm: number;
  target_accuracy: number;
  due_date?: string;
  lessons?: { title: string; language: string };
  classes_or_batches?: { name: string };
  completed?: boolean;
  scored_wpm?: number;
  scored_accuracy?: number;
}

interface LeaderboardEntry {
  display_name: string;
  high_wpm: number;
}

export default function StudentDashboard({ user, profile, isStudent = false, onTabChange }: StudentDashboardProps) {
  const router = useRouter();
  const [results, setResults] = useState<TypingResult[]>([]);
  const [progressList, setProgressList] = useState<ProgressRecord[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  // Organization and Multi-tenant states
  const [orgDetails, setOrgDetails] = useState<OrgDetails | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [classId, setClassId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch core lessons, progress, and typing results
        const [lessonsRes, progressRes, resultsRes] = await Promise.all([
          supabase.from('lessons').select('id, title, level, language').order('created_at', { ascending: true }),
          supabase.from('progress').select('*').eq('user_id', user.id),
          supabase.from('typing_results').select(`
            id, wpm, accuracy, mistakes, total_typed, duration, created_at,
            lessons ( id, title, language )
          `).eq('user_id', user.id).order('created_at', { ascending: true })
        ]);

        if (lessonsRes.error) throw lessonsRes.error;
        if (progressRes.error) throw progressRes.error;
        if (resultsRes.error) throw resultsRes.error;

        setLessons(lessonsRes.data || []);
        setProgressList((progressRes.data || []).map(p => ({ ...p, best_wpm: p.high_score_wpm, accuracy: 0 })));
        setResults(resultsRes.data as any[] || []);

        // 2. Fetch multi-tenant organization details if enrolled
        if (isStudent && profile?.organization_id) {
          const [orgRes, enrollRes] = await Promise.all([
            supabase.from('organizations').select('*').eq('id', profile.organization_id).single(),
            supabase.from('class_students').select('class_id').eq('student_id', user.id)
          ]);

          if (!orgRes.error) setOrgDetails(orgRes.data);
          
          const enrolledClassId = enrollRes.data?.[0]?.class_id;
          if (enrolledClassId) {
            setClassId(enrolledClassId);

            // Fetch assignments for this class
            const assignRes = await supabase
              .from('assignments')
              .select(`
                id, class_id, lesson_id, title, target_wpm, target_accuracy, due_date,
                lessons ( title, language ),
                classes_or_batches ( name )
              `)
              .eq('class_id', enrolledClassId);

            // Fetch submissions for assignments
            const submissionsRes = await supabase
              .from('assignment_submissions')
              .select('*')
              .eq('student_id', user.id);

            const submissionMap = new Map(
              (submissionsRes.data || []).map(sub => [sub.assignment_id, sub])
            );

            const mappedAssignments = (assignRes.data as any[] || []).map(assign => {
              const sub = submissionMap.get(assign.id);
              return {
                ...assign,
                completed: !!sub,
                scored_wpm: sub?.wpm,
                scored_accuracy: sub?.accuracy
              };
            });
            setAssignments(mappedAssignments);

            // Fetch class leaderboard
            const classStudentsRes = await supabase
              .from('class_students')
              .select('student_id')
              .eq('class_id', enrolledClassId);
            const studentIdsInClass = (classStudentsRes.data || []).map(s => s.student_id);

            if (studentIdsInClass.length > 0) {
              // Query profiles & high scores
              const classmatesRes = await supabase
                .from('users')
                .select('id, display_name, email')
                .in('id', studentIdsInClass);

              const classmatesData = classmatesRes.data || [];
              
              // Batch fetch all typing results for classmates in a single query
              const bestResultsRes = await supabase
                .from('typing_results')
                .select('user_id, wpm')
                .in('user_id', studentIdsInClass);

              const bestResultsMap = new Map<string, number>();
              (bestResultsRes.data || []).forEach((row: any) => {
                const currentBest = bestResultsMap.get(row.user_id) || 0;
                if (row.wpm > currentBest) {
                  bestResultsMap.set(row.user_id, row.wpm);
                }
              });

              const leaderboardData = classmatesData.map((classmate) => {
                const highWpm = bestResultsMap.get(classmate.id) || 0;
                return {
                  display_name: classmate.display_name || classmate.email?.split('@')[0] || 'Student',
                  high_wpm: Math.round(highWpm)
                };
              });

              // Sort leaderboard descending
              leaderboardData.sort((a, b) => b.high_wpm - a.high_wpm);
              setLeaderboard(leaderboardData);
            } else {
              setLeaderboard([]);
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching student dashboard:', err);
        setError('Failed to sync student telemetry from database.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user, isStudent, profile?.organization_id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-slate-950 min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]" />
        <p className="text-sm text-slate-400 font-semibold tracking-wider animate-pulse">Syncing personal student console...</p>
      </div>
    );
  }

  // Calculate aggregates
  const totalTests = results.length;
  const avgWpm = totalTests > 0 ? Math.round(results.reduce((acc, r) => acc + r.wpm, 0) / totalTests) : 0;
  const bestWpm = totalTests > 0 ? Math.max(...results.map((r) => r.wpm)) : 0;
  const avgAcc = totalTests > 0 ? Math.round(results.reduce((acc, r) => acc + r.accuracy, 0) / totalTests) : 0;
  const completedLessonsCount = progressList.filter((p) => p.completed).length;

  const totalTyped = results.reduce((acc, r) => acc + r.total_typed, 0);
  const totalMistakes = results.reduce((acc, r) => acc + r.mistakes, 0);

  const englishResults = results.filter((r) => r.lessons?.language === 'English');
  const englishAvgWpm = englishResults.length > 0
    ? Math.round(englishResults.reduce((acc, r) => acc + r.wpm, 0) / englishResults.length)
    : 0;

  const hindiResults = results.filter((r) => r.lessons?.language === 'Hindi');
  const hindiAvgWpm = hindiResults.length > 0
    ? Math.round(hindiResults.reduce((acc, r) => acc + r.wpm, 0) / hindiResults.length)
    : 0;

  const chartPoints = results.slice(-12).map((r) => ({
    wpm: Math.round(r.wpm),
    accuracy: Math.round(r.accuracy),
    date: new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }));

  // Subscription Plan Gates & Limits
  const plan = profile?.subscription_plan || 'Free Practice';
  const isStaffOrAdmin = ['admin', 'principal', 'staff'].includes(profile?.role || '');
  const isChartLocked = !isStaffOrAdmin && ['none', 'free practice', 'daily explorer'].includes(plan.toLowerCase());
  const isEliteLocked = !isStaffOrAdmin && plan.toLowerCase() !== 'elite typist';

  const limit = isStaffOrAdmin ? Infinity : plan === 'Free Practice' ? 10 : plan === 'Daily Explorer' ? 50 : Infinity;
  const truncatedResults = results.slice(-limit); // slice from end to show latest results
  const isHistoryLimited = !isStaffOrAdmin && results.length > limit;

  return (
    <div className="space-y-8 w-full text-left">
      {/* Alert Notifications */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-sm text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Multi-Tenant Organization Header */}
      {isStudent && orgDetails && (
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/10 p-5 md:p-6 backdrop-blur-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <School className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Enrolled Institute Deployment</span>
            </div>
            <h2 className="text-lg font-black text-white">{orgDetails.name}</h2>
            {orgDetails.address && (
              <p className="text-xs text-slate-500">{orgDetails.address}</p>
            )}
          </div>
          <span className="inline-flex rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-1 text-xs font-black text-cyan-400 uppercase tracking-widest">
            {orgDetails.type}
          </span>
        </div>
      )}

      {/* 4 Core Indicators grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Average Speed"
          value={avgWpm}
          unit="WPM"
          icon={Clock}
          color="cyan"
          description="Average across all attempts"
        />
        <StatsCard
          title="Personal Best"
          value={Math.round(bestWpm)}
          unit="WPM"
          icon={Zap}
          color="indigo"
          description="Your absolute record speed"
        />
        <StatsCard
          title="Avg Accuracy"
          value={`${avgAcc}%`}
          icon={Target}
          color="emerald"
          description="Mean accuracy rate achieved"
        />
        <StatsCard
          title="Completed Lessons"
          value={completedLessonsCount}
          unit={`/ ${lessons.length}`}
          icon={BookOpen}
          color="purple"
          description="Lessons marked fully completed"
        />
      </div>

      {/* Deep-dive Performance insights */}
      {totalTests > 0 && (
        <PerformanceCard
          bestWpm={bestWpm}
          avgWpm={avgWpm}
          avgAccuracy={avgAcc}
          totalTyped={totalTyped}
          totalMistakes={totalMistakes}
          englishAvgWpm={englishAvgWpm}
          hindiAvgWpm={hindiAvgWpm}
        />
      )}

      {/* Main Splits layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Side: Telemetry chart and Recent tests */}
        <div className="lg:col-span-2 space-y-8">
          {/* Interactive speed progression chart */}
          <div className="relative">
            <ProgressChart data={chartPoints} />
            
            {/* Locked Overlay */}
            {isChartLocked && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
                <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                  <Zap className="h-5 w-5 animate-pulse" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-black text-white">Progression Chart is Locked</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Interactive speed velocity curves and history tracking reports are locked on your current plan.
                  </p>
                </div>
                <button
                  onClick={() => onTabChange?.('subscription')}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-[10px] font-extrabold text-white shadow-md hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
                >
                  Upgrade to Pro Tactile
                </button>
              </div>
            )}
          </div>

          <div>
            <RecentTests results={truncatedResults} />
            {isHistoryLimited && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/20 p-4 text-center space-y-2 mt-4">
                <p className="text-[10px] text-slate-400 leading-none">
                  🔒 <strong>{results.length - limit} historical attempts are hidden</strong> on your current {plan} plan.
                </p>
                <button
                  onClick={() => onTabChange?.('subscription')}
                  className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Upgrade subscription to unlock unlimited logs →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Sidebar: Homework & Leaderboard or Lesson Progress */}
        <div className="lg:col-span-1 space-y-8">
          {/* Assignments / Homework Module */}
          {isStudent && (
            <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-6 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-1.5 border-b border-white/5 pb-4">
                <Clipboard className="h-4.5 w-4.5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-wide">My Homework Assignments</h3>
                  <p className="text-[10px] text-slate-500">Assigned typing tasks for your batch</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {assignments.length > 0 ? (
                  assignments.map(assign => (
                    <div key={assign.id} className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-3 relative group hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-white leading-snug group-hover:text-cyan-400 transition-colors">
                          {assign.title}
                        </h4>
                        
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[8px] font-black uppercase shrink-0 ${
                          assign.completed 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                        }`}>
                          {assign.completed ? 'Done' : 'Pending'}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 space-y-1 font-medium">
                        <div>Syllabus: {assign.lessons?.title}</div>
                        <div className="flex gap-2">
                          <span>Target: {assign.target_wpm} WPM</span>
                          <span>Min Acc: {assign.target_accuracy}%</span>
                        </div>
                      </div>

                      {assign.completed ? (
                        <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">Your score:</span>
                          <span className="font-bold text-emerald-400">{assign.scored_wpm} WPM ({assign.scored_accuracy}% Acc)</span>
                        </div>
                      ) : (
                        <Link 
                          href={`/lessons/${assign.lesson_id}?assignment_id=${assign.id}`}
                          className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-[10px] font-extrabold text-white shadow-md hover:from-cyan-400 hover:to-blue-500 transition-all"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Start Homework</span>
                        </Link>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500 font-medium text-xs">
                    No typing homework assigned. Standby for staff instructions.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Government Mock Exams Card */}
          <div className="relative rounded-3xl border border-white/5 bg-slate-900/10 p-6 backdrop-blur-sm space-y-6 overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-4">
              <Trophy className="h-4.5 w-4.5 text-amber-400" />
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-wide">Government Mock Exams</h3>
                <p className="text-[10px] text-slate-500">Official simulated SSC & state typing exams</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="inline-flex rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[8px] font-black text-cyan-400 uppercase">
                    English
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold">10 Mins</span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">SSC CHSL Mock Test - Pattern Alpha</h4>
              </div>

              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="inline-flex rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8px] font-black text-amber-400 uppercase">
                    Hindi
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold">5 Mins</span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">UPSSSC Krutidev 10 Touch Drill</h4>
              </div>
            </div>

            {/* Lock Overlay if not Elite Typist */}
            {isEliteLocked && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-3xl border border-white/5 flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
                <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <Trophy className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <div className="space-y-1 max-w-[200px]">
                  <h4 className="text-[11px] font-black text-white">Government Exams Locked</h4>
                  <p className="text-[9px] text-slate-450 leading-normal">
                    Official simulated exam modules are locked on your current plan.
                  </p>
                </div>
                <button
                  onClick={() => onTabChange?.('subscription')}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-3.5 py-2 text-[9px] font-extrabold text-white shadow-md hover:from-amber-400 hover:to-orange-500 transition-all cursor-pointer"
                >
                  Upgrade to Elite
                </button>
              </div>
            )}
          </div>

          {/* Classmates leaderboard */}
          {isStudent && leaderboard.length > 0 && (
            <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-6 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-1.5 border-b border-white/5 pb-4">
                <Trophy className="h-4.5 w-4.5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-wide">Classroom Leaderboard</h3>
                  <p className="text-[10px] text-slate-500">Batch speed rankings (WPM)</p>
                </div>
              </div>

              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((entry, index) => {
                  const isSelf = entry.display_name === profile?.display_name;
                  return (
                    <div 
                      key={entry.display_name} 
                      className={`rounded-2xl border px-4 py-3 flex justify-between items-center ${
                        isSelf 
                          ? 'border-cyan-500 bg-cyan-500/5' 
                          : 'border-white/5 bg-slate-950/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-black w-4 ${
                          index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-350' : index === 2 ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          #{index + 1}
                        </span>
                        <span className={`text-xs font-bold ${isSelf ? 'text-cyan-400 font-black' : 'text-white'}`}>
                          {entry.display_name} {isSelf && '(You)'}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-300">{entry.high_wpm} WPM</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Standard progress trackers (always visible as fallback/secondary widget) */}
          <LessonProgressList lessons={lessons} progressList={progressList} />
        </div>
      </div>
    </div>
  );
}
