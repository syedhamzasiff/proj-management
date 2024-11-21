'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { CalendarIcon, CheckCircleIcon, ClockIcon, PinIcon } from 'lucide-react'
import { Task, DashboardData } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useUser } from '@/context/UserContext'

export default function Dashboard() {
  const { userId } = useUser();  // Get the userId from the context
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')

  //console.log(userId);

  useEffect(() => {
    if (!userId) {
      setError('User ID is required')
      setIsLoading(false)
      return
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/dashboard/${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const result: DashboardData = await response.json()
        setData(result)
        setUserName(result?.userName || 'User')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [userId]) // Ensure the effect runs when userId changes

  if (error) {
    return <ErrorState message={error} />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-screen bg-gray-50 p-6">
          <header className="mb-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/path/to/user-avatar.jpg" alt={userName} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <h1 className="text-xl font-semibold text-gray-900">{`Welcome, ${userName}`}</h1>
            </div>
          </header>
          {isLoading ? (
            <LoadingState />
          ) : (
            data && (
              <div className="grid grid-cols-2 gap-4">
                <TasksOverviewCard data={data.tasksOverview} />
                <PinnedTasksCard tasks={data.pinnedTasks} />
                <UpcomingDeadlinesCard tasks={data.upcomingDeadlines} />
                <InProgressTasksCard tasks={data.inProgressTasks} />
              </div>
            )
          )}
        </div>
      </main>
    </div>
  )
}


function TasksOverviewCard({ data }: { data: DashboardData['tasksOverview'] }) {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-gray-900">Tasks Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <OverviewItem icon={<ClockIcon className="h-4 w-4 text-blue-500" />} label="Due Today" value={data.dueToday} />
          <OverviewItem icon={<CalendarIcon className="h-4 w-4 text-green-500" />} label="Due This Week" value={data.dueThisWeek} />
          <OverviewItem icon={<ClockIcon className="h-4 w-4 text-red-500" />} label="Overdue" value={data.overdue} />
          <OverviewItem icon={<CheckCircleIcon className="h-4 w-4 text-purple-500" />} label="Total Tasks" value={data.total} />
        </div>
      </CardContent>
    </Card>
  )
}

function OverviewItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {icon}
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}

function PinnedTasksCard({ tasks }: { tasks: Task[] }) {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium text-gray-900">Pinned Tasks</CardTitle>
        <PinIcon className="h-4 w-4 text-blue-500" />
      </CardHeader>
      <CardContent>
        <TaskList tasks={tasks} emptyMessage="No pinned tasks" />
      </CardContent>
    </Card>
  )
}

function UpcomingDeadlinesCard({ tasks }: { tasks: Task[] }) {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium text-gray-900">Upcoming Deadlines</CardTitle>
        <CalendarIcon className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <TaskList tasks={tasks} emptyMessage="No upcoming deadlines" />
      </CardContent>
    </Card>
  )
}

function InProgressTasksCard({ tasks }: { tasks: Task[] }) {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium text-gray-900">In Progress</CardTitle>
        <ClockIcon className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <TaskList tasks={tasks} emptyMessage="No tasks in progress" showProgress />
      </CardContent>
    </Card>
  )
}

function TaskList({ tasks, emptyMessage, showProgress = false }: { 
  tasks: Task[] 
  emptyMessage: string 
  showProgress?: boolean 
}) {
  if (tasks.length === 0) {
    return <p className="text-center text-gray-500 text-xs">{emptyMessage}</p>
  }

  return (
    <ScrollArea className="h-[180px]">
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="p-2 bg-gray-50 rounded-md">
            <h3 className="font-medium text-xs text-gray-900 truncate">{task.title}</h3>
            <div className="flex justify-between items-center text-xs mt-1">
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
              <span className="text-gray-500 text-[10px]">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
            {showProgress && task.progress !== undefined && (
              <Progress value={task.progress} className="w-full mt-1 h-1" />
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

function LoadingState() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="bg-white shadow-sm">
          <CardHeader>
            <Skeleton className="h-4 w-[100px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">{message}</p>
          <Button className="w-full" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}