'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, Filter, Loader2 } from 'lucide-react'
import { TabsContent } from '@/components/ui/tabs'

const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface Task {
  id: string
  title: string
  status: TaskStatus
  isCompleted: boolean
  isPinned: boolean
  priority: TaskPriority
  due_date: string
  assignedUsers: { id: string; name: string }[]
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  resource: Task
}

type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'
type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE'

const TaskCard = ({ event }: { event: { resource: Task } }) => {
  const { resource: task } = event

  const getStatusColor = (status: TaskStatus | undefined) => {
    if (!status) return 'bg-gray-200 text-gray-800'
    switch (status) {
      case 'TODO': return 'bg-yellow-200 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-200 text-blue-800'
      case 'DONE': return 'bg-green-200 text-green-800'
      case 'BACKLOG': return 'bg-gray-300 text-gray-900'
      default: return 'bg-gray-200 text-gray-800'
    }
  }

  const getPriorityColor = (priority: TaskPriority | undefined) => {
    if (!priority) return 'bg-muted text-muted-foreground'
    switch (priority) {
      case 'LOW': return 'bg-primary text-primary-foreground'
      case 'MEDIUM': return 'bg-secondary text-secondary-foreground'
      case 'HIGH': return 'bg-destructive text-destructive-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <Card className="p-2 mb-2 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        <h3 className="font-semibold text-sm mb-1">{task.title || 'Untitled Task'}</h3>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className={`${getStatusColor(task.status)} text-xs`}>{task.status}</Badge>
          <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs`}>{task.priority}</Badge>
        </div>
        {task.assignedUsers?.length > 0 && (
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={`/avatars/${task.assignedUsers[0]?.name?.toLowerCase().replace(' ', '-') || 'default'}.jpg`} alt={task.assignedUsers[0]?.name || 'User'} />
              <AvatarFallback>{task.assignedUsers[0]?.name?.split(' ').map(n => n[0]).join('') || '?'}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{task.assignedUsers[0]?.name || 'Unknown User'}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function CalendarPage() {
  const params = useParams<{ projectId: string }>()
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<View>(Views.MONTH)
  const [date, setDate] = useState(new Date())
  const [filterCriteria, setFilterCriteria] = useState<string | null>(null)
  const [filterValue, setFilterValue] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/project/${params.projectId}/tasks?view=calendar`)
        if (!response.ok) throw new Error('Failed to fetch tasks')
        const data = await response.json()
        setTasks(data.data)
      } catch (error) {
        console.error('Error fetching tasks:', error)
        setError('Failed to load tasks. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [params.projectId])

  const filteredTasks = useMemo(() => {
    if (!filterCriteria || !filterValue) return tasks
    return tasks.filter(task => {
      if (filterCriteria === 'priority') return task.priority?.toUpperCase() === filterValue.toUpperCase()
      if (filterCriteria === 'status') return task.status?.toUpperCase() === filterValue.toUpperCase()
      if (filterCriteria === 'assignee') return task.assignedUsers.some(user => user.name === filterValue)
      return true
    })
  }, [tasks, filterCriteria, filterValue])

  const events: CalendarEvent[] = filteredTasks
    .filter(task => task.due_date)
    .map(task => ({
      id: task.id,
      title: task.title || 'Untitled Task',
      start: new Date(task.due_date),
      end: new Date(task.due_date),
      allDay: true,
      resource: task,
    }))

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-destructive">{error}</p>
    </div>
  )

  return (
    <TabsContent value="calendar" className="space-y-4">
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Project Calendar</h1>
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Select value={view} onValueChange={(value: View) => setView(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Views.MONTH}>Month</SelectItem>
                <SelectItem value={Views.WEEK}>Week</SelectItem>
                <SelectItem value={Views.DAY}>Day</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Filter by</h4>
                    <Select value={filterCriteria || ''} onValueChange={setFilterCriteria}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select criteria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="assignee">Assignee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {filterCriteria && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Value</h4>
                      <Select value={filterValue || ''} onValueChange={setFilterValue}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterCriteria === 'priority' && (
                            <>
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                            </>
                          )}
                          {filterCriteria === 'status' && (
                            <>
                              <SelectItem value="BACKLOG">Backlog</SelectItem>
                              <SelectItem value="TODO">To Do</SelectItem>
                              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                              <SelectItem value="DONE">Done</SelectItem>
                            </>
                          )}
                          {filterCriteria === 'assignee' &&
                            tasks.flatMap(task => task.assignedUsers).map(user => (
                              <SelectItem key={user.id} value={user.name}>
                                {user.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={['month', 'week', 'day']}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            components={{
              event: TaskCard,
            }}
            className="rounded-md border"
            style={{ height: 'calc(100vh - 250px)' }}
          />
        </Card>
      </div>
    </TabsContent>
  )
}