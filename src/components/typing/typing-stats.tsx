'use client';

import { useTypingStore } from '@/store/typing-store';
import { Zap, Target, AlertTriangle } from 'lucide-react';

export default function TypingStats() {
  const { mistakes, getWpm, getAccuracy } = useTypingStore();

  const wpm = getWpm();
  const accuracy = getAccuracy();

  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-900/40 p-4 shadow-sm">
        <Zap className="h-5 w-5 text-cyan-400" />
        <div>
          <p className="text-xs font-semibold text-slate-400">Speed (WPM)</p>
          <h4 className="text-xl font-bold text-white transition-all duration-200">{wpm}</h4>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-900/40 p-4 shadow-sm">
        <Target className="h-5 w-5 text-emerald-400" />
        <div>
          <p className="text-xs font-semibold text-slate-400">Accuracy</p>
          <h4 className="text-xl font-bold text-white transition-all duration-200">{accuracy}%</h4>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-900/40 p-4 shadow-sm">
        <AlertTriangle className="h-5 w-5 text-rose-400" />
        <div>
          <p className="text-xs font-semibold text-slate-400">Mistakes</p>
          <h4 className="text-xl font-bold text-white">{mistakes}</h4>
        </div>
      </div>
    </div>
  );
}
