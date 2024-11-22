'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar'
import {format} from 'date-fns/format'
import {parse} from 'date-fns/parse'
import {startOfWeek} from 'date-fns/startOfWeek'
import {getDay} from 'date-fns/getDay'
import {enUS} from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, Filter } from 'lucide-react'
import { TabsContent } from '@/components/ui/tabs'

// Set up the localizer for react-big-calendar
const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Task type definition
interface Task {
  id: string
  title: string
  status: 'To Do' | 'In Progress' | 'Done'
  priority: 'Low' | 'Medium' | 'High'
  assignee: string
  dueDate: Date
}

// Event type for calendar
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  resource: Task
}

// Mock tasks data
const initialTasks: Task[] = [
  { id: '1', title: 'Design new landing page', status: 'To Do', priority: 'High', assignee: 'John Doe', dueDate: new Date(2024, 2, 15) },
  { id: '2', title: 'Implement user authentication', status: 'In Progress', priority: 'Medium', assignee: 'Jane Smith', dueDate: new Date(2024, 2, 20) },
  { id: '3', title: 'Refactor database schema', status: 'In Progress', priority: 'Low', assignee: 'Bob Johnson', dueDate: new Date(2024, 2, 25) },
  { id: '4', title: 'Set up CI/CD pipeline', status: 'Done', priority: 'High', assignee: 'Alice Williams', dueDate: new Date(2024, 2, 10) },
  { id: '5', title: 'Write API documentation', status: 'To Do', priority: 'Medium', assignee: 'Charlie Brown', dueDate: new Date(2024, 2, 30) },
]

interface TaskCardProps {
  event: {
    resource: Task
  }
}

const TaskCard = ({ event }: TaskCardProps) => {
  const { resource: task } = event
  
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'To Do': return 'bg-yellow-200 text-yellow-800'
      case 'In Progress': return 'bg-blue-200 text-blue-800'
      case 'Done': return 'bg-green-200 text-green-800'
      default: return 'bg-gray-200 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Low': return 'bg-green-200 text-green-800'
      case 'Medium': return 'bg-yellow-200 text-yellow-800'
      case 'High': return 'bg-red-200 text-red-800'
      default: return 'bg-gray-200 text-gray-800'
    }
  }

  return (
    <Card className="p-2 mb-2">
      <CardContent className="p-0">
        <h3 className="font-semibold text-sm">{task.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
        </div>
        <div className="flex items-center mt-1">
          <Avatar className="h-6 w-6 mr-1">
            <AvatarImage src={`/avatars/${task.assignee.toLowerCase().replace(' ', '-')}.jpg`} alt={task.assignee} />
            <AvatarFallback>{task.assignee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <span className="text-xs">{task.assignee}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CalendarPage() {
  const params = useParams<{ id: string }>()
  const [tasks] = useState<Task[]>(initialTasks)
  const [view, setView] = useState<View>(Views.MONTH)
  const [date, setDate] = useState(new Date())
  const [filterCriteria, setFilterCriteria] = useState<string | null>(null)
  const [filterValue, setFilterValue] = useState<string | null>(null)

  const filteredTasks = useMemo(() => {
    if (!filterCriteria || !filterValue) return tasks
    return tasks.filter(task => {
      if (filterCriteria === 'priority') return task.priority === filterValue
      if (filterCriteria === 'status') return task.status === filterValue
      if (filterCriteria === 'assignee') return task.assignee === filterValue
      return true
    })
  }, [tasks, filterCriteria, filterValue])

  const events: CalendarEvent[] = filteredTasks.map(task => ({
    id: task.id,
    title: task.title,
    start: task.dueDate,
    end: task.dueDate,
    allDay: true,
    resource: task,
  }))

  return (
    <TabsContent value="calendar">
        <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Project Calendar - {params.id}</h1>
        <div className="flex justify-between items-center mb-4">
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
                  <h4 className="font-medium leading-none">Filter by</h4>
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
                    <h4 className="font-medium leading-none">Value</h4>
                    <Select value={filterValue || ''} onValueChange={setFilterValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select value" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterCriteria === 'priority' && (
                          <>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </>
                        )}
                        {filterCriteria === 'status' && (
                          <>
                            <SelectItem value="To Do">To Do</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                          </>
                        )}
                        {filterCriteria === 'assignee' && tasks.map(task => (
                          <SelectItem key={task.assignee} value={task.assignee}>
                            {task.assignee}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button onClick={() => { setFilterCriteria(null); setFilterValue(null); }}>
                  Clear Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 200px)' }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          components={{
            event: TaskCard,
          }}
        />
        </div>
    </TabsContent>
  )
}