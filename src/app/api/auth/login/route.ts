import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, generateTokens } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Find the user in the database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.password_hash))) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id);

    // Set the refresh token in an HTTP-only cookie
    const response = NextResponse.json({ accessToken });
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true
    });

    return response;
  } catch (error) {
    console.error('Error in login route:', error);
    return NextResponse.json({ message: 'An error occurred during login' }, { status: 500 });
  }
}
