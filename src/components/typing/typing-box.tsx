'use client';

import { useEffect, useRef } from 'react';
import { useTypingStore } from '@/store/typing-store';
import TypingText from './typing-text';
import TypingStats from './typing-stats';
import TypingTimer from './typing-timer';
import { RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';

interface TypingBoxProps {
  initialText: string;
  timeLimit?: number;
  onComplete?: (stats: { wpm: number; accuracy: number; mistakes: number }) => void;
}

export default function TypingBox({ initialText, timeLimit = 60, onComplete }: TypingBoxProps) {
  const {
    typedText,
    isActive,
    isCompleted,
    initialize,
    typeChar,
    deleteChar,
    tick,
    reset,
    getWpm,
    getAccuracy,
    mistakes,
  } = useTypingStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize store with text and time limit
  useEffect(() => {
    initialize(initialText, timeLimit);
  }, [initialText, timeLimit, initialize]);

  // Handle live ticking clock
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isCompleted, tick]);

  // Capture global keydown events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      // Prevent system standard shortcut triggers
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        deleteChar();
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
      }

      if (e.key.length === 1) {
        e.preventDefault();
        typeChar(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCompleted, typeChar, deleteChar]);

  // Trigger completion callback
  useEffect(() => {
    if (isCompleted && onComplete) {
      onComplete({
        wpm: getWpm(),
        accuracy: getAccuracy(),
        mistakes,
      });
    }
  }, [isCompleted, onComplete, getWpm, getAccuracy, mistakes]);

  const handleRestart = () => {
    reset();
  };

  return (
    <div className="w-full space-y-6" ref={containerRef}>
      {/* Top Header Hub */}
      <div className="flex items-center justify-between gap-4">
        <TypingTimer />
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 hover:border-white/20 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4" />
          Restart Test
        </button>
      </div>

      {/* Typing Container */}
      <div className="relative min-h-[160px] rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl transition-all duration-300 md:p-8">
        {!isActive && !isCompleted && typedText.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 rounded-2xl z-10 backdrop-blur-sm">
            <p className="animate-pulse text-sm font-semibold tracking-wide text-cyan-400">
              Start typing on your keyboard to begin countdown...
            </p>
          </div>
        )}

        <TypingText />

        {isCompleted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 rounded-2xl z-10 backdrop-blur-sm space-y-4">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">Test Completed!</h3>
            <div className="flex gap-6 text-sm font-semibold">
              <span className="text-cyan-400">Speed: {getWpm()} WPM</span>
              <span className="text-emerald-400">Accuracy: {getAccuracy()}%</span>
              <span className="text-rose-400">Mistakes: {mistakes}</span>
            </div>
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              Try Again
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Live metrics display */}
      <TypingStats />
    </div>
  );
}
