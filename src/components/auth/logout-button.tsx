'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { performLogout } from '@/lib/auth/logout';

interface LogoutButtonProps {
  className?: string;
  showIcon?: boolean;
  buttonText?: string;
}

export default function LogoutButton({
  className = '',
  showIcon = true,
  buttonText = 'Logout',
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await performLogout(router);
    } catch (error) {
      console.error('Logout handler error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center justify-center gap-2 rounded-lg border border-red-500/10 bg-slate-900/40 px-3.5 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer ${className}`}
      aria-label="Secure Sign Out"
    >
      {isLoggingOut ? (
        <>
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent"></div>
          <span>Signing Out...</span>
        </>
      ) : (
        <>
          {showIcon && <LogOut className="h-3.5 w-3.5 shrink-0" />}
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
}
