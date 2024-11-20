'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import DashboardLayout from '../components/layout/DashboardLayout'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth') || pathname === '/';
  const [userId, setUserId] = useState<String | null>(null)

  useEffect(() => {
    async function fetchUserId() {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include', 
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }
  
        const { userId } = await response.json();
        setUserId(userId);
      } catch (error) {
        console.error('Error fetching session:', error);
        setUserId(null);
      }
    }
  
    fetchUserId();
  }, []);

  if (!userId && !isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex-h-screen bg-background">
          {isAuthPage ? (
            children
          ) : (
            <DashboardLayout userId={userId as string}>
              {children}
            </DashboardLayout>
          )}
        </div>
      </body>
    </html>
  )
}