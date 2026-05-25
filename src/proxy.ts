import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Proxy for Secure Route Protection.
 * Runs only on configured protected routes.
 * Redirects unauthenticated requests (missing typing-session cookie) to "/login".
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has('typing-session');

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/lessons/:id+', // Matches /lessons/[id] (1 or more subpaths) but NOT /lessons itself
    '/results/:id+', // Matches /results/[id] (1 or more subpaths) but NOT /results itself
    '/history/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
};
