import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Circle, PlayCircle, AlertCircle } from 'lucide-react'
import ProgressBar from "./ProgressBar"

interface Task {
  id: number
  title: string
  status: 'Not Started' | 'In Progress' | 'Completed'
  priority: 'High' | 'Medium' | 'Low'
  progress: number
}

interface TaskCardProps {
  task: Task
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case 'In Progress':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'Not Started':
      return <Circle className="h-4 w-4 text-gray-400" />
    default:
      return <AlertCircle className="h-4 w-4 text-red-500" />
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-red-500'
    case 'Medium':
      return 'bg-yellow-500'
    case 'Low':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  // Provide default values if task or its properties are undefined
  const title = task?.title || 'Untitled Task'
  const status = task?.status || 'Not Started'
  const priority = task?.priority || 'Medium'
  const progress = task?.progress || 0

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex flex-col flex-grow p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className={`w-2 h-2 rounded-full ${getPriorityColor(priority)}`}></span>
          <span className="text-xs font-medium text-gray-500 flex items-center">
            {getStatusIcon(status)}
            <span className="ml-1">{status}</span>
          </span>
        </div>
        <h3 className="font-semibold text-sm line-clamp-2">{title}</h3>
        <ProgressBar progress={progress} />
        <div className="flex flex-col sm:flex-row gap-2 mt-auto">
          {/*}
          <Button size="sm" variant="outline" className="flex-1 text-xs py-1 h-8">
            <PlayCircle className="h-3 w-3 mr-1" />
            Start Timer
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs py-1 h-8">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Mark Complete
          </Button>
          {*/}
        </div>
      </CardContent>
    </Card>
  )
}

export default TaskCard