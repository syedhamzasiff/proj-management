import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    request.nextUrl.searchParams.set('userId', payload.userId as string);
    return NextResponse.rewrite(request.nextUrl);
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ['/user/:path*', '/workspace/:path*', '/project/:path*'],
};