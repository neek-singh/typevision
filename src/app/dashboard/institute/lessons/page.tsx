'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Search, Award, Clock, Database, Plus,
  RefreshCw, CheckCircle2, AlertCircle, X, Eye, ClipboardCheck,
  Languages, Globe, ShieldCheck, Trophy, Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/utils/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  content: string;
  level: string;
  language: string;
  created_at: string;
}

interface Batch {
  id: string;
  name: string;
}

// ─── Toast Notification ───────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl text-sm font-semibold animate-in slide-in-from-bottom-4 duration-200 ${
      type === 'success'
        ? 'border-emerald-500/30 bg-emerald-950/80 text-emerald-300 backdrop-blur-md'
        : 'border-rose-500/30 bg-rose-950/80 text-rose-300 backdrop-blur-md'
    }`}>
      {type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-current opacity-60 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
    </div>
  );
}

// ─── Lessons Explorer Page ───────────────────────────────────────────────────

export default function LessonsExplorer() {
  const { profile } = useAuthStore();
  const orgId = profile?.organization_id;

  // Data State
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // Modal State
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [assignLesson, setAssignLesson] = useState<Lesson | null>(null);

  // Deploy Form State
  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignBatch, setNewAssignBatch] = useState('');
  const [newAssignTargetWpm, setNewAssignTargetWpm] = useState(40);
  const [newAssignTargetAcc, setNewAssignTargetAcc] = useState(90);
  const [newAssignDue, setNewAssignDue] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  // ─── Fetching Data ─────────────────────────────────────────────────────────

  const fetchLessons = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('language')
        .order('level')
        .order('title');

      if (error) throw error;
      setLessons(data || []);
    } catch (err: any) {
      console.error('Error fetching lessons:', err);
      showToast('Failed to load lessons.', 'error');
    }
  }, [showToast]);

  const fetchBatches = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase
      .from('classes_or_batches')
      .select('id, name')
      .eq('organization_id', orgId)
      .order('name');
    setBatches(data || []);
  }, [orgId]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchLessons(), fetchBatches()]);
    setLoading(false);
  }, [fetchLessons, fetchBatches]);

  useEffect(() => {
    fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Deploy Handler ────────────────────────────────────────────────────────

  const handleDeployExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignLesson || !newAssignTitle.trim() || !newAssignBatch || !orgId) return;
    setSavingAssignment(true);
    try {
      const { error } = await supabase.from('assignments').insert({
        title: newAssignTitle.trim(),
        class_id: newAssignBatch,
        lesson_id: assignLesson.id,
        target_wpm: newAssignTargetWpm,
        target_accuracy: newAssignTargetAcc,
        due_date: newAssignDue || null,
        created_by: profile?.id,
      });

      if (error) throw error;

      setNewAssignTitle('');
      setNewAssignBatch('');
      setNewAssignTargetWpm(40);
      setNewAssignTargetAcc(90);
      setNewAssignDue('');
      setAssignLesson(null);
      showToast('Mock Exam deployed successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Deployment failed.', 'error');
    } finally {
      setSavingAssignment(false);
    }
  };

  // ─── Filtering ─────────────────────────────────────────────────────────────

  const filteredLessons = lessons.filter((l) => {
    const matchesLang = langFilter === 'all' || l.language.toLowerCase() === langFilter;
    const matchesLevel = levelFilter === 'all' || l.level.toLowerCase() === levelFilter.toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch = l.title.toLowerCase().includes(term) || l.content.toLowerCase().includes(term);
    return matchesLang && matchesLevel && matchesSearch;
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading lessons library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full min-h-[calc(100vh-3.5rem)] bg-slate-950">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px] opacity-60" />
      <div className="absolute bottom-1/4 left-1/3 -z-10 h-[250px] w-[500px] rounded-full bg-purple-600/5 blur-[120px] opacity-50" />

      {/* ── HEADER ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-cyan-400" />
            <span>Lessons Library Explorer</span>
          </h1>
          <p className="text-xs text-slate-400">Review practice scripts, inspect language content, and deploy mock tests.</p>
        </div>
        <button
          onClick={fetchAll}
          className="self-end sm:self-auto flex items-center gap-1.5 rounded-xl border border-white/5 bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* ── FILTERS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by lesson title or typing text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/5 bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:bg-slate-900 transition-all"
          />
        </div>

        {/* Language Filter */}
        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value)}
          className="w-full rounded-xl border border-white/5 bg-slate-900/60 px-3.5 py-2.5 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none focus:bg-slate-900 transition-all cursor-pointer"
        >
          <option value="all">All Languages</option>
          <option value="english">English Lessons</option>
          <option value="hindi">Hindi Krutidev Lessons</option>
        </select>

        {/* Level Filter */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="w-full rounded-xl border border-white/5 bg-slate-900/60 px-3.5 py-2.5 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none focus:bg-slate-900 transition-all cursor-pointer"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* ── LESSONS GRID ── */}
      {filteredLessons.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-16 text-center text-slate-500 text-sm">
          No lessons found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLessons.map((l) => (
            <div key={l.id} className="relative rounded-3xl border border-white/5 bg-slate-900/20 p-5 flex flex-col justify-between group hover:border-white/10 transition-all">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    l.language.toLowerCase() === 'english'
                      ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20'
                      : 'bg-amber-950/40 text-amber-400 border border-amber-500/20'
                  }`}>
                    {l.language}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 capitalize">{l.level}</span>
                </div>
                <h3 className="text-sm font-extrabold text-white leading-tight group-hover:text-cyan-400 transition-colors line-clamp-1">
                  {l.title}
                </h3>
                <p className="text-[10px] text-slate-500 leading-normal line-clamp-3 bg-slate-950/30 p-2.5 rounded-xl border border-white/[0.02]">
                  {l.content}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/5 mt-4 flex gap-2">
                <button
                  onClick={() => setSelectedLesson(l)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-slate-900 px-3 py-2 text-[10px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Inspect Script</span>
                </button>
                {orgId && (
                  <button
                    onClick={() => {
                      setAssignLesson(l);
                      setNewAssignTitle(`Exam: ${l.title}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 px-3 py-2 text-[10px] font-bold text-cyan-400 hover:bg-cyan-950/60 hover:border-cyan-500/30 transition-all cursor-pointer"
                  >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    <span>Quick Deploy</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────── MODALS ─────────────────────── */}

      {/* INSPECT LESSON MODAL */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${
                    selectedLesson.language.toLowerCase() === 'english'
                      ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20'
                      : 'bg-amber-950/40 text-amber-400 border border-amber-500/20'
                  }`}>
                    {selectedLesson.language}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">{selectedLesson.level}</span>
                </div>
                <h3 className="text-base font-extrabold text-white mt-1.5">{selectedLesson.title}</h3>
              </div>
              <button onClick={() => setSelectedLesson(null)} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Typing Script text</label>
              <div className="w-full h-48 overflow-y-auto rounded-xl border border-white/5 bg-slate-900/60 p-4 text-xs font-semibold leading-relaxed text-slate-300 selection:bg-cyan-500/20 selection:text-cyan-300">
                {selectedLesson.content}
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setSelectedLesson(null)}
                className="flex-1 rounded-xl border border-white/5 bg-slate-900 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"
              >
                Close View
              </button>
              {orgId && (
                <button
                  onClick={() => {
                    const l = selectedLesson;
                    setSelectedLesson(null);
                    setAssignLesson(l);
                    setNewAssignTitle(`Exam: ${l.title}`);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-white hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg cursor-pointer"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  <span>Quick Deploy Exam</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUICK DEPLOY MOCK EXAM MODAL */}
      {assignLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white">Deploy Mock Exam</h3>
                <p className="text-xs text-slate-400">Deploying: <span className="text-cyan-400 font-bold">{assignLesson.title}</span></p>
              </div>
              <button onClick={() => setAssignLesson(null)} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleDeployExam} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Exam Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Krutidev Advanced Mock"
                  value={newAssignTitle}
                  onChange={(e) => setNewAssignTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Target Batch *</label>
                <select
                  value={newAssignBatch}
                  onChange={(e) => setNewAssignBatch(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none cursor-pointer"
                  required
                >
                  <option value="">— Select Batch —</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Target Speed (WPM) *</label>
                  <input
                    type="number"
                    min={1}
                    max={150}
                    value={newAssignTargetWpm}
                    onChange={(e) => setNewAssignTargetWpm(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Target Accuracy (%) *</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={newAssignTargetAcc}
                    onChange={(e) => setNewAssignTargetAcc(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Due Date (optional)</label>
                <input
                  type="date"
                  value={newAssignDue}
                  onChange={(e) => setNewAssignDue(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignLesson(null)}
                  className="flex-1 rounded-xl border border-white/5 bg-slate-900 py-3 text-xs font-bold text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAssignment}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold text-white hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {savingAssignment ? 'Deploying...' : 'Deploy Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
