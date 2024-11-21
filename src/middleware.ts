import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from './lib/auth';
import { cookies } from 'next/headers';

export const protectedRoutes =  ['/u', '/p', '/w'];
const publicRoutes = ['/auth/login', '/auth/signup', '/'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
  }

  if (
    isPublicRoute &&
    session?.userId &&
    !request.nextUrl.pathname.startsWith('/u/dashboard')
  ) {
    return NextResponse.redirect(new URL('/u/dashboard', request.nextUrl));
  }

  return NextResponse.next();
}






