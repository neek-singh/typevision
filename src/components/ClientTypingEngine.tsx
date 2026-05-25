'use client';

import dynamic from 'next/dynamic';
import { Shimmer } from '@/components/ui/shimmer';
import { Skeleton } from '@/components/ui/skeleton';

const DynamicTypingEngine = dynamic(() => import('@/components/TypingEngine'), {
  ssr: false,
  loading: () => (
    <div className="w-full space-y-3">
      {/* Stats Bar Shimmer */}
      <div className="flex flex-wrap items-center gap-6 border-b border-white/5 pb-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
      
      {/* Playground Area Shimmer */}
      <Shimmer className="min-h-[240px] flex items-center justify-center p-6 md:p-10">
        <Skeleton className="h-12 w-full max-w-xl" />
      </Shimmer>

      {/* Action Tray Shimmer */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-11 w-44 rounded-xl" />
      </div>
    </div>
  ),
});

export default DynamicTypingEngine;
