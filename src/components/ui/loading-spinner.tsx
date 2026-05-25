import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-cyan-500 border-t-transparent shadow-[0_0_15px_rgba(34,211,238,0.2)]`}
        role="status"
        aria-label="loading"
      />
      {text && (
        <p className="text-xs text-slate-400 font-semibold tracking-wider animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
