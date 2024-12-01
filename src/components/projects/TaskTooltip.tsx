import { FC } from 'react'

interface Task {
  id: string
  title: string
  type: string
  status: string
  priority: string
  dueDate: string | null
  description: string | null
}

interface TaskTooltipProps {
  task: Task
}

const TaskTooltip: FC<TaskTooltipProps> = ({ task }) => {
  return (
    <div className="absolute top-full mt-2 w-64 p-4 bg-white border rounded shadow-lg text-sm">
      <p><strong>Title:</strong> {task.title}</p>
      <p><strong>Status:</strong> {task.status}</p>
      <p><strong>Type:</strong> {task.type}</p>
      <p><strong>Priority:</strong> {task.priority}</p>
      {task.dueDate && <p><strong>Due:</strong> {task.dueDate}</p>}
      {task.description && <p><strong>Description:</strong> {task.description}</p>}
    </div>
  )
}

export default TaskTooltip
