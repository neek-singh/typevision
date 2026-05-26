'use client';

import { useState, useEffect } from 'react';
import { Languages, Shuffle, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Shimmer } from '@/components/ui/shimmer';
import { Skeleton } from '@/components/ui/skeleton';

const TypingEngine = dynamic(() => import('@/components/TypingEngine'), {
  ssr: false,
  loading: () => (
    <div className="w-full space-y-3">
      {/* Stats Bar Shimmer */}
      <div className="flex flex-wrap items-center gap-6 border-b border-white/5 pb-2">
        <Skeleton className="h-6 w-24 animate-pulse" />
        <Skeleton className="h-6 w-28 animate-pulse" />
        <Skeleton className="h-6 w-20 animate-pulse" />
        <Skeleton className="h-6 w-20 animate-pulse" />
      </div>
      
      {/* Playground Area Shimmer */}
      <Shimmer className="min-h-[240px] flex items-center justify-center p-6 md:p-10">
        <Skeleton className="h-12 w-full max-w-xl" />
      </Shimmer>

      {/* Action Tray Shimmer */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-11 w-44 rounded-xl" />
      </div>
    </div>
  ),
});

const HINDI_PARAGRAPHS = {
  Beginner: [
    'क ख ग घ ङ च छ ज झ ञ क ख ग घ ङ च छ ज झ ञ क ख ग घ ङ च छ ज झ ञ क ख ग घ ङ च छ ज झ ञ',
    'ट ठ ड ढ ण त थ द ध न ट ठ ड ढ ण त थ द ध न ट ठ ड ढ ण त थ द ध न ट ठ ड ढ ण त थ द ध न',
    'प फ ब भ म य र ल व श ष स ह प फ ब भ म य र ल व श ष स ह प फ ब भ म य र ल व श ष स ह',
  ],
  Intermediate: [
    'राम और सीता वन में गए। वहाँ उन्होंने एक शेर देखा। राम ने तीर चलाया। राजा बहुत खुश हुआ। वन का दृश्य बहुत ही सुंदर था।',
    'सच्चा मित्र वही है जो विपत्ति के समय काम आए। हमें हमेशा दूसरों की मदद करनी चाहिए। जैसी करनी वैसी भरनी। जो जैसा बोएगा वो वैसा ही काटेगा।',
    'मेहनत ही सफलता की कुंजी है। जो व्यक्ति परिश्रम करता है वह जीवन में आगे बढ़ता है। सफलता उन्हीं को मिलती है जो लगन से काम करते हैं।',
  ],
  Advanced: [
    'जब हम अपने लक्ष्य के प्रति समर्पित होते हैं तो सफलता निश्चित ही मिलती है। परिश्रम ही सफलता की कुंजी है। जीवन में निरंतर आगे बढ़ते रहना ही प्रगति का दूसरा नाम है।',
    'व्यक्तिगत विकास के लिए निरंतर अभ्यास की आवश्यकता होती है। ज्ञान और कौशल को बढ़ाने के लिए प्रतिदिन पढ़ना और सीखना बेहद जरूरी है। अनुशासन सफलता की नींव है।',
    'भारत एक विविधताओं से भरा देश है जहाँ अनेक भाषाएँ, धर्म और संस्कृतियाँ एक साथ फलती-फूलती हैं। यहाँ की मिट्टी में इतिहास की गहरी छाप है और भविष्य की असीम संभावनाएँ हैं।',
  ],
};

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export default function HindiPractice() {
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [paragraph, setParagraph] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const list = HINDI_PARAGRAPHS[difficulty];
    const randomIndex = Math.floor(Math.random() * list.length);
    setParagraph(list[randomIndex]);
    setIndex(randomIndex);
  }, [difficulty]);

  const handleShuffle = () => {
    const list = HINDI_PARAGRAPHS[difficulty];
    let nextIndex = Math.floor(Math.random() * list.length);
    if (list.length > 1 && nextIndex === index) {
      nextIndex = (nextIndex + 1) % list.length;
    }
    setParagraph(list[nextIndex]);
    setIndex(nextIndex);
  };

  return (
    <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 w-full space-y-4 min-h-screen">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-[100px]" />

      {/* Header — Left title | Right controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-3">
        {/* Left: Title only */}
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight sm:text-2xl flex items-center gap-2">
            <Languages className="h-5 w-5 text-indigo-400" />
            हिंदी टाइपिंग
          </h1>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Difficulty Selector */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
            {(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  difficulty === level
                    ? 'bg-transparent text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Shuffle button */}
          <button
            onClick={handleShuffle}
            title="Randomize Text"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-all duration-200"
          >
            <Shuffle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Typing Playground */}
      {paragraph && (
        <TypingEngine
          key={`hindi-${difficulty}-${index}`}
          initialText={paragraph}
          language="Hindi"
        />
      )}

      {/* Typing Tip */}
      <div className="rounded-2xl border border-indigo-500/10 bg-indigo-950/10 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <h4 className="text-sm font-bold text-white">हिंदी टाइपिंग — सुझाव</h4>
        </div>
        <p className="text-xs leading-relaxed text-slate-400">
          हिंदी टाइपिंग के लिए अपने कीबोर्ड पर हिंदी इनपुट चालू करें। Windows में <strong className="text-slate-300">Win + Space</strong> दबाकर भाषा बदलें, या हिंदी IME (जैसे Google Hindi Input) इंस्टॉल करें। नियमित अभ्यास से गति और शुद्धता दोनों बढ़ते हैं।
        </p>
      </div>
    </div>
  );
}
