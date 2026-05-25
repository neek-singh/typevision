'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Keyboard, BookOpen, LayoutDashboard, Menu, X, LogIn, Tag, Globe, Languages, ChevronDown, Info, Mail, History, UserCircle, Settings, MoreHorizontal, School } from 'lucide-react';
import { performLogout } from '@/lib/auth/logout';
import NavLink from './nav-link';
import dynamic from 'next/dynamic';

const UserMenu = dynamic(() => import('./user-menu'), {
  ssr: false,
  loading: () => <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse border border-white/5" />
});

const MobileMenu = dynamic(() => import('./mobile-menu'), {
  ssr: false
});

const Logo = React.memo(function Logo() {
  return (
    <div className="flex items-center">
      <Link
        href="/"
        prefetch={false}
        className="flex items-center gap-2 text-xl font-bold tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <Keyboard className="h-6 w-6 animate-pulse" />
        <span>
          TYPE<span className="text-white">VISION</span>
        </span>
      </Link>
    </div>
  );
});
Logo.displayName = 'Logo';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const initialize = useAuthStore((state) => state.initialize);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Close mobile menu on path changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [pathname]);


  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Lessons', href: '/lessons' },
  ];

  const practiceItems = [
    { name: 'English Typing', href: '/practice/english', icon: Globe },
    { name: 'Hindi Typing', href: '/practice/hindi', icon: Languages },
  ];

  const extraNavItems = [
    { name: 'Pricing', href: '/pricing' },
    ...(!user ? [{ name: 'Institute', href: '/institute' }] : []),
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const moreItems = [
    ...(user
      ? [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Institute Tutor Portal', href: '/dashboard/institute', icon: School },
      ]
      : []),
  ];

  const isPracticeActive = pathname?.startsWith('/practice');
  const isMoreActive = ['/dashboard'].some((p) =>
    pathname?.startsWith(p)
  );

  // All items for mobile menu
  const showInstitutePortal = profile && ['principal', 'staff', 'admin'].includes(profile.role || '');

  const allMobileItems = [
    ...navItems.map((i) => ({ ...i, icon: undefined as never })),
    ...practiceItems,
    { name: 'Pricing', href: '/pricing', icon: Tag },
    ...(!user ? [{ name: 'Institute', href: '/institute', icon: School }] : []),
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Mail },
    ...(user
      ? [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ...(showInstitutePortal
          ? [{ name: 'Institute Tutor Portal', href: '/dashboard/institute', icon: School }]
          : []),
      ]
      : []),
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await performLogout(router);
    } catch (err) {
      console.error('Header logout error:', err);
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <Logo />

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                href={item.href}
                name={item.name}
              />
            ))}

            {/* Practice Dropdown */}
            <NavDropdown
              label="Practice"
              items={practiceItems}
              isActive={isPracticeActive}
              pathname={pathname}
              accentColor="cyan"
            />

            {/* About & Contact direct links */}
            {extraNavItems.map((item) => (
              <NavLink
                key={item.name}
                href={item.href}
                name={item.name}
              />
            ))}

            {/* Authenticated Quick Links */}
          </div>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-1">
                  <NavLink
                    href="/dashboard"
                    name="Dashboard"
                  />
                  {showInstitutePortal && (
                    <NavLink
                      href="/dashboard/institute"
                      name="Institute Tutor Portal"
                    />
                  )}
                </div>
                <UserMenu
                  user={user}
                  profile={profile}
                  onLogout={handleLogout}
                  isLoggingOut={isLoggingOut}
                />
              </>
            ) : (
              <Link
                href="/register"
                prefetch={false}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 transition-all duration-200"
              >
                Start Typing
              </Link>
            )}
          </div>

          {/* Mobile Hamburger menu triggers */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white focus:outline-none"
              aria-label="Toggle main menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sliding Overlay Panel */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={allMobileItems}
        user={user}
        profile={profile}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </nav>
  );
}

// ─── Reusable Nav Dropdown ──────────────────────────────────────────────────────
const NavDropdown = React.memo(function NavDropdown({
  label,
  icon: LabelIcon,
  items,
  isActive,
  pathname,
  accentColor = 'cyan',
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: Array<{ name: string; href: string; icon: React.ComponentType<{ className?: string }> }>;
  isActive: boolean | null | undefined;
  pathname: string | null;
  accentColor?: 'cyan' | 'slate';
}) {
  const [open, setOpen] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeItemClass =
    accentColor === 'cyan' ? 'text-cyan-400 bg-cyan-500/10' : 'text-white bg-slate-800';

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center">
      <button
          onClick={() => setOpen((v) => !v)}
          className={`relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors duration-200 group focus:outline-none ${isActive
              ? 'text-cyan-400 font-semibold'
              : 'text-slate-350 hover:text-white'
            }`}
        >
        {LabelIcon && <LabelIcon className="h-4 w-4 shrink-0" />}
        <span>{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
        {/* Sleek hover underline animation */}
        <span
          className={`absolute bottom-0 left-3.5 right-3.5 h-[2px] rounded-full bg-cyan-400 transform origin-left transition-transform duration-300 ease-out ${
            isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-52 rounded-xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/50 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {items.map((item) => {
            const Icon = item.icon;
            const isItemActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                prefetch={item.href.startsWith('/dashboard') || item.href.startsWith('/lessons') || item.href.startsWith('/practice')}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${isItemActive
                    ? activeItemClass
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
});
NavDropdown.displayName = 'NavDropdown';
