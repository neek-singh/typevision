'use client';

import React, { useState } from 'react';
import { 
  School, Users, BookOpen, Clock, Plus, Trash2, Search, ArrowUpRight, 
  Award, Trophy, GraduationCap, LayoutDashboard, Database, Key, Sparkles, 
  Globe, Languages, FileText, ChevronRight
} from 'lucide-react';

interface Batch {
  id: string;
  name: string;
  count: number;
  avgWpm: number;
  avgAcc: number;
  language: 'English' | 'Hindi';
}

interface Student {
  id: string;
  name: string;
  email: string;
  wpm: number;
  accuracy: number;
  completed: number;
  batchId: string;
  status: 'Active' | 'Inactive';
}

interface MockExam {
  id: string;
  title: string;
  language: 'English' | 'Hindi';
  duration: number;
  text: string;
  attempts: number;
}

export default function InstituteDashboard() {
  // ─── STORES & STATES ─────────────────────────────────────────────────────────
  const [batches, setBatches] = useState<Batch[]>([
    { id: 'batch-1', name: 'SSC CHSL Morning English', count: 12, avgWpm: 48, avgAcc: 96, language: 'English' },
    { id: 'batch-2', name: 'UPSSSC Evening Krutidev', count: 8, avgWpm: 38, avgAcc: 93, language: 'Hindi' },
    { id: 'batch-3', name: 'Intermediate Touch Typing A', count: 5, avgWpm: 42, avgAcc: 95, language: 'English' }
  ]);

  const [students, setStudents] = useState<Student[]>([
    { id: 'student-1', name: 'Rahul Sharma', email: 'rahul.s@platform.in', wpm: 54, accuracy: 98, completed: 15, batchId: 'batch-1', status: 'Active' },
    { id: 'student-2', name: 'Priya Patel', email: 'priya.p@platform.in', wpm: 48, accuracy: 96, completed: 12, batchId: 'batch-1', status: 'Active' },
    { id: 'student-3', name: 'Amit Verma', email: 'amit.v@platform.in', wpm: 42, accuracy: 95, completed: 10, batchId: 'batch-1', status: 'Active' },
    { id: 'student-4', name: 'Sandeep Kumar', email: 'sandeep.k@platform.in', wpm: 40, accuracy: 94, completed: 8, batchId: 'batch-2', status: 'Active' },
    { id: 'student-5', name: 'Kiran Joshi', email: 'kiran.j@platform.in', wpm: 37, accuracy: 93, completed: 6, batchId: 'batch-2', status: 'Active' },
    { id: 'student-6', name: 'Rohit Singh', email: 'rohit.s@platform.in', wpm: 35, accuracy: 92, completed: 5, batchId: 'batch-2', status: 'Inactive' },
    { id: 'student-7', name: 'Ananya Rao', email: 'ananya.r@platform.in', wpm: 45, accuracy: 97, completed: 9, batchId: 'batch-3', status: 'Active' }
  ]);

  const [exams, setExams] = useState<MockExam[]>([
    { id: 'exam-1', title: 'SSC CHSL 10-Min English Mock', language: 'English', duration: 10, text: 'Technology is driving rapid changes...', attempts: 15 },
    { id: 'exam-2', title: 'UPSSSC 5-Min Krutidev Typing Simulation', language: 'Hindi', duration: 5, text: 'डिजिटल भारत एक क्रांतिकारी अभियान है...', attempts: 8 }
  ]);

  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form State managers
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchLang, setNewBatchLang] = useState<'English' | 'Hindi'>('English');
  const [showBatchModal, setShowBatchModal] = useState(false);

  const [newStudName, setNewStudName] = useState('');
  const [newStudEmail, setNewStudEmail] = useState('');
  const [newStudBatch, setNewStudBatch] = useState(batches[0]?.id || '');
  const [showStudModal, setShowStudModal] = useState(false);

  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamLang, setNewExamLang] = useState<'English' | 'Hindi'>('English');
  const [newExamDuration, setNewExamDuration] = useState(10);
  const [newExamText, setNewExamText] = useState('');
  const [showExamModal, setShowExamModal] = useState(false);

  // ─── OPERATIONS (CRUD) ───────────────────────────────────────────────────────
  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;
    const batch: Batch = {
      id: `batch-${Date.now()}`,
      name: newBatchName,
      count: 0,
      avgWpm: 0,
      avgAcc: 0,
      language: newBatchLang
    };
    setBatches([...batches, batch]);
    setNewBatchName('');
    setShowBatchModal(false);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudName.trim() || !newStudEmail.trim()) return;
    const student: Student = {
      id: `stud-${Date.now()}`,
      name: newStudName,
      email: newStudEmail,
      wpm: 0,
      accuracy: 0,
      completed: 0,
      batchId: newStudBatch,
      status: 'Active'
    };
    setStudents([...students, student]);
    // Increment student count in batch list
    setBatches(batches.map(b => b.id === newStudBatch ? { ...b, count: b.count + 1 } : b));
    setNewStudName('');
    setNewStudEmail('');
    setShowStudModal(false);
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim() || !newExamText.trim()) return;
    const exam: MockExam = {
      id: `exam-${Date.now()}`,
      title: newExamTitle,
      language: newExamLang,
      duration: newExamDuration,
      text: newExamText,
      attempts: 0
    };
    setExams([...exams, exam]);
    setNewExamTitle('');
    setNewExamText('');
    setShowExamModal(false);
  };

  const handleDeleteBatch = (id: string) => {
    setBatches(batches.filter(b => b.id !== id));
    setStudents(students.filter(s => s.batchId !== id));
  };

  const handleDeleteStudent = (id: string, batchId: string) => {
    setStudents(students.filter(s => s.id !== id));
    setBatches(batches.map(b => b.id === batchId ? { ...b, count: Math.max(0, b.count - 1) } : b));
  };

  const handleDeleteExam = (id: string) => {
    setExams(exams.filter(e => e.id !== id));
  };

  // ─── CALCULATIONS & SPLITS ──────────────────────────────────────────────────
  const activeStudents = students.filter(s => s.status === 'Active').length;
  const totalSlots = 50; // Dynamic slot license size
  const totalWpm = students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.wpm, 0) / students.length) : 0;
  const totalAcc = students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.accuracy, 0) / students.length) : 0;

  // Filtered Student List matching search & dropdown selector
  const filteredStudents = students.filter(s => {
    const matchesBatch = selectedBatchFilter === 'all' || s.batchId === selectedBatchFilter;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBatch && matchesSearch;
  });

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12 min-h-screen">
      {/* Premium Glassmorphic glowing backgrounds */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[120px] opacity-60"></div>
      <div className="absolute bottom-1/4 left-1/3 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/5 blur-[120px] opacity-50"></div>

      {/* HEADER ACTION AREA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6 text-left">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3 py-1 text-xs font-semibold text-cyan-400">
            <School className="h-3.5 w-3.5" />
            <span>Institute Deployment Manager</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Coaching Performance Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
            Oversee batch analytics splits, student WPM telemetry progression logs, and configure simulated governmental Krutidev & English test modules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:border-white/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-cyan-400" />
            <span>New Batch</span>
          </button>
          <button 
            onClick={() => setShowStudModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* CORE PERFORMANCE ANALYTICS INDICATORS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-6 backdrop-blur-sm text-left relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.02] to-blue-500/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slot Allocation</span>
            <Database className="h-5 w-5 text-cyan-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 mt-4">
            <span className="text-3xl font-black text-white tracking-tight">{students.length}</span>
            <span className="text-xs font-bold text-slate-500">/ {totalSlots} slots used</span>
          </div>
          <div className="w-full bg-slate-850 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${(students.length / totalSlots) * 100}%` }}></div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-6 backdrop-blur-sm text-left relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.02] to-indigo-500/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Batches</span>
            <Users className="h-5 w-5 text-purple-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 mt-4">
            <span className="text-3xl font-black text-white tracking-tight">{batches.length}</span>
            <span className="text-xs font-bold text-slate-500">batches active</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-5 leading-tight truncate">Classrooms configured on English & Hindi layouts</p>
        </div>

        <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-6 backdrop-blur-sm text-left relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-teal-500/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg WPM Speed</span>
            <Clock className="h-5 w-5 text-emerald-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 mt-4">
            <span className="text-3xl font-black text-white tracking-tight">{totalWpm}</span>
            <span className="text-xs font-bold text-emerald-400">WPM</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-5 leading-tight truncate">School-wide average typing speeds</p>
        </div>

        <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-6 backdrop-blur-sm text-left relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.02] to-orange-500/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Accuracy</span>
            <Award className="h-5 w-5 text-amber-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 mt-4">
            <span className="text-3xl font-black text-white tracking-tight">{totalAcc}%</span>
            <span className="text-xs font-bold text-slate-500">mean accuracy</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-5 leading-tight truncate">Total batch telemetry precision logs</p>
        </div>
      </div>

      {/* MAIN LAYOUT SPLITS */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* LEFT & MID SECTIONS: BATCHES & STUDENTS DIRECTORY */}
        <div className="lg:col-span-2 space-y-10 text-left">
          {/* BATCHES CARD GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-white tracking-wide">Batches & Classrooms</h2>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Interactive View</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {batches.map(batch => (
                <div key={batch.id} className="relative rounded-2xl border border-white/5 bg-slate-900/20 p-5 backdrop-blur-sm flex flex-col justify-between group hover:border-white/10 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        batch.language === 'English' 
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {batch.language === 'English' ? <Globe className="h-2.5 w-2.5" /> : <Languages className="h-2.5 w-2.5" />}
                        <span>{batch.language}</span>
                      </span>
                      
                      <button 
                        onClick={() => handleDeleteBatch(batch.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete Batch"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors">
                      {batch.name}
                    </h3>
                  </div>

                  <div className="pt-4 border-t border-white/5 mt-4 space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Students:</span>
                      <span className="font-bold text-slate-300">{batch.count} registered</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Avg Speed:</span>
                      <span className="font-bold text-cyan-400">{batch.avgWpm} WPM</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Avg Accuracy:</span>
                      <span className="font-bold text-emerald-400">{batch.avgAcc}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STUDENT DIRECTORY LIST */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-extrabold text-white tracking-wide">Student Performance Logs</h2>
              
              {/* Filters Panel */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Bar */}
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

                {/* Batch Dropdown */}
                <select
                  value={selectedBatchFilter}
                  onChange={(e) => setSelectedBatchFilter(e.target.value)}
                  className="rounded-xl border border-white/5 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="all">All Batches</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table Directory Container */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 overflow-hidden shadow-xl backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-slate-900/40 border-b border-white/5 text-xs font-bold text-slate-400">
                      <th className="px-5 py-4 text-left">Student Info</th>
                      <th className="px-5 py-4">Assigned Batch</th>
                      <th className="px-5 py-4">Avg WPM</th>
                      <th className="px-5 py-4">Avg Accuracy</th>
                      <th className="px-5 py-4">Lessons Done</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => {
                        const batchName = batches.find(b => b.id === student.batchId)?.name || 'Unassigned';
                        return (
                          <tr key={student.id} className="hover:bg-white/[0.01] transition-colors text-slate-300">
                            <td className="px-5 py-4 text-left">
                              <div className="space-y-0.5">
                                <div className="font-bold text-white">{student.name}</div>
                                <div className="text-[10px] text-slate-500">{student.email}</div>
                              </div>
                            </td>
                            <td className="px-5 py-4 font-medium text-slate-400 truncate max-w-[150px]" title={batchName}>
                              {batchName}
                            </td>
                            <td className="px-5 py-4 font-bold text-cyan-400">{student.wpm > 0 ? `${student.wpm} WPM` : '—'}</td>
                            <td className="px-5 py-4 font-bold text-emerald-400">{student.accuracy > 0 ? `${student.accuracy}%` : '—'}</td>
                            <td className="px-5 py-4 font-semibold text-slate-400">{student.completed > 0 ? `${student.completed} lessons` : '0 completed'}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                student.status === 'Active' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-slate-800 text-slate-500 border border-white/5'
                              }`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <button 
                                onClick={() => handleDeleteStudent(student.id, student.batchId)}
                                className="text-slate-500 hover:text-red-400 transition-colors"
                                title="Remove Student"
                              >
                                <Trash2 className="h-3.5 w-3.5 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-slate-500 font-medium">
                          No students registered in this batch.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: GOVERNMENT MOCK EXAMS BUILDER */}
        <div className="lg:col-span-1 space-y-6 text-left">
          {/* MOCK EXAMS LIST CONTAINER */}
          <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-6 backdrop-blur-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white tracking-wide">Government Mock Exams</h3>
              </div>
              <button 
                onClick={() => setShowExamModal(true)}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <span>New</span>
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-4">
              {exams.map(exam => (
                <div key={exam.id} className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-3 relative group hover:border-white/10 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold ${
                        exam.language === 'English' 
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {exam.language}
                      </span>
                      
                      <button 
                        onClick={() => handleDeleteExam(exam.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete Exam"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors pr-4">
                      {exam.title}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-600" />
                      <span>{exam.duration} mins</span>
                    </span>
                    
                    <span className="flex items-center gap-1 font-bold text-slate-400">
                      <GraduationCap className="h-3.5 w-3.5 text-slate-600" />
                      <span>{exam.attempts} attempts logged</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC TELEMETRY SPEED CURVE */}
          <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white tracking-wide">Batch Velocity Progression</span>
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              Telemetry progression split maps indicating weekly gains in average words-per-minute (WPM) across standard classrooms.
            </p>

            {/* Simple Graphic telemetry layout */}
            <div className="h-36 w-full flex items-end justify-between gap-1 pt-6 border-b border-white/5 px-2 relative">
              <div className="absolute inset-0 flex flex-col justify-between text-[8px] text-slate-600 pointer-events-none pb-2">
                <div className="border-b border-white/5 w-full pb-1">50 WPM</div>
                <div className="border-b border-white/5 w-full pb-1">40 WPM</div>
                <div className="border-b border-white/5 w-full pb-1">30 WPM</div>
                <div className="border-b border-white/5 w-full pb-1">20 WPM</div>
              </div>
              <div className="flex flex-col items-center gap-1.5 w-1/4 z-10">
                <div className="text-[9px] font-bold text-slate-400">35</div>
                <div className="bg-slate-800 hover:bg-slate-700 w-full rounded-t-lg transition-all" style={{ height: '55px' }}></div>
                <span className="text-[8px] text-slate-500 font-bold">Week 1</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 w-1/4 z-10">
                <div className="text-[9px] font-bold text-slate-300">40</div>
                <div className="bg-slate-800 hover:bg-slate-700 w-full rounded-t-lg transition-all" style={{ height: '70px' }}></div>
                <span className="text-[8px] text-slate-500 font-bold">Week 2</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 w-1/4 z-10">
                <div className="text-[9px] font-bold text-cyan-400">44</div>
                <div className="bg-gradient-to-t from-cyan-600 to-blue-500 w-full rounded-t-lg shadow-lg shadow-cyan-500/10 transition-all" style={{ height: '82px' }}></div>
                <span className="text-[8px] text-cyan-400 font-bold">Week 3</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 w-1/4 z-10">
                <div className="text-[9px] font-bold text-emerald-400">48</div>
                <div className="bg-gradient-to-t from-emerald-600 to-teal-500 w-full rounded-t-lg shadow-lg shadow-emerald-500/10 transition-all" style={{ height: '96px' }}></div>
                <span className="text-[8px] text-emerald-400 font-bold">Week 4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL OVERLAYS (CRUD Forms) ─────────────────────────────────────────── */}
      {/* 1. Add Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl relative text-left space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-white">Create New Batch</h3>
              <p className="text-xs text-slate-400">Configure typing layouts for this classroom group.</p>
            </div>
            
            <form onSubmit={handleAddBatch} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">Batch Name</label>
                <input
                  type="text"
                  placeholder="e.g. SSC Evening Target 50"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 text-left block">Keyboard Language Layout</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewBatchLang('English')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-3 text-xs font-bold transition-all cursor-pointer ${
                      newBatchLang === 'English' 
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' 
                        : 'border-white/5 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Globe className="h-4 w-4" />
                    <span>English</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBatchLang('Hindi')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-3 text-xs font-bold transition-all cursor-pointer ${
                      newBatchLang === 'Hindi' 
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400' 
                        : 'border-white/5 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Languages className="h-4 w-4" />
                    <span>Hindi</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 cursor-pointer"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Student Modal */}
      {showStudModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl relative text-left space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-white">Register Student Slot</h3>
              <p className="text-xs text-slate-400">Allocate a slot and assign them to an active batch.</p>
            </div>
            
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">Student Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={newStudName}
                  onChange={(e) => setNewStudName(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">Student Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. rahul@email.com"
                  value={newStudEmail}
                  onChange={(e) => setNewStudEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 text-left block">Assign Batch</label>
                <select
                  value={newStudBatch}
                  onChange={(e) => setNewStudBatch(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none"
                  required
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowStudModal(false)}
                  className="rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 cursor-pointer"
                >
                  Register Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl relative text-left space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-white">Create Government Simulated Exam</h3>
              <p className="text-xs text-slate-400">Deploy custom paragraphs under strict governmental WPM standards.</p>
            </div>
            
            <form onSubmit={handleAddExam} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">Exam Title</label>
                <input
                  type="text"
                  placeholder="e.g. SSC CHSL Practice Exam - Week 4"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 block text-left">Exam Language</label>
                  <select
                    value={newExamLang}
                    onChange={(e) => setNewExamLang(e.target.value as 'English' | 'Hindi')}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 focus:border-cyan-500 focus:outline-none"
                    required
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (Krutidev)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 block text-left">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newExamDuration}
                    onChange={(e) => setNewExamDuration(parseInt(e.target.value) || 10)}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">Typing Passage Text</label>
                <textarea
                  rows={4}
                  placeholder="Paste the paragraph exam text here..."
                  value={newExamText}
                  onChange={(e) => setNewExamText(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 cursor-pointer"
                >
                  Deploy Mock Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
