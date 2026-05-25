import Link from 'next/link';
import { Keyboard, Shield, Zap, Target, BookOpen, Star, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex flex-col justify-center items-center overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[100px] opacity-70"></div>
      <div className="absolute bottom-1/4 left-1/3 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px] opacity-60"></div>

      <div className="mx-auto max-w-5xl text-center space-y-8">

        {/* Premium Brand Badge */}
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-950/40 px-4 py-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider glow-cyan">
          <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
          English & Hindi Krutidev Support
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
          Master Your Typing with <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            TypeVision
          </span>
        </h1>

        {/* Hero Subhead */}
        <p className="mx-auto max-w-2xl text-lg text-slate-400">
          Supercharge your finger dexterity. Learn standard QWERTY touch typing or legacy Remington Hindi Krutidev layout with our highly responsive web typing engine and real-time accuracy charts.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/lessons"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-base font-bold text-white shadow-xl hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 transition-all duration-200"
          >
            <BookOpen className="h-5 w-5" />
            Browse Lessons
          </Link>
          <Link
            href="/practice"
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-8 py-4 text-base font-bold text-white hover:bg-slate-800 hover:border-white/20 transition-all duration-200"
          >
            <Keyboard className="h-5 w-5" />
            Quick Practice
          </Link>
        </div>

        {/* Visual Showcase Card */}
        <div className="relative mt-12 rounded-3xl border border-white/10 bg-slate-950/70 p-6 md:p-10 shadow-2xl backdrop-blur-md">
          {/* Top Bar Mockup */}
          <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500"></span>
              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
              <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          {/* Typing Area Preview */}
          <div className="text-left space-y-4 font-mono text-base md:text-lg">
            <div className="text-slate-500">
              <span className="text-emerald-400">the</span>{' '}
              <span className="text-emerald-400">quick</span>{' '}
              <span className="text-emerald-400">brown</span>{' '}
              <span className="text-rose-400 border-b border-rose-500 font-semibold bg-rose-500/10">f</span>
              <span className="text-cyan-400 border-b-2 border-cyan-400 animate-pulse font-bold bg-cyan-400/20">o</span>
              <span>x jumps over the lazy dog. typing regularly builds flawless muscle memory.</span>
            </div>
            {/* Visual stats indicators */}
            <div className="flex flex-wrap gap-4 pt-6">
              <div className="rounded-xl bg-slate-900/80 px-4 py-3 border border-white/5">
                <span className="block text-xs font-semibold text-slate-400">SPEED</span>
                <span className="text-xl font-bold text-cyan-400">74 WPM</span>
              </div>
              <div className="rounded-xl bg-slate-900/80 px-4 py-3 border border-white/5">
                <span className="block text-xs font-semibold text-slate-400">ACCURACY</span>
                <span className="text-xl font-bold text-emerald-400">98.5%</span>
              </div>
              <div className="rounded-xl bg-slate-900/80 px-4 py-3 border border-white/5">
                <span className="block text-xs font-semibold text-slate-400">ERRORS</span>
                <span className="text-xl font-bold text-rose-400">1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 pt-12">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 text-left">
            <Zap className="h-8 w-8 text-cyan-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Dual Layout Support</h3>
            <p className="text-sm text-slate-400">
              Switch seamlessly between English QWERTY and Hindi Krutidev typing lessons depending on your goals or state typing exam requirements.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 text-left">
            <Target className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Real-Time Analytics</h3>
            <p className="text-sm text-slate-400">
              Your speed (WPM) and accuracy are calculated live as you type. Get instant feedback on your progress.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 text-left">
            <Shield className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Supabase Sync</h3>
            <p className="text-sm text-slate-400">
              Log in to store your best typing speeds, track lesson completion rates, and view your history charts securely over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
