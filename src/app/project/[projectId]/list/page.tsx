'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpDown, Search } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';

type Task = {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: number;
  assignedUsers: { id: string; name: string }[];
  due_date?: string;
};

export default function ListView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof Task>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const params = useParams();

  const projectId = params.projectId;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/tasks`);
        const data = await response.json();
        if (response.ok) {
          setTasks(data.data);
        } else {
          console.error('Failed to fetch tasks:', data.error);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [projectId]);

  const sortedTasks = useMemo(() => {
    const filteredTasks = tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedUsers.some(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    return filteredTasks.sort((a, b) => {
      const valA = a[sortColumn] ?? ''; 
      const valB = b[sortColumn] ?? ''; 
    
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tasks, sortColumn, sortDirection, searchTerm]);

  const handleSort = (column: keyof Task) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (column: keyof Task) => {
    if (column === sortColumn) {
      return <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />;
    }
    return null;
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'TODO': return 'bg-yellow-200 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-200 text-blue-800';
      case 'DONE': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <TabsContent value="list">
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
              <TableHead>Assignees</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('due_date')}>
                  Due Date {renderSortIcon('due_date')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>
                </TableCell>
                <TableCell>{task.priority}</TableCell>
                <TableCell>
                  {task.assignedUsers.map((user) => (
                    <div key={user.id} className="flex items-center mb-1">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {user.name}
                    </div>
                  ))}
                </TableCell>
                <TableCell>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
}
