import React from 'react';
import { useTypingStore } from '@/store/typing-store';

const TypingText = React.memo(function TypingText() {
  const text = useTypingStore((state) => state.text);
  const typedText = useTypingStore((state) => state.typedText);
  const wrongIndexes = useTypingStore((state) => state.wrongIndexes);

  return (
    <div className="text-xl md:text-2xl leading-relaxed tracking-wide select-none outline-none font-mono text-slate-500">
      {text.split('').map((char, index) => {
        let className = 'text-slate-500';
        const isTyped = index < typedText.length;
        const isCurrent = index === typedText.length;
        const isWrong = wrongIndexes.has(index);

        if (isTyped) {
          className = isWrong
            ? 'text-rose-500 bg-rose-500/10 border-b border-rose-500 font-semibold'
            : 'text-emerald-400 font-medium';
        } else if (isCurrent) {
          className = 'text-cyan-400 bg-cyan-400/20 border-b-2 border-cyan-400 animate-pulse font-bold rounded-sm px-0.5';
        }

        return (
          <span key={index} className={`${className} transition-all duration-100`}>
            {char}
          </span>
        );
      })}
    </div>
  );
});

TypingText.displayName = 'TypingText';
export default TypingText;
