import Link from 'next/link';
import { Keyboard, Zap, Target, Shield, BookOpen, Star, Sparkles, Trophy } from 'lucide-react';

export default function About() {
  const benefits = [
    {
      title: 'Build Muscle Memory',
      description: 'Train your brain to memorize keyboard layout geometries. Typing becomes automatic, freeing cognitive resources to focus entirely on code and copywriting structure.',
      icon: Trophy,
    },
    {
      title: 'Ergonomic Accuracy',
      description: 'Learn correct, stress-free touch patterns. Reduce wrist strain and physical hand movements to protect physical health over long desk-bound shifts.',
      icon: Target,
    },
    {
      title: 'Legacy Remington Exam Prep',
      description: 'Specially structured Remington Hindi Krutidev layout exercises. Perfect preparation for specialized state service writing tests and governmental exams.',
      icon: Keyboard,
    },
  ];

  return (
    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 w-full space-y-16 min-h-screen">
      {/* Dynamic Glow Circles */}
      <div className="absolute top-10 left-1/4 -z-10 h-[300px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]"></div>
      <div className="absolute bottom-20 right-1/4 -z-10 h-[300px] w-[500px] rounded-full bg-blue-600/5 blur-[120px]"></div>

      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3.5 py-1 text-xs font-semibold text-cyan-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>About Our Platform</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Crafting Elite Finger Speed & Accuracy
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          TypeVision is a premium touch-typing arena optimized for both English QWERTY touch typists and Hindi legacy Krutidev Remington layout writers. 
        </p>
      </div>

      {/* Philosophy Split Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Why Dual Layout Support Matters
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Governmental agencies, public sectors, and state typing contests across India mandate typing speed tests using the legacy **Remington Remington typewriter (Krutidev 010) layout**.
          </p>
          <p className="text-slate-400 leading-relaxed text-sm">
            Our platform allows students to easily toggle between standard global QWERTY drills and exact Hindi Krutidev exercises. With live visual telemetry tracking, you will know exactly when you meet governmental speed metrics.
          </p>
          <div className="flex gap-4">
            <Link
              href="/lessons"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <BookOpen className="h-4 w-4" />
              Explore Lessons
            </Link>
          </div>
        </div>

        {/* Visual Mockup Frame */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Exercises Run</span>
              <span className="text-cyan-400 font-bold">14,250+</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Mean Speed Improvement</span>
              <span className="text-emerald-400 font-bold">+24% WPM</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Supported Layouts</span>
              <span className="text-purple-400 font-bold">QWERTY & Remington</span>
            </div>
            <div className="h-[2px] bg-white/5 my-2"></div>
            <div className="text-left text-xs font-mono text-slate-500 bg-slate-900/50 p-3 rounded-lg border border-white/5">
              <span className="text-emerald-400 font-bold">jke jktk jke</span> dk jktk Fkk mldh jkuh...
            </div>
          </div>
        </div>
      </div>

      {/* Core Benefits Grid */}
      <div className="space-y-8 pt-8">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-white">Benefits of Touch Typing Mastery</h2>
          <p className="text-sm text-slate-400 mt-2">Maximize your day-to-day productivity and protect your health.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <div key={i} className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 hover:border-white/10 transition-all duration-200">
                <div className="h-10 w-10 rounded-xl bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-xs leading-relaxed text-slate-400">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
