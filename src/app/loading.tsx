import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-slate-950 min-h-[50vh]">
      <LoadingSpinner size="lg" text="Loading TypeVision..." />
    </div>
  );
}
