'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import TaskCard from "@/components/projects/TaskCard"
import TeamMemberAvatar from "@/components/projects/TeamMemberAvatar"
import { TabsContent } from "@/components/ui/tabs"
import { Clock, Columns, FileText } from 'lucide-react'

interface ProjectData {
  name: string
  progress: number
  tasks: {
    total: number
    completed: number
    inProgress: number
    notStarted: number
  }
  team: {
    name: string
    avatar: string | null
  }[]
  timeTracked: string
  currentSprint: {
    name: string
    endDate: string
  }
}

export default function ProjectDashboard() {
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const projectId = params.projectId as string

  useEffect(() => {
    const fetchProjectData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/project/${projectId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch project data')
        }
        const data = await response.json()
        setProjectData(data)
      } catch (error) {
        console.error('Error fetching project data:', error)
        setError('Failed to load project data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjectData()
  }, [projectId])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!projectData) return <div>No project data found</div>

  return (
    <TabsContent value="overview">
      <div className="space-y-6">
        {/* Task Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <TaskCard 
            title="Total Tasks" 
            value={projectData.tasks.total} 
            icon={Columns} 
            progress={projectData.progress} 
          />
          <TaskCard 
            title="In Progress" 
            value={projectData.tasks.inProgress} 
            icon={Clock} 
          />
          <TaskCard 
            title="Completed" 
            value={projectData.tasks.completed} 
            icon={FileText} 
          />
          <TaskCard 
            title="Time Tracked" 
            value={projectData.timeTracked} 
            icon={Clock} 
          />
        </div>

        {/* Sprint and Team Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <TaskCard 
              title="Current Sprint" 
              value={projectData.currentSprint.name} 
              icon={Columns} 
              subtitle={`Ends: ${projectData.currentSprint.endDate}`}
            />
          </div>
          <div>
             {/* <TeamMemberAvatar members={projectData.team} />*/}
          </div>
        </div>
      </div>
    </TabsContent>
  )
}
