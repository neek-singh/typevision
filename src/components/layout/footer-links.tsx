'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface FooterLinkItem {
  label: string;
  href: string;
}

const FooterLinkGroup = React.memo(function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: FooterLinkItem[];
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.label}>
              <Link
                href={link.href}
                prefetch={link.href.startsWith('/dashboard') || link.href.startsWith('/lessons') || link.href.startsWith('/practice')}
                className={`group relative text-sm transition-all duration-200 ${
                  isActive
                    ? 'text-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="relative inline-block">
                  {link.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
});
FooterLinkGroup.displayName = 'FooterLinkGroup';

export const QuickLinks = React.memo(function QuickLinks() {
  const links: FooterLinkItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Practice', href: '/practice/english' },
    { label: 'Lessons', href: '/lessons' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/dashboard' },
  ];

  return <FooterLinkGroup title="Quick Links" links={links} />;
});
QuickLinks.displayName = 'QuickLinks';

export const CompanyLinks = React.memo(function CompanyLinks() {
  const links: FooterLinkItem[] = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ];

  return <FooterLinkGroup title="Company" links={links} />;
});
CompanyLinks.displayName = 'CompanyLinks';

export const TypingCategoryLinks = React.memo(function TypingCategoryLinks() {
  const links: FooterLinkItem[] = [
    { label: 'English Typing', href: '/practice/english' },
    { label: 'Hindi Krutidev Typing', href: '/practice/hindi' },
    { label: 'Beginner Lessons', href: '/lessons' },
    { label: 'Advanced Lessons', href: '/lessons' },
  ];

  return <FooterLinkGroup title="Typing Categories" links={links} />;
});
TypingCategoryLinks.displayName = 'TypingCategoryLinks';
