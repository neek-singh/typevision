'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, ShieldAlert, ArrowUpRight, LayoutDashboard, History, UserCircle, Settings, ChevronLeft, ChevronRight, Menu, X, CreditCard } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import dynamic from 'next/dynamic';

function DashboardTabSkeleton({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-slate-900/10 p-12 text-center space-y-4 backdrop-blur-md relative overflow-hidden animate-pulse">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/25 border-t-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] mx-auto"></div>
      <p className="text-xs text-slate-400 font-semibold tracking-wider">{text}</p>
    </div>
  );
}

const PrincipalDashboard = dynamic(() => import('@/components/dashboard/PrincipalDashboard'), {
  ssr: false,
  loading: () => <DashboardTabSkeleton text="Syncing organizational console..." />
});

const StaffDashboard = dynamic(() => import('@/components/dashboard/StaffDashboard'), {
  ssr: false,
  loading: () => <DashboardTabSkeleton text="Syncing staff console..." />
});

const StudentDashboard = dynamic(() => import('@/components/dashboard/StudentDashboard'), {
  ssr: false,
  loading: () => <DashboardTabSkeleton text="Syncing typing telemetry..." />
});

const DashboardHistory = dynamic(() => import('@/components/dashboard/DashboardHistory'), {
  ssr: false,
  loading: () => <DashboardTabSkeleton text="Syncing practice logs..." />
});

const DashboardProfile = dynamic(() => import('@/components/dashboard/DashboardProfile'), {
  ssr: false,
  loading: () => <DashboardTabSkeleton text="Syncing user profile..." />
});

const DashboardSettings = dynamic(() => import('@/components/dashboard/DashboardSettings'), {
  ssr: false,
  loading: () => <DashboardTabSkeleton text="Syncing analytical targets..." />
});

const DashboardSubscription = dynamic(() => import('@/components/dashboard/DashboardSubscription'), {
  ssr: false,
  loading: () => <DashboardTabSkeleton text="Syncing active plan status..." />
});

type TabType = 'overview' | 'history' | 'profile' | 'settings' | 'subscription';

export default function Dashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading, initialize, initialized } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const sidebarItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'history', name: 'Practice History', icon: History },
    { id: 'profile', name: 'My Profile', icon: UserCircle },
    { id: 'subscription', name: 'Subscription Plan', icon: CreditCard },
    { id: 'settings', name: 'Settings', icon: Settings },
  ] as const;

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirect to login if unauthenticated or if subscription plan is missing
  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    } else if (initialized && user && profile) {
      const hasPlan = profile.subscription_plan && profile.subscription_plan !== 'none';
      const isRoleExempt = ['admin', 'principal', 'staff'].includes(profile.role || '');
      if (!hasPlan && !isRoleExempt) {
        router.push('/pricing');
      }
    }
  }, [user, profile, initialized, router]);

  // Read active tab from URL query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'history' || tab === 'profile' || tab === 'settings' || tab === 'overview') {
        setActiveTab(tab as TabType);
      }
    }
  }, []);

  // Update query params without full page reload
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  // Loading indicator while auth initialized
  if (authLoading || !initialized || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-slate-950 min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]" />
        <p className="text-sm text-slate-400 font-semibold tracking-wider animate-pulse">Establishing secure session context...</p>
      </div>
    );
  }

  const role = profile?.role || 'user';

  return (
    <div className="w-full min-h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] md:overflow-hidden flex flex-col md:flex-row bg-slate-950 text-white">
      {/* Mobile Toggle Button Header (Visible only on mobile devices) */}
      <div className="flex md:hidden items-center justify-between p-4 border-b border-white/10 bg-slate-950/40 backdrop-blur-md shrink-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-300 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-xs font-bold text-white tracking-widest uppercase">
          Dashboard
        </div>
        <div className="w-9 h-9" /> {/* Spacer to center the title */}
      </div>

      {/* SIDEBAR - Desktop View */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-white/10 bg-slate-950/40 p-4 backdrop-blur-md transition-all duration-300 h-full ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Collapse/Expand toggle button */}
        <div className="flex items-center justify-between mb-8 px-2 shrink-0">
          {!isSidebarCollapsed && (
            <span className="text-[10px] font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-widest">
              Navigation
            </span>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto cursor-pointer"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto scrollbar-none">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center rounded-2xl p-3.5 text-xs font-bold transition-all duration-200 w-full cursor-pointer group relative border ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border-white/5 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                    : 'text-slate-450 border-transparent hover:text-white hover:bg-white/5 text-slate-405'
                } ${isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3.5'}`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {!isSidebarCollapsed && <span>{item.name}</span>}
                
                {/* Collapsed view hover label/tooltip */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-4 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-2xl">
                    {item.name}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* SIDEBAR - Mobile Drawer Overlay View */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-64 max-w-[80vw] bg-slate-950 border-r border-white/10 h-full p-4 flex flex-col animate-in slide-in-from-left duration-250 text-left"
          >
            <div className="flex items-center justify-between mb-8 px-2">
              <span className="text-xs font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-widest">
                Navigation
              </span>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleTabChange(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3.5 rounded-2xl p-3.5 text-xs font-bold transition-all duration-200 w-full cursor-pointer border ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border-white/5 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                        : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Clickable Backdrop to close */}
          <div 
            onClick={() => setIsMobileSidebarOpen(false)} 
            className="flex-1"
          />
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 min-w-0">
        {/* Universal branding header */}
        <DashboardHeader user={user} profile={profile} />

        {/* Dynamic Active Tab Content Panel */}
        <div className="w-full mt-4">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Role-based dashboard router switch */}
              {role === 'admin' && (
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl backdrop-blur-md text-left space-y-6">
                  <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-cyan-500/5 blur-3xl -z-10"></div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-950/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)] shrink-0">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-white tracking-tight">Ecosystem Control Center</h2>
                      <p className="text-xs text-slate-400 font-medium">Authentication confirmed • Platform Administrator account</p>
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-slate-450 leading-relaxed max-w-xl text-slate-400">
                    To ensure secure environment boundaries and modular deployments, global platform management is operated strictly from the **Typing Admin Console**.
                  </p>

                  <a 
                    href="http://localhost:3001/dashboard" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-amber-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:from-red-400 hover:to-amber-500 transition-all duration-200"
                  >
                    <span>Open Admin Operations Console</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              )}
              {role === 'principal' && (
                <PrincipalDashboard user={user} profile={profile} />
              )}
              {role === 'staff' && (
                <StaffDashboard user={user} profile={profile} />
              )}
              {role === 'student' && (
                <StudentDashboard user={user} profile={profile} isStudent={true} onTabChange={handleTabChange} />
              )}
              {role === 'user' && (
                <StudentDashboard user={user} profile={profile} isStudent={false} onTabChange={handleTabChange} />
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-in fade-in duration-200">
              <DashboardHistory />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="animate-in fade-in duration-200">
              <DashboardProfile />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-200">
              <DashboardSettings />
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="animate-in fade-in duration-200">
              <DashboardSubscription />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
