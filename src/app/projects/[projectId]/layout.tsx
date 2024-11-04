'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from '@/components/projects/Navbar'

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  
  const pathParts = pathname.split('/')
  const projectId = pathParts[2]
  const currentPath = pathParts[3]
  
  // If we're at /projects/[id], use 'overview' as the current tab
  const currentTab = !currentPath ? 'overview' : currentPath

  const handleTabChange = (value: string) => {
    if (value === 'overview') {
      router.push(`/projects/${projectId}`)
    } else {
      router.push(`/projects/${projectId}/${value}`)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Navbar projectName="Project Alpha" />

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="docs">Docs</TabsTrigger>
          <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {children}
      </Tabs>
    </div>
  )
}