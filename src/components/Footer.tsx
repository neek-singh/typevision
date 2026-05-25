'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <footer className="border-t border-white/5 bg-slate-950 py-6 text-center text-xs text-slate-500">
      <p>© {new Date().getFullYear()} TypeVision. All rights reserved.</p>
    </footer>
  );
}
