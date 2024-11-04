import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        {children}
      </main>
    </div>
  )
}