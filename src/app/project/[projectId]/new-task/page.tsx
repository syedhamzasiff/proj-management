'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.number().min(1).max(5),
  dueDate: z.date().optional(),
  assignedUserId: z.string().min(1, "Assign a user"),
});

export default function NewTaskPage({ params }: { params: Promise<{ projectId: string }> }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: 1,
      assignedUserId: "",
    },
  });

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setProjectId(resolvedParams.projectId);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!projectId) return;

    async function fetchAssignableUsers() {
      try {
        setLoading(true);
        const response = await fetch(`/api/project/${projectId}/assignable-users`);
        const data = await response.json();

        if (response.ok) {
          setAssignableUsers(data.users);
          if (data.users.length === 1) {
            form.setValue("assignedUserId", data.users[0].id);
          }
        } else {
          console.error(data.error || "Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching assignable users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignableUsers();
  }, [projectId, form]);

  async function onSubmit(values: z.infer<typeof taskSchema>) {
    if (!projectId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/project/${projectId}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/project/${projectId}`);
      } else {
        console.error(data.error || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!projectId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fixed right-0 top-0 w-[400px] h-full bg-white shadow-lg p-6 overflow-y-auto transition-transform duration-300 ease-in-out transform translate-x-0">
      <Card>
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((priority) => (
                          <SelectItem key={priority} value={priority.toString()}>
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
                control={form.control}
                name="assignedUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
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
                    <FormDescription>
                      Choose a user to assign this task to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
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
        </CardContent>
      </Card>
    </div>
  );
}