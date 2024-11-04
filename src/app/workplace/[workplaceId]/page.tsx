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
import { Users, Folder, BarChart2, Clock, Plus } from 'lucide-react'

// Mock data (replace with actual data fetching in a real application)
const workspaceData = {
  name: "Acme Corp Workspace",
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
    { id: 4, name: "Alice Williams", avatar: "/avatars/alice-williams.jpg", online: false },
    { id: 5, name: "Charlie Brown", avatar: "/avatars/charlie-brown.jpg", online: true },
  ],
  projects: [
    { id: 1, name: "Website Redesign", progress: 75, tasks: 20, completedTasks: 15 },
    { id: 2, name: "Mobile App Development", progress: 40, tasks: 30, completedTasks: 12 },
    { id: 3, name: "Marketing Campaign", progress: 90, tasks: 15, completedTasks: 13 },
    { id: 4, name: "Database Migration", progress: 20, tasks: 25, completedTasks: 5 },
  ],
  activities: [
    { id: 1, user: "John Doe", action: "completed a task", project: "Website Redesign", time: "2 hours ago" },
    { id: 2, user: "Jane Smith", action: "created a new project", project: "Q4 Planning", time: "5 hours ago" },
    { id: 3, user: "Bob Johnson", action: "commented on", project: "Mobile App Development", time: "1 day ago" },
    { id: 4, user: "Alice Williams", action: "updated the status of", project: "Marketing Campaign", time: "2 days ago" },
  ]
}

export default function WorkspaceDashboard() {
  const [workspace, setWorkspace] = useState(workspaceData)
  const params = useParams()
  const workspaceId = params.id

  // Fetch workspace data (replace with actual API call)
  useEffect(() => {
    // Simulating API call
    const fetchWorkspace = async () => {
      // const response = await fetch(`/api/workspaces/${workspaceId}`)
      // const data = await response.json()
      // setWorkspace(data)
      setWorkspace(workspaceData) // Using mock data for now
    }
    fetchWorkspace()
  }, [workspaceId])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{workspace.name}</h1>

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
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspace.members.length}</div>
            <p className="text-xs text-muted-foreground">
              {workspace.members.filter(m => m.online).length} online
            </p>
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

      {/* Team Members */}
      <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div className="flex w-max space-x-4 p-4">
          {workspace.members.map((member) => (
            <div key={member.id} className="flex flex-col items-center space-y-2">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar} alt={member.name} />
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

      {/* Projects */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspace.projects.map((project) => (
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
          {workspace.activities.map((activity, index) => (
            <div key={activity.id}>
              <div className="flex items-center mb-4">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={`/avatars/${activity.user.toLowerCase().replace(' ', '-')}.jpg`} alt={activity.user} />
                  <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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