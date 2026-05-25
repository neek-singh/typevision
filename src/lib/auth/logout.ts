import { useAuthStore } from '@/store/useAuthStore';

/**
 * Performs a complete, secure logout:
 * - Invokes Supabase signOut via Zustand store
 * - Cleans up local authentication state
 * - Wipes the browser typing-session cookie
 * - Gracefully redirects to "/login"
 */
export async function performLogout(router: any): Promise<void> {
  try {
    // 1. Invoke Zustand useAuthStore signOut (which calls supabase.auth.signOut() and wipes cookie/state)
    await useAuthStore.getState().signOut();
    
    // 2. Additional cookie cleanup to ensure absolutely no stale state remains
    if (typeof document !== 'undefined') {
      document.cookie = 'typing-session=; path=/; max-age=0; SameSite=Lax; Secure';
    }
    
    // 3. Securely redirect user to /login
    router.push('/login');
  } catch (error) {
    console.error('An error occurred during secure logout:', error);
    // Fallback: clear cookie and force redirect
    if (typeof document !== 'undefined') {
      document.cookie = 'typing-session=; path=/; max-age=0; SameSite=Lax; Secure';
    }
    router.push('/login');
  }
}
