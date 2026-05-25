'use client';

import Link from 'next/link';

export default function FooterBottom() {
  const year = new Date().getFullYear();

  return (
    <div className="border-t border-white/5 pt-6">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        {/* Copyright */}
        <p className="text-xs text-slate-500">
          © {year}{' '}
          <span className="text-slate-400">TypeVision</span>. All rights
          reserved.
        </p>

        {/* Legal links */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <Link
            href="/privacy-policy"
            className="transition-colors duration-200 hover:text-slate-300"
          >
            Privacy Policy
          </Link>
          <span className="text-white/10">·</span>
          <Link
            href="/terms"
            className="transition-colors duration-200 hover:text-slate-300"
          >
            Terms &amp; Conditions
          </Link>
          <span className="text-white/10">·</span>
          <Link
            href="/return-policy"
            className="transition-colors duration-200 hover:text-slate-300"
          >
            Return Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
