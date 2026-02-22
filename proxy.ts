import { auth } from '@/lib/auth/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_MAX_AGE = 60 * 60 * 2; // 2 hours in seconds

export default async function middleware(request: NextRequest) {
  // Get session from Neon Auth
  const { data: session } = await auth.getSession();

  // If there's a session, check if it's expired due to inactivity
  if (session?.session) {
    const lastActivity = request.cookies.get('last-activity')?.value;
    const now = Date.now();

    if (lastActivity) {
      const timeSinceLastActivity = (now - parseInt(lastActivity)) / 1000; // Convert to seconds
      
      // If more than 2 hours of inactivity, sign out and redirect
      if (timeSinceLastActivity > SESSION_MAX_AGE) {
        const response = NextResponse.redirect(new URL('/auth/sign-in', request.url));
        response.cookies.delete('last-activity');
        // Let Neon Auth handle the session cleanup
        return response;
      }
    }

    // Update last activity timestamp
    const response = NextResponse.next();
    response.cookies.set('last-activity', now.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  }

  // Use Neon Auth middleware for authentication check
  return auth.middleware({
    loginUrl: '/auth/sign-in',
  })(request);
}

export const config = {
  matcher: [
    // Protected routes requiring authentication
    '/account/:path*',
    '/status/:path*',
    '/api/secure-api-route/:path*',
  ],
};