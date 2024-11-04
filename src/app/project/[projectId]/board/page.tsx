'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react'
import { DndContext, UniqueIdentifier, closestCenter } from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { TabsContent } from '@/components/ui/tabs'

interface Task {
  id: string
  content: string
  assignee: string
  description?: string
  dueDate?: string
  priority?: 'Low' | 'Medium' | 'High'
}

interface Column {
  id: string
  title: string
  tasks: Task[]
}

interface Columns {
  [key: string]: Column
}

const initialColumns: Columns = {
  'todo': {
    id: 'todo',
    title: 'To Do',
    tasks: [
      { id: 't1', content: 'Design new landing page', assignee: 'John Doe' },
      { id: 't2', content: 'Implement user authentication', assignee: 'Jane Smith' },
    ]
  },
  'in-progress': {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      { id: 't3', content: 'Refactor database schema', assignee: 'Bob Johnson' },
    ]
  },
  'done': {
    id: 'done',
    title: 'Done',
    tasks: [
      { id: 't4', content: 'Set up CI/CD pipeline', assignee: 'Alice Williams' },
    ]
  }
}

function TaskCard({ task, index, columnId }: { task: Task, index: number, columnId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { columnId, index }
  })

  const style = {
    transform: `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card className="mb-2 bg-white">
        <CardContent className="p-4">
          <p>{task.content}</p>
          <div className="flex items-center mt-2">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarFallback>{task.assignee[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-500">{task.assignee}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ColumnComponent({ column, openAddTaskModal }: { column: Column, openAddTaskModal: (columnId: string) => void }) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  })

  const style = {
    backgroundColor: isOver ? '#f0f4f8' : 'inherit',
  }

  return (
    <div ref={setNodeRef} className="flex-1 min-w-[250px] max-w-[500px]" style={style}>
      <div className="bg-gray-100 p-4 rounded-t-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">{column.title}</h2>
        </div>
        <div className="min-h-[200px]">
          {column.tasks.map((task, index) => (
            <TaskCard key={task.id} task={task} index={index} columnId={column.id} />
          ))}
        </div>
        <Button onClick={() => openAddTaskModal(column.id)} className="w-full mt-2" variant="outline">
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      </div>
    </div>
  )
}

function AddTaskModal({ isOpen, onClose, onAddTask, columnId }: { isOpen: boolean, onClose: () => void, onAddTask: (task: Task, columnId: string) => void, columnId: string }) {
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('Medium')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newTask: Task = {
      id: `t${Date.now()}`,
      content: taskTitle,
      assignee: taskAssignee,
      description: taskDescription,
      dueDate: taskDueDate,
      priority: taskPriority,
    }
    onAddTask(newTask, columnId)
    onClose()
    // Reset form fields
    setTaskTitle('')
    setTaskDescription('')
    setTaskAssignee('')
    setTaskDueDate('')
    setTaskPriority('Medium')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Fill in the details for the new task.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskTitle">Task Title</Label>
            <Input
              id="taskTitle"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taskDescription">Description</Label>
            <Textarea
              id="taskDescription"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Enter task description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taskAssignee">Assignee</Label>
            <Input
              id="taskAssignee"
              value={taskAssignee}
              onChange={(e) => setTaskAssignee(e.target.value)}
              placeholder="Enter assignee name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taskDueDate">Due Date</Label>
            <Input
              id="taskDueDate"
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taskPriority">Priority</Label>
            <Select value={taskPriority} onValueChange={(value) => setTaskPriority(value as Task['priority'])}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function KanbanBoard() {
  const [columns, setColumns] = useState<Columns>(initialColumns)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null)
  const params = useParams()
  const projectId = params?.id as string

  const moveTask = (dragIndex: number, hoverIndex: number, dragColumnId: UniqueIdentifier, targetColumnId: UniqueIdentifier) => {
    const sourceColumn = columns[dragColumnId as string];
    const targetColumn = columns[targetColumnId as string];

    const updatedSourceTasks = [...sourceColumn.tasks];
    const [movedTask] = updatedSourceTasks.splice(dragIndex, 1);
    const updatedTargetTasks = [...targetColumn.tasks];

    if (dragColumnId === targetColumnId) {
      arrayMove(updatedTargetTasks, dragIndex, hoverIndex);
    } else {
      updatedTargetTasks.splice(hoverIndex, 0, movedTask);
    }

    setColumns((prevColumns) => ({
      ...prevColumns,
      [dragColumnId]: {
        ...sourceColumn,
        tasks: updatedSourceTasks,
      },
      [targetColumnId]: {
        ...targetColumn,
        tasks: updatedTargetTasks,
      }
    }));
  }

  const openAddTaskModal = (columnId: string) => {
    setActiveColumnId(columnId)
    setIsAddTaskModalOpen(true)
  }

  const closeAddTaskModal = () => {
    setIsAddTaskModalOpen(false)
    setActiveColumnId(null)
  }

  const handleAddTask = (newTask: Task, columnId: string) => {
    setColumns((prevColumns) => ({
      ...prevColumns,
      [columnId]: {
        ...prevColumns[columnId],
        tasks: [...prevColumns[columnId].tasks, newTask],
      },
    }))
  }

  return (
    <TabsContent value="board">
      <div className='rounded-lg border p-4'>
        <h2 className="text-xl font-semibold mb-4">Board View</h2>
        <DndContext collisionDetection={closestCenter} onDragEnd={(event) => {
          const { active, over } = event
          if (!over || !active) return

          const sourceColumnId = active.data.current?.columnId as UniqueIdentifier;
          const targetColumnId = over.id as UniqueIdentifier;

          if (sourceColumnId && targetColumnId && sourceColumnId !== targetColumnId) {
            if (active.data.current && typeof active.data.current.index === 'number') {
              moveTask(
                active.data.current.index,
                0,
                sourceColumnId,
                targetColumnId
              );
            }
          }
        }}>
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Project Kanban Board</h1>
            <div className="flex space-x-4">
              {Object.values(columns).map((column) => (
                <ColumnComponent key={column.id} column={column} openAddTaskModal={openAddTaskModal} />
              ))}
            </div>
          </div>
        </DndContext>
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={closeAddTaskModal}
          onAddTask={handleAddTask}
          columnId={activeColumnId || ''}
        />
      </div>
    </TabsContent>
  )
}

export default KanbanBoard;