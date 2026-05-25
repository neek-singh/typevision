import React from 'react';
import { Check, X } from 'lucide-react';

interface FeatureItemProps {
  text: string;
  included: boolean;
}

export default function FeatureItem({ text, included }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-2.5 text-xs text-left">
      <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
        included
          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
          : 'bg-slate-900/50 text-slate-500 border-white/5'
      }`}>
        {included ? (
          <Check className="h-2.5 w-2.5 stroke-[3px]" />
        ) : (
          <X className="h-2.5 w-2.5" />
        )}
      </div>
      <span className={included ? 'text-slate-300' : 'text-slate-500 line-through'}>
        {text}
      </span>
    </div>
  );
}
