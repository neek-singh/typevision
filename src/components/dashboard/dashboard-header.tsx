'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, User, Sparkles } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role?: string;
  organization_id?: string | null;
  created_at: string;
}

interface DashboardHeaderProps {
  user: SupabaseUser | null;
  profile: UserProfile | null;
}

export default function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const name = profile?.display_name || user?.email?.split('@')[0] || 'Typist';
  const email = user?.email || '';

  // Safe date formatter
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6 md:p-8 shadow-2xl backdrop-blur-md">
      {/* Dynamic Background Neon Glow */}
      <div className="absolute -right-16 -top-16 -z-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl opacity-70"></div>
      <div className="absolute -left-16 -bottom-16 -z-10 h-32 w-32 rounded-full bg-blue-600/10 blur-2xl opacity-60"></div>

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* User Info Section */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            <User className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
                Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{name}</span>!
              </h1>
              <div className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                <Sparkles className="h-3 w-3" />
                <span>Active Member</span>
              </div>
            </div>
            <p className="mt-1.5 text-sm text-slate-400">
              {email} {profile?.created_at && `• Joined on ${formatDate(profile.created_at)}`}
            </p>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="flex items-center">
          <Link
            href="/lessons"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 transition-all duration-200"
          >
            Practice Lessons
            <ArrowUpRight className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
