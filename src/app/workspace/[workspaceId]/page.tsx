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
import { Separator } from "@/components/ui/separator"
import { Users, Folder, BarChart2, Clock, Plus, User } from 'lucide-react'

// Mock data for personal workspace
const personalWorkspaceData = {
  id: "personal-123",
  name: "John's Workspace",
  type: "personal",
  owner: {
    id: 1,
    name: "John Doe",
    avatar: "/avatars/john-doe.jpg",
  },
  stats: {
    totalProjects: 5,
    completedProjects: 2,
    totalTasks: 25,
    completedTasks: 18,
  },
  projects: [
    { id: 1, name: "Personal Blog", progress: 75, tasks: 10, completedTasks: 7 },
    { id: 2, name: "Side Project", progress: 40, tasks: 15, completedTasks: 6 },
  ],
  activities: [
    { id: 1, user: "John Doe", action: "completed a task", project: "Personal Blog", time: "2 hours ago" },
    { id: 2, user: "John Doe", action: "created a new project", project: "Side Project", time: "5 hours ago" },
  ]
}

// Mock data for shared workspace
const sharedWorkspaceData = {
  id: "shared-456",
  name: "Acme Corp Workspace",
  type: "shared",
  owner: {
    id: 1,
    name: "John Doe",
    avatar: "/avatars/john-doe.jpg",
  },
  stats: {
    totalProjects: 12,
    completedProjects: 5,
    totalTasks: 87,
    completedTasks: 62,
  },
  members: [
    { id: 1, name: "John Doe", avatar: "/avatars/john-doe.jpg", online: true },
    { id: 2, name: "Jane Smith", avatar: "/avatars/jane-smith.jpg", online: false },
    { id: 3, name: "Bob Johnson", avatar: "/avatars/bob-johnson.jpg", online: true },
  ],
  projects: [
    { id: 1, name: "Website Redesign", progress: 75, tasks: 20, completedTasks: 15 },
    { id: 2, name: "Mobile App Development", progress: 40, tasks: 30, completedTasks: 12 },
  ],
  activities: [
    { id: 1, user: "John Doe", action: "completed a task", project: "Website Redesign", time: "2 hours ago" },
    { id: 2, user: "Jane Smith", action: "created a new project", project: "Q4 Planning", time: "5 hours ago" },
  ]
}

export default function WorkspaceDashboard() {
  const [workspace, setWorkspace] = useState<any>(null)
  const params = useParams()
  const workspaceId = params.id

  // Fetch workspace data (replace with actual API call)
  useEffect(() => {
    // Simulating API call - here we're checking if it's a personal workspace based on ID
    const fetchWorkspace = async () => {
      // In real app, fetch from API based on workspaceId
      const isPersonal = workspaceId === "personal-123"
      setWorkspace(isPersonal ? personalWorkspaceData : sharedWorkspaceData)
    }
    fetchWorkspace()
  }, [workspaceId])

  if (!workspace) return null

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
        {!isPersonal && (
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Manage Team
          </Button>
        )}
      </div>

      {/* Workspace stats/metrics bar */}
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
            {isPersonal ? <User className="h-4 w-4 text-muted-foreground" /> : 
                         <Users className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            {isPersonal ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={workspace.owner.avatar} alt={workspace.owner.name} />
                  <AvatarFallback>{workspace.owner.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{workspace.owner.name}</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{workspace.members.length}</div>
                <p className="text-xs text-muted-foreground">
                  {workspace.members.filter((m: any) => m.online).length} online
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspace.activities.length}</div>
            <p className="text-xs text-muted-foreground">
              in the last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members - Only show for shared workspaces */}
      {!isPersonal && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex w-max space-x-4 p-4">
              {workspace.members.map((member: any) => (
                <div key={member.id} className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
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

      {/* Projects */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspace.projects.map((project: any) => (
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
                {project.completedTasks} / {project.tasks} tasks completed
              </p>
              <Link href={`/projects/${project.id}`}>
                <Button variant="link" className="p-0 h-auto">View Project</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        <Card className="flex items-center justify-center">
          <Button variant="ghost">
            <Plus className="mr-2 h-4 w-4" />
            Add New Project
          </Button>
        </Card>
      </div>

      {/* Activity Feed */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">Recent Activity</h2>
      <Card>
        <CardContent className="p-6">
          {workspace.activities.map((activity: any, index: number) => (
            <div key={activity.id}>
              <div className="flex items-center mb-4">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={`/avatars/${activity.user.toLowerCase().replace(' ', '-')}.jpg`} alt={activity.user} />
                  <AvatarFallback>{activity.user.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                    <span className="font-medium">{activity.project}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
              {index < workspace.activities.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}