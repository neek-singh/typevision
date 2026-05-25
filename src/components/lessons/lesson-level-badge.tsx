import React from 'react';

interface LessonLevelBadgeProps {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  className?: string;
}

export default function LessonLevelBadge({ level, className = '' }: LessonLevelBadgeProps) {
  let badgeStyles = 'border-cyan-500/30 bg-cyan-950/30 text-cyan-400';
  
  if (level === 'Intermediate') {
    badgeStyles = 'border-indigo-500/30 bg-indigo-950/30 text-indigo-400';
  } else if (level === 'Advanced') {
    badgeStyles = 'border-purple-500/30 bg-purple-950/30 text-purple-400';
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeStyles} ${className}`}>
      {level}
    </span>
  );
}
