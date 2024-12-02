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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowUpDown, Search, Edit } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { TaskPriority, TaskStatus, TaskType } from '@prisma/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  type: TaskType;
  priority: TaskPriority;
  assignedUsers: { id: string; name: string }[];
  due_date?: string;
  isCompleted: boolean;
  isPinned: boolean;
};

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less"),
  status: z.nativeEnum(TaskStatus),
  type: z.nativeEnum(TaskType),
  priority: z.nativeEnum(TaskPriority),
  due_date: z.date().optional(),
  assignedUserIds: z.array(z.string()).optional(),
  isCompleted: z.boolean(),
  isPinned: z.boolean(),
});

type FormTask = z.infer<typeof taskSchema>;

function EditTaskDialog({ task, onSave, assignableUsers }: { task: Task; onSave: (updatedTask: FormTask) => void; assignableUsers: { id: string; name: string }[] }) {
  const form = useForm<FormTask>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      status: task.status,
      type: task.type,
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date) : undefined,
      assignedUserIds: task.assignedUsers.map(user => user.id),
      isCompleted: task.isCompleted,
      isPinned: task.isPinned,
    },
  });

  const onSubmit = (data: FormTask) => {
    onSave(data);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Task</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Task title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Task description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TaskStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TaskType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TaskPriority).map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assignedUserIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned Users</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange([...field.value || [], value])}
                    value={field.value?.[field.value.length - 1] || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select users" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <div className="mt-2">
                  {field.value?.map((userId) => {
                    const user = assignableUsers.find((u) => u.id === userId);
                    return user ? (
                      <Badge key={userId} variant="secondary" className="mr-1">
                        {user.name}
                        <button
                          type="button"
                          onClick={() => field.onChange(field.value?.filter((id) => id !== userId))}
                          className="ml-1 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isCompleted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Completed
                  </FormLabel>
                  <FormDescription>
                    Mark this task as completed
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPinned"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Pinned
                  </FormLabel>
                  <FormDescription>
                    Pin this task to the top of the list
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <Button type="submit">Save changes</Button>
        </form>
      </Form>
    </DialogContent>
  );
}

export default function ListView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof Task>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignableUsers, setAssignableUsers] = useState<{ id: string; name: string }[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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

    const fetchAssignableUsers = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/assignable-users`);
        const data = await response.json();
        if (response.ok) {
          setAssignableUsers(data.users);
        } else {
          console.error('Failed to fetch assignable users:', data.error);
        }
      } catch (error) {
        console.error('Error fetching assignable users:', error);
      }
    };

    fetchTasks();
    fetchAssignableUsers();
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

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return 'bg-yellow-200 text-yellow-800';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-200 text-blue-800';
      case TaskStatus.DONE: return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getTypeColor = (type: TaskType) => {
    switch (type) {
      case TaskType.FEATURE: return 'bg-purple-200 text-purple-800';
      case TaskType.BUG: return 'bg-red-200 text-red-800';
      case TaskType.TASK: return 'bg-blue-200 text-blue-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW: return 'bg-green-100 text-green-800';
      case TaskPriority.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case TaskPriority.HIGH: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tasksDueSoon = useMemo(() => {
    const now = new Date();
    const twoDaysLater = new Date(now);
    twoDaysLater.setDate(now.getDate() + 2);

    return tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= now && dueDate <= twoDaysLater;
    });
  }, [tasks]);

  const handleEditTask = async (updatedTask: FormTask) => {
    try {
      const response = await fetch(`/api/project/${projectId}/task/${selectedTask?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        const updatedTaskData = await response.json();
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === updatedTaskData.id ? { ...task, ...updatedTaskData } : task
          )
        );
        setSelectedTask(null);
      } else {
        console.error('Failed to update task:', await response.text());
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <TabsContent value="list">
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Project Tasks</h1>

        {tasksDueSoon.length > 0 && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
            <h2 className="text-xl font-bold text-red-800 mb-2">Tasks Due Soon</h2>
            <ul>
              {tasksDueSoon.map(task => (
                <li key={task.id} className="text-red-700">
                  {task.title} - Due by {new Date(task.due_date!).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}

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
                <Button variant="ghost" onClick={() => handleSort('type')}>
                  Type {renderSortIcon('type')}
                </Button>
              </TableHead>
              <TableHead>Assignees</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('due_date')}>
                  Due Date {renderSortIcon('due_date')}
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getTypeColor(task.type)}>{task.type}</Badge>
                </TableCell>
                <TableCell>
                  {task.assignedUsers.map((user) => (
                    <div key={user.id} className="flex items-center mb-1">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>{user.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {user.name}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedTask(task)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    {selectedTask && (
                      <EditTaskDialog
                        task={selectedTask}
                        onSave={handleEditTask}
                        assignableUsers={assignableUsers}
                      />
                    )}
                  </Dialog>
                </TableCell>
              </TableRow>            
            ))}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
}