import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;

  // If no token exists, redirect to the login page
  if (!accessToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Verify the token
    const payload = await verifyToken(accessToken);

    // If verification fails (e.g., expired or invalid token), redirect to login
    if (!payload) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Add userId to the request URL for subsequent handling
    request.nextUrl.searchParams.set('userId', payload.userId);

    // Proceed to the requested page
    return NextResponse.next();
  } catch (error) {
    // Handle token verification errors (e.g., invalid format, expired, etc.)
    console.error('Token verification failed:', error);

    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: ['/user/:path*', '/workspace/:path*', '/project/:path*'], // Add protected routes here
};
