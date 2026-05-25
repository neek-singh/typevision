import React from 'react';

interface LessonHeaderProps {
  title: string;
  subtitle: string;
}

export default function LessonHeader({ title, subtitle }: LessonHeaderProps) {
  return (
    <div className="border-b border-white/5 pb-6">
      <h1 className="text-3xl font-extrabold text-white tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}
