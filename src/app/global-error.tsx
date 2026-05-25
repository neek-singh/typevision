'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorBoundary({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-50 antialiased min-h-screen flex items-center justify-center p-6 select-none font-sans">
        {/* Glow Sphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[300px] w-[300px] rounded-full bg-cyan-600/10 blur-[100px]"></div>

        <div className="w-full max-w-md relative bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 space-y-6 text-center shadow-[0_0_50px_rgba(6,182,212,0.05)] border-cyan-500/10">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-pulse">
              <AlertTriangle className="h-7 w-7" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Layout Integrity Compromised</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              A fatal crash occurred in the core HTML frame layer. Root layout nodes had to be terminated to protect application state.
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/80 border border-white/5 p-3 text-[11px] font-mono text-cyan-300 text-left overflow-x-auto whitespace-pre-wrap select-text">
            {error.message || 'Fatal layout rendering fault.'}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" /> Restart Main Frame
            </button>
            <a
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white border border-white/5 hover:border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition duration-200"
            >
              Sign Out & Reload Session
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
