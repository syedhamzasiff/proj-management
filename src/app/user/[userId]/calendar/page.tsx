'use client'

import { useEffect, useState } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import {format} from 'date-fns/format'
import {parse} from 'date-fns/parse'
import {startOfWeek} from 'date-fns/startOfWeek'
import {getDay} from 'date-fns/getDay'
import {enUS} from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

// Define the Subtask type
interface Subtask {
  id: string
  title: string
  completed: boolean
}

// Define the Task type
interface Task {
  id: string
  title: string
  start: Date
  end: Date
  project: string
  priority: 'Low' | 'Medium' | 'High'
  description: string
  subtasks: Subtask[]
}

// Hardcoded tasks data
const tasks: Task[] = [
  {
    id: '1',
    title: 'Design new landing page',
    start: new Date(2024, 10, 5, 10, 0),
    end: new Date(2024, 10, 5, 12, 0),
    project: 'Website Redesign',
    priority: 'High',
    description: 'Create a new design for the company website landing page',
    subtasks: [
      { id: '1a', title: 'Wireframe design', completed: true },
      { id: '1b', title: 'Color scheme selection', completed: false },
      { id: '1c', title: 'Typography choice', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Team meeting',
    start: new Date(2024, 10, 6, 14, 0),
    end: new Date(2024, 10, 6, 15, 0),
    project: 'General',
    priority: 'Medium',
    description: 'Weekly team sync-up meeting',
    subtasks: [
      { id: '2a', title: 'Prepare agenda', completed: true },
      { id: '2b', title: 'Review last week\'s action items', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Implement user authentication',
    start: new Date(2024, 10, 7, 9, 0),
    end: new Date(2024, 10, 7, 17, 0),
    project: 'User Management System',
    priority: 'High',
    description: 'Implement secure user authentication system',
    subtasks: [
      { id: '3a', title: 'Set up authentication server', completed: false },
      { id: '3b', title: 'Implement login functionality', completed: false },
      { id: '3c', title: 'Implement registration functionality', completed: false },
      { id: '3d', title: 'Implement password reset', completed: false },
    ],
  },
  {
    id: '4',
    title: 'Write documentation',
    start: new Date(2024, 10, 7, 13, 0),
    end: new Date(2024, 10, 7, 16, 0),
    project: 'API Development',
    priority: 'Low',
    description: 'Write comprehensive documentation for the new API',
    subtasks: [
      { id: '4a', title: 'Document endpoints', completed: false },
      { id: '4b', title: 'Write usage examples', completed: false },
      { id: '4c', title: 'Create API reference', completed: false },
    ],
  },
  {
    id: '5',
    title: 'Code review',
    start: new Date(2024, 10, 11, 11, 0),
    end: new Date(2024, 10, 11, 12, 0),
    project: 'Website Redesign',
    priority: 'Medium',
    description: 'Review and provide feedback on recent code changes',
    subtasks: [
      { id: '5a', title: 'Review pull requests', completed: false },
      { id: '5b', title: 'Test implemented features', completed: false },
      { id: '5c', title: 'Provide feedback', completed: false },
    ],
  },
]

const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'Low':
      return 'bg-green-100 text-green-800'
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'High':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function UserCalendar() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  const handleSelectEvent = (task: Task) => {
    setSelectedTask(task)
  }

  const TaskDetails = ({ task }: { task: Task }) => (
    <div>
      <p className="text-sm text-gray-500 mb-2">{task.project}</p>
      <p className="mb-2">{task.description}</p>
      <p className="text-sm mb-1"><strong>Start:</strong> {format(task.start, 'PPp')}</p>
      <p className="text-sm mb-2"><strong>End:</strong> {format(task.end, 'PPp')}</p>
      <Badge className={`mb-4 ${getPriorityColor(task.priority)}`}>
        {task.priority} Priority
      </Badge>
      <h3 className="font-semibold mb-2">Subtasks:</h3>
      <ul className="list-disc pl-5">
        {task.subtasks.map((subtask) => (
          <li key={subtask.id} className={subtask.completed ? 'line-through text-gray-500' : ''}>
            {subtask.title}
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="w-full min-h-screen flex flex-col p-4">
      <h1 className="text-2xl font-semibold mb-4">Your Calendar</h1>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 flex-grow">
          <Card className="h-full">
            <CardContent className="h-full p-4">
              <Calendar
                localizer={localizer}
                events={tasks}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={(event) => ({
                  className: `${getPriorityColor(event.priority)} cursor-pointer`,
                })}
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="mb-4 last:mb-0 cursor-pointer" onClick={() => setSelectedTask(task)}>
                  <h3 className="font-semibold text-sm">{task.title}</h3>
                  <p className="text-xs text-gray-500">{format(task.start, 'PPp')}</p>
                  <Badge className={`mt-1 text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          {selectedTask && <TaskDetails task={selectedTask} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}