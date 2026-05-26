'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  School, Users, BookOpen, Clock, Plus, Trash2, Search, Award,
  Trophy, GraduationCap, Database, Sparkles, Globe, Languages,
  FileText, RefreshCw, AlertCircle, CheckCircle2, X, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/utils/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Batch {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  studentCount?: number;
  avgWpm?: number;
  avgAccuracy?: number;
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

interface Assignment {
  id: string;
  title: string;
  target_wpm: number;
  target_accuracy: number;
  due_date: string | null;
  class_id: string;
  lesson_id: string | null;
  created_at: string;
  batchName?: string;
  submissions?: number;
}

interface Lesson {
  id: string;
  title: string;
  level: string;
  language: string;
}

interface OrgStats {
  totalStudents: number;
  totalBatches: number;
  avgWpm: number;
  avgAccuracy: number;
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InstituteDashboard() {
  const { profile } = useAuthStore();
  const orgId = profile?.organization_id;

  // Data
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState<OrgStats>({ totalStudents: 0, totalBatches: 0, avgWpm: 0, avgAccuracy: 0 });

  // UI State
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // New Batch form
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchDesc, setNewBatchDesc] = useState('');
  const [savingBatch, setSavingBatch] = useState(false);

  // New Student form
  const [newStudName, setNewStudName] = useState('');
  const [newStudEmail, setNewStudEmail] = useState('');
  const [newStudPassword, setNewStudPassword] = useState('');
  const [newStudBatch, setNewStudBatch] = useState('');
  const [savingStudent, setSavingStudent] = useState(false);

  // New Assignment form
  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignBatch, setNewAssignBatch] = useState('');
  const [newAssignLesson, setNewAssignLesson] = useState('');
  const [newAssignTargetWpm, setNewAssignTargetWpm] = useState(40);
  const [newAssignTargetAcc, setNewAssignTargetAcc] = useState(90);
  const [newAssignDue, setNewAssignDue] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  // ─── DATA FETCHING ──────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      await Promise.all([
        fetchBatches(),
        fetchStudents(),
        fetchAssignments(),
        fetchLessons(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBatches = async () => {
    if (!orgId) return;
    const { data, error } = await supabase
      .from('classes_or_batches')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) { console.error('Batches fetch error:', error); return; }

    // For each batch, get student count and avg stats
    const enriched = await Promise.all((data || []).map(async (batch) => {
      const { count } = await supabase
        .from('class_students')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', batch.id);

      // Get avg WPM and accuracy for students in this batch
      const { data: csData } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', batch.id);

      let avgWpm = 0;
      let avgAccuracy = 0;

      if (csData && csData.length > 0) {
        const studentIds = csData.map((cs) => cs.student_id);
        const { data: resultsData } = await supabase
          .from('typing_results')
          .select('wpm, accuracy')
          .in('user_id', studentIds);

        if (resultsData && resultsData.length > 0) {
          avgWpm = Math.round(resultsData.reduce((a, r) => a + r.wpm, 0) / resultsData.length);
          avgAccuracy = Math.round(resultsData.reduce((a, r) => a + r.accuracy, 0) / resultsData.length);
        }
      }

      return { ...batch, studentCount: count || 0, avgWpm, avgAccuracy };
    }));

    setBatches(enriched);
  };

  const fetchStudents = async () => {
    if (!orgId) return;
    // Get all users in this organization with student role
    const { data: usersData, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', orgId)
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (error) { console.error('Students fetch error:', error); return; }

    // For each student, get batch assignment and typing stats
    const enriched = await Promise.all((usersData || []).map(async (student) => {
      // Get batch info
      const { data: csData } = await supabase
        .from('class_students')
        .select('class_id, classes_or_batches(name)')
        .eq('student_id', student.id)
        .maybeSingle();

      // Get typing stats
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

    // Compute org-wide stats
    const allResults = await supabase
      .from('typing_results')
      .select('wpm, accuracy, user_id')
      .in('user_id', (usersData || []).map((u) => u.id));

    const results = allResults.data || [];
    const orgAvgWpm = results.length > 0 ? Math.round(results.reduce((a, r) => a + r.wpm, 0) / results.length) : 0;
    const orgAvgAcc = results.length > 0 ? Math.round(results.reduce((a, r) => a + r.accuracy, 0) / results.length) : 0;

    setStudents(enriched);
    setStats({
      totalStudents: enriched.length,
      totalBatches: 0, // will be set after fetchBatches
      avgWpm: orgAvgWpm,
      avgAccuracy: orgAvgAcc,
    });
  };

  const fetchAssignments = async () => {
    if (!orgId) return;
    // Get assignments for all batches in this org
    const { data: batchIds } = await supabase
      .from('classes_or_batches')
      .select('id, name')
      .eq('organization_id', orgId);

    if (!batchIds || batchIds.length === 0) { setAssignments([]); return; }

    const ids = batchIds.map((b) => b.id);
    const batchNameMap = Object.fromEntries(batchIds.map((b) => [b.id, b.name]));

    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .in('class_id', ids)
      .order('created_at', { ascending: false });

    if (error) { console.error('Assignments fetch error:', error); return; }

    // Get submission counts
    const enriched = await Promise.all((data || []).map(async (assignment) => {
      const { count } = await supabase
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('assignment_id', assignment.id);

      return {
        ...assignment,
        batchName: batchNameMap[assignment.class_id] || 'Unknown Batch',
        submissions: count || 0,
      };
    }));

    setAssignments(enriched);
  };

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from('lessons')
      .select('id, title, level, language')
      .order('language')
      .order('level');
    if (error) { console.error('Lessons fetch error:', error); return; }
    setLessons(data || []);
  };

  useEffect(() => {
    if (orgId) fetchAll();
  }, [orgId, fetchAll]);

  // Sync batch count into stats after batches load
  useEffect(() => {
    setStats((prev) => ({ ...prev, totalBatches: batches.length }));
  }, [batches]);

  // ─── CRUD OPERATIONS ────────────────────────────────────────────────────────

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim() || !orgId) return;
    setSavingBatch(true);
    try {
      const { error } = await supabase.from('classes_or_batches').insert({
        name: newBatchName.trim(),
        description: newBatchDesc.trim() || null,
        organization_id: orgId,
        created_by: profile?.id,
      });
      if (error) throw error;
      setNewBatchName('');
      setNewBatchDesc('');
      setShowBatchModal(false);
      showToast('Batch created successfully!', 'success');
      await fetchBatches();
    } catch (err: any) {
      showToast(err.message || 'Failed to create batch.', 'error');
    } finally {
      setSavingBatch(false);
    }
  };

  const handleDeleteBatch = async (id: string) => {
    if (!confirm('Delete this batch? All student enrollments in this batch will be removed.')) return;
    const { error } = await supabase.from('classes_or_batches').delete().eq('id', id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Batch deleted.', 'success');
    await fetchBatches();
    await fetchStudents();
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudName.trim() || !newStudEmail.trim() || !newStudPassword.trim() || !orgId) return;
    setSavingStudent(true);
    try {
      // 1. Create Supabase Auth user via Admin API is not available on client.
      // Instead: sign up the student with a temporary session via signUp.
      // We use the service-role workaround through an API route.
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
      setShowStudentModal(false);
      showToast('Student account created!', 'success');
      await fetchStudents();
      await fetchBatches();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSavingStudent(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm('Remove this student from your institute? Their account will remain but unlinked.')) return;
    const { error } = await supabase
      .from('users')
      .update({ organization_id: null, role: 'user' })
      .eq('id', studentId);
    if (error) { showToast(error.message, 'error'); return; }
    // Also remove from class_students
    await supabase.from('class_students').delete().eq('student_id', studentId);
    showToast('Student removed from institute.', 'success');
    await fetchStudents();
    await fetchBatches();
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignTitle.trim() || !newAssignBatch) return;
    setSavingAssignment(true);
    try {
      const { error } = await supabase.from('assignments').insert({
        title: newAssignTitle.trim(),
        class_id: newAssignBatch,
        lesson_id: newAssignLesson || null,
        target_wpm: newAssignTargetWpm,
        target_accuracy: newAssignTargetAcc,
        due_date: newAssignDue || null,
        created_by: profile?.id,
      });
      if (error) throw error;
      setNewAssignTitle('');
      setNewAssignBatch('');
      setNewAssignLesson('');
      setNewAssignTargetWpm(40);
      setNewAssignTargetAcc(90);
      setNewAssignDue('');
      setShowAssignmentModal(false);
      showToast('Assignment created!', 'success');
      await fetchAssignments();
    } catch (err: any) {
      showToast(err.message || 'Failed to create assignment.', 'error');
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Assignment deleted.', 'success');
    await fetchAssignments();
  };

  // ─── FILTERED STUDENTS ──────────────────────────────────────────────────────

  const filteredStudents = students.filter((s) => {
    const matchesBatch = selectedBatchFilter === 'all' || s.batchId === selectedBatchFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = s.display_name?.toLowerCase().includes(term) || s.email?.toLowerCase().includes(term);
    return matchesBatch && matchesSearch;
  });

  // ─── NO ORG GUARD ───────────────────────────────────────────────────────────

  if (!orgId) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-sm">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <School className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white">No Institute Linked</h2>
          <p className="text-sm text-slate-400">Your account is not linked to any organization. Please contact the system admin to link your account.</p>
        </div>
      </div>
    );
  }

  // ─── LOADING STATE ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading institute data...</p>
        </div>
      </div>
    );
  }

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10 min-h-screen">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px] opacity-60" />
      <div className="absolute bottom-1/4 left-1/3 -z-10 h-[300px] w-[500px] rounded-full bg-purple-600/5 blur-[120px] opacity-50" />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── HEADER ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3 py-1 text-xs font-semibold text-cyan-400">
            <School className="h-3.5 w-3.5" />
            <span>Institute Deployment Manager</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Coaching Performance Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Manage batches, student accounts, assignments, and track real-time typing telemetry.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:border-white/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-cyan-400" />
            <span>New Batch</span>
          </button>
          <button
            onClick={() => setShowStudentModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Student</span>
          </button>
          <button
            onClick={fetchAll}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Students', value: stats.totalStudents.toString(), sub: 'enrolled in institute', icon: Database, color: 'text-cyan-400', gradient: 'from-cyan-500/[0.02] to-blue-500/[0.02]' },
          { label: 'Active Batches', value: stats.totalBatches.toString(), sub: 'batches active', icon: Users, color: 'text-purple-400', gradient: 'from-purple-500/[0.02] to-indigo-500/[0.02]' },
          { label: 'Avg WPM Speed', value: stats.avgWpm.toString(), sub: 'WPM', icon: Clock, color: 'text-emerald-400', gradient: 'from-emerald-500/[0.02] to-teal-500/[0.02]' },
          { label: 'Avg Accuracy', value: `${stats.avgAccuracy}%`, sub: 'mean accuracy', icon: Award, color: 'text-amber-400', gradient: 'from-amber-500/[0.02] to-orange-500/[0.02]' },
        ].map(({ label, value, sub, icon: Icon, color, gradient }) => (
          <div key={label} className="rounded-3xl border border-white/5 bg-slate-900/10 p-6 backdrop-blur-sm relative overflow-hidden group">
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
              <Icon className={`h-5 w-5 ${color} shrink-0`} />
            </div>
            <div className="flex items-baseline gap-1 mt-4">
              <span className="text-3xl font-black text-white tracking-tight">{value}</span>
              {label === 'Avg WPM Speed' && <span className="text-xs font-bold text-emerald-400">WPM</span>}
            </div>
            <p className="text-[10px] text-slate-500 mt-3 leading-tight">{label === 'Total Students' ? '' : sub}</p>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left + Mid */}
        <div className="lg:col-span-2 space-y-10">

          {/* BATCHES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-white tracking-wide">Batches &amp; Classrooms</h2>
              <span className="text-[10px] font-bold text-slate-500 uppercase">{batches.length} Active</span>
            </div>

            {batches.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-10 text-center text-slate-500 text-sm">
                No batches yet. Click <span className="text-cyan-400 font-semibold">New Batch</span> to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {batches.map((batch) => (
                  <div key={batch.id} className="relative rounded-2xl border border-white/5 bg-slate-900/20 p-5 flex flex-col justify-between group hover:border-white/10 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2">
                          {batch.name}
                        </h3>
                        <button onClick={() => handleDeleteBatch(batch.id)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0 mt-0.5" title="Delete batch">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {batch.description && <p className="text-[10px] text-slate-500 leading-tight">{batch.description}</p>}
                    </div>
                    <div className="pt-4 border-t border-white/5 mt-4 space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Students:</span>
                        <span className="font-bold text-slate-300">{batch.studentCount} enrolled</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Avg Speed:</span>
                        <span className="font-bold text-cyan-400">{(batch.avgWpm ?? 0) > 0 ? `${batch.avgWpm} WPM` : '—'}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Avg Accuracy:</span>
                        <span className="font-bold text-emerald-400">{(batch.avgAccuracy ?? 0) > 0 ? `${batch.avgAccuracy}%` : '—'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STUDENTS TABLE */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-extrabold text-white tracking-wide">Student Performance Logs</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-xl border border-white/5 bg-slate-950 pl-9 pr-4 py-1.5 text-xs font-semibold text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none w-44"
                  />
                </div>
                <select
                  value={selectedBatchFilter}
                  onChange={(e) => setSelectedBatchFilter(e.target.value)}
                  className="rounded-xl border border-white/5 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="all">All Batches</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-slate-900/40 border-b border-white/5 text-xs font-bold text-slate-400">
                      <th className="px-5 py-4 text-left">Student</th>
                      <th className="px-5 py-4">Batch</th>
                      <th className="px-5 py-4">Avg WPM</th>
                      <th className="px-5 py-4">Avg Acc</th>
                      <th className="px-5 py-4">Tests</th>
                      <th className="px-5 py-4 w-10">⋯</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.015] transition-colors text-slate-300">
                          <td className="px-5 py-4 text-left">
                            <div className="font-bold text-white">{s.display_name || '—'}</div>
                            <div className="text-[10px] text-slate-500">{s.email}</div>
                          </td>
                          <td className="px-5 py-4 text-slate-400 font-medium max-w-[140px] truncate" title={s.batchName}>
                            {s.batchName}
                          </td>
                          <td className="px-5 py-4 font-bold text-cyan-400">
                            {s.avgWpm && s.avgWpm > 0 ? `${s.avgWpm} WPM` : '—'}
                          </td>
                          <td className="px-5 py-4 font-bold text-emerald-400">
                            {s.avgAccuracy && s.avgAccuracy > 0 ? `${s.avgAccuracy}%` : '—'}
                          </td>
                          <td className="px-5 py-4 text-slate-400 font-semibold">
                            {s.totalTests ?? 0}
                          </td>
                          <td className="px-5 py-4">
                            <button onClick={() => handleRemoveStudent(s.id)} className="text-slate-500 hover:text-red-400 transition-colors" title="Remove from institute">
                              <Trash2 className="h-3.5 w-3.5 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                          {students.length === 0
                            ? 'No students yet. Add your first student →'
                            : 'No students match your search/filter.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">

          {/* ASSIGNMENTS */}
          <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white">Assignments</h3>
              </div>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
              >
                New <Plus className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3">
              {assignments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No assignments yet.</p>
              ) : (
                assignments.slice(0, 5).map((a) => (
                  <div key={a.id} className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-2 group hover:border-white/10 transition-colors relative">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white leading-tight group-hover:text-cyan-400 pr-4">{a.title}</h4>
                      <button onClick={() => handleDeleteAssignment(a.id)} className="text-slate-500 hover:text-red-400 transition-colors shrink-0">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">{a.batchName}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                      <span>Target: <span className="text-cyan-400 font-bold">{a.target_wpm} WPM</span> · <span className="text-emerald-400 font-bold">{a.target_accuracy}%</span></span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3 text-slate-600" />
                        {a.submissions} submitted
                      </span>
                    </div>
                    {a.due_date && (
                      <div className="text-[10px] text-amber-400 font-semibold">
                        Due: {new Date(a.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TOP STUDENTS LEADERBOARD */}
          <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-6 space-y-4">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-extrabold text-white">Top Students</h3>
            </div>
            <div className="space-y-2">
              {students
                .filter((s) => (s.avgWpm ?? 0) > 0)
                .sort((a, b) => (b.avgWpm ?? 0) - (a.avgWpm ?? 0))
                .slice(0, 5)
                .map((s, idx) => (
                  <div key={s.id} className="flex items-center justify-between text-xs py-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                        {idx + 1}.
                      </span>
                      <div>
                        <div className="font-bold text-white text-[11px]">{s.display_name || s.email}</div>
                        <div className="text-[9px] text-slate-500">{s.batchName}</div>
                      </div>
                    </div>
                    <span className={`font-black text-xs ${idx === 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {s.avgWpm} WPM
                    </span>
                  </div>
                ))}
              {students.filter((s) => (s.avgWpm ?? 0) > 0).length === 0 && (
                <p className="text-[11px] text-slate-500 text-center py-3">No typing data yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────── MODALS ─────────────────────── */}

      {/* ADD BATCH MODAL */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white">Create New Batch</h3>
                <p className="text-xs text-slate-400">Group students into a classroom or batch.</p>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddBatch} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Batch Name *</label>
                <input
                  type="text"
                  placeholder="e.g. SSC Evening Target 50"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Description (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Morning batch for Hindi typing"
                  value={newBatchDesc}
                  onChange={(e) => setNewBatchDesc(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                <button type="button" onClick={() => setShowBatchModal(false)} className="rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer">Cancel</button>
                <button type="submit" disabled={savingBatch} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 cursor-pointer">
                  {savingBatch ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white">Register Student</h3>
                <p className="text-xs text-slate-400">Create a new student account for your institute.</p>
              </div>
              <button onClick={() => setShowStudentModal(false)} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Full Name *</label>
                <input type="text" placeholder="e.g. Rahul Sharma" value={newStudName} onChange={(e) => setNewStudName(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Email Address *</label>
                <input type="email" placeholder="student@email.com" value={newStudEmail} onChange={(e) => setNewStudEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Password *</label>
                <input type="text" placeholder="Set a login password for student" value={newStudPassword} onChange={(e) => setNewStudPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none" required minLength={6} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Assign to Batch (optional)</label>
                <select value={newStudBatch} onChange={(e) => setNewStudBatch(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none">
                  <option value="">— No batch yet —</option>
                  {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                <button type="button" onClick={() => setShowStudentModal(false)} className="rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer">Cancel</button>
                <button type="submit" disabled={savingStudent} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 cursor-pointer">
                  {savingStudent ? 'Creating Account...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ASSIGNMENT MODAL */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white">New Assignment</h3>
                <p className="text-xs text-slate-400">Assign a typing task to a batch with speed targets.</p>
              </div>
              <button onClick={() => setShowAssignmentModal(false)} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Assignment Title *</label>
                <input type="text" placeholder="e.g. Week 3 Speed Test" value={newAssignTitle} onChange={(e) => setNewAssignTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Assign to Batch *</label>
                <select value={newAssignBatch} onChange={(e) => setNewAssignBatch(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none" required>
                  <option value="">— Select Batch —</option>
                  {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Link Lesson (optional)</label>
                <select value={newAssignLesson} onChange={(e) => setNewAssignLesson(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none">
                  <option value="">— Free practice (no specific lesson) —</option>
                  {lessons.map((l) => <option key={l.id} value={l.id}>{l.language} · {l.level} · {l.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Target WPM</label>
                  <input type="number" min={10} max={200} value={newAssignTargetWpm} onChange={(e) => setNewAssignTargetWpm(parseInt(e.target.value) || 40)}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Target Accuracy %</label>
                  <input type="number" min={50} max={100} value={newAssignTargetAcc} onChange={(e) => setNewAssignTargetAcc(parseInt(e.target.value) || 90)}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Due Date (optional)</label>
                <input type="datetime-local" value={newAssignDue} onChange={(e) => setNewAssignDue(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                <button type="button" onClick={() => setShowAssignmentModal(false)} className="rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer">Cancel</button>
                <button type="submit" disabled={savingAssignment} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 cursor-pointer">
                  {savingAssignment ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
