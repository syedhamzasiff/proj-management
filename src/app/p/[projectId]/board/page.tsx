'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, CalendarIcon, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task, TaskStatus, TaskPriority, Column, Subtask, Comment } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Columns = Record<TaskStatus, Column>;

const initialColumns: Columns = {
  BACKLOG: { id: 'BACKLOG', title: 'Backlog', tasks: [] },
  TODO: { id: 'TODO', title: 'To Do', tasks: [] },
  IN_PROGRESS: { id: 'IN_PROGRESS', title: 'In Progress', tasks: [] },
  DONE: { id: 'DONE', title: 'Done', tasks: [] },
};

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less"),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'] as const),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'] as const),
  type: z.enum(['FEATURE', 'BUG', 'TASK'] as const),
  dueDate: z.date().optional(),
  assignedUserIds: z.array(z.string()).optional(),
});

const subtaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  isCompleted: z.boolean().default(false),
});

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500, "Comment must be 500 characters or less"),
});

type FormTask = z.infer<typeof taskSchema>;
type FormSubtask = z.infer<typeof subtaskSchema>;
type FormComment = z.infer<typeof commentSchema>;

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Columns>(initialColumns);
  const [isAddTaskDrawerOpen, setIsAddTaskDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<{ id: string; name: string }[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);

  const params = useParams();
  const projectId = params?.projectId as string;

  const taskForm = useForm<FormTask>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      type: "TASK",
      assignedUserIds: [],
    },
  });

  const subtaskForm = useForm<FormSubtask>({
    resolver: zodResolver(subtaskSchema),
    defaultValues: {
      title: "",
      isCompleted: false,
    },
  });

  const commentForm = useForm<FormComment>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    if (!projectId) return;

    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/project/${projectId}/tasks?view=kanban`);
        if (!res.ok) throw new Error('Failed to fetch tasks');
        const data = await res.json();

        if (!data || !data.data) {
          throw new Error('Invalid response from server');
        }

        const formattedColumns: Columns = { ...initialColumns };
        data.data.forEach(({ status, tasks }: { status: TaskStatus; tasks: Task[] }) => {
          if (formattedColumns[status]) {
            formattedColumns[status].tasks = tasks || [];
          }
        });

        setColumns(formattedColumns);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAssignableUsers = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/assignable-users`);
        const data = await response.json();

        if (response.ok) {
          setAssignableUsers(data.users);
        } else {
          console.error(data.error || "Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching assignable users:", error);
      }
    };

    fetchTasks();
    fetchAssignableUsers();
  }, [projectId]);

  const handleAddTask = async (values: FormTask) => {
    if (!projectId) return;
  
    try {
      setIsLoading(true);
      const response = await fetch(`/api/project/${projectId}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          priority: values.priority,
          type: values.type,
          dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const newTask: Task = {
          ...data.task,
          dueDate: data.task.due_date ? new Date(data.task.due_date) : undefined,
          assignedUsers: data.task.assignments.map((assignment: any) => assignment.user),
          subtasks: [],
          comments: [],
        };
  
        setColumns(prevColumns => ({
          ...prevColumns,
          [newTask.status]: {
            ...prevColumns[newTask.status],
            tasks: [...prevColumns[newTask.status].tasks, newTask],
          },
        }));
        setIsAddTaskDrawerOpen(false);
        taskForm.reset();
      } else {
        console.error(data.error || "Failed to create task");
        setError(data.error || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      setError("An error occurred while creating the task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTask = async (values: FormTask) => {
    if (!projectId || !selectedTask) {
      console.error("Project ID or selected task is missing.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/project/${projectId}/task/${selectedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedTask: Task = {
          ...selectedTask,
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          assignments: data.assignments || [],
        };

        setColumns(prevColumns => {
          const newColumns = { ...prevColumns };
          const oldStatus = selectedTask.status;
          const newStatus = updatedTask.status;
        
          // Remove task from all columns first
          Object.keys(newColumns).forEach(statusKey => {
            // Cast statusKey to one of the valid column keys to prevent the TS error
            newColumns[statusKey as keyof typeof newColumns].tasks = newColumns[statusKey as keyof typeof newColumns].tasks.filter(
              task => task.id !== updatedTask.id
            );
          });
        
          // Add task to the new status column
          if (!newColumns[newStatus].tasks.some(task => task.id === updatedTask.id)) {
            newColumns[newStatus].tasks.push(updatedTask);
          }
        
          return newColumns;
        });
        
        

        setIsEditTaskDialogOpen(false);
        setSelectedTask(null);
        taskForm.reset();
      } else {
        console.error(data.error || "Failed to update task");
        setError(data.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      setError("An error occurred while updating the task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubtask = async (values: FormSubtask) => {
    if (!projectId || !selectedTask) return;
  
    try {
      setIsLoading(true);
      const response = await fetch(`/api/project/${projectId}/task/${selectedTask.id}/subtask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const newSubtask: Subtask = data.subtask;
  
        setColumns(prevColumns => {
          const newColumns = { ...prevColumns };
          const taskColumn = newColumns[selectedTask.status];
          const taskIndex = taskColumn.tasks.findIndex(task => task.id === selectedTask.id);
  
          if (taskIndex !== -1) {
            const updatedTask = { ...taskColumn.tasks[taskIndex] };
            updatedTask.subtasks = [...(updatedTask.subtasks || []), newSubtask];
            taskColumn.tasks[taskIndex] = updatedTask;
          }
  
          return newColumns;
        });
  
        setSelectedTask(prevTask => {
          if (prevTask) {
            return {
              ...prevTask,
              subtasks: [...(prevTask.subtasks || []), newSubtask],
            };
          }
          return prevTask;
        });
  
        subtaskForm.reset();
      } else {
        console.error(data.error || "Failed to create subtask");
        setError(data.error || "Failed to create subtask");
      }
    } catch (error) {
      console.error("Error creating subtask:", error);
      setError("An error occurred while creating the subtask");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
    if (!projectId || !selectedTask) return;
  
    try {
      setIsLoading(true);
      const response = await fetch(`/api/project/${projectId}/task/${selectedTask.id}/subtask/${subtaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setColumns(prevColumns => {
          const newColumns = { ...prevColumns };
          const taskColumn = newColumns[selectedTask.status];
          const taskIndex = taskColumn.tasks.findIndex(task => task.id === selectedTask.id);
  
          if (taskIndex !== -1) {
            const updatedTask = { ...taskColumn.tasks[taskIndex] };
            const subtaskIndex = updatedTask.subtasks.findIndex(subtask => subtask.id === subtaskId);
            if (subtaskIndex !== -1) {
              updatedTask.subtasks[subtaskIndex].isCompleted = isCompleted;
            }
            taskColumn.tasks[taskIndex] = updatedTask;
          }
  
          return newColumns;
        });
  
        setSelectedTask(prevTask => {
          if (prevTask) {
            const updatedSubtasks = prevTask.subtasks.map(subtask =>
              subtask.id === subtaskId ? { ...subtask, isCompleted } : subtask
            );
            return { ...prevTask, subtasks: updatedSubtasks };
          }
          return prevTask;
        });
  
        // Check if all subtasks are completed
        const allSubtasksCompleted = selectedTask.subtasks.every(subtask => 
          subtask.id === subtaskId ? isCompleted : subtask.isCompleted
        );
  
        if (allSubtasksCompleted && selectedTask.status !== 'DONE') {
          // Update the task status to DONE
          await handleUpdateTaskStatus(selectedTask.id, 'DONE');
        }
      } else {
        console.error(data.error || "Failed to update subtask");
        setError(data.error || "Failed to update subtask");
      }
    } catch (error) {
      console.error("Error updating subtask:", error);
      setError("An error occurred while updating the subtask");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (values: FormComment) => {
    if (!projectId || !selectedTask) return;
  
    try {
      setIsLoading(true);
      const response = await fetch(`/api/project/${projectId}/task/${selectedTask.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const newComment: Comment = data.comment;
  
        setColumns(prevColumns => {
          const newColumns = { ...prevColumns };
          const taskColumn = newColumns[selectedTask.status];
          const taskIndex = taskColumn.tasks.findIndex(task => task.id === selectedTask.id);
  
          if (taskIndex !== -1) {
            const updatedTask = { ...taskColumn.tasks[taskIndex] };
            updatedTask.comments = [...(updatedTask.comments || []), newComment];
            taskColumn.tasks[taskIndex] = updatedTask;
          }
  
          return newColumns;
        });
  
        setSelectedTask(prevTask => {
          if (prevTask) {
            return {
              ...prevTask,
              comments: [...(prevTask.comments || []), newComment],
            };
          }
          return prevTask;
        });
  
        commentForm.reset();
      } else {
        console.error(data.error || "Failed to add comment");
        setError(data.error || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("An error occurred while adding the comment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;
  
    const draggedTaskId = active.id as string;
    const targetColumnId = over.id as TaskStatus;
  
    const draggedTask = Object.values(columns).flatMap(column => column.tasks).find(task => task.id === draggedTaskId);
    if (!draggedTask || draggedTask.status === targetColumnId) return;
  
    await handleUpdateTaskStatus(draggedTaskId, targetColumnId);
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/project/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
  
      const updatedTask = await response.json();
  
      setColumns(prevColumns => {
        const newColumns = { ...prevColumns };
  
        // Remove the task from its old status column
        Object.values(newColumns).forEach(column => {
          column.tasks = column.tasks.filter(task => task.id !== taskId);
        });
  
        // Add the updated task to its new status column
        newColumns[newStatus].tasks.push(updatedTask);
  
        return newColumns;
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Failed to update task status. Please try again.');
    }
  };
  
  const TaskCard = ({ task }: { task: Task }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: task.id,
      data: { task },
    });

    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <Card className={cn("mb-2 bg-white cursor-pointer", task.isPinned && "border-2 border-blue-500")} onClick={() => {
          setSelectedTask(task);
          setIsEditTaskDialogOpen(true);
        }}>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">{task.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            <div className="text-sm text-gray-500 mb-2">
              Assignees: 
              {task.assignedUsers && task.assignedUsers.length > 0
                ? task.assignedUsers.map((user) => user.name).join(', ')
                : 'Unassigned'}
            </div>
            <div className="text-sm mt-2">
              Priority:
              <span
                className={cn("ml-1 px-2 py-1 rounded-full text-xs", {
                  'bg-red-100 text-red-800': task.priority === 'HIGH',
                  'bg-yellow-100 text-yellow-800': task.priority === 'MEDIUM',
                  'bg-green-100 text-green-800': task.priority === 'LOW',
                })}
              >
                {task.priority}
              </span>
            </div>
            <div className="text-sm mt-2">
              Type:
              <span
                className={cn("ml-1 px-2 py-1 rounded-full text-xs", {
                  'bg-red-100 text-red-800': task.type === 'BUG',
                  'bg-purple-100 text-purple-800': task.type === 'FEATURE',
                  'bg-amber-100 text-amber-800': task.type === 'TASK',
                })}
              >
                {task.type}
              </span>
            </div>
            {task.dueDate && (
              <div className="text-sm mt-2">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="text-sm mt-2">
                Subtasks: {task.subtasks.filter(st => st.isCompleted).length}/{task.subtasks.length}
              </div>
            )}
            {task.comments && task.comments.length > 0 && (
              <div className="text-sm mt-2">
                Comments: {task.comments.length}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const Column = ({ column }: { column: Column }) => {
    const { isOver, setNodeRef } = useDroppable({ id: column.id });
    const style = isOver ? 'bg-gray-100' : 'bg-white';

    return (
      <div ref={setNodeRef} className={`flex-shrink-0 w-80 p-4 rounded-lg ${style}`}>
        <h2 className="text-lg font-semibold mb-4">{column.title}</h2>
        <div className="space-y-2 min-h-[200px]">
          {column.tasks && column.tasks.length > 0 ? (
            column.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <p className="text-gray-500 text-center">No tasks in this column</p>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <Sheet open={isAddTaskDrawerOpen} onOpenChange={setIsAddTaskDrawerOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Task</SheetTitle>
            </SheetHeader>
            <Form {...taskForm}>
              <form onSubmit={taskForm.handleSubmit(handleAddTask)} className="space-y-6 mt-4">
                <FormField
                  control={taskForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taskForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter task description"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taskForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select task type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FEATURE">Feature</SelectItem>
                          <SelectItem value="BUG">Bug</SelectItem>
                          <SelectItem value="TASK">Task</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taskForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select task status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BACKLOG">Backlog</SelectItem>
                          <SelectItem value="TODO">To Do</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taskForm.control}
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
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taskForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taskForm.control}
                  name="assignedUserIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange([...field.value || [], value])}
                        value={field.value?.[field.value.length - 1] || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select users" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assignableUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="mt-2">
                        {field.value?.map((userId) => {
                          const user = assignableUsers.find((u) => u.id === userId);
                          return user ? (
                            <span key={userId} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 mb-2 px-2.5 py-0.5 rounded">
                              {user.name}
                              <button
                                type="button"
                                onClick={() => field.onChange(field.value?.filter((id) => id !== userId))}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                      <FormDescription>
                        Choose users to assign this task to.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Task
                    </>
                  ) : (
                    "Create Task"
                  )}
                </Button>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex space-x-4 pb-4 min-w-max">
          {Object.values(columns).map((column) => (
            <Column key={column.id} column={column} />
          ))}
        </div>
      </DndContext>
      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="grid gap-4 py-4">
              <Form {...taskForm}>
                <form onSubmit={taskForm.handleSubmit(handleEditTask)} className="space-y-6">
                  <FormField
                    control={taskForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter task title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={taskForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter task description"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={taskForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select task type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FEATURE">Feature</SelectItem>
                              <SelectItem value="BUG">Bug</SelectItem>
                              <SelectItem value="TASK">Task</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={taskForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select task status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="BACKLOG">Backlog</SelectItem>
                              <SelectItem value="TODO">To Do</SelectItem>
                              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                              <SelectItem value="DONE">Done</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={taskForm.control}
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
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={taskForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={taskForm.control}
                    name="assignedUserIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign To</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange([...field.value || [], value])}
                          value={field.value?.[field.value.length - 1] || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select users" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {assignableUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="mt-2">
                          {field.value?.map((userId) => {
                            const user = assignableUsers.find((u) => u.id === userId);
                            return user ? (
                              <span key={userId} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 mb-2 px-2.5 py-0.5 rounded">
                                {user.name}
                                <button
                                  type="button"
                                  onClick={() => field.onChange(field.value?.filter((id) => id !== userId))}
                                  className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                  ×
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                        <FormDescription>
                          Choose users to assign this task to.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Task
                      </>
                    ) : (
                      "Update Task"
                    )}
                  </Button>
                </form>
              </Form>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Subtasks</h3>
                {selectedTask.subtasks && selectedTask.subtasks.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedTask.subtasks.map((subtask) => (
                      <li key={subtask.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={subtask.isCompleted}
                          onCheckedChange={(checked) => handleToggleSubtask(subtask.id, checked as boolean)}
                        />
                        <span className={cn(subtask.isCompleted && "line-through")}>{subtask.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No subtasks yet.</p>
                )}
                <Form {...subtaskForm}>
                  <form onSubmit={subtaskForm.handleSubmit(handleAddSubtask)} className="flex items-center space-x-2">
                    <FormField
                      control={subtaskForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input placeholder="Add a subtask" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="sm" disabled={isLoading}>
                      Add
                    </Button>
                  </form>
                </Form>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Comments</h3>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  {selectedTask.comments && selectedTask.comments.length > 0 ? (
                    <ul className="space-y-4">
                      {selectedTask.comments.map((comment) => (
                        <li key={comment.id} className="flex items-start space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.user.avatar_url} alt={comment.user.name} />
                            <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{comment.user.name}</p>
                            <p className="text-sm">{comment.content}</p>
                            <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No comments yet.</p>
                  )}
                </ScrollArea>
                <Form {...commentForm}>
                  <form onSubmit={commentForm.handleSubmit(handleAddComment)} className="flex items-center space-x-2">
                    <FormField
                      control={commentForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input placeholder="Add a comment" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="sm" disabled={isLoading}>
                      Comment
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}