'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, LogOut, User } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  user: SupabaseUser | null;
  profile: UserProfile | null;
  onLogout: () => Promise<void>;
  isLoggingOut?: boolean;
}

export default function MobileMenu({
  isOpen,
  onClose,
  navItems,
  user,
  profile,
  onLogout,
  isLoggingOut = false,
}: MobileMenuProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="absolute top-16 left-0 right-0 z-40 w-full border-b border-white/10 bg-slate-950 px-4 py-4 space-y-1.5 md:hidden shadow-2xl animate-in slide-in-from-top-4 duration-200">
      {/* Navigation Links */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              prefetch={item.href.startsWith('/dashboard') || item.href.startsWith('/lessons') || item.href.startsWith('/practice')}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-semibold transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-white/5 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                  : 'text-slate-300 border border-transparent hover:bg-white/5 hover:text-white'
              }`}
            >
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User Section / Auth CTAs */}
      <div className="border-t border-white/10 my-3 pt-3">
        {user ? (
          <div className="flex flex-col gap-3 px-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <User className="h-5 w-5 text-cyan-400 shrink-0" />
              <span className="truncate">{displayName}</span>
            </span>
            <button
              onClick={async () => {
                if (isLoggingOut) return;
                onClose();
                await onLogout();
              }}
              disabled={isLoggingOut}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-950/20 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isLoggingOut ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent"></div>
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-1">
            <Link
              href="/login"
              onClick={onClose}
              prefetch={false}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              prefetch={false}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-bold text-white hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 transition-all duration-200"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
