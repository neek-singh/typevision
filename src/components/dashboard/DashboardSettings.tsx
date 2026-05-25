'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/utils/supabase';
import { User, Lock, Keyboard, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { clearCache } from '@/lib/cache/cache-utils';

export default function DashboardSettings() {
  const { user, profile, initialized } = useAuthStore();
  
  const [displayName, setDisplayName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [languagePref, setLanguagePref] = useState<'English' | 'Hindi'>('English');
  const [targetWpm, setTargetWpm] = useState(40);

  // Sync state values on profile mount
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
    }
  }, [profile]);

  // Update profile handler (mutates public.users display_name)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdatingProfile(true);
    setProfileSuccess(false);
    setProfileError(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({ display_name: displayName })
        .eq('id', user.id);

      if (error) throw error;

      // Invalidate profile cache entry
      clearCache(`profile-${user.id}`);

      // Sync the Zustand store's profile state to reflect changes instantly across layout menus
      useAuthStore.setState((state) => ({
        profile: state.profile ? { ...state.profile, display_name: displayName } : null,
      }));

      setProfileSuccess(true);
      
      // Update local storage or session store state directly by executing a shallow refresh
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to update profile name:', err);
      setProfileError(err.message || 'Failed to update name.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Update password handler (mutates auth.users credentials via auth API)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordSuccess(false);
    setPasswordError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;
      setPasswordSuccess(true);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to mutate credentials password:', err);
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="relative w-full space-y-8 text-left">
      {/* Glow Decor */}
      <div className="absolute top-1/4 left-1/3 -z-10 h-[300px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]"></div>

      {/* Title bar */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Account Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Configure profile metrics, security settings, and keyboard configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings categories navigation links */}
        <div className="lg:col-span-1 space-y-4 text-left">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 space-y-1">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Category Panel</span>
            <div className="flex flex-col space-y-1">
              <button className="flex w-full items-center gap-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-white/5 px-3 py-2.5 text-xs font-bold text-left">
                <User className="h-4 w-4" />
                <span>Profile & Custom Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Box */}
        <div className="lg:col-span-2 space-y-8 text-left">
          
          {/* Module 1: Profile Information */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <User className="h-4 w-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Profile Details</h3>
            </div>

            {profileSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-400">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Display name successfully updated!</span>
              </div>
            )}
            {profileError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address (Read Only)</label>
                <input
                  type="text"
                  disabled
                  value={user?.email || ''}
                  className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-3 text-xs text-slate-500 focus:outline-none opacity-60 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdatingProfile ? 'Saving...' : 'Save Profile Name'}
              </button>
            </form>
          </div>

          {/* Module 2: Security & Credentials */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Lock className="h-4 w-4 text-rose-400" />
              <h3 className="text-base font-bold text-white">Change Password</h3>
            </div>

            {passwordSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-400">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Password changed successfully!</span>
              </div>
            )}
            {passwordError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-semibold text-slate-300">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="rounded-xl border border-rose-500/30 bg-rose-950/20 px-5 py-3 text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Module 3: Tactile Preferences */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Keyboard className="h-4 w-4 text-purple-400" />
              <h3 className="text-base font-bold text-white">Tactile Preferences</h3>
            </div>

            <div className="space-y-4">
              {/* Default Language selection */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-white">Default Exercise Language</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Preferred typing practice configuration when launching layouts.</p>
                </div>
                <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/5 shrink-0">
                  {(['English', 'Hindi'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguagePref(lang)}
                      className={`rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all ${
                        languagePref === lang
                          ? 'bg-cyan-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'Hindi' ? 'Hindi Krutidev' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-white/5"></div>

              {/* Goal Speed selection */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-white">Speed Targets (WPM)</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Configure your custom target speeds for analytical gauge ranges.</p>
                </div>
                <select
                  value={targetWpm}
                  onChange={(e) => setTargetWpm(Number(e.target.value))}
                  className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value={20}>20 WPM (Standard Casual)</option>
                  <option value={40}>40 WPM (Professional standard)</option>
                  <option value={60}>60 WPM (Expert level)</option>
                  <option value={80}>80 WPM+ (Typing Legend)</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
