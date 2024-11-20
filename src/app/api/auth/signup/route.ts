import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Hash the user's password
    const hashedPassword = await hashPassword(password);

    // Create the user in the database
    await prisma.user.create({
      data: { email, password_hash: hashedPassword, name },
    });

    return NextResponse.json({ message: 'Account created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error in signup route:', error);
    return NextResponse.json({ message: 'An error occurred during signup' }, { status: 500 });
  }
}
