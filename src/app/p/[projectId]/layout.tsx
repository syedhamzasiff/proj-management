'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Navbar from '@/components/projects/Navbar'

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  
  const pathParts = pathname.split('/')
  const projectId = pathParts[2]
  const currentPath = pathParts[3]
  
  const currentTab = !currentPath ? 'overview' : currentPath

  const [projectName, setProjectName] = useState('Loading...')

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const res = await fetch(`/api/project/${projectId}`)
        if (!res.ok) throw new Error('Failed to fetch project details')
        const data = await res.json()
        setProjectName(data.name)
      } catch (error) {
        console.error('Error fetching project details:', error)
        setProjectName('Unknown Project')
      }
    }

    fetchProjectDetails()
  }, [projectId])

  const handleTabChange = (value: string) => {
    if (value === 'overview') {
      router.push(`/p/${projectId}`)
    } else {
      router.push(`/p/${projectId}/${value}`)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Navbar projectName={projectName} href={`/p/${projectId}`} />

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
