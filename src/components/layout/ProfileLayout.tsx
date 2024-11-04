'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Mail, MapPin, Phone, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

// TypeScript interfaces
interface User {
  id: string
  name: string
  username: string
  email: string
  role: string
  isActive: boolean
  joinDate: string
  avatarUrl: string
  location: string
  phone: string
}

interface UserStats {
  totalTasks: number
  completedTasks: number
  ongoingTasks: number
  avgCompletionTime: string
  efficiency: number
}

interface ContextSpecificStats {
  workspaceContributions?: number
  projectDeadlinesMet?: number
  codeReviewsCompleted?: number
}

interface Activity {
  id: string
  type: 'task_completed' | 'comment_added' | 'project_joined' | 'code_committed'
  timestamp: string
  description: string
  workspaceId?: string
  projectId?: string
}

interface ProfileLayoutProps {
  source: 'workspace' | 'project' | 'global'
  sourceId?: string
  userId: string
}

// Mock data (replace with actual data fetching in a real application)
const userData: User = {
  id: '1',
  name: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
  role: 'Senior Developer',
  isActive: true,
  joinDate: '2022-01-01',
  avatarUrl: 'https://github.com/shadcn.png',
  location: 'New York, USA',
  phone: '+1 (555) 123-4567'
}

const userStats: UserStats = {
  totalTasks: 150,
  completedTasks: 120,
  ongoingTasks: 30,
  avgCompletionTime: '3 days',
  efficiency: 85
}

const contextSpecificStats: ContextSpecificStats = {
  workspaceContributions: 45,
  projectDeadlinesMet: 12,
  codeReviewsCompleted: 78
}

const activities: Activity[] = [
  { id: '1', type: 'task_completed', timestamp: '2023-06-01T10:00:00Z', description: 'Completed task "Implement user authentication"', workspaceId: 'ws1', projectId: 'p1' },
  { id: '2', type: 'comment_added', timestamp: '2023-06-02T14:30:00Z', description: 'Commented on "Database schema design"', workspaceId: 'ws1', projectId: 'p2' },
  { id: '3', type: 'project_joined', timestamp: '2023-06-03T09:15:00Z', description: 'Joined project "E-commerce Platform Redesign"', workspaceId: 'ws2', projectId: 'p3' },
  { id: '4', type: 'code_committed', timestamp: '2023-06-04T16:45:00Z', description: 'Committed code for "Fix login bug"', workspaceId: 'ws1', projectId: 'p1' },
]

export default function ProfileLayout({ source, sourceId, userId }: ProfileLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [contextStats, setContextStats] = useState<ContextSpecificStats | null>(null)
  const [userActivities, setUserActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activityFilter, setActivityFilter] = useState<Activity['type'] | 'all'>('all')
  const [activitySort, setActivitySort] = useState<'newest' | 'oldest'>('newest')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setUser(userData)
        setStats(userStats)
        setContextStats(contextSpecificStats)
        setUserActivities(filterActivities(activities))
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch user data')
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, source, sourceId])

  const filterActivities = (activities: Activity[]) => {
    if (source === 'workspace') {
      return activities.filter(activity => activity.workspaceId === sourceId)
    }
    if (source === 'project') {
      return activities.filter(activity => activity.projectId === sourceId)
    }
    return activities
  }

  const filteredActivities = userActivities
    .filter(activity => activityFilter === 'all' || activity.type === activityFilter)
    .sort((a, b) => {
      if (activitySort === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      } else {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      }
    })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !user || !stats) {
    return (
      <div className="text-center text-red-500">
        {error || 'Failed to load user profile'}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardContent className="flex items-center space-x-4 p-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.role}</p>
            <div className="flex items-center mt-2 space-x-2">
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
              <span className="text-sm text-muted-foreground">Member since {new Date(user.joinDate).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="mr-2 h-4 w-4" />
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{user.location}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total Tasks:</span>
              <span className="font-semibold">{stats.totalTasks}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed Tasks:</span>
              <span className="font-semibold">{stats.completedTasks}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongoing Tasks:</span>
              <span className="font-semibold">{stats.ongoingTasks}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg. Completion Time:</span>
              <span className="font-semibold">{stats.avgCompletionTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Efficiency:</span>
              <span className="font-semibold">{stats.efficiency}%</span>
            </div>
            {contextStats && (
              <>
                {contextStats.workspaceContributions && (
                  <div className="flex justify-between">
                    <span>Workspace Contributions:</span>
                    <span className="font-semibold">{contextStats.workspaceContributions}</span>
                  </div>
                )}
                {contextStats.projectDeadlinesMet && (
                  <div className="flex justify-between">
                    <span>Project Deadlines Met:</span>
                    <span className="font-semibold">{contextStats.projectDeadlinesMet}</span>
                  </div>
                )}
                {contextStats.codeReviewsCompleted && (
                  <div className="flex justify-between">
                    <span>Code Reviews Completed:</span>
                    <span className="font-semibold">{contextStats.codeReviewsCompleted}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Select value={activityFilter} onValueChange={(value: Activity['type'] | 'all') => setActivityFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter activities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="task_completed">Tasks Completed</SelectItem>
                <SelectItem value="comment_added">Comments Added</SelectItem>
                <SelectItem value="project_joined">Projects Joined</SelectItem>
                <SelectItem value="code_committed">Code Committed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activitySort} onValueChange={(value: 'newest' | 'oldest') => setActivitySort(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort activities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 py-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(activity.timestamp), 'PPpp')}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}