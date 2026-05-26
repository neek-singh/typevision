'use client';

import { usePathname } from 'next/navigation';
import Header from './header';
import Footer from './footer';

/**
 * Routes where the main site Header and Footer should be hidden.
 * The tutor portal has its own isolated layout with a custom header.
 */
const HIDDEN_SHELL_PREFIXES = ['/dashboard/institute'];

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideShell = 
    HIDDEN_SHELL_PREFIXES.some((prefix) => pathname?.startsWith(prefix)) ||
    pathname?.startsWith('/lessons/');

  if (hideShell) {
    // Tutor portal: render children directly — the layout.tsx inside dashboard/institute
    // provides its own isolated header and layout.
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
