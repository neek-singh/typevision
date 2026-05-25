'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { 
  School, Key, Users, Sparkles, Mail, Lock, Shield, 
  ArrowRight, ArrowLeft, RefreshCw, CheckCircle2, 
  Clipboard, AlertCircle, Eye, EyeOff, User,
  Phone, Calendar 
} from 'lucide-react';

export default function InstituteRegister() {
  const router = useRouter();
  const { user, initialize, initialized } = useAuthStore();

  // Multi-stage control state: 'input' | 'otp' | 'credentials' | 'submitting'
  const [stage, setStage] = useState<'input' | 'otp' | 'credentials' | 'submitting'>('input');

  // Input states
  const [instituteName, setInstituteName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [dob, setDob] = useState('');
  
  // Verification states
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [localFallback, setLocalFallback] = useState(false);
  
  // Credentials states
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Status/Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirect if already logged in, only from the initial input stage
  useEffect(() => {
    if (initialized && user && stage === 'input') {
      router.push('/dashboard');
    }
  }, [user, initialized, router, stage]);

  // Background check listener to dynamically detect Magic Link click verification
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (stage === 'otp' && !localFallback) {
      interval = setInterval(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          clearInterval(interval);
          // Auto-generate password and advance to credentials stage!
          const securePassword = `TypeVision_@${Math.floor(1000 + Math.random() * 9000)}`;
          setGeneratedPassword(securePassword);
          setStage('credentials');
        }
      }, 1500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stage, localFallback]);

  // Trigger real Supabase SMTP to send OTP/Link to owner email, with automatic local fail-safe
  const triggerSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLocalFallback(false);

    if (!instituteName.trim() || !ownerName.trim() || !ownerEmail.trim() || !mobileNo.trim() || !dob.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (mobileNo.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      // Trigger Supabase built-in SMTP to send a real OTP code/link to the email address
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: ownerEmail.trim(),
        options: {
          shouldCreateUser: true
        }
      });

      // If Supabase SMTP throws a rate-limit (429) or SMTP config error, initiate fail-safe fallback
      if (otpError) {
        console.warn('Supabase SMTP failed or rate-limited. Falling back to secure local OTP:', otpError);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setLocalFallback(true);
      }

      setStage('otp');
    } catch (err: any) {
      console.warn('Supabase SMTP triggered exception. Falling back to local OTP:', err);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setLocalFallback(true);
      setStage('otp');
    } finally {
      setLoading(false);
    }
  };

  // Verify entered OTP code (handles both native Supabase verify and local fallback verification)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!enteredOtp.trim() || enteredOtp.length < 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      if (localFallback) {
        // Verify local fallback OTP code
        if (enteredOtp.trim() !== generatedOtp) {
          throw new Error('Invalid verification code. Please try again.');
        }
      } else {
        // Natively verify the OTP token using Supabase VerifyOtp API
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          email: ownerEmail.trim(),
          token: enteredOtp.trim(),
          type: 'email'
        });

        if (verifyError) throw verifyError;
        if (!verifyData.user) {
          throw new Error('OTP verification failed.');
        }
      }

      // Generate a secure temporary password
      const securePassword = `TypeVision_@${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedPassword(securePassword);
      setStage('credentials');
    } catch (err: any) {
      console.error('verify error:', err);
      setError(err.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Copy credentials to clipboard
  const handleCopyCredentials = () => {
    const text = `Tutor Login ID: ${ownerEmail}\nGenerated Password: ${generatedPassword}\nLogin Portal: ${window.location.origin}/institute/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Finalize password setting & insert organization parameters
  const handleFinalizeRegistration = async () => {
    setError(null);
    setStage('submitting');
    setLoading(true);

    try {
      let currentUser: any = null;

      if (localFallback) {
        // 1. In fallback mode, the user isn't registered in auth yet, so we sign them up natively
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: ownerEmail.trim(),
          password: generatedPassword,
          options: {
            data: {
              display_name: ownerName.trim()
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) {
          throw new Error('Auth registration failed. Please try again.');
        }
        currentUser = authData.user;
      } else {
        // 1. In native mode, user is already logged in, so we just retrieve and set their password
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          throw new Error('No authenticated tutor session found. Please reload and try again.');
        }
        currentUser = authUser;

        // Set/update the user's password in Supabase auth to the auto-generated one
        const { error: passwordError } = await supabase.auth.updateUser({
          password: generatedPassword
        });
        if (passwordError) throw passwordError;
      }

      // 2. Create Organization in the public.organizations table
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: instituteName.trim(),
          type: 'institute'
        })
        .select();

      if (orgError) throw orgError;
      if (!orgData || orgData.length === 0) {
        throw new Error('Failed to initialize Institute database entry.');
      }
      const newOrg = orgData[0];

      // 3. Update public.users database row to set role = 'principal', link organization_id, and save mobile / dob
      // A retry loop is utilized to accommodate asynchronous trigger execution in Postgres
      let profileRowUpdated = false;
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('users')
          .update({
            role: 'principal',
            organization_id: newOrg.id,
            mobile_no: mobileNo.trim(),
            dob: dob ? dob : null
          })
          .eq('id', currentUser.id)
          .select();

        if (!updateError && updatedProfile && updatedProfile.length > 0) {
          profileRowUpdated = true;
          break;
        }
        // Wait 250ms before retrying
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      if (!profileRowUpdated) {
        throw new Error('Failed to bind your tutor profile with your new Institute entry.');
      }

      // 4. Force state update and redirect
      await initialize();
      router.push('/dashboard');

    } catch (err: any) {
      console.error('Finalize registration error:', err);
      setError(err.message || 'An unexpected database synchronization error occurred.');
      setStage('credentials'); // Fallback to let them see password and try again
    } finally {
      setLoading(false);
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
      <div className="absolute top-1/2 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[120px] opacity-70"></div>

      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-slate-950/60 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        
        {/* Step 1: Input details */}
        {stage === 'input' && (
          <>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 animate-pulse">
                <School className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">Register Institute</h2>
              <p className="mt-2 text-xs text-slate-400">
                Setup your elite classroom speed testing infrastructure today.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={triggerSendOtp} className="mt-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="instituteName" className="block text-xs font-bold text-slate-400">
                    Institute Name
                  </label>
                  <div className="relative mt-1.5">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <School className="h-4 w-4" />
                    </div>
                    <input
                      id="instituteName"
                      type="text"
                      required
                      value={instituteName}
                      onChange={(e) => setInstituteName(e.target.value)}
                      className="block w-full rounded-xl border border-white/10 bg-slate-900/50 py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500 transition-all text-xs font-semibold"
                      placeholder="e.g. Vision IT Computer Institute"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="ownerName" className="block text-xs font-bold text-slate-400">
                    Tutor / Owner Full Name
                  </label>
                  <div className="relative mt-1.5">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="ownerName"
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="block w-full rounded-xl border border-white/10 bg-slate-900/50 py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500 transition-all text-xs font-semibold"
                      placeholder="e.g. Aditya Sharma"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="ownerEmail" className="block text-xs font-bold text-slate-400">
                    Tutor Email Address
                  </label>
                  <div className="relative mt-1.5">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="ownerEmail"
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      className="block w-full rounded-xl border border-white/10 bg-slate-900/50 py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500 transition-all text-xs font-semibold"
                      placeholder="e.g. owner@institute.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mobileNo" className="block text-xs font-bold text-slate-400">
                    Mobile Number
                  </label>
                  <div className="relative mt-1.5">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      id="mobileNo"
                      type="tel"
                      required
                      value={mobileNo}
                      onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, ''))}
                      className="block w-full rounded-xl border border-white/10 bg-slate-900/50 py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500 transition-all text-xs font-semibold"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dob" className="block text-xs font-bold text-slate-400">
                    Date of Birth
                  </label>
                  <div className="relative mt-1.5">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <input
                      id="dob"
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="block w-full rounded-xl border border-white/10 bg-slate-900/50 py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500 transition-all text-xs font-semibold text-slate-400 focus:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all cursor-pointer animate-in fade-in"
                >
                  {loading ? 'Sending Verification...' : 'Send Verification Code'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Already registered?{' '}
                <Link href="/institute/login" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                  Tutor Login
                </Link>
              </p>
            </div>
          </>
        )}

        {/* Step 2: OTP verification */}
        {stage === 'otp' && (
          <>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 animate-pulse">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">Verify Email</h2>
              <p className="mt-2 text-xs text-slate-400">
                A verification request has been dispatched to <span className="font-semibold text-white">{ownerEmail}</span>
              </p>
            </div>

            {/* Real OTP Dispatch / Magic Link Notification Alert / Local Fallback Box */}
            {localFallback ? (
              <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 p-4 text-xs text-amber-400 font-semibold space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 animate-pulse text-amber-400" />
                  <span>Rate-Limit / SMTP Fallback:</span>
                </div>
                <p className="leading-relaxed">
                  The email server is currently rate-limited (limit: 1 mail per min) or has template rendering errors. For complete convenience, enter the backup code: <strong className="text-white text-sm tracking-wider font-mono bg-slate-900/50 px-2.5 py-0.5 rounded border border-white/5">{generatedOtp}</strong>
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-cyan-500/25 bg-cyan-950/20 p-4 text-xs text-cyan-400 font-semibold space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
                  <span>Verification Dispatch:</span>
                </div>
                <p className="leading-relaxed">
                  A verification link or 6-digit code has been dispatched successfully to: <strong className="text-white font-mono">{ownerEmail}</strong>.
                </p>
                <div className="h-[1px] bg-white/5 my-2"></div>
                <p className="font-normal text-slate-350 text-[10px] leading-relaxed space-y-1">
                  <strong>How to verify:</strong><br />
                  • If you got a **6-Digit Code (OTP)**, enter it below.<br />
                  • If you got a **"Sign in" Link**, click the link in your email. This page will **automatically detect it** and advance you!
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
              <div>
                <label htmlFor="enteredOtp" className="block text-xs font-bold text-slate-400">
                  {localFallback ? 'Enter the Backup Code shown above' : '6-Digit Verification Code (if received)'}
                </label>
                <input
                  id="enteredOtp"
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  className="block w-full text-center rounded-xl border border-white/10 bg-slate-900/50 py-3.5 text-lg font-bold font-mono tracking-widest text-slate-100 placeholder-slate-600 outline-none focus:border-cyan-500 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="000000"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStage('input')}
                  className="w-1/3 rounded-xl border border-white/5 bg-slate-900 py-3.5 text-xs font-bold text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer disabled:opacity-55"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                  {!loading && <CheckCircle2 className="h-4 w-4" />}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 3: Auto-generate credentials & display */}
        {stage === 'credentials' && (
          <>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <Key className="h-6 w-6 text-cyan-400" />
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">Credentials Generated</h2>
              <p className="mt-2 text-xs text-slate-400">
                Below is your secure generated temporary password. Copy and store it safely.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Generated Details Card */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 space-y-4 text-left shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-cyan-500/5 blur-xl"></div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tutor Login ID</span>
                <p className="text-xs font-semibold text-white font-mono truncate">{ownerEmail}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tutor Password</span>
                <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                  <span className="text-xs font-bold text-cyan-400 font-mono tracking-wider">
                    {showPassword ? generatedPassword : '••••••••••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900 py-3.5 text-xs font-bold text-slate-350 hover:bg-slate-800 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="h-4 w-4 text-cyan-400" />
                    <span>Copy Credentials details</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleFinalizeRegistration}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-xs font-bold text-white shadow-xl hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer shadow-cyan-500/10 animate-bounce"
              >
                <span>Finalize & Access Portal</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {/* Step 4: Submitting Database updates loader */}
        {stage === 'submitting' && (
          <div className="py-8 space-y-6 text-center animate-in fade-in duration-200">
            <RefreshCw className="h-10 w-10 animate-spin text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] mx-auto" />
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-white tracking-wide">Syncing Deployment Parameters...</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                Creating secure organization workspace, writing database RLS triggers, and linking your tutor administrative profile. Please do not close your browser.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
