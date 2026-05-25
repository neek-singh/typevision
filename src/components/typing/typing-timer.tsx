'use client';

import { useTypingStore } from '@/store/typing-store';
import { Clock } from 'lucide-react';

export default function TypingTimer() {
  const timeLeft = useTypingStore((state) => state.timeLeft);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-slate-900/40 px-4 py-3 shadow-sm text-slate-300">
      <Clock className="h-4 w-4 text-purple-400" />
      <span className="text-sm font-bold">{formatTime(timeLeft)}</span>
    </div>
  );
}
