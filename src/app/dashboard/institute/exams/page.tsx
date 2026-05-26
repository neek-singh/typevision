'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Search, Award, Clock, Database, Trash2, Plus,
  RefreshCw, CheckCircle2, AlertCircle, X, ChevronRight,
  GraduationCap, Calendar, Trophy, Check, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/utils/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Batch {
  id: string;
  name: string;
}

interface Lesson {
  id: string;
  title: string;
  language: string;
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
  lessonTitle?: string;
  submissionsCount?: number;
  totalStudents?: number;
}

interface StudentSubmission {
  student_id: string;
  student_name: string;
  student_email: string;
  submitted: boolean;
  wpm?: number;
  accuracy?: number;
  mistakes?: number;
  duration?: number;
  completed_at?: string;
  passed?: boolean;
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

// ─── Mock Exams Page Component ───────────────────────────────────────────────

export default function MockExamsPortal() {
  const { profile } = useAuthStore();
  const orgId = profile?.organization_id;

  // Data State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
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

  // ─── Fetching Data ─────────────────────────────────────────────────────────

  const fetchAssignments = useCallback(async () => {
    if (!orgId) return;
    try {
      // Get all batches in this org
      const { data: batchData } = await supabase
        .from('classes_or_batches')
        .select('id, name')
        .eq('organization_id', orgId);

      if (!batchData || batchData.length === 0) {
        setAssignments([]);
        return;
      }

      const batchIds = batchData.map((b) => b.id);
      const batchNameMap = Object.fromEntries(batchData.map((b) => [b.id, b.name]));

      // Get assignments
      const { data, error } = await supabase
        .from('assignments')
        .select('*, lessons(title)')
        .in('class_id', batchIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with submission counts and total students enrolled in batch
      const enriched = await Promise.all((data || []).map(async (assign) => {
        // Submission count
        const { count: subCount } = await supabase
          .from('assignment_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('assignment_id', assign.id);

        // Total students in batch
        const { count: studCount } = await supabase
          .from('class_students')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', assign.class_id);

        const lessonInfo = assign.lessons as any;

        return {
          ...assign,
          batchName: batchNameMap[assign.class_id] || 'Unknown Batch',
          lessonTitle: lessonInfo?.title || 'Unknown Lesson',
          submissionsCount: subCount || 0,
          totalStudents: studCount || 0,
        };
      }));

      setAssignments(enriched);

      // Sync active view
      if (selectedAssignment) {
        const updated = enriched.find((a) => a.id === selectedAssignment.id);
        if (updated) setSelectedAssignment(updated);
      }
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
      showToast('Failed to load assignments.', 'error');
    }
  }, [orgId, selectedAssignment, showToast]);

  const fetchBatches = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase
      .from('classes_or_batches')
      .select('id, name')
      .eq('organization_id', orgId)
      .order('name');
    setBatches(data || []);
  }, [orgId]);

  const fetchLessons = useCallback(async () => {
    const { data } = await supabase
      .from('lessons')
      .select('id, title, language')
      .order('language')
      .order('title');
    setLessons(data || []);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchAssignments(), fetchBatches(), fetchLessons()]);
    setLoading(false);
  }, [fetchAssignments, fetchBatches, fetchLessons]);

  useEffect(() => {
    if (orgId) fetchAll();
  }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch student submissions details for selected assignment
  const fetchSubmissionsTelemetry = async (assignment: Assignment) => {
    setSubLoading(true);
    try {
      // 1. Get all students enrolled in the batch
      const { data: classStudents, error: csErr } = await supabase
        .from('class_students')
        .select('student_id, users(id, display_name, email)')
        .eq('class_id', assignment.class_id);

      if (csErr) throw csErr;

      const enrolledStudents = (classStudents || []).map((cs: any) => ({
        id: cs.student_id,
        name: cs.users?.display_name || 'Enrolled Student',
        email: cs.users?.email || '',
      }));

      if (enrolledStudents.length === 0) {
        setSubmissions([]);
        return;
      }

      // 2. Get all submissions for this assignment
      const { data: subsData, error: subsErr } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignment.id);

      if (subsErr) throw subsErr;

      const subMap = Object.fromEntries((subsData || []).map((s) => [s.student_id, s]));

      // 3. Map student details + submission details
      const mapped = enrolledStudents.map((stud) => {
        const sub = subMap[stud.id];
        if (!sub) {
          return {
            student_id: stud.id,
            student_name: stud.name,
            student_email: stud.email,
            submitted: false,
          };
        }

        const passed = sub.wpm >= assignment.target_wpm && sub.accuracy >= assignment.target_accuracy;

        return {
          student_id: stud.id,
          student_name: stud.name,
          student_email: stud.email,
          submitted: true,
          wpm: sub.wpm,
          accuracy: sub.accuracy,
          mistakes: sub.mistakes,
          duration: sub.duration,
          completed_at: sub.completed_at,
          passed,
        };
      });

      // Sort: submitted first, then by speed
      mapped.sort((a, b) => {
        if (a.submitted && !b.submitted) return -1;
        if (!a.submitted && b.submitted) return 1;
        if (a.submitted && b.submitted) return (b.wpm || 0) - (a.wpm || 0);
        return a.student_name.localeCompare(b.student_name);
      });

      setSubmissions(mapped);
    } catch (err: any) {
      console.error('Error fetching submissions telemetry:', err);
      showToast('Failed to load submissions logs.', 'error');
    } finally {
      setSubLoading(false);
    }
  };

  const handleSelectAssignment = (assign: Assignment) => {
    setSelectedAssignment(assign);
    fetchSubmissionsTelemetry(assign);
  };

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignTitle.trim() || !newAssignBatch || !newAssignLesson || !orgId) return;
    setSavingAssignment(true);
    try {
      const { error } = await supabase.from('assignments').insert({
        title: newAssignTitle.trim(),
        class_id: newAssignBatch,
        lesson_id: newAssignLesson,
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
      setShowAddModal(false);
      showToast('Mock Exam successfully deployed!', 'success');
      await fetchAssignments();
    } catch (err: any) {
      showToast(err.message || 'Failed to deploy assignment.', 'error');
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mock exam? All student submissions will be lost.')) return;
    try {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) throw error;

      showToast('Assignment deleted.', 'success');
      if (selectedAssignment?.id === id) setSelectedAssignment(null);
      await fetchAssignments();
    } catch (err: any) {
      showToast(err.message || 'Deletion failed.', 'error');
    }
  };

  // ─── Filtering ─────────────────────────────────────────────────────────────

  const filteredAssignments = assignments.filter((a) => {
    const matchesBatch = batchFilter === 'all' || a.class_id === batchFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = a.title.toLowerCase().includes(term) || a.lessonTitle?.toLowerCase().includes(term);
    return matchesBatch && matchesSearch;
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  if (!orgId) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 bg-slate-950">
        <div className="text-center space-y-4 max-w-sm">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <ClipboardList className="h-8 w-8 text-amber-400" />
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
          <p className="text-xs font-semibold text-slate-500">Loading assignments board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col lg:flex-row min-h-[calc(100vh-3.5rem)] bg-slate-950">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Ambient backgrounds */}
      <div className="absolute top-10 left-1/3 -z-10 h-[300px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px] opacity-60" />
      <div className="absolute bottom-10 right-1/4 -z-10 h-[300px] w-[500px] rounded-full bg-purple-600/5 blur-[120px] opacity-45" />

      {/* ── LEFT PANEL: ASSIGNMENTS GRID ── */}
      <div className="flex flex-1 flex-col p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Title & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-cyan-400" />
              <span>Mock Exams &amp; Assignments</span>
            </h1>
            <p className="text-xs text-slate-400">Deploy specific lesson targets to batches and track completion scores.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New Mock Exam</span>
            </button>
            <button
              onClick={fetchAssignments}
              className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-slate-900 px-3 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by assignment title or lesson name..."
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

        {/* Assignments Grid */}
        {filteredAssignments.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-16 text-center text-slate-500 text-sm">
            No mock exams found. Click <span className="text-cyan-400 font-bold">New Mock Exam</span> to deploy one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAssignments.map((a) => (
              <div
                key={a.id}
                onClick={() => handleSelectAssignment(a)}
                className={`relative rounded-3xl border transition-all p-6 flex flex-col justify-between group cursor-pointer hover:border-white/20 ${
                  selectedAssignment?.id === a.id
                    ? 'border-cyan-500/40 bg-cyan-950/10 shadow-2xl shadow-cyan-950/10'
                    : 'border-white/5 bg-slate-900/20'
                }`}
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] font-black text-purple-300 uppercase tracking-wide">{a.batchName}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAssignment(a.id);
                      }}
                      className="text-slate-600 hover:text-rose-400 p-1 transition-colors shrink-0"
                      title="Delete assignment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h3 className="text-sm font-extrabold text-white leading-tight group-hover:text-cyan-400 transition-colors">
                    {a.title}
                  </h3>
                  <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    <span>Script: {a.lessonTitle}</span>
                  </div>
                </div>

                {/* Performance Goals */}
                <div className="grid grid-cols-2 gap-4 py-4 my-4 border-t border-b border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Target Speed</span>
                    <div className="text-sm font-black text-cyan-400">{a.target_wpm} WPM</div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Target Accuracy</span>
                    <div className="text-sm font-black text-emerald-400">{a.target_accuracy}%</div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex justify-between items-center text-xs">
                  <div className="text-slate-400 font-bold flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-cyan-400" />
                    <span>{a.submissionsCount} / {a.totalStudents} Submitted</span>
                  </div>
                  {a.due_date && (
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      new Date(a.due_date) < new Date()
                        ? 'bg-rose-950/20 text-rose-400 border-rose-500/20'
                        : 'bg-amber-950/20 text-amber-400 border-amber-500/20'
                    }`}>
                      Due {new Date(a.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: SUBMISSIONS TELEMETRY ── */}
      <div className={`w-full lg:w-[420px] shrink-0 bg-slate-950/40 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col transition-all overflow-hidden ${
        selectedAssignment ? 'h-auto opacity-100' : 'h-0 lg:h-auto opacity-0 lg:opacity-100 lg:w-0'
      }`}>
        {selectedAssignment ? (
          <div className="flex flex-col flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-white/5 pb-4">
              <div>
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Exam Submission Telemetry</span>
                <h2 className="text-base font-black text-white leading-tight">{selectedAssignment.title}</h2>
                <p className="text-[10px] text-slate-500 mt-1">Batch: {selectedAssignment.batchName} · Lesson: {selectedAssignment.lessonTitle}</p>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="text-slate-500 hover:text-white p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target Criteria Quick Card */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-4 space-y-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Exam Target Benchmarks</div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Minimum speed threshold:</span>
                <span className="font-extrabold text-cyan-400">{selectedAssignment.target_wpm} WPM</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Minimum accuracy threshold:</span>
                <span className="font-extrabold text-emerald-400">{selectedAssignment.target_accuracy}%</span>
              </div>
            </div>

            {/* Student Submissions List */}
            <div className="flex-1 flex flex-col min-h-[300px] space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                <span className="font-extrabold text-white flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-cyan-400" />
                  <span>Student Completion List</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  {selectedAssignment.submissionsCount} / {selectedAssignment.totalStudents} complete
                </span>
              </div>

              {subLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full border border-cyan-500/20 border-t-cyan-400 animate-spin" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center text-xs text-slate-500 py-10">
                  No students currently enrolled in this batch.
                </div>
              ) : (
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[420px] pr-1">
                  {submissions.map((sub) => (
                    <div
                      key={sub.student_id}
                      className={`rounded-2xl border p-4 space-y-2.5 transition-colors ${
                        sub.submitted
                          ? sub.passed
                            ? 'border-emerald-500/10 bg-emerald-950/[0.04]'
                            : 'border-amber-500/10 bg-amber-950/[0.04]'
                          : 'border-white/[0.02] bg-slate-900/[0.05]'
                      }`}
                    >
                      {/* Name & Status */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="text-xs font-bold text-white leading-tight">{sub.student_name}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5">{sub.student_email}</div>
                        </div>
                        {sub.submitted ? (
                          sub.passed ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-400">
                              <Check className="h-3 w-3" /> Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[9px] font-black text-amber-400">
                              <AlertTriangle className="h-3 w-3" /> Target Missed
                            </span>
                          )
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-900 border border-white/5 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                            Not Attempted
                          </span>
                        )}
                      </div>

                      {/* Performance Telemetry */}
                      {sub.submitted && (
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-3">
                            <span className="text-cyan-400 font-extrabold">{sub.wpm} WPM</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-emerald-400 font-extrabold">{sub.accuracy}% acc</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400">{sub.mistakes} mistakes</span>
                          </div>
                          <span className="text-slate-500 text-[9px]">
                            {sub.completed_at ? new Date(sub.completed_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center text-center p-6 text-slate-500 text-xs">
            Select a mock exam from the console to view detailed student submission telemetry.
          </div>
        )}
      </div>

      {/* ─────────────────────── MODALS ─────────────────────── */}

      {/* DEPLOY MOCK EXAM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white">Deploy Mock Exam</h3>
                <p className="text-xs text-slate-400">Create a new test assignment targeting a batch.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Exam Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Mid-term Krutidev Test"
                  value={newAssignTitle}
                  onChange={(e) => setNewAssignTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Target Lesson *</label>
                  <select
                    value={newAssignLesson}
                    onChange={(e) => setNewAssignLesson(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none cursor-pointer"
                    required
                  >
                    <option value="">— Select Lesson —</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        [{l.language === 'english' ? 'EN' : 'HI'}] {l.title}
                      </option>
                    ))}
                  </select>
                </div>
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
                  onClick={() => setShowAddModal(false)}
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
