import Link from 'next/link';
import { School, Users, LineChart, Shield, Sparkles, LayoutDashboard, Key, Award, CheckCircle2, ArrowRight, Laptop, ClipboardList } from 'lucide-react';

export default function InstituteLanding() {
  const features = [
    {
      title: 'Tutor Dashboard Control',
      description: 'A powerful master control console to easily monitor entire student batches, manage classes, and customize lesson plans in real-time.',
      icon: LayoutDashboard,
      color: 'text-cyan-400 border-cyan-500/20 bg-cyan-950/20',
    },
    {
      title: 'Bulk Student Generation',
      description: 'Generate 20, 50, or 100+ student accounts in single-click CSV bulk workflows. Students can log in instantly with simple usernames and no email overhead.',
      icon: Key,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/20',
    },
    {
      title: 'Dual Layout Testing Support',
      description: 'Perfect preparation for governmental examinations. Support for standard English QWERTY touch-typing alongside legacy Hindi Krutidev (Remington layout).',
      icon: Laptop,
      color: 'text-purple-400 border-purple-500/20 bg-purple-950/20',
    },
    {
      title: 'Deep Student Telemetry',
      description: 'Audit each student’s speed (WPM) timeline, error rate curves, accuracy curves, and chronological typing attempt logs.',
      icon: LineChart,
      color: 'text-blue-400 border-blue-500/20 bg-blue-950/20',
    },
    {
      title: 'Batch Management & Targets',
      description: 'Organize students into distinct batches (Morning, Evening, etc.). Set typing speed goals and track standard progression timelines.',
      icon: Users,
      color: 'text-amber-400 border-amber-500/20 bg-amber-950/20',
    },
    {
      title: 'White-Label Branding Options',
      description: 'Enterprise tiers get unique white-label solutions with customized institute logos, private subdomains, and tailored visual branding themes.',
      icon: Shield,
      color: 'text-rose-400 border-rose-500/20 bg-rose-950/20',
    },
  ];

  const highlights = [
    'No complicated student email verification needed.',
    'Detailed telemetry logs exports in one click.',
    'Classroom rankings and automatic speed leaderboards.',
    'Real-time accuracy & error breakdown analytics.',
  ];

  return (
    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 w-full space-y-20 min-h-screen overflow-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 left-1/3 -z-10 h-[400px] w-[600px] rounded-full bg-cyan-500/5 blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[400px] w-[500px] rounded-full bg-indigo-600/5 blur-[120px]"></div>

      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3.5 py-1 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Institutes & Academies Portal</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-6xl">
          Empower Your Students with{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            TypeVision for Institutes
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Deploy an elite multi-student typing environment for your school, college, or private typing academy. Monitor speed gains, organize groups, and prepare students for typing examinations seamlessly.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/pricing?category=institute"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 transition-all duration-200"
          >
            Explore Institute Plans
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-8 py-4 text-sm font-bold text-white hover:bg-slate-800 hover:border-white/20 transition-all duration-200"
          >
            Contact Sales
          </Link>
        </div>
      </div>

      {/* Portal Section Showcase (Interactive Mockup Console) */}
      <div className="relative pt-6 max-w-5xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Inside the Institute Tutor Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            A beautiful, clean control center that lets teachers track, guide, and support students automatically.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 md:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden group">
          {/* Top mock window controls */}
          <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500"></span>
              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
              <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
              <span className="ml-2 text-[10px] font-mono text-slate-500 tracking-wider">TUTOR_CONSOLE://DASHBOARD</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping mr-1"></span>
              Active Deployment Sync
            </div>
          </div>

          {/* Grid representing sections of the portal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Batch card */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Batches</span>
                <Users className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-950/50 p-2.5 rounded-lg border border-white/5 text-xs">
                  <span className="font-semibold text-white">Morning Elite Batch</span>
                  <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-md">24 Enrolled</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-2.5 rounded-lg border border-white/5 text-xs">
                  <span className="font-semibold text-white">Evening Remington Batch</span>
                  <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-md">18 Enrolled</span>
                </div>
              </div>
            </div>

            {/* Performance charts */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Telemetry Target</span>
                <LineChart className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
                    <span>Average Accuracy</span>
                    <span className="text-emerald-400 font-bold">96.8%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96.8%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
                    <span>Target Speed Achieved</span>
                    <span className="text-cyan-400 font-bold">82% of students</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Students */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Class Leaderboard</span>
                <Award className="h-4 w-4 text-amber-400" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-350">1. Rohan Sharma (Remington)</span>
                  <span className="font-bold text-amber-400">58 WPM</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-350">2. Aditi Verma (English)</span>
                  <span className="font-bold text-cyan-400">62 WPM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 pt-5 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
              {highlights.map((h, idx) => (
                <div key={idx} className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
            <Link
              href="/pricing?category=institute"
              className="text-cyan-400 font-bold flex items-center gap-1 hover:text-cyan-300 transition-colors"
            >
              Learn about batch accounts
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits / Features Grid */}
      <div className="space-y-10 pt-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Why Top Institutes Choose TypeVision
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to successfully run, monitor, and scale professional typing training classrooms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-white/5 bg-slate-900/20 p-6 hover:border-white/10 hover:bg-slate-900/30 transition-all duration-200 group text-left space-y-4"
              >
                <div className={`h-11 w-11 rounded-xl border flex items-center justify-center ${feature.color}`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Registration / Access Portal Section */}
      <div className="space-y-10 pt-4 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3 py-1 text-xs font-semibold text-cyan-400">
            <Key className="h-3.5 w-3.5" />
            <span>Instant Setup Workflow</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Tutor Portal Registration & Sign In
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Create your tutor account with secure OTP verification. The system will auto-generate secure login credentials for your dashboard access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4 text-left">
          {/* Card 1: Register */}
          <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-8 backdrop-blur-md flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-cyan-500/5 blur-2xl"></div>
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <School className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Create Institute Account</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Register your academy name, verify your email with a secure 6-digit OTP code, and auto-generate highly secure admin credentials to access your Principal Control room instantly.
              </p>
            </div>
            <Link
              href="/institute/register"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <span>Create Account (OTP Verified)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Card 2: Login */}
          <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-8 backdrop-blur-md flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-purple-500/5 blur-2xl"></div>
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-purple-950/50 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Key className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Tutor Portal Access</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Already registered? Access your private batch dashboards, edit lesson cohorts, add instructional staff members, and track average student speed benchmarks.
              </p>
            </div>
            <Link
              href="/institute/login"
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950 py-3.5 text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-white transition-all text-center"
            >
              <span>Sign In to Tutor Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Pricing / CTA Section */}
      <div className="pt-8 max-w-4xl mx-auto">
        <div className="relative rounded-3xl border border-white/5 bg-slate-900/20 p-8 sm:p-12 text-center shadow-xl backdrop-blur-sm overflow-hidden group">
          {/* Internal Glow Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          
          <div className="relative space-y-6 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3.5 py-1 text-xs font-semibold text-cyan-400">
              <School className="h-3.5 w-3.5 animate-bounce" />
              <span>Deploy Instantly</span>
            </div>
            
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Elevate Your Institute's Standards Today
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Equip your classrooms with precise telemetry trackers, comprehensive batch dashboards, and Remington Hindi and English touch structures. Plans start at just ₹799/month for 5 student accounts.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/pricing?category=institute"
                className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 transition-all"
              >
                <span>View Institute Pricing</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-slate-900 px-6 py-3.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:border-white/20 transition-all"
              >
                <span>Request Custom Quote</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
