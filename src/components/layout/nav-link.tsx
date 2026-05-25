'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

interface NavLinkProps {
  href: string;
  name: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

const NavLink = React.memo(function NavLink({ href, name, icon: Icon, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const shouldPrefetch = href.startsWith('/dashboard') || href.startsWith('/lessons') || href.startsWith('/practice');

  return (
    <Link
      href={href}
      onClick={onClick}
      prefetch={shouldPrefetch}
      className={`relative flex items-center gap-2 px-3.5 py-2 text-sm font-medium transition-colors duration-200 group ${
        isActive
          ? 'text-cyan-400 font-semibold'
          : 'text-slate-350 hover:text-white'
      }`}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span>{name}</span>
      {/* Sleek hover underline animation */}
      <span
        className={`absolute bottom-0 left-3.5 right-3.5 h-[2px] rounded-full bg-cyan-400 transform origin-left transition-transform duration-300 ease-out ${
          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </Link>
  );
});

NavLink.displayName = 'NavLink';
export default NavLink;
