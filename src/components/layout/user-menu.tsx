'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { User, LogOut, LayoutDashboard, ChevronDown, School, History, Settings } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role?: string;
  created_at: string;
}

interface UserMenuProps {
  user: SupabaseUser;
  profile: UserProfile | null;
  onLogout: () => Promise<void>;
  isLoggingOut?: boolean;
}

export default function UserMenu({ user, profile, onLogout, isLoggingOut = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User';

  // Toggle open state
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape keypress
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center justify-center h-9 w-9 rounded-full border border-white/5 bg-slate-900/50 hover:border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
        title={displayName}
      >
        <User className="h-4 w-4 text-cyan-400" />
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-white/10 bg-slate-950 p-1.5 shadow-2xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User profile meta */}
          <div className="px-3 py-2 border-b border-white/5 mb-1.5 text-left">
            <p className="text-xs font-bold text-white truncate">{displayName}</p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
          </div>

          {/* Links */}
          <div className="space-y-0.5">
            <Link
              href="/dashboard?tab=overview"
              onClick={() => setIsOpen(false)}
              prefetch={true}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span>Dashboard</span>
            </Link>

            {profile && ['principal', 'staff', 'admin'].includes(profile.role || '') && (
              <Link
                href="/dashboard/institute"
                onClick={() => setIsOpen(false)}
                prefetch={true}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <School className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Institute Tutor Portal</span>
              </Link>
            )}

            <div className="h-[1px] bg-white/5 my-1"></div>

            <Link
              href="/dashboard?tab=history"
              onClick={() => setIsOpen(false)}
              prefetch={true}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <History className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span>Practice History</span>
            </Link>

            <Link
              href="/dashboard?tab=profile"
              onClick={() => setIsOpen(false)}
              prefetch={true}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <User className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span>My Profile</span>
            </Link>

            <Link
              href="/dashboard?tab=settings"
              onClick={() => setIsOpen(false)}
              prefetch={true}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span>Settings</span>
            </Link>

            <div className="h-[1px] bg-white/5 my-1"></div>

            {/* Logout Trigger */}
            <button
              onClick={async () => {
                if (isLoggingOut) return;
                setIsOpen(false);
                await onLogout();
              }}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isLoggingOut ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent"></div>
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
