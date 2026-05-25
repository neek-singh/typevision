'use client';

import Link from 'next/link';
import { Flame, Globe, Languages, ArrowRight, Keyboard } from 'lucide-react';

export default function PracticeLanding() {
  return (
    <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 w-full min-h-screen flex flex-col items-center justify-center">
      {/* Background decorations */}
      <div className="absolute top-1/3 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[300px] w-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3.5 py-1 text-xs font-semibold text-cyan-400 mb-6">
        <Flame className="h-3.5 w-3.5 animate-pulse" />
        <span>Practice Arena</span>
      </div>

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight text-center mb-3">
        Quick Practice
      </h1>
      <p className="text-center text-slate-400 text-sm sm:text-base max-w-md mb-14">
        Choose your preferred language and start improving your typing speed and accuracy right away.
      </p>

      {/* Language Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* English Card */}
        <Link
          href="/practice/english"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-8 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all duration-300 flex flex-col gap-5 backdrop-blur-sm shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1"
        >
          {/* Glow on hover */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-1">English Typing</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Practice with English paragraphs ranging from beginner to advanced levels. Master touch typing on the QWERTY layout.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <span
                key={level}
                className="rounded-full bg-slate-800 border border-white/5 px-2.5 py-0.5 text-xs font-semibold text-slate-400"
              >
                {level}
              </span>
            ))}
          </div>
        </Link>

        {/* Hindi Card */}
        <Link
          href="/practice/hindi"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-8 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all duration-300 flex flex-col gap-5 backdrop-blur-sm shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
        >
          {/* Glow on hover */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Languages className="h-6 w-6 text-white" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-1">Hindi Typing</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Practice Hindi Krutidev typing using the legacy Remington typewriter layout. Improve your speed in Devanagari script.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <span
                key={level}
                className="rounded-full bg-slate-800 border border-white/5 px-2.5 py-0.5 text-xs font-semibold text-slate-400"
              >
                {level}
              </span>
            ))}
          </div>
        </Link>
      </div>

      {/* Bottom tip */}
      <div className="mt-12 flex items-center gap-2 text-xs text-slate-500">
        <Keyboard className="h-4 w-4" />
        <span>Select a language to start your typing practice session</span>
      </div>
    </div>
  );
}
