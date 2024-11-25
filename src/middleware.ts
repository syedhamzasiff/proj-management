import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from './lib/auth';
import { cookies } from 'next/headers';

export const protectedRoutes = ['/u', '/p', '/w'];
const publicRoutes = ['/auth/login', '/auth/signup', '/'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

  const cookie = (await cookies()).get('session')?.value;
  const session = cookie ? await decrypt(cookie) : null;

  console.log('Session:', session); 

  if (isProtectedRoute && !session?.userId) {
    console.log('Redirecting to /auth/login...');
    return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
  }

  if (
    isPublicRoute &&
    session?.userId &&
    !request.nextUrl.pathname.startsWith('/u/dashboard')
  ) {
    console.log('Redirecting to /u/dashboard...');
    return NextResponse.redirect(new URL('/u/dashboard', request.nextUrl));
  }

  return NextResponse.next();
}
