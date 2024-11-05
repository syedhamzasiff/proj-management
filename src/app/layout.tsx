'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import DashboardLayout from '../components/layout/DashboardLayout'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth') || pathname === '/';

return (
  <html lang="en">
    <body className={inter.className}>
      <div className="flex h-screen bg-background">
        {isAuthPage ? (
          children
        ) : (
          <DashboardLayout>{children}</DashboardLayout>
        )}
      </div>
    </body>
  </html>
)
}