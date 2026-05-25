'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  School, Users, BookOpen, Clock, Plus, Trash2, Search, ArrowUpRight, 
  Award, Trophy, GraduationCap, LayoutDashboard, Database, Key, Sparkles, 
  Globe, Languages, FileText, ChevronRight, AlertCircle, Loader2, RefreshCw,
  UserCheck, UserMinus, UserPlus, GraduationCap as StudentIcon
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

interface PrincipalDashboardProps {
  user: any;
  profile: UserProfile | null;
}

interface Organization {
  id: string;
  name: string;
  type: 'school' | 'institute';
  logo_url?: string;
  address?: string;
}

interface ClassOrBatch {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  student_count?: number;
}

interface Member {
  id: string;
  email: string;
  display_name: string;
  role: 'principal' | 'staff' | 'student';
  created_at: string;
}

export default function PrincipalDashboard({ user, profile }: PrincipalDashboardProps) {
  const [orgDetails, setOrgDetails] = useState<Organization | null>(null);
  const [classes, setClasses] = useState<ClassOrBatch[]>([]);
  const [staffList, setStaffList] = useState<Member[]>([]);
  const [studentList, setStudentList] = useState<Member[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [showClassModal, setShowClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'staff' | 'student'>('student');

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

      // 2. Fetch classes or batches
      const classesRes = await supabase
        .from('classes_or_batches')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      if (classesRes.error) throw classesRes.error;

      // 3. Fetch all members in parallel
      const membersRes = await supabase
        .from('users')
        .select('id, email, display_name, role, created_at')
        .eq('organization_id', profile.organization_id);
      if (membersRes.error) throw membersRes.error;

      const allMembers = (membersRes.data as Member[]) || [];
      const staff = allMembers.filter(m => m.role === 'staff');
      const students = allMembers.filter(m => m.role === 'student');

      setStaffList(staff);
      setStudentList(students);

      // Fetch student counts for each class in parallel
      const classesWithCounts = await Promise.all(
        (classesRes.data || []).map(async (c) => {
          const countRes = await supabase
            .from('class_students')
            .select('student_id', { count: 'exact', head: true })
            .eq('class_id', c.id);
          return {
            ...c,
            student_count: countRes.count || 0
          };
        })
      );
      setClasses(classesWithCounts);

    } catch (err: any) {
      console.error('Error fetching principal data:', err);
      setErrorMessage(err.message || 'Failed to sync school statistics from database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile?.organization_id]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !profile?.organization_id) return;

    setActionLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase
        .from('classes_or_batches')
        .insert({
          organization_id: profile.organization_id,
          name: newClassName,
          description: newClassDesc || null,
          created_by: user.id
        })
        .select();

      if (error) throw error;

      setClasses([{ ...data[0], student_count: 0 }, ...classes]);
      setNewClassName('');
      setNewClassDesc('');
      setShowClassModal(false);
      setSuccessMessage('Classroom batch created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create class.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !profile?.organization_id) return;

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      // Find the user by email first
      const { data: userRecord, error: findError } = await supabase
        .from('users')
        .select('id, email, display_name, role, created_at')
        .eq('email', inviteEmail.trim())
        .single();

      if (findError || !userRecord) {
        throw new Error('User not found. They must first sign up for an account on the platform.');
      }

      // Update their role and organization link
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role: inviteRole,
          organization_id: profile.organization_id
        })
        .eq('id', userRecord.id);

      if (updateError) throw updateError;

      const newMember: Member = {
        id: userRecord.id,
        email: userRecord.email,
        display_name: userRecord.display_name,
        role: inviteRole,
        created_at: userRecord.created_at
      };

      if (inviteRole === 'staff') {
        setStaffList([newMember, ...staffList]);
      } else {
        setStudentList([newMember, ...studentList]);
      }

      setInviteEmail('');
      setShowInviteModal(false);
      setSuccessMessage(`Successfully registered ${userRecord.display_name} as ${inviteRole}!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to assign user to organization.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (id: string, name: string, role: 'staff' | 'student') => {
    if (!confirm(`Are you sure you want to remove ${name} from your organization?`)) return;

    setActionLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          role: 'user', // demote to regular standalone user
          organization_id: null // unlink from school
        })
        .eq('id', id);

      if (error) throw error;

      if (role === 'staff') {
        setStaffList(staffList.filter(s => s.id !== id));
      } else {
        setStudentList(studentList.filter(s => s.id !== id));
      }
      setSuccessMessage(`Removed ${name} from organization roster.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove member.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class? This will unlink all students enrolled inside it.')) return;

    setActionLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase
        .from('classes_or_batches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClasses(classes.filter(c => c.id !== id));
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete class.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-slate-950 min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]" />
        <p className="text-sm text-slate-400 font-semibold tracking-wider animate-pulse">Syncing Principal Operations Room...</p>
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
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3 py-1 text-xs font-semibold text-cyan-400">
            <School className="h-3.5 w-3.5" />
            <span>School Principal console • {orgDetails?.name}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            {orgDetails?.name || 'School Operations Room'}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            Administer classes, assign instructional staff (teachers), and review registered student lists under your licensed deployment.
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
            onClick={() => setShowClassModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-cyan-400" />
            <span>Create Class</span>
          </button>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Staff / Student</span>
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-sm text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-400">
          <UserCheck className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 4 Core Indicators grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Active Classes"
          value={classes.length}
          icon={School}
          color="cyan"
          description="Configured classrooms"
        />
        <StatsCard
          title="Teachers (Staff)"
          value={staffList.length}
          icon={Users}
          color="indigo"
          description="Instructional staff assigned"
        />
        <StatsCard
          title="Enrolled Students"
          value={studentList.length}
          icon={StudentIcon}
          color="emerald"
          description="Active student roster slots"
        />
        <StatsCard
          title="Location Address"
          value={orgDetails?.address || 'Not Configured'}
          icon={Database}
          color="purple"
          description="School branch location details"
        />
      </div>

      {/* Main Grid Splits */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Col - Classes list & Staff list */}
        <div className="lg:col-span-2 space-y-10">
          {/* Class Batches */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-white tracking-wide">Classrooms & Batches</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {classes.length > 0 ? (
                classes.map(c => (
                  <div key={c.id} className="relative rounded-2xl border border-white/5 bg-slate-900/20 p-5 backdrop-blur-sm flex flex-col justify-between group hover:border-white/10 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Class Group
                        </span>
                        <button 
                          onClick={() => handleDeleteClass(c.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Classroom Batch"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <h3 className="text-base font-extrabold text-white group-hover:text-cyan-400 transition-colors">
                        {c.name}
                      </h3>
                      {c.description && (
                        <p className="text-xs text-slate-400 leading-normal">{c.description}</p>
                      )}
                    </div>
                    <div className="pt-3 border-t border-white/5 mt-4 text-[10px] text-slate-500 flex justify-between items-center">
                      <span className="font-bold text-slate-350">{c.student_count} registered students</span>
                      <span>Created {new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 rounded-2xl border border-dashed border-white/5 bg-slate-900/10 p-8 text-center text-slate-500 font-medium">
                  No classroom groups registered yet. Use Create Class button to begin.
                </div>
              )}
            </div>
          </div>

          {/* Teachers list */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-white tracking-wide">Assigned Instructional Staff (Teachers)</h2>
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 overflow-hidden shadow-xl backdrop-blur-sm">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-900/40 border-b border-white/5 text-xs font-bold text-slate-400">
                    <th className="px-5 py-4 text-left">Display Name</th>
                    <th className="px-5 py-4 text-left">Email Address</th>
                    <th className="px-5 py-4">Assigned On</th>
                    <th className="px-5 py-4 w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                  {staffList.length > 0 ? (
                    staffList.map(staff => (
                      <tr key={staff.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-5 py-4 text-left font-bold text-white">{staff.display_name}</td>
                        <td className="px-5 py-4 text-left font-mono text-slate-400">{staff.email}</td>
                        <td className="px-5 py-4">{new Date(staff.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          <button 
                            onClick={() => handleRemoveMember(staff.id, staff.display_name, 'staff')}
                            className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Remove Teacher"
                          >
                            <UserMinus className="h-4 w-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-500 font-medium">
                        No instructional staff registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col - Student Roster */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-6 backdrop-blur-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <StudentIcon className="h-4.5 w-4.5 text-emerald-400" />
                <h3 className="text-sm font-extrabold text-white tracking-wide">Student Enrollment Roster</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">{studentList.length} total</span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {studentList.length > 0 ? (
                studentList.map(student => (
                  <div key={student.id} className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 flex justify-between items-center group hover:border-white/10 transition-all">
                    <div className="space-y-1 text-left">
                      <div className="text-xs font-bold text-white">{student.display_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{student.email}</div>
                    </div>
                    
                    <button 
                      onClick={() => handleRemoveMember(student.id, student.display_name, 'student')}
                      className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0 ml-2"
                      title="De-register Student Slot"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 font-medium">
                  Zero students enrolled. Add student profiles to initialize.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Create Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl relative text-left space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-white">Create Classroom Batch</h3>
              <p className="text-xs text-slate-400">Initialize a new grade/section classroom or coaching batch.</p>
            </div>
            
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">Class Name</label>
                <input
                  type="text"
                  placeholder="e.g. Grade 10 Section A"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Standard english keyboard training cohort."
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
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
                  <span>Generate Classroom</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl relative text-left space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-white">Enroll Member Slot</h3>
              <p className="text-xs text-slate-400">Search and bind a registered user to your organization.</p>
            </div>
            
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">Member Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. member@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 block text-left">Assign Roster Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInviteRole('student')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-3 text-xs font-bold transition-all cursor-pointer ${
                      inviteRole === 'student' 
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' 
                        : 'border-white/5 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <StudentIcon className="h-4 w-4" />
                    <span>Student Slot</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteRole('staff')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-3 text-xs font-bold transition-all cursor-pointer ${
                      inviteRole === 'staff' 
                        ? 'border-purple-500 bg-purple-500/10 text-purple-400' 
                        : 'border-white/5 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Teacher (Staff)</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
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
                  <span>Enroll Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
