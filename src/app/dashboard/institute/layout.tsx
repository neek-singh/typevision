'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { School, LayoutDashboard, LogOut, Keyboard, Users, BookOpen, ClipboardList } from 'lucide-react';
import { performLogout } from '@/lib/auth/logout';

export default function TutorPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, profile, initialize, initialized, loading } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Auth guard: redirect if not logged in or not a tutor role
  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.push('/institute/login');
      return;
    }
    const tutorRoles = ['principal', 'staff', 'admin', 'tutor'];
    if (profile && !tutorRoles.includes(profile.role || '')) {
      // Regular user — redirect to normal dashboard
      router.push('/dashboard');
    }
  }, [user, profile, initialized, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await performLogout(router);
    } catch (err) {
      console.error('Tutor portal logout error:', err);
      setIsLoggingOut(false);
    }
  };

  // Show loading spinner while auth is initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Authenticating Tutor Portal...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated (redirect in progress)
  if (!user) return null;

  const navLinks = [
    { href: '/dashboard/institute', label: 'Console', icon: LayoutDashboard },
    { href: '/dashboard/institute/students', label: 'Students', icon: Users },
    { href: '/dashboard/institute/exams', label: 'Mock Exams', icon: ClipboardList },
    { href: '/dashboard/institute/lessons', label: 'Lessons', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Tutor Portal Top Bar — replaces the main site Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Brand / Portal Identity */}
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/institute"
                className="flex items-center gap-2 text-sm font-bold tracking-wide text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Keyboard className="h-5 w-5" />
                <span>
                  TYPE<span className="text-white">VISION</span>
                </span>
              </Link>
              <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/30 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400">
                <School className="h-3 w-3" />
                Tutor Portal
              </span>
            </div>

            {/* Portal Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right: Profile Info + Logout */}
            <div className="flex items-center gap-3">
              {profile && (
                <div className="hidden sm:flex flex-col items-end leading-none">
                  <span className="text-[11px] font-bold text-white">
                    {profile.display_name || profile.email}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize">{profile.role || 'Tutor'}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 hover:border-white/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tutor Portal Main Content — no Footer */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
