import React from 'react';
import { Sparkles } from 'lucide-react';

export default function PricingHeader() {
  return (
    <div className="text-center space-y-4 max-w-3xl mx-auto">
      {/* Glow Badge */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3.5 py-1 text-xs font-semibold text-cyan-400">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Simple, Transparent Plans</span>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
        Accelerate Your Typing Skills <br />
        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
          At Any Scale
        </span>
      </h1>

      {/* Description */}
      <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
        Choose a billing tier configured to your practice scope. Master standard English layout rows or prepare for governmental Hindi Krutidev writing contests.
      </p>
    </div>
  );
}
