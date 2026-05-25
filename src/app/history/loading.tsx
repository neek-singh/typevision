import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 min-h-screen">
      {/* Decorative Glow Circles */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]"></div>

      {/* Header bar skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-9 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>
      </div>

      {/* Visual Analytics indicators skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
        <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
        <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
        <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
      </div>

      {/* Table view skeleton */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-5 w-20 rounded" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
