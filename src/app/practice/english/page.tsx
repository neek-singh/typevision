'use client';

import { useState, useEffect } from 'react';
import { Globe, Shuffle, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Shimmer } from '@/components/ui/shimmer';
import { Skeleton } from '@/components/ui/skeleton';

const TypingEngine = dynamic(() => import('@/components/TypingEngine'), {
  ssr: false,
  loading: () => (
    <div className="w-full space-y-3">
      {/* Stats Bar Shimmer */}
      <div className="flex flex-wrap items-center gap-6 border-b border-white/5 pb-2">
        <Skeleton className="h-6 w-24 animate-pulse" />
        <Skeleton className="h-6 w-28 animate-pulse" />
        <Skeleton className="h-6 w-20 animate-pulse" />
        <Skeleton className="h-6 w-20 animate-pulse" />
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

const ENGLISH_PARAGRAPHS = {
  Beginner: [
    'asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl;',
    'qwert poiuy qwert poiuy qwert poiuy qwert poiuy qwert poiuy qwert poiuy qwert poiuy qwert poiuy',
    'zxcvb /.,mn zxcvb /.,mn zxcvb /.,mn zxcvb /.,mn zxcvb /.,mn zxcvb /.,mn zxcvb /.,mn zxcvb /.,mn',
  ],
  Intermediate: [
    'regular typing practice builds muscle memory and improves both speed and accuracy. focus on keeping your wrists straight and placing your fingers on the home row keys at all times.',
    'the digital world relies heavily on keyboard communication. writing clean code or preparing reports requires fluent touch typing skills to reduce physical strain and complete tasks faster.',
    'success is not the key to happiness. happiness is the key to success. if you love what you are doing, you will be successful in mastering typing or any other programming discipline you pursue.',
  ],
  Advanced: [
    'the advancement of artificial intelligence and machine learning is reshaping the technological landscape. software engineering practices are evolving rapidly, requiring continuous adaptation and robust system design skills from developers worldwide.',
    'time is a created thing. to say I do not have time, is like saying, I do not want to. our focus should be on prioritizing high impact creative actions rather than running behind minor distractions in our daily lives.',
    'continuous improvement is better than delayed perfection. dedicate fifteen minutes everyday to test your typing limit and you will witness an outstanding acceleration in your daily workflow.',
  ],
};

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export default function EnglishPractice() {
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [paragraph, setParagraph] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const list = ENGLISH_PARAGRAPHS[difficulty];
    const randomIndex = Math.floor(Math.random() * list.length);
    setParagraph(list[randomIndex]);
    setIndex(randomIndex);
  }, [difficulty]);

  const handleShuffle = () => {
    const list = ENGLISH_PARAGRAPHS[difficulty];
    let nextIndex = Math.floor(Math.random() * list.length);
    if (list.length > 1 && nextIndex === index) {
      nextIndex = (nextIndex + 1) % list.length;
    }
    setParagraph(list[nextIndex]);
    setIndex(nextIndex);
  };

  return (
    <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 w-full space-y-4 min-h-screen">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[100px]" />

      {/* Header — Left title | Right controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-3">
        {/* Left: Title only */}
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight sm:text-2xl flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-400" />
            English Typing
          </h1>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Difficulty Selector */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
            {(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  difficulty === level
                    ? 'bg-transparent text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.1)]'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Shuffle button */}
          <button
            onClick={handleShuffle}
            title="Randomize Text"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-all duration-200"
          >
            <Shuffle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Typing Playground — moved up, bigger */}
      {paragraph && (
        <TypingEngine
          key={`english-${difficulty}-${index}`}
          initialText={paragraph}
          language="English"
        />
      )}

      {/* Typing Tip */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white">Touch Typing Quick Tip</h4>
        </div>
        <p className="text-xs leading-relaxed text-slate-400">
          Focus on accuracy rather than pure speed. Keep your fingers resting on the home row (A-S-D-F for left hand, J-K-L-; for right hand) and do not look down at your keyboard.
        </p>
      </div>
    </div>
  );
}
