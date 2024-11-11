// lib/auth.ts
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'  // Secure this in production

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash)
}

export const generateToken = (userId: String) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET)
}
