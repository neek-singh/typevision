'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?tab=profile');
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-slate-950 min-h-screen">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-[0_0_15px_rgba(34,211,238,0.2)]"></div>
      <p className="text-xs text-slate-400 font-semibold tracking-wider animate-pulse">Redirecting to Dashboard Profile...</p>
    </div>
  );
}
