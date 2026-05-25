'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Keyboard, Send } from 'lucide-react';
import { QuickLinks, CompanyLinks, TypingCategoryLinks } from './footer-links';
import SocialLinks from './social-links';
import FooterBottom from './footer-bottom';

const NewsletterSection = React.memo(function NewsletterSection() {
  const [email, setEmail] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
        Stay Updated
      </h3>
      <p className="text-sm leading-relaxed text-slate-400">
        Get the latest typing challenges and platform updates.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label="Email address for newsletter"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all duration-200 focus:border-cyan-500/50 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]"
        />
        <button
          type="button"
          aria-label="Subscribe to newsletter"
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Subscribe</span>
        </button>
      </div>
    </div>
  );
});
NewsletterSection.displayName = 'NewsletterSection';

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <footer
      aria-label="Site footer"
      className="relative border-t border-white/10 bg-slate-950"
    >
      {/* Subtle top glow line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column – spans 2 on large screens */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-bold tracking-wider text-cyan-400 transition-colors duration-200 hover:text-cyan-300"
            >
              <Keyboard className="h-6 w-6 animate-pulse" />
              <span>
                TYPE<span className="text-white">VISION</span>
              </span>
            </Link>

            {/* Description */}
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              Master English and Hindi Krutidev typing with real-time analytics,
              adaptive lessons, and precision speed tests — all in one premium
              platform.
            </p>

            {/* Social icons */}
            <SocialLinks />

            {/* Newsletter */}
            <div className="mt-2">
              <NewsletterSection />
            </div>
          </div>

          {/* Quick Links */}
          <QuickLinks />

          {/* Company Links */}
          <CompanyLinks />

          {/* Typing Categories */}
          <TypingCategoryLinks />
        </div>

        {/* Bottom bar */}
        <FooterBottom />

        {/* Bottom padding */}
        <div className="h-6" />
      </div>
    </footer>
  );
}
