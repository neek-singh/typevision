'use client';

import React from 'react';
import { Award, TrendingUp, Keyboard, Activity } from 'lucide-react';

interface PerformanceCardProps {
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
  totalTyped: number;
  totalMistakes: number;
  englishAvgWpm: number;
  hindiAvgWpm: number;
}

export default function PerformanceCard({
  bestWpm,
  avgWpm,
  avgAccuracy,
  totalTyped,
  totalMistakes,
  englishAvgWpm,
  hindiAvgWpm,
}: PerformanceCardProps) {
  // Determine Typing Rank details
  const getRankDetails = (wpm: number) => {
    if (wpm < 20) {
      return {
        name: 'Novice',
        desc: 'Just starting out. Practice finger placement on the Home Row keys!',
        color: 'from-slate-500 to-slate-400',
        glow: 'shadow-slate-500/10',
        nextRank: 'Casual Typist',
        nextTarget: 20,
        progress: (wpm / 20) * 100,
      };
    } else if (wpm < 40) {
      return {
        name: 'Casual Typist',
        desc: 'Great! You have basic familiarity. Keep practicing to build muscle memory.',
        color: 'from-amber-500 to-orange-400',
        glow: 'shadow-orange-500/15',
        nextRank: 'Intermediate',
        nextTarget: 40,
        progress: ((wpm - 20) / 20) * 100,
      };
    } else if (wpm < 60) {
      return {
        name: 'Intermediate',
        desc: 'Solid speed! You are typing faster than the average person. Aim for professional levels.',
        color: 'from-emerald-500 to-teal-400',
        glow: 'shadow-emerald-500/15',
        nextRank: 'Professional',
        nextTarget: 60,
        progress: ((wpm - 40) / 20) * 100,
      };
    } else if (wpm < 80) {
      return {
        name: 'Professional',
        desc: 'Outstanding speed! Your dexterity is exceptional. Keep your accuracy near 98%.',
        color: 'from-cyan-500 to-blue-500',
        glow: 'shadow-cyan-500/20 border-cyan-500/20',
        nextRank: 'Typing Legend',
        nextTarget: 80,
        progress: ((wpm - 60) / 20) * 100,
      };
    } else {
      return {
        name: 'Typing Legend',
        desc: 'Phenomenal! Your fingers fly across the keys like a wizard. You have mastered touch typing.',
        color: 'from-purple-500 via-indigo-500 to-pink-500',
        glow: 'shadow-purple-500/30 border-purple-500/30 animate-pulse-slow',
        nextRank: 'Grandmaster Limit',
        nextTarget: 120,
        progress: Math.min(((wpm - 80) / 40) * 100, 100),
      };
    }
  };

  const rank = getRankDetails(bestWpm);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* 1. Skill Rank & Level Progression Card */}
      <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between ${rank.glow}`}>
        <div className="absolute -right-6 -bottom-6 -z-10 h-24 w-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl"></div>

        <div>
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-cyan-400" />
              Typing Rank
            </h3>
            <span className={`inline-flex rounded-xl bg-gradient-to-r ${rank.color} px-3.5 py-1 text-xs font-extrabold tracking-wide text-white uppercase shadow-md`}>
              {rank.name}
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            {rank.desc}
          </p>
        </div>

        {/* Progress Bar towards Next Bracket */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-bold">
            <span>Next Bracket: <span className="text-white font-extrabold">{rank.nextRank}</span></span>
            <span>{Math.round(bestWpm)} / {rank.nextTarget} WPM</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-white/5 p-0.5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${rank.color} transition-all duration-1000`}
              style={{ width: `${Math.max(rank.progress, 5)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Key Insights & Language Breakdown Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between">
        <div className="absolute -right-6 -bottom-6 -z-10 h-24 w-24 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-full blur-xl"></div>

        <div>
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Performance Insights
            </h3>
          </div>

          {/* Indicators list */}
          <div className="space-y-4">
            {/* English Speed */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 font-semibold text-slate-300">
                <Keyboard className="h-4 w-4 text-cyan-400" />
                <span>English QWERTY Average</span>
              </div>
              <span className="font-bold text-white">
                {englishAvgWpm > 0 ? `${englishAvgWpm} WPM` : '--'}
              </span>
            </div>

            {/* Hindi Speed */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 font-semibold text-slate-300">
                <Keyboard className="h-4 w-4 text-purple-400" />
                <span>Hindi Krutidev Average</span>
              </div>
              <span className="font-bold text-white">
                {hindiAvgWpm > 0 ? `${hindiAvgWpm} WPM` : '--'}
              </span>
            </div>

            {/* Key Volume */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 font-semibold text-slate-300">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span>Total Keys Pressed</span>
              </div>
              <span className="font-bold text-white">
                {totalTyped.toLocaleString()}
              </span>
            </div>

            {/* Accuracy and Mistakes */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 font-semibold text-slate-300">
                <Activity className="h-4 w-4 text-rose-400" />
                <span>Mistakes Ratio</span>
              </div>
              <span className="font-bold text-rose-400">
                {totalTyped > 0 ? `${((totalMistakes / totalTyped) * 100).toFixed(1)}%` : '0.0%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
