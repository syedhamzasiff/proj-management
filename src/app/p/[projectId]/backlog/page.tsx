'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/hooks/use-toast";
import { Loader2, Plus, Save } from 'lucide-react';
import { TaskPriority, TaskStatus, TaskType } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Assignee = {
  userId: string;
  user: {
    name: string;
    email: string;
  };
};

type BacklogTask = {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignments: Assignee[];
};

const taskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  type: z.nativeEnum(TaskType),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus),
  assignments: z.array(z.object({
    userId: z.string(),
    user: z.object({
      name: z.string(),
      email: z.string(),
    }),
  })),
});

const backlogFormSchema = z.object({
  tasks: z.array(taskSchema),
});

type BacklogFormValues = z.infer<typeof backlogFormSchema>;

export default function BacklogManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const form = useForm<BacklogFormValues>({
    resolver: zodResolver(backlogFormSchema),
    defaultValues: {
      tasks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tasks",
  });

  useEffect(() => {
    const fetchBacklogTasks = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/backlog`);
        if (response.status === 403) {
          setIsAuthorized(false);
          toast({
            title: "Unauthorized",
            description: "You don't have permission to access this page.",
            variant: "destructive",
          });
          router.push('/dashboard');
          return;
        }
        if (!response.ok) throw new Error('Failed to fetch backlog tasks');
        const data = await response.json();
        form.reset({ tasks: data.tasks });
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error fetching backlog tasks:', error);
        toast({
          title: "Error",
          description: "Failed to load backlog tasks. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBacklogTasks();
  }, [projectId, form, router]);

  const onSubmit = async (data: BacklogFormValues) => {
    setIsUpdateDialogOpen(false);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/project/${projectId}/backlog`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update backlog tasks');

      const updatedData = await response.json();
      form.reset({ tasks: updatedData.tasks });
      toast({
        title: "Success",
        description: "Backlog tasks updated successfully.",
      });
    } catch (error) {
      console.error('Error updating backlog tasks:', error);
      toast({
        title: "Error",
        description: "Failed to update backlog tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTask = (index: number) => {
    remove(index);
  };

  const handleAddTask = () => {
    append({
      title: "",
      description: "",
      type: TaskType.TASK,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.BACKLOG,
      assignments: [],
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Backlog Manager</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {fields.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-500 mb-4">No backlog tasks found.</p>
              <Button type="button" onClick={handleAddTask}>Add Your First Task</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignees</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`tasks.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`tasks.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`tasks.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
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
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`tasks.${index}.priority`}
                        render={({ field }) => (
                          <FormItem>
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
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`tasks.${index}.status`}
                        render={({ field }) => (
                          <FormItem>
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
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {field.assignments?.map((assignee) => (
                          <Avatar key={assignee.userId} className="h-8 w-8">
                            <AvatarImage src={`https://www.gravatar.com/avatar/${assignee.user.email}?d=mp`} />
                            <AvatarFallback>{assignee.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleRemoveTask(index)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="mt-4 flex justify-between">
            <Button type="button" onClick={handleAddTask}>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
            {fields.length > 0 && (
              <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button">
                    <Save className="mr-2 h-4 w-4" /> Update Changes
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Update</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to update the backlog tasks? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
                      Confirm Update
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}