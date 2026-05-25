'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { CreditCard, Check, ShieldAlert, Sparkles, BookOpen, Zap, School, Loader2 } from 'lucide-react';

export default function DashboardSubscription() {
  const { user, profile, updateSubscription } = useAuthStore();
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null);

  const activePlanName = profile?.subscription_plan || 'Free Practice';
  const activePlanStatus = profile?.subscription_status || 'active';

  const plans = [
    {
      name: 'Free Practice',
      price: '₹0',
      period: 'forever',
      description: 'Core row exercises and basic metrics trackers for starters.',
      icon: BookOpen,
      features: [
        'English typing practice & lessons',
        'Hindi Krutidev keyboard support',
        'Real-time WPM speed & accuracy',
        'Latest 10 typing history logs',
      ],
    },
    {
      name: 'Daily Explorer',
      price: '₹199',
      period: 'month',
      description: 'Perfect for casual learners focusing on daily drills.',
      icon: Zap,
      features: [
        'English & Hindi typing support',
        'Real-time WPM speed & accuracy',
        'Latest 50 typing history logs',
        'Daily explorer badge',
      ],
    },
    {
      name: 'Pro Tactile',
      price: '₹799',
      period: 'month',
      description: 'Unlimited access to complex layout chapters & stats.',
      icon: Sparkles,
      recommended: true,
      features: [
        'Everything in Daily Explorer',
        'Unlimited typing history logs',
        'Custom paragraph/text uploads',
        'Interactive speed progression charts',
      ],
    },
    {
      name: 'Elite Typist',
      price: '₹1,499',
      period: 'month',
      description: 'For competitive champions preparing for governmental exams.',
      icon: School,
      features: [
        'Everything in Pro Tactile',
        'Simulated government typing exams',
        'Exclusive speed booster courses',
        'Typing certificate generation',
      ],
    },
  ];

  const handleUpgrade = async (planName: string) => {
    setUpgradingTo(planName);
    try {
      // Simulate payment gateway delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const { error } = await updateSubscription(planName, 'active');
      if (error) {
        alert('Failed to upgrade plan. Please try again.');
        console.error('Upgrade plan error:', error);
      } else {
        alert(`Successfully upgraded to ${planName}!`);
      }
    } catch (err) {
      console.error('Upgrade threw error:', err);
    } finally {
      setUpgradingTo(null);
    }
  };

  return (
    <div className="relative w-full space-y-8 text-left">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]"></div>

      {/* Header bar */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Subscription Plan</h2>
        <p className="text-xs text-slate-400 mt-1">Manage your active platform access subscription and unlock elite features.</p>
      </div>

      {/* Active Subscription Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-900/10 p-6 md:p-8 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute -right-16 -top-16 -z-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl opacity-70"></div>
        
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            <CreditCard className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">Active Plan: <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{activePlanName}</span></h3>
              <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-widest animate-pulse">
                {activePlanStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Account: {user?.email} • Role: <span className="capitalize font-semibold text-slate-350">{profile?.role || 'user'}</span>
            </p>
          </div>
        </div>

        {activePlanName === 'Free Practice' && (
          <div className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-500/25 bg-amber-950/20 px-4 py-2.5 text-xs font-bold text-amber-400 shrink-0">
            <ShieldAlert className="h-4 w-4" />
            <span>Limited Features Mode</span>
          </div>
        )}
      </div>

      {/* Plans Upgrade Choices */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-white tracking-wide">Available Subscription Tiers</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {upgradingTo && (
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex flex-col items-center justify-center rounded-3xl gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]" />
              <p className="text-xs font-bold text-slate-350 tracking-wider">Processing secure subscription context...</p>
            </div>
          )}

          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const isActive = activePlanName.toLowerCase() === plan.name.toLowerCase();
            return (
              <div 
                key={plan.name}
                className={`relative rounded-3xl border p-5 flex flex-col justify-between backdrop-blur-sm group hover:-translate-y-1 transition-all ${
                  isActive 
                    ? 'border-cyan-500 bg-cyan-950/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
                    : plan.recommended
                      ? 'border-white/10 bg-slate-900/30'
                      : 'border-white/5 bg-slate-900/10 hover:border-white/10'
                }`}
              >
                {/* Recommended Tag */}
                {plan.recommended && !isActive && (
                  <span className="absolute -top-3 right-4 inline-flex rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-2.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider shadow-md shadow-cyan-500/20">
                    Popular
                  </span>
                )}

                <div className="space-y-4">
                  {/* Icon & Title */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white leading-none">{plan.name}</span>
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center border shrink-0 transition-transform ${
                      isActive 
                        ? 'bg-cyan-950 border-cyan-500/20 text-cyan-400' 
                        : 'bg-slate-900 border-white/5 text-slate-400'
                    }`}>
                      <PlanIcon className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-left">
                    <span className="text-2xl font-black text-white">{plan.price}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">/{plan.period}</span>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal text-left">{plan.description}</p>

                  {/* Feature Lists */}
                  <ul className="space-y-2 border-t border-white/5 pt-4 text-left">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[10px] font-medium text-slate-300">
                        <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  {isActive ? (
                    <button 
                      disabled
                      className="w-full rounded-2xl bg-cyan-500/10 border border-cyan-500/20 py-2.5 text-[10px] font-extrabold text-cyan-400 cursor-default"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleUpgrade(plan.name)}
                      className={`w-full rounded-2xl py-2.5 text-[10px] font-extrabold transition-all cursor-pointer ${
                        plan.recommended
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:from-cyan-400 hover:to-blue-500'
                          : 'border border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      Select Plan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
