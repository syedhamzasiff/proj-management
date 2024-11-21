'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Users, Folder, BarChart2, User, Plus } from 'lucide-react'

interface Member {
  id: string
  name: string
  avatar: string | null
  online: boolean
}

interface Project {
  id: string
  name: string
  description: string | null
  progress: number
  totalTasks: number
  completedTasks: number
}

interface WorkspaceData {
  id: string
  name: string
  description: string | null
  type: 'personal' | 'shared'
  stats: {
    totalProjects: number
    completedProjects: number
    totalTasks: number
    completedTasks: number
  }
  owner: {
    id: string
    name: string
    avatar: string | null
  } | null
  members: Member[]
  projects: Project[]
}

export default function WorkspaceDashboard() {
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const workspaceId = params.workspaceId as string

  useEffect(() => {
    const fetchWorkspace = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}`)
        if (!response.ok) throw new Error("Failed to fetch workspace data")
        const data = await response.json()
        setWorkspace(data)
      } catch (error) {
        console.error("Error fetching workspace:", error)
        setError("Failed to load workspace data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchWorkspace()
  }, [workspaceId])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!workspace) return <div>No workspace data found</div>

  const isPersonal = workspace.type === "personal"

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{workspace.name}</h1>
          <Badge variant={isPersonal ? "secondary" : "default"}>
            {isPersonal ? "Personal Workspace" : "Shared Workspace"}
          </Badge>
        </div>
        <div className="flex gap-2">
          {!isPersonal && (
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Team
            </Button>
          )}
          <Link href={`/w/${workspace.id}/new-project`}>
            <Button variant="default">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspace.stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {workspace.stats.completedProjects} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspace.stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {workspace.stats.completedTasks} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isPersonal ? "Owner" : "Team Members"}
            </CardTitle>
            {isPersonal ? <User className="h-4 w-4 text-muted-foreground" /> : <Users className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            {isPersonal ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={workspace.owner?.avatar || ''} 
                    alt={workspace.owner?.name || 'Owner'} 
                  />
                  <AvatarFallback>{workspace.owner?.name.split(' ').map(n => n[0]).join('') || 'O'}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{workspace.owner?.name || 'Owner'}</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{workspace.members.length}</div>
                <p className="text-xs text-muted-foreground">
                  {workspace.members.filter(m => m.online).length} online
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {!isPersonal && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex w-max space-x-4 p-4">
              {workspace.members.map(member => (
                <div key={member.id} className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={member.avatar || ''} 
                        alt={member.name} 
                      />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${member.online ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  <span className="text-sm font-medium">{member.name}</span>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </>
      )}

      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <Link href={`/w/${workspace.id}/new-project`}>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add New Project
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspace.projects.map(project => (
          <Card key={project.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{project.name}</CardTitle>
              <div className="relative h-10 w-10">
                <Progress value={project.progress} className="h-10 w-10 rounded-full" />
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-bold">
                  {project.progress}%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {project.completedTasks} / {project.totalTasks} tasks completed
              </p>
              <Link href={`/project/${project.id}`}>
                <Button variant="link" className="p-0 h-auto">View Project</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}