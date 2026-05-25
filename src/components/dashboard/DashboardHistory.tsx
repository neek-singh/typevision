'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/utils/supabase';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchWithCache } from '@/lib/cache/cache-utils';
import type { TypingResult } from '@/components/history/history-table';

// Dynamic lazy imports
const HistoryStats = dynamic(() => import('@/components/history/history-stats'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
      <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
      <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
      <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
    </div>
  ),
});

const HistoryTable = dynamic(() => import('@/components/history/history-table'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <Skeleton className="h-5 w-40 rounded" />
        <Skeleton className="h-5 w-20 rounded" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  ),
});

export default function DashboardHistory() {
  const { user, initialized } = useAuthStore();
  const [results, setResults] = useState<TypingResult[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch full test history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setDataLoading(true);
      try {
        const dbResults = await fetchWithCache(`typing-results-${user.id}`, async () => {
          const { data: tryData, error: tryError } = await supabase
            .from('typing_results')
            .select(`
              id, wpm, accuracy, mistakes, total_typed, duration, created_at,
              lessons ( id, title, language )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (tryError) {
            console.warn('Failing back to querying typing_results without lessons join:', tryError);
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('typing_results')
              .select('id, wpm, accuracy, mistakes, total_typed, duration, created_at, lesson_id')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });

            if (fallbackError) throw fallbackError;

            // Map lesson names if possible by querying lessons
            try {
              const { data: lessonsData } = await supabase
                .from('lessons')
                .select('id, title, language');
              if (lessonsData) {
                const lessonsMap = new Map(lessonsData.map((l) => [l.id, l]));
                return (fallbackData || []).map((r: any) => {
                  if (r.lesson_id) {
                    const lesson = lessonsMap.get(r.lesson_id);
                    if (lesson) {
                      return {
                        ...r,
                        lessons: {
                          id: lesson.id,
                          title: lesson.title,
                          language: lesson.language
                        }
                      };
                    }
                  }
                  return { ...r, lessons: null };
                });
              }
            } catch (e) {
              console.error('Error fetching lessons fallback mapping in history:', e);
            }
            return (fallbackData || []).map((r: any) => ({ ...r, lessons: null }));
          }

          return (tryData || []).map((r: any) => ({
            ...r,
            lessons: r.lessons || null
          }));
        }, 15000);

        setResults((dbResults as unknown as TypingResult[]) || []);
      } catch (err) {
        console.error('Failed to fetch typing history:', err);
      } finally {
        setDataLoading(false);
      }
    };

    if (initialized && user) {
      fetchHistory();
    }
  }, [user, initialized]);

  // Standard high-fidelity loader
  if (dataLoading && results.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-12 text-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-[0_0_15px_rgba(34,211,238,0.2)] mx-auto"></div>
        <p className="text-xs text-slate-400 font-semibold tracking-wider animate-pulse">Syncing WPM records...</p>
      </div>
    );
  }

  // Calculate aggregates
  const totalTests = results.length;
  const avgWpm = totalTests > 0 ? Math.round(results.reduce((acc, r) => acc + r.wpm, 0) / totalTests) : 0;
  const bestWpm = totalTests > 0 ? Math.max(...results.map((r) => r.wpm)) : 0;
  const avgAcc = totalTests > 0 ? Math.round(results.reduce((acc, r) => acc + r.accuracy, 0) / totalTests) : 0;

  // Pagination bounds
  const totalPages = Math.ceil(totalTests / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="relative w-full space-y-8 text-left">
      {/* Decorative Glow Circles */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]"></div>

      {/* Title bar */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Practice History</h2>
        <p className="text-xs text-slate-400 mt-1">Complete historical logs of your typing tests and speed records.</p>
      </div>

      {/* Dynamic Stats Indicators Panel */}
      <HistoryStats
        totalTests={totalTests}
        avgWpm={avgWpm}
        bestWpm={bestWpm}
        avgAcc={avgAcc}
      />

      {/* History logs block */}
      {totalTests === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-12 text-center space-y-4">
          <Clock className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No historical results found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            You haven't run any typing tests yet. Visit the practice room or course chapters to run attempts.
          </p>
          <Link
            href="/lessons"
            prefetch={true}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            Start Practicing
          </Link>
        </div>
      ) : (
        <HistoryTable
          currentItems={currentItems}
          totalPages={totalPages}
          currentPage={currentPage}
          totalTests={totalTests}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
        />
      )}
    </div>
  );
}
