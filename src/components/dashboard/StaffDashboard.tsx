'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  School, Users, BookOpen, Clock, Plus, Trash2, Search, ArrowUpRight, 
  Award, Trophy, GraduationCap, LayoutDashboard, Database, Key, Sparkles, 
  Globe, Languages, FileText, ChevronRight, AlertCircle, Loader2, RefreshCw,
  UserCheck, UserMinus, UserPlus, Clipboard, CheckCircle2, ChevronDown
} from 'lucide-react';
import StatsCard from '@/components/dashboard/stats-card';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role?: string;
  organization_id?: string | null;
  created_at: string;
}

interface StaffDashboardProps {
  user: any;
  profile: UserProfile | null;
}

interface ClassOrBatch {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
  type: 'school' | 'institute';
}

interface Lesson {
  id: string;
  title: string;
  language: 'English' | 'Hindi';
}

interface Student {
  id: string;
  email: string;
  display_name: string;
  class_id?: string | null;
  class_name?: string | null;
}

interface Assignment {
  id: string;
  class_id: string;
  lesson_id: string;
  title: string;
  target_wpm: number;
  target_accuracy: number;
  due_date?: string;
  created_at: string;
  lessons?: { title: string; language: string };
  classes_or_batches?: { name: string };
}

interface Submission {
  id: string;
  wpm: number;
  accuracy: number;
  mistakes: number;
  total_typed: number;
  completed_at: string;
  users: { display_name: string; email: string };
}

export default function StaffDashboard({ user, profile }: StaffDashboardProps) {
  const [orgDetails, setOrgDetails] = useState<Organization | null>(null);
  const [classes, setClasses] = useState<ClassOrBatch[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  // Selection/Focus States
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignClassId, setAssignClassId] = useState('');
  const [assignLessonId, setAssignLessonId] = useState('');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignWpm, setAssignWpm] = useState(30);
  const [assignAccuracy, setAssignAccuracy] = useState(90);
  const [assignDueDate, setAssignDueDate] = useState('');

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollStudentId, setEnrollStudentId] = useState('');
  const [enrollClassId, setEnrollClassId] = useState('');

  const fetchData = async () => {
    if (!profile?.organization_id) return;
    setRefreshing(true);
    setErrorMessage(null);
    try {
      // 1. Fetch organization details
      const orgRes = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();
      if (orgRes.error) throw orgRes.error;
      setOrgDetails(orgRes.data);

      // 2. Fetch classes
      const classesRes = await supabase
        .from('classes_or_batches')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('name', { ascending: true });
      if (classesRes.error) throw classesRes.error;
      setClasses(classesRes.data || []);
      if (classesRes.data && classesRes.data.length > 0) {
        setAssignClassId(classesRes.data[0].id);
        setEnrollClassId(classesRes.data[0].id);
      }

      // 3. Fetch global lessons for selection
      const lessonsRes = await supabase
        .from('lessons')
        .select('id, title, language')
        .order('created_at', { ascending: true });
      if (lessonsRes.error) throw lessonsRes.error;
      setLessons(lessonsRes.data || []);
      if (lessonsRes.data && lessonsRes.data.length > 0) {
        setAssignLessonId(lessonsRes.data[0].id);
      }

      // 4. Fetch assignments created by staff
      const assignmentsRes = await supabase
        .from('assignments')
        .select(`
          id, class_id, lesson_id, title, target_wpm, target_accuracy, due_date, created_at,
          lessons ( title, language ),
          classes_or_batches ( name )
        `)
        .order('created_at', { ascending: false });
      
      const classIds = new Set((classesRes.data || []).map(c => c.id));
      const orgAssignments: Assignment[] = (assignmentsRes.data as any[] || [])
        .filter(a => classIds.has(a.class_id))
        .map(a => ({
          id: a.id,
          class_id: a.class_id,
          lesson_id: a.lesson_id,
          title: a.title,
          target_wpm: Number(a.target_wpm),
          target_accuracy: Number(a.target_accuracy),
          due_date: a.due_date || undefined,
          created_at: a.created_at,
          lessons: Array.isArray(a.lessons) ? a.lessons[0] : a.lessons,
          classes_or_batches: Array.isArray(a.classes_or_batches) ? a.classes_or_batches[0] : a.classes_or_batches
        }));
      setAssignments(orgAssignments);

      // 5. Fetch students linked to organization
      const studentsRes = await supabase
        .from('users')
        .select('id, email, display_name')
        .eq('organization_id', profile.organization_id)
        .eq('role', 'student')
        .order('display_name', { ascending: true });
      if (studentsRes.error) throw studentsRes.error;

      // Find which students are in which classes (via class_students)
      const enrolledStudents: Student[] = await Promise.all(
        (studentsRes.data || []).map(async (stud) => {
          const enrollRes = await supabase
            .from('class_students')
            .select('class_id, classes_or_batches(name)')
            .eq('student_id', stud.id);
          
          const enrollment = enrollRes.data?.[0];
          return {
            ...stud,
            class_id: enrollment?.class_id || null,
            class_name: enrollment?.classes_or_batches ? (enrollment.classes_or_batches as any).name : null
          };
        })
      );
      setStudents(enrolledStudents);
      if (enrolledStudents.length > 0) {
        setEnrollStudentId(enrolledStudents[0].id);
      }

    } catch (err: any) {
      console.error('Error fetching staff metrics:', err);
      setErrorMessage(err.message || 'Failed to sync staff batch statistics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile?.organization_id]);

  // Fetch submissions when an assignment is selected
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!selectedAssignmentId) {
        setSubmissions([]);
        return;
      }
      setSubmissionsLoading(true);
      try {
        const res = await supabase
          .from('assignment_submissions')
          .select(`
            id, wpm, accuracy, mistakes, total_typed, completed_at,
            users ( display_name, email )
          `)
          .eq('assignment_id', selectedAssignmentId)
          .order('wpm', { ascending: false });
        
        if (res.error) throw res.error;
        setSubmissions(res.data as any[] || []);
      } catch (err: any) {
        console.error('Error fetching submissions:', err);
        setErrorMessage(err.message || 'Failed to sync student submissions.');
      } finally {
        setSubmissionsLoading(false);
      }
    };

    fetchSubmissions();
  }, [selectedAssignmentId]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim() || !assignClassId || !assignLessonId) return;

    setActionLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          class_id: assignClassId,
          lesson_id: assignLessonId,
          title: assignTitle,
          target_wpm: assignWpm,
          target_accuracy: assignAccuracy,
          due_date: assignDueDate ? new Date(assignDueDate).toISOString() : null,
          created_by: user.id
        })
        .select(`
          id, class_id, lesson_id, title, target_wpm, target_accuracy, due_date, created_at,
          lessons ( title, language ),
          classes_or_batches ( name )
        `);

      if (error) throw error;

      const rawAssignment = data[0];
      const formattedAssignment: Assignment = {
        id: rawAssignment.id,
        class_id: rawAssignment.class_id,
        lesson_id: rawAssignment.lesson_id,
        title: rawAssignment.title,
        target_wpm: Number(rawAssignment.target_wpm),
        target_accuracy: Number(rawAssignment.target_accuracy),
        due_date: rawAssignment.due_date || undefined,
        created_at: rawAssignment.created_at,
        lessons: Array.isArray(rawAssignment.lessons) ? rawAssignment.lessons[0] : rawAssignment.lessons,
        classes_or_batches: Array.isArray(rawAssignment.classes_or_batches) ? rawAssignment.classes_or_batches[0] : rawAssignment.classes_or_batches
      };

      setAssignments([formattedAssignment, ...assignments]);
      setAssignTitle('');
      setShowAssignModal(false);
      setSuccessMessage('Homework task assigned successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create assignment task.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollStudentId || !enrollClassId) return;

    setActionLoading(true);
    setErrorMessage(null);
    try {
      // Check if student is already in a class (un-enroll first just in case)
      await supabase
        .from('class_students')
        .delete()
        .eq('student_id', enrollStudentId);

      // Insert enrollment row
      const { error } = await supabase
        .from('class_students')
        .insert({
          class_id: enrollClassId,
          student_id: enrollStudentId
        });

      if (error) throw error;

      // Update local state
      const targetClass = classes.find(c => c.id === enrollClassId);
      setStudents(students.map(s => s.id === enrollStudentId ? {
        ...s,
        class_id: enrollClassId,
        class_name: targetClass?.name || 'Assigned'
      } : s));

      setShowEnrollModal(false);
      setSuccessMessage('Student enrolled in class successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to enroll student in class.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnenrollStudent = async (studentId: string, name: string) => {
    if (!confirm(`Are you sure you want to unenroll ${name} from this class?`)) return;

    setActionLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase
        .from('class_students')
        .delete()
        .eq('student_id', studentId);

      if (error) throw error;

      setStudents(students.map(s => s.id === studentId ? {
        ...s,
        class_id: null,
        class_name: null
      } : s));

      setSuccessMessage(`Unenrolled ${name} from class.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to unenroll student.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment? All student homework submissions for it will also be deleted.')) return;

    setActionLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAssignments(assignments.filter(a => a.id !== id));
      if (selectedAssignmentId === id) {
        setSelectedAssignmentId(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete assignment task.');
    } finally {
      setActionLoading(false);
    }
  };

  // Student filtering matching search and batch selection
  const filteredStudents = students.filter(s => {
    const matchesClass = selectedClassId === 'all' || s.class_id === selectedClassId;
    return matchesClass;
  });

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-slate-950 min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]" />
        <p className="text-sm text-slate-400 font-semibold tracking-wider animate-pulse">Entering Teacher Staff room...</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10 min-h-screen text-left">
      {/* Background aesthetics */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[120px] opacity-60"></div>
      <div className="absolute bottom-1/4 left-1/3 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/5 blur-[120px] opacity-50"></div>

      {/* Header Info Block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-950/20 px-3 py-1 text-xs font-semibold text-purple-400">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Staff Dashboard • {orgDetails?.name}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Teacher Operations Center
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            Create homework typing tasks (Assignments), monitor student submissions telemetry in real-time, and enroll student profiles into classroom groups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            disabled={refreshing}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowEnrollModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4 text-cyan-400" />
            <span>Enroll Student</span>
          </button>
          <button 
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
          >
            <Clipboard className="h-4 w-4" />
            <span>Assign Homework</span>
          </button>
        </div>
      </div>

      {/* Status Banners */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-sm text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Indicators row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Classrooms managed"
          value={classes.length}
          icon={School}
          color="cyan"
          description="Groups you instruct"
        />
        <StatsCard
          title="Total Students"
          value={students.length}
          icon={Users}
          color="indigo"
          description="Assigned student roster"
        />
        <StatsCard
          title="Active Homeworks"
          value={assignments.length}
          icon={Clipboard}
          color="emerald"
          description="Tasks assigned in batches"
        />
        <StatsCard
          title="License Allocated"
          value={`${students.filter(s => s.class_id).length} / ${students.length}`}
          icon={Database}
          color="purple"
          description="Roster enrollment split"
        />
      </div>

      {/* Main Splits */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Side: Homework Assignments & Roster Enrollments */}
        <div className="lg:col-span-2 space-y-10">
          {/* Assignments list */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-white tracking-wide">Active Homework Assignments</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {assignments.length > 0 ? (
                assignments.map(assign => (
                  <div 
                    key={assign.id} 
                    onClick={() => setSelectedAssignmentId(assign.id)}
                    className={`relative rounded-2xl border p-5 backdrop-blur-sm flex flex-col justify-between group transition-all cursor-pointer ${
                      selectedAssignmentId === assign.id 
                        ? 'border-cyan-500 bg-cyan-500/5 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                        : 'border-white/5 bg-slate-900/20 hover:border-white/10'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {assign.classes_or_batches?.name}
                        </span>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAssignment(assign.id);
                          }}
                          className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Homework Assignment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <h3 className="text-sm font-bold text-white leading-snug group-hover:text-cyan-400 transition-colors">
                        {assign.title}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                        <span>Syllabus: {assign.lessons?.title} ({assign.lessons?.language})</span>
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex gap-2">
                        <span className="font-bold text-cyan-400">{assign.target_wpm} WPM</span>
                        <span className="font-bold text-emerald-400">{assign.target_accuracy}% Acc</span>
                      </div>
                      <span>
                        {assign.due_date ? `Due: ${new Date(assign.due_date).toLocaleDateString()}` : 'No deadline'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 rounded-2xl border border-dashed border-white/5 bg-slate-900/10 p-8 text-center text-slate-500 font-medium">
                  No active assignments. Click Assign Homework to deploy typing tasks.
                </div>
              )}
            </div>
          </div>

          {/* Roster enrollments list */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-extrabold text-white tracking-wide">Student Class Enrollments</h2>
              
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="rounded-xl border border-white/5 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-350 focus:border-cyan-500 focus:outline-none"
              >
                <option value="all">All Classroom Batches</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/10 overflow-hidden shadow-xl backdrop-blur-sm">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-900/40 border-b border-white/5 text-xs font-bold text-slate-400">
                    <th className="px-5 py-4 text-left">Student Info</th>
                    <th className="px-5 py-4">Assigned Classroom Batch</th>
                    <th className="px-5 py-4 w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(stud => (
                      <tr key={stud.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-5 py-4 text-left">
                          <div className="font-bold text-white">{stud.display_name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{stud.email}</div>
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            stud.class_id 
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                              : 'bg-slate-800 text-slate-500 border border-white/5'
                          }`}>
                            {stud.class_name || 'Unassigned / Standalone'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {stud.class_id ? (
                            <button 
                              onClick={() => handleUnenrollStudent(stud.id, stud.display_name)}
                              className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                              title="Unenroll student from class"
                            >
                              <UserMinus className="h-4 w-4 mx-auto" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                setEnrollStudentId(stud.id);
                                setShowEnrollModal(true);
                              }}
                              className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                              title="Enroll in class batch"
                            >
                              <UserPlus className="h-4 w-4 mx-auto" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-slate-500 font-medium">
                        No students enrolled matching filter constraints.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Assignment Submissions Monitor */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-6 backdrop-blur-sm space-y-6">
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-4">
              <Clipboard className="h-4.5 w-4.5 text-cyan-400" />
              <div className="text-left">
                <h3 className="text-sm font-extrabold text-white tracking-wide">Homework Submissions</h3>
                <p className="text-[10px] text-slate-500">Telemetry progression logs per task</p>
              </div>
            </div>

            {selectedAssignmentId ? (
              submissionsLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
                </div>
              ) : submissions.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {submissions.map(sub => {
                    const submissionTime = new Date(sub.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={sub.id} className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-3 text-left hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-xs font-bold text-white">{sub.users.display_name}</div>
                            <div className="text-[9px] text-slate-500 font-mono mt-0.5">{sub.users.email}</div>
                          </div>
                          <span className="text-[8px] text-slate-600 font-bold">{submissionTime}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                          <div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase">Speed</div>
                            <div className="text-xs font-black text-cyan-400">{sub.wpm} WPM</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase">Accuracy</div>
                            <div className="text-xs font-black text-emerald-400">{sub.accuracy}%</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase">Mistakes</div>
                            <div className="text-xs font-black text-rose-450">{sub.mistakes} keys</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 font-medium text-xs">
                  Zero homework submissions logged for this task yet.
                </div>
              )
            ) : (
              <div className="py-12 text-center text-slate-500 font-medium text-xs leading-relaxed">
                Click on any homework assignment box on the left to review student speed & accuracy telemetry records.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Assign Homework Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl relative text-left space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-white">Create Typing Assignment</h3>
              <p className="text-xs text-slate-400">Deploy a standard or custom typing lesson to a classroom batch.</p>
            </div>
            
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">Assignment Title</label>
                <input
                  type="text"
                  placeholder="e.g. English Touch Typing Target Week 2"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 block text-left">Target Class</label>
                  <select
                    value={assignClassId}
                    onChange={(e) => setAssignClassId(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-350 focus:border-cyan-500 focus:outline-none"
                    required
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 block text-left">Select Lesson</label>
                  <select
                    value={assignLessonId}
                    onChange={(e) => setAssignLessonId(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-350 focus:border-cyan-500 focus:outline-none"
                    required
                  >
                    {lessons.map(l => (
                      <option key={l.id} value={l.id}>{l.title} ({l.language})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 block text-left">Target WPM Speed</label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={assignWpm}
                    onChange={(e) => setAssignWpm(parseInt(e.target.value) || 30)}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 block text-left">Min Accuracy (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={assignAccuracy}
                    onChange={(e) => setAssignAccuracy(parseInt(e.target.value) || 90)}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">Due Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-350 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>Assign Homework</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Enroll Student Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl relative text-left space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-white">Enroll Student in Batch</h3>
              <p className="text-xs text-slate-400">Assign a student slot to a designated classroom batch.</p>
            </div>
            
            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 block text-left">Select Student</label>
                <select
                  value={enrollStudentId}
                  onChange={(e) => setEnrollStudentId(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none"
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.display_name} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 block text-left">Select Class / Batch</label>
                <select
                  value={enrollClassId}
                  onChange={(e) => setEnrollClassId(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none"
                  required
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>Assign to Class</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
