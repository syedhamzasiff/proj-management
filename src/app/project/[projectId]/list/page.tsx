'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUpDown, Search } from 'lucide-react'
import { TabsContent } from '@/components/ui/tabs'

type Task = {
  id: string
  title: string
  status: 'To Do' | 'In Progress' | 'Done'
  priority: 'Low' | 'Medium' | 'High'
  assignee: string
  dueDate: string
}

const initialTasks: Task[] = [
  { id: '1', title: 'Design new landing page', status: 'To Do', priority: 'High', assignee: 'John Doe', dueDate: '2024-03-15' },
  { id: '2', title: 'Implement user authentication', status: 'In Progress', priority: 'Medium', assignee: 'Jane Smith', dueDate: '2024-03-20' },
  { id: '3', title: 'Refactor database schema', status: 'In Progress', priority: 'Low', assignee: 'Bob Johnson', dueDate: '2024-03-25' },
  { id: '4', title: 'Set up CI/CD pipeline', status: 'Done', priority: 'High', assignee: 'Alice Williams', dueDate: '2024-03-10' },
  { id: '5', title: 'Write API documentation', status: 'To Do', priority: 'Medium', assignee: 'Charlie Brown', dueDate: '2024-03-30' },
]

export default function ListView() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [sortColumn, setSortColumn] = useState<keyof Task>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')
  const params = useParams()
  const projectId = params.id

  const sortedTasks = useMemo(() => {
    const filteredTasks = tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filteredTasks.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [tasks, sortColumn, sortDirection, searchTerm])

  const handleSort = (column: keyof Task) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const renderSortIcon = (column: keyof Task) => {
    if (column === sortColumn) {
      return <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
    }
    return null
  }

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
    <TabsContent value="list">
      <div className="container mx-auto py-10">
        <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Project Tasks</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('title')}>
                Title {renderSortIcon('title')}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('status')}>
                Status {renderSortIcon('status')}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('priority')}>
                Priority {renderSortIcon('priority')}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('assignee')}>
                Assignee {renderSortIcon('assignee')}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('dueDate')}>
                Due Date {renderSortIcon('dueDate')}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={`/avatars/${task.assignee.toLowerCase().replace(' ', '-')}.jpg`} alt={task.assignee} />
                    <AvatarFallback>{task.assignee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {task.assignee}
                </div>
              </TableCell>
              <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
      </div>
    </TabsContent>
    
  )
}