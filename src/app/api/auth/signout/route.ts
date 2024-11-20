import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' });
    // Clear the refresh token cookie
    response.cookies.delete('refreshToken');

    return response;
  } catch (error) {
    console.error('Error during signout:', error);
    return NextResponse.json({ message: 'An error occurred during signout' }, { status: 500 });
  }
}
