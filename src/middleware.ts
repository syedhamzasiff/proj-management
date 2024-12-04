import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from './lib/auth';
import { cookies } from 'next/headers';

const protectedRoutePattern = /^\/(u|p|w)(\/|$)/;
const publicRoutes = ['/auth/login', '/auth/signup'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if route is protected
  function isProtectedRoute(path: string): boolean {
    return protectedRoutePattern.test(path);
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.includes(path);

  // Access session from cookie
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);

  // Redirect if user is unauthenticated on a protected route
  if (isProtectedRoute(path) && (!session || session.expired)) {
    return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
  }

  // Redirect authenticated users from public routes to dashboard
  if (isPublicRoute && session?.userId && !path.startsWith('/u')) {
    return NextResponse.redirect(new URL('/u/dashboard', request.nextUrl));
  }

  return NextResponse.next();
}
