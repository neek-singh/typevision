'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabase';
import {
  BookOpen, Plus, Trash2, Search, Award, RefreshCw,
  CheckCircle2, AlertCircle, X, ShieldAlert, Sparkles,
  Languages, Globe, BookOpenCheck, Settings
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  content: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  language: 'English' | 'Hindi';
  type: 'theory' | 'practical';
  created_at: string;
}

export default function AdminDashboard() {
  // Authentication states
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Lessons data state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'theory' | 'practical'>('all');
  const [langFilter, setLangFilter] = useState<'all' | 'English' | 'Hindi'>('all');

  // Modal control states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states for Create Lesson
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [language, setLanguage] = useState<'English' | 'Hindi'>('English');
  const [lessonType, setLessonType] = useState<'theory' | 'practical'>('practical');
  const [saving, setSaving] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  // Authentication check & session subscription
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!error && profile && ['admin', 'principal', 'staff'].includes(profile.role)) {
            setUser(session.user);
          } else {
            setAuthError('Access Denied: You do not have administrator permissions.');
            await supabase.auth.signOut();
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile && ['admin', 'principal', 'staff'].includes(profile.role)) {
          setUser(session.user);
          setAuthError(null);
        } else {
          setAuthError('Access Denied: You do not have administrator permissions.');
          setUser(null);
          await supabase.auth.signOut();
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError || !profile || !['admin', 'principal', 'staff'].includes(profile.role)) {
        await supabase.auth.signOut();
        throw new Error('Access Denied: You do not have administrator permissions.');
      }
      
      setUser(data.user);
      showToast('Welcome back, Administrator!', 'success');
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setAuthError(err.message || 'Failed to authenticate.');
      showToast(err.message || 'Authentication failed.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    showToast('Signed out successfully.', 'success');
  };

  // Fetch all lessons from Supabase database
  const fetchLessons = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Handle null/missing types gracefully by defaulting to 'practical'
      const formatted = (data || []).map((l: any) => ({
        ...l,
        type: l.type || 'practical',
      }));

      setLessons(formatted);
    } catch (err: any) {
      console.error('Error fetching lessons:', err);
      showToast(err.message || 'Failed to sync platform lessons.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Handle lesson deletion
  const handleDeleteLesson = async (id: string, lessonTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete the lesson "${lessonTitle}"? This will erase all student high scores for it.`)) return;

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLessons(lessons.filter((l) => l.id !== id));
      showToast('Lesson deleted successfully.', 'success');
    } catch (err: any) {
      console.error('Failed to delete lesson:', err);
      showToast(err.message || 'Deletion failed.', 'error');
    }
  };

  // Handle lesson creation
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          title: title.trim(),
          content: content.trim(),
          level,
          language,
          type: lessonType,
        })
        .select();

      if (error) throw error;

      // Reset form states
      setTitle('');
      setContent('');
      setLevel('Beginner');
      setLanguage('English');
      setLessonType('practical');
      setShowCreateModal(false);
      showToast('New lesson uploaded successfully!', 'success');
      
      // Refresh list
      fetchLessons();
    } catch (err: any) {
      console.error('Failed to insert lesson:', err);
      showToast(err.message || 'Failed to publish lesson.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filter lessons matching search terms and filters
  const filteredLessons = lessons.filter((l) => {
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || l.type === typeFilter;
    const matchesLang = langFilter === 'all' || l.language === langFilter;
    return matchesSearch && matchesType && matchesLang;
  });

  // Calculate statistics
  const totalLessons = lessons.length;
  const theoryCount = lessons.filter(l => l.type === 'theory').length;
  const practicalCount = lessons.filter(l => l.type === 'practical').length;
  const englishCount = lessons.filter(l => l.language === 'English').length;
  const hindiCount = lessons.filter(l => l.language === 'Hindi').length;

  if (checkingAuth) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-screen bg-[#020617] space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/25 border-t-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]"></div>
        <p className="text-sm text-slate-400 font-semibold tracking-wider animate-pulse">Verifying Admin Credentials...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#020617] p-4 overflow-hidden select-none">
        {/* Background glows */}
        <div className="absolute top-1/4 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[150px]" />

        <div className="w-full max-w-md rounded-3xl border border-white/5 bg-slate-900/20 backdrop-blur-xl p-8 space-y-6 shadow-2xl relative">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">TypeVision Admin</h2>
            <p className="text-xs text-slate-400 font-medium">Please sign in with administrator or staff credentials to manage the curriculum.</p>
          </div>

          {authError && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-950/20 p-4 text-xs font-semibold text-rose-350 animate-in fade-in">
              <AlertCircle className="h-4.5 w-4.5 text-rose-450 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <input
                type="email"
                placeholder="admin@typevision.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-3 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-3 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-xs font-bold text-white hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-50 shadow-lg cursor-pointer"
            >
              {authLoading ? 'Authenticating...' : 'Sign In as Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-screen bg-[#020617] space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/25 border-t-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]"></div>
        <p className="text-sm text-slate-400 font-semibold tracking-wider animate-pulse">Entering Platform Admin Control Panel...</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10 min-h-screen text-left">
      {/* Background glow glows */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-500/5 blur-[120px] opacity-60" />
      <div className="absolute bottom-1/4 left-1/3 -z-10 h-[300px] w-[500px] rounded-full bg-purple-600/5 blur-[120px] opacity-50" />

      {/* Toast popup */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl text-sm font-semibold animate-in slide-in-from-bottom-4 duration-200 ${
          toast.type === 'success'
            ? 'border-emerald-500/30 bg-emerald-950/80 text-emerald-300 backdrop-blur-md'
            : 'border-rose-500/30 bg-rose-950/80 text-rose-300 backdrop-blur-md'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-current opacity-60 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-950/20 px-3 py-1 text-xs font-semibold text-indigo-400">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Platform Administrator Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            TypeVision Curriculum Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Create and maintain practice syllabus. Author typing assignments with custom layout tags, difficulty levels, and theory reading modules.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:from-indigo-400 hover:to-purple-500 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Lesson</span>
          </button>
          <button
            onClick={fetchLessons}
            disabled={refreshing}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"
            title="Refresh Curriculum"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSignOut}
            className="flex h-10 px-4 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-350 hover:bg-rose-900/30 transition-all cursor-pointer text-xs font-bold"
            title="Logout from Admin Console"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* ── CURRICULUM STATS CARDS ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: 'Total Lessons', value: totalLessons.toString(), sub: 'active syllabus', icon: BookOpen, color: 'text-indigo-400', bg: 'from-indigo-500/[0.02] to-blue-500/[0.02]' },
          { label: 'Theory Modules', value: theoryCount.toString(), sub: 'reading lessons', icon: BookOpenCheck, color: 'text-purple-400', bg: 'from-purple-500/[0.02] to-pink-500/[0.02]' },
          { label: 'Practical Drills', value: practicalCount.toString(), sub: 'typing engines', icon: Award, color: 'text-cyan-400', bg: 'from-cyan-500/[0.02] to-teal-500/[0.02]' },
          { label: 'English Layouts', value: englishCount.toString(), sub: 'qwerty keymaps', icon: Globe, color: 'text-emerald-400', bg: 'from-emerald-500/[0.02] to-green-500/[0.02]' },
          { label: 'Hindi Layouts', value: hindiCount.toString(), sub: 'krutidev layout', icon: Languages, color: 'text-amber-400', bg: 'from-amber-500/[0.02] to-orange-500/[0.02]' },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-white/5 bg-slate-900/10 p-5 backdrop-blur-sm relative overflow-hidden group">
            <div className={`absolute inset-0 bg-gradient-to-r ${bg} opacity-0 transition-opacity duration-350 group-hover:opacity-100`} />
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
              <Icon className={`h-4.5 w-4.5 ${color} shrink-0`} />
            </div>
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-2xl font-black text-white tracking-tight">{value}</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-2 leading-tight">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── FILTER & EXPLORATION ROW ── */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-extrabold text-white tracking-wide flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
            <span>Curriculum Inventory Logs</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-550" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl border border-white/5 bg-slate-950 pl-9 pr-4 py-1.5 text-xs font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none w-48 transition-all"
              />
            </div>
            
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="rounded-xl border border-white/5 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="theory">Theory Only</option>
              <option value="practical">Practical Typing</option>
            </select>

            {/* Language Filter */}
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value as any)}
              className="rounded-xl border border-white/5 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi (Krutidev)</option>
            </select>
          </div>
        </div>

        {/* ── LESSONS INVENTORY GRID ── */}
        {filteredLessons.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-16 text-center text-slate-500 font-medium">
            No curriculum lessons found matching your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLessons.map((lesson) => (
              <div key={lesson.id} className="relative rounded-3xl border border-white/5 bg-slate-900/20 p-5 flex flex-col justify-between group hover:border-white/10 transition-all shadow-md">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[8px] font-black uppercase border ${
                        lesson.language === 'English'
                          ? 'bg-cyan-950/30 text-cyan-400 border-cyan-500/10'
                          : 'bg-amber-950/30 text-amber-400 border-amber-500/10'
                      }`}>
                        {lesson.language}
                      </span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[8px] font-black uppercase border ${
                        lesson.type === 'theory'
                          ? 'bg-purple-950/30 text-purple-400 border-purple-500/10'
                          : 'bg-emerald-950/30 text-emerald-400 border-emerald-500/10'
                      }`}>
                        {lesson.type}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{lesson.level}</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-white leading-tight group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {lesson.title}
                  </h3>
                  <div className="text-[10px] text-slate-400 font-medium leading-relaxed line-clamp-4 bg-slate-950/40 p-3 rounded-xl border border-white/[0.02] h-24 overflow-hidden select-all">
                    {lesson.content}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between">
                  <span className="text-[9px] text-slate-650 text-slate-500">
                    Uploaded: {new Date(lesson.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-slate-900/60 text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-all cursor-pointer"
                    title="Delete Lesson"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CREATE LESSON MODAL ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl relative text-left space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">Create New Curriculum Lesson</h3>
                <p className="text-xs text-slate-400">Add interactive typing drills or reading-only theory tutorials.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Lesson Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Hindi Intermediate Shift-Key Practice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Language */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">Syllabus Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="English">English QWERTY</option>
                    <option value="Hindi">Hindi (Krutidev 010)</option>
                  </select>
                </div>

                {/* Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">Skill Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Lesson Type (Theory vs Practical) -- The key new feature! */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">Lesson Type</label>
                  <select
                    value={lessonType}
                    onChange={(e) => setLessonType(e.target.value as any)}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="practical">Practical Typing Drill</option>
                    <option value="theory">Theory Tutorial Only</option>
                  </select>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400">Lesson Material Content *</label>
                  <span className="text-[9px] text-slate-500 font-semibold">
                    {lessonType === 'theory' 
                      ? 'Format reading paragraphs here.' 
                      : 'Hindi: type mapped keys. English: type target drill script.'
                    }
                  </span>
                </div>
                <textarea
                  placeholder={
                    lessonType === 'theory'
                      ? 'Type the reading theory tutorial text here. You can use standard formatting or multiple paragraphs.'
                      : 'Type the actual practice script that students will type. Example: "asdfg hjkl;"'
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-40 rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-50 shadow-lg cursor-pointer"
                >
                  {saving ? 'Creating Lesson...' : 'Publish Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
