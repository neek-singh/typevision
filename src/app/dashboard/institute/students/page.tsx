'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Award, Clock, Database, Trash2, Plus,
  RefreshCw, CheckCircle2, AlertCircle, X, ArrowRight,
  TrendingUp, Calendar, ChevronRight, GraduationCap, School,
  Eye, EyeOff
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/utils/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Batch {
  id: string;
  name: string;
}

interface Student {
  id: string;
  display_name: string;
  email: string;
  role: string;
  created_at: string;
  batchId?: string;
  batchName?: string;
  avgWpm?: number;
  avgAccuracy?: number;
  totalTests?: number;
}

interface TelemetryRecord {
  id: string;
  wpm: number;
  accuracy: number;
  mistakes: number;
  duration: number;
  created_at: string;
  lesson_title?: string;
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

// ─── Students Page Component ─────────────────────────────────────────────────

export default function StudentsExplorer() {
  const { profile } = useAuthStore();
  const orgId = profile?.organization_id;

  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryRecord[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);

  // Form State
  const [newStudName, setNewStudName] = useState('');
  const [newStudEmail, setNewStudEmail] = useState('');
  const [newStudPassword, setNewStudPassword] = useState('');
  const [showStudPassword, setShowStudPassword] = useState(false);
  const [newStudBatch, setNewStudBatch] = useState('');
  const [savingStudent, setSavingStudent] = useState(false);

  const [reassignBatchId, setReassignBatchId] = useState('');
  const [savingReassign, setSavingReassign] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  // ─── Fetching Data ─────────────────────────────────────────────────────────

  const fetchStudents = useCallback(async () => {
    if (!orgId) return;
    try {
      // Get all students
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', orgId)
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich students with batch and typing averages
      const enriched = await Promise.all((usersData || []).map(async (student) => {
        // Fetch batch
        const { data: csData } = await supabase
          .from('class_students')
          .select('class_id, classes_or_batches(name)')
          .eq('student_id', student.id)
          .maybeSingle();

        // Fetch averages
        const { data: resultsData } = await supabase
          .from('typing_results')
          .select('wpm, accuracy')
          .eq('user_id', student.id);

        let avgWpm = 0;
        let avgAccuracy = 0;
        const totalTests = resultsData?.length || 0;

        if (resultsData && resultsData.length > 0) {
          avgWpm = Math.round(resultsData.reduce((a, r) => a + r.wpm, 0) / resultsData.length);
          avgAccuracy = Math.round(resultsData.reduce((a, r) => a + r.accuracy, 0) / resultsData.length);
        }

        const batchInfo = csData as any;

        return {
          ...student,
          batchId: batchInfo?.class_id || null,
          batchName: batchInfo?.classes_or_batches?.name || 'Unassigned',
          avgWpm,
          avgAccuracy,
          totalTests,
        };
      }));

      setStudents(enriched);

      // Keep selected student synced if they are open
      if (selectedStudent) {
        const updated = enriched.find((s) => s.id === selectedStudent.id);
        if (updated) setSelectedStudent(updated);
      }
    } catch (err: any) {
      console.error('Error fetching students:', err);
      showToast(err.message || 'Failed to load students.', 'error');
    }
  }, [orgId, selectedStudent, showToast]);

  const fetchBatches = useCallback(async () => {
    if (!orgId) return;
    const { data, error } = await supabase
      .from('classes_or_batches')
      .select('id, name')
      .eq('organization_id', orgId)
      .order('name');
    if (error) {
      console.error('Error fetching batches:', error);
      return;
    }
    setBatches(data || []);
  }, [orgId]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStudents(), fetchBatches()]);
    setLoading(false);
  }, [fetchStudents, fetchBatches]);

  useEffect(() => {
    if (orgId) fetchAll();
  }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch telemetry history for selected student
  const fetchTelemetry = async (studentId: string) => {
    setTelemetryLoading(true);
    try {
      const { data, error } = await supabase
        .from('typing_results')
        .select('id, wpm, accuracy, mistakes, duration, created_at, lessons(title)')
        .eq('user_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((row: any) => ({
        id: row.id,
        wpm: row.wpm,
        accuracy: row.accuracy,
        mistakes: row.mistakes,
        duration: row.duration,
        created_at: row.created_at,
        lesson_title: row.lessons?.title || 'Practice Exercise',
      }));

      setTelemetry(formatted);
    } catch (err: any) {
      console.error('Telemetry fetch error:', err);
      showToast('Failed to load typing logs.', 'error');
    } finally {
      setTelemetryLoading(false);
    }
  };

  // Select student handler
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    fetchTelemetry(student.id);
  };

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudName.trim() || !newStudEmail.trim() || !newStudPassword.trim() || !orgId) return;
    setSavingStudent(true);
    try {
      const res = await fetch('/api/institute/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudName.trim(),
          email: newStudEmail.trim(),
          password: newStudPassword.trim(),
          organizationId: orgId,
          batchId: newStudBatch || null,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create student.');

      setNewStudName('');
      setNewStudEmail('');
      setNewStudPassword('');
      setNewStudBatch('');
      setShowAddModal(false);
      showToast('Student registered successfully!', 'success');
      await fetchStudents();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSavingStudent(false);
    }
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSavingReassign(true);
    try {
      // 1. Remove from old batch (if any)
      await supabase.from('class_students').delete().eq('student_id', selectedStudent.id);

      // 2. Add to new batch (if specified)
      if (reassignBatchId) {
        const { error } = await supabase
          .from('class_students')
          .insert({ class_id: reassignBatchId, student_id: selectedStudent.id });
        if (error) throw error;
      }

      showToast('Batch reassigned successfully!', 'success');
      setShowReassignModal(false);
      setReassignBatchId('');
      await fetchStudents();
    } catch (err: any) {
      showToast(err.message || 'Reassignment failed.', 'error');
    } finally {
      setSavingReassign(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm('Remove this student from your institute? Their account will remain but will be unlinked.')) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ organization_id: null, role: 'user' })
        .eq('id', studentId);

      if (error) throw error;

      // Delete from class_students
      await supabase.from('class_students').delete().eq('student_id', studentId);

      showToast('Student removed from institute.', 'success');
      if (selectedStudent?.id === studentId) setSelectedStudent(null);
      await fetchStudents();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove student.', 'error');
    }
  };

  // ─── Filtering ─────────────────────────────────────────────────────────────

  const filteredStudents = students.filter((s) => {
    const matchesBatch = batchFilter === 'all' || s.batchId === batchFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = s.display_name?.toLowerCase().includes(term) || s.email?.toLowerCase().includes(term);
    return matchesBatch && matchesSearch;
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  if (!orgId) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 bg-slate-950">
        <div className="text-center space-y-4 max-w-sm">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <School className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white">No Institute Linked</h2>
          <p className="text-sm text-slate-400">Your account is not linked to any organization.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading student registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col lg:flex-row min-h-[calc(100vh-3.5rem)] bg-slate-950">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Background ambient glows */}
      <div className="absolute top-10 left-1/4 -z-10 h-[300px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px] opacity-60" />
      <div className="absolute bottom-10 right-1/4 -z-10 h-[300px] w-[500px] rounded-full bg-purple-600/5 blur-[120px] opacity-45" />

      {/* ── LEFT PANEL: STUDENTS LIST ── */}
      <div className="flex flex-1 flex-col border-r border-white/5 p-6 lg:p-8 space-y-6">
        {/* Title + Action Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-cyan-400" />
              <span>Student Registry</span>
            </h1>
            <p className="text-xs text-slate-400">Manage batches, student logins, and track telemetry profiles.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Register Student</span>
            </button>
            <button
              onClick={fetchAll}
              className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-slate-900 px-3 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:bg-slate-900 transition-all"
            />
          </div>
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-white/5 bg-slate-900/60 px-3.5 py-2.5 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none focus:bg-slate-900 transition-all cursor-pointer"
          >
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Students Table */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/10 overflow-hidden shadow-2xl flex-1 min-h-[400px]">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-900/40 border-b border-white/5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 text-left">Student Profile</th>
                  <th className="px-6 py-4">Assigned Batch</th>
                  <th className="px-6 py-4">Avg Speed</th>
                  <th className="px-6 py-4">Avg Accuracy</th>
                  <th className="px-6 py-4">Tests taken</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => handleSelectStudent(s)}
                      className={`cursor-pointer transition-all hover:bg-white/[0.02] ${
                        selectedStudent?.id === s.id ? 'bg-cyan-500/[0.04] text-white border-l-2 border-l-cyan-400' : 'text-slate-300'
                      }`}
                    >
                      <td className="px-6 py-4 text-left">
                        <div className="font-bold text-white leading-tight">{s.display_name || '—'}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{s.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          s.batchId ? 'bg-purple-950/40 text-purple-300 border border-purple-500/20' : 'bg-slate-950/60 text-slate-400 border border-white/5'
                        }`}>
                          {s.batchName}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-cyan-400">
                        {s.avgWpm && s.avgWpm > 0 ? `${s.avgWpm} WPM` : '—'}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">
                        {s.avgAccuracy && s.avgAccuracy > 0 ? `${s.avgAccuracy}%` : '—'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-400">{s.totalTests || 0}</td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleRemoveStudent(s.id)}
                          className="text-slate-600 hover:text-rose-400 transition-colors"
                          title="Remove from institute"
                        >
                          <Trash2 className="h-3.5 w-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500 text-sm">
                      No student accounts found. Click <span className="text-cyan-400 font-bold">Register Student</span> to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: DETAILED TELEMETRY PANEL ── */}
      <div className={`w-full lg:w-96 shrink-0 bg-slate-950/40 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col transition-all overflow-hidden ${
        selectedStudent ? 'h-auto opacity-100' : 'h-0 lg:h-auto opacity-0 lg:opacity-100 lg:w-0'
      }`}>
        {selectedStudent ? (
          <div className="flex flex-col flex-1 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/5 pb-4">
              <div>
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Selected Profile</span>
                <h2 className="text-lg font-black text-white leading-tight">{selectedStudent.display_name}</h2>
                <p className="text-[10px] text-slate-500">{selectedStudent.email}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-500 hover:text-white p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Action Box */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Class / Batch:</span>
                <span className="font-extrabold text-purple-300">{selectedStudent.batchName}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setReassignBatchId(selectedStudent.batchId || '');
                    setShowReassignModal(true);
                  }}
                  className="flex-1 rounded-xl border border-white/5 bg-slate-900 px-3 py-2 text-[10px] font-bold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Change Batch
                </button>
                <button
                  onClick={() => handleRemoveStudent(selectedStudent.id)}
                  className="rounded-xl border border-rose-950/20 bg-rose-950/10 px-3 py-2 text-[10px] font-bold text-rose-400 hover:bg-rose-900/20 transition-all cursor-pointer"
                >
                  Remove Account
                </button>
              </div>
            </div>

            {/* Career Averages */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-4 flex flex-col justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Avg Speed</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-cyan-400">{selectedStudent.avgWpm || 0}</span>
                  <span className="text-[10px] font-bold text-slate-500">WPM</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-4 flex flex-col justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Avg Accuracy</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-emerald-400">{selectedStudent.avgAccuracy || 0}%</span>
                </div>
              </div>
            </div>

            {/* Performance Telemetry History */}
            <div className="flex-1 flex flex-col min-h-[250px] space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                <span className="font-extrabold text-white flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Telemetry Logs</span>
                </span>
                <span className="text-[10px] text-slate-500">{telemetry.length} records</span>
              </div>

              {telemetryLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full border border-cyan-500/20 border-t-cyan-400 animate-spin" />
                </div>
              ) : telemetry.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center text-xs text-slate-500 py-10">
                  No typing logs recorded for this student.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[350px] pr-1">
                  {telemetry.map((log) => (
                    <div key={log.id} className="rounded-xl border border-white/[0.03] bg-slate-950/60 p-3 space-y-1.5 hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-bold text-white leading-tight line-clamp-1">{log.lesson_title}</span>
                        <span className="text-[9px] font-medium text-slate-500 shrink-0">{new Date(log.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="text-cyan-400 font-extrabold">{log.wpm} WPM</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-emerald-400 font-extrabold">{log.accuracy}% acc</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">{log.mistakes} mistakes</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center text-center p-6 text-slate-500 text-xs">
            Select a student to view their detailed performance logs and recent telemetry.
          </div>
        )}
      </div>

      {/* ─────────────────────── MODALS ─────────────────────── */}

      {/* REGISTER STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white">Register Student</h3>
                <p className="text-xs text-slate-400">Create a new student account for your institute.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={newStudName}
                  onChange={(e) => setNewStudName(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Email Address *</label>
                <input
                  type="email"
                  placeholder="student@email.com"
                  value={newStudEmail}
                  onChange={(e) => setNewStudEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Password *</label>
                <div className="relative">
                  <input
                    type={showStudPassword ? 'text' : 'password'}
                    placeholder="Set a login password for student"
                    value={newStudPassword}
                    onChange={(e) => setNewStudPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 pl-4 pr-10 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudPassword(!showStudPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    title={showStudPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showStudPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Assign to Batch (optional)</label>
                <select
                  value={newStudBatch}
                  onChange={(e) => setNewStudBatch(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">— No batch yet —</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-white/5 bg-slate-900 py-3 text-xs font-bold text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStudent}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold text-white hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {savingStudent ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REASSIGN STUDENT BATCH MODAL */}
      {showReassignModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">Reassign Student Batch</h3>
                <p className="text-xs text-slate-400">Assign {selectedStudent.display_name} to a batch.</p>
              </div>
              <button onClick={() => setShowReassignModal(false)} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleReassign} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Select Batch</label>
                <select
                  value={reassignBatchId}
                  onChange={(e) => setReassignBatchId(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">— Unassign / No Batch —</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  className="flex-1 rounded-xl border border-white/5 bg-slate-900 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReassign}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-white hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {savingReassign ? 'Reassigning...' : 'Confirm Reassign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
