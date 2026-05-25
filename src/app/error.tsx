'use client';

import { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { user } = useAuthStore();

  useEffect(() => {
    console.error('Unhandled route compilation or render error:', error);

    // Asynchronously report runtime error telemetry to Supabase
    const logErrorToSupabase = async () => {
      try {
        const error_message = error?.message || String(error) || 'Unknown error';
        const stack_trace = error?.stack || null;
        const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
        const user_id = user?.id || null;

        await supabase.from('system_errors').insert([
          {
            error_message,
            stack_trace,
            pathname,
            user_id,
          }
        ]);
        console.log('Runtime error successfully reported to Admin Monitoring Panel.');
      } catch (err) {
        console.error('Failed to dispatch error telemetry:', err);
      }
    };

    logErrorToSupabase();
  }, [error, user]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-6 px-4 py-20 text-center bg-slate-950 min-h-[60vh]">
      <div className="h-16 w-16 rounded-2xl bg-rose-950/40 border border-rose-500/25 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)] animate-bounce">
        <AlertTriangle className="h-8 w-8" />
      </div>
      
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Something went wrong!</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          An unexpected error occurred during execution. We have logged the telemetry and are ready to recover.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Attempt Recovery
        </button>
        <Link
          href="/"
          className="rounded-xl border border-white/10 bg-slate-900 px-6 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:border-white/20 transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
