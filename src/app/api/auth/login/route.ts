import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }
  
  const isPasswordValid = await comparePassword(password, user.password_hash)
  if (!isPasswordValid) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }
  
  const token = generateToken(user.id)
  const response = NextResponse.json({ userId: user.id, message: 'Login successful' }, { status: 200 })

  response.cookies.set('token', token, {
    httpOnly: true,
    maxAge: 3600,
  })

  return response
}