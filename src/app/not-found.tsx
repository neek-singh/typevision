import Link from 'next/link';
import { Keyboard, ArrowLeft, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex-1 min-h-[calc(100vh-4rem)] w-full flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      {/* Dynamic Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[350px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[100px] opacity-75"></div>
      <div className="absolute bottom-1/4 left-1/3 -z-10 h-[250px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-[120px] opacity-60"></div>

      <div className="w-full max-w-lg space-y-8 rounded-3xl border border-white/10 bg-slate-950/60 p-8 sm:p-10 shadow-2xl backdrop-blur-md text-center">
        {/* Animated Icon Grid */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)] relative">
          <HelpCircle className="h-10 w-10 animate-bounce" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
          </span>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-950/20 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-400">
            Error 404
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Page Not Found
          </h1>
          <p className="mx-auto max-w-md text-sm text-slate-400 leading-relaxed">
            The requested typing path does not exist, or has been relocated to another tactile module. Double check the address or return home.
          </p>
        </div>

        {/* Visual Terminal/Editor Mockup to match the theme */}
        <div className="rounded-xl border border-white/5 bg-slate-900/40 p-4 font-mono text-[11px] text-left space-y-1 text-slate-500">
          <div className="flex items-center gap-1.5 border-b border-white/5 pb-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-[9px] ml-1">router-exception.log</span>
          </div>
          <div><span className="text-rose-400">GET</span> /path-not-found - <span className="text-rose-400">404</span></div>
          <div><span className="text-slate-600">Error:</span> Module evaluation failed. Target path is not resolved.</div>
          <div><span className="text-cyan-400">Action:</span> Redirecting user interaction to primary tactile dashboard...</div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/lessons"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-900 hover:border-white/20 px-6 py-3.5 text-sm font-bold text-white transition-all duration-200"
          >
            <Keyboard className="h-4 w-4 text-cyan-400" />
            Browse Lessons
          </Link>
        </div>
      </div>
    </div>
  );
}
