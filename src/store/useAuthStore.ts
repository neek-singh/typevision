import { create } from 'zustand';
import { supabase } from '@/utils/supabase';
import { Session, User } from '@supabase/supabase-js';
import { fetchWithCache, clearCache } from '@/lib/cache/cache-utils';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role?: string;
  organization_id?: string | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  created_at: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateSubscription: (plan: string, status: string) => Promise<{ error: any }>;
  initialize: () => Promise<void>;
}

const syncCookie = (sessionExists: boolean) => {
  if (typeof document !== 'undefined') {
    if (sessionExists) {
      document.cookie = 'typing-session=true; path=/; max-age=604800; SameSite=Lax; Secure';
    } else {
      document.cookie = 'typing-session=; path=/; max-age=0; SameSite=Lax; Secure';
    }
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  initialized: false,

  signUp: async (email, password, displayName) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        set({ loading: false });
        return { error };
      }

      if (data.user) {
        syncCookie(true);
        set({ user: data.user, session: data.session });
        try {
          const userId = data.user.id;
          // The trigger automatically inserts into public.users, so we fetch profile
          const profileData = await fetchWithCache(`profile-${userId}`, async () => {
            const { data: pData, error: pErr } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single();
            if (pErr) throw pErr;
            return pData;
          }, 30000);
          set({ profile: profileData });
        } catch (profileErr) {
          console.error('Profile fetch failed during signUp:', profileErr);
        }
      }
      return { error: null };
    } catch (err: any) {
      console.error('signUp threw error:', err);
      return { error: err };
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ loading: false });
        return { error };
      }

      if (data.user) {
        syncCookie(true);
        set({ user: data.user, session: data.session });
        try {
          const userId = data.user.id;
          const profileData = await fetchWithCache(`profile-${userId}`, async () => {
            const { data: pData, error: pErr } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single();
            if (pErr) throw pErr;
            return pData;
          }, 30000);
          set({ profile: profileData });
        } catch (profileErr) {
          console.error('Profile fetch failed during signIn:', profileErr);
        }
      }
      return { error: null };
    } catch (err: any) {
      console.error('signIn threw error:', err);
      return { error: err };
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    // 1. Immediately wipe local auth cookies, Zustand state, and clear memory cache for instant UI response
    try {
      clearCache();
    } catch (cacheErr) {
      console.error('Cache clear failed during signOut:', cacheErr);
    }
    syncCookie(false);
    set({ user: null, profile: null, session: null, loading: false });

    // 2. Perform Supabase sign out asynchronously in the background (fire-and-forget)
    supabase.auth.signOut().catch((err) => {
      console.error('Background SignOut failed:', err);
    });
  },

  updateSubscription: async (plan, status) => {
    const { user, profile } = get();
    if (!user) return { error: 'No authenticated user found' };
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('users')
        .update({ subscription_plan: plan, subscription_status: status })
        .eq('id', user.id);

      if (error) {
        set({ loading: false });
        return { error };
      }

      // Update local store profile state
      if (profile) {
        set({
          profile: {
            ...profile,
            subscription_plan: plan,
            subscription_status: status,
          },
        });
      }
      return { error: null };
    } catch (err: any) {
      console.error('updateSubscription threw error:', err);
      return { error: err };
    } finally {
      set({ loading: false });
    }
  },

  initialize: async () => {
    if (get().initialized) return;

    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        syncCookie(true);
        set({ user: session.user, session });
        try {
          const userId = session.user.id;
          const profileData = await fetchWithCache(`profile-${userId}`, async () => {
            const { data: pData, error: pErr } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single();
            if (pErr) throw pErr;
            return pData;
          }, 30000);
          set({ profile: profileData });
        } catch (profileErr) {
          console.error('Profile fetch failed during init:', profileErr);
        }
      }
    } catch (err) {
      console.error('Auth initialization failed:', err);
    } finally {
      set({ loading: false, initialized: true });
    }

    // Set up auth state change listener
    supabase.auth.onAuthStateChange(async (event, newSession) => {
      try {
        if (newSession?.user) {
          syncCookie(true);
          set({ user: newSession.user, session: newSession });
          try {
            const userId = newSession.user.id;
            const profileData = await fetchWithCache(`profile-${userId}`, async () => {
              const { data: pData, error: pErr } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
              if (pErr) throw pErr;
              return pData;
            }, 30000);
            set({ profile: profileData });
          } catch (profileErr) {
            console.error('Profile fetch failed on auth state change:', profileErr);
          }
        } else {
          syncCookie(false);
          set({ user: null, profile: null, session: null });
        }
      } catch (err) {
        console.error('Auth state change listener encountered error:', err);
      }
    });
  },
}));
