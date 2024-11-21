'use client'

import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import { Toaster } from "@/components/ui/toaster"
import DashboardLayout from '@/components/layout/DashboardLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import './globals.css'
import { UserProvider } from '@/context/UserContext'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/auth')

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <title>Projectify</title>
        <meta name="description" content="Manage your projects efficiently with Projectify" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background`}>
        {isAuthPage ? (
          <AuthLayout>{children}</AuthLayout>
        ) : (
          <UserProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </UserProvider>
        )}
        <Toaster />
      </body>
    </html>
  )
}
