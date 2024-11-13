'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [windowWidth, setWindowWidth] = useState(0)
  const [mounted, setMounted] = useState(false) // Track mounting status

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Only render the component after mounting on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  const getMainContentMargin = () => {
    if (windowWidth < 640) { // sm
      return 'ml-0' // No margin on mobile
    }
    if (windowWidth < 1024) { // lg
      return 'ml-16' // Fixed margin for collapsed sidebar
    }
    return sidebarOpen ? 'ml-64' : 'ml-16' // Dynamic margin on desktop
  }

  if (!mounted) {
    // Render a loading state (or nothing) until the component has mounted
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      <main className={`transition-all duration-300 ${getMainContentMargin()} pt-4 px-4`}>
        {children}
      </main>
    </div>
  )
}
