import React from 'react';
import FeatureItem from './feature-item';
import { LucideIcon } from 'lucide-react';

interface PricingCardProps {
  title: string;
  price: string;
  originalPrice?: string;
  savingsText?: string;
  period: string;
  description: string;
  features: Array<{ text: string; included: boolean }>;
  recommended: boolean;
  ctaText: string;
  icon: LucideIcon;
  onSelect?: () => void;
}

export default function PricingCard({
  title,
  price,
  originalPrice,
  savingsText,
  period,
  description,
  features,
  recommended,
  ctaText,
  icon: Icon,
  onSelect,
}: PricingCardProps) {
  return (
    <div className={`relative flex flex-col justify-between rounded-3xl border p-6 sm:p-8 backdrop-blur-md transition-all duration-300 group hover:-translate-y-1.5 hover:shadow-2xl ${
      recommended
        ? 'border-cyan-500 bg-slate-900/50 shadow-[0_0_30px_rgba(34,211,238,0.1)]'
        : 'border-white/5 bg-slate-900/20 hover:border-white/10'
    }`}>
      {/* Recommended badge */}
      {recommended && (
        <span className="absolute -top-3.5 right-6 inline-flex rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase shadow-md shadow-cyan-500/20">
          Recommended
        </span>
      )}

      {/* Card Body */}
      <div className="space-y-6">
        {/* Title & Icon Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1.5 text-left">
            <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
            <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">{description}</p>
          </div>
          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center border shrink-0 transition-transform duration-300 group-hover:scale-110 ${
            recommended
              ? 'bg-cyan-950/50 border-cyan-500/20 text-cyan-400'
              : 'bg-slate-900/50 border-white/5 text-slate-400'
          }`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Price section */}
        <div className="border-y border-white/5 py-5 text-left">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-1.5">
              {originalPrice && (
                <span className="text-sm font-semibold text-slate-500 line-through tracking-tight mr-1">
                  {originalPrice}
                </span>
              )}
              <span className="text-4xl font-extrabold text-white tracking-tight">{price}</span>
              {period && <span className="text-xs font-semibold text-slate-500">/{period}</span>}
            </div>
            {savingsText && (
              <div className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 animate-pulse">
                {savingsText}
              </div>
            )}
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-3.5 pt-1">
          {features.map((feature, i) => (
            <FeatureItem
              key={i}
              text={feature.text}
              included={feature.included}
            />
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-8">
        {recommended ? (
          <button
            onClick={onSelect}
            className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 transition-all cursor-pointer"
          >
            {ctaText}
          </button>
        ) : (
          <button
            onClick={onSelect}
            className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 py-3.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:border-white/20 transition-all cursor-pointer"
          >
            {ctaText}
          </button>
        )}
      </div>
    </div>
  );
}
