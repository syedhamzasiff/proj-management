
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  const { email, password, name } = await request.json()

  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 })
  }

  const hashedPassword = await hashPassword(password)
  const user = await prisma.user.create({
    data: { email, password_hash: hashedPassword, name },
  })

  const token = generateToken(user.id)

  const response = NextResponse.json({ message: "Account Created Successfully"}, {status: 200})

  response.cookies.set('token', token, {
    httpOnly: true,
  })

  return response
}
