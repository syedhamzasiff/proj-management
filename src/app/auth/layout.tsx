import { MenuIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Projectify - Authentication',
  description: 'Sign up or sign in to Projectify, your all-in-one project management solution.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <main className="container flex justify-center">
        {children}
      </main>
    </div>
  )
}