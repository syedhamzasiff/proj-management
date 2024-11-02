'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import DashboardLayout from '../components/layout/DashboardLayout'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-background">
        <DashboardLayout>{children}</DashboardLayout>
        </div>
      </body>
    </html>
  )
}