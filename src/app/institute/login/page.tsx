'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, ArrowLeft, School } from 'lucide-react';

export default function InstituteLogin() {
  const router = useRouter();
  const { signIn, user, loading, initialize, initialized } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && user) {
      router.push('/dashboard');
    }
  }, [user, initialized, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message || 'Invalid email or password.');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="relative flex-1 min-h-[calc(100vh-4rem)] w-full flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      {/* Back button */}
      <Link
        href="/institute"
        className="absolute top-6 left-6 inline-flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-900 hover:border-white/10 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-all duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Institute
      </Link>

      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[350px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[100px] opacity-70"></div>

      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-slate-950/60 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            <School className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">Tutor Portal Login</h2>
          <p className="mt-2 text-xs text-slate-400">
            Sign in to manage classes, batches, and view student speed dashboards.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-sm text-rose-400 animate-pulse">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-400">
                Tutor Login Email Address
              </label>
              <div className="relative mt-1.5">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-slate-900/50 py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500 transition-all text-xs font-semibold"
                  placeholder="tutor@institute.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400">
                Tutor Password
              </label>
              <div className="relative mt-1.5">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-slate-900/50 py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500 transition-all text-xs font-semibold"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 disabled:opacity-50 transition-all duration-200 cursor-pointer"
            >
              {loading ? 'Entering Tutor Portal...' : 'Access My Portal'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Need to register your Institute?{' '}
            <Link href="/institute/register" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
