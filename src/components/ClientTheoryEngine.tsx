'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const DynamicTheoryEngine = dynamic(() => import('@/components/TheoryEngine'), {
  ssr: false,
  loading: () => (
    <div className="w-full relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/10 p-8 space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
        <div className="h-8 w-48 bg-slate-800 rounded-xl" />
        <div className="h-6 w-32 bg-slate-800 rounded-xl" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-slate-800 rounded-lg" />
        <div className="h-4 w-full bg-slate-800 rounded-lg" />
        <div className="h-4 w-3/4 bg-slate-800 rounded-lg" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-10 w-32 bg-slate-800 rounded-xl" />
        <div className="h-10 w-44 bg-slate-800 rounded-xl" />
      </div>
    </div>
  ),
});

export default DynamicTheoryEngine;
