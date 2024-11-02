import React from 'react'
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, Circle, AlertCircle } from 'lucide-react'

interface RecentTask {
  id: number
  title: string
  status: 'Not Started' | 'In Progress' | 'Completed'
}

interface RecentTaskListProps {
  tasks: RecentTask[]
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Completed':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    case 'In Progress':
      return <Clock className="h-5 w-5 text-yellow-500" />
    case 'Not Started':
      return <Circle className="h-5 w-5 text-gray-400" />
    default:
      return <AlertCircle className="h-5 w-5 text-red-500" />
  }
}

const RecentTaskList: React.FC<RecentTaskListProps> = ({ tasks }) => (
  <Card>
    <CardHeader>
      <CardTitle>📋 Recent Tasks</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-4">
        {tasks.map(task => (
          <li key={task.id} className="flex items-center justify-between">
            <span>{task.title}</span>
            {getStatusIcon(task.status)}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
)

export default RecentTaskList