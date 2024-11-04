'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Workspace name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Workspace description must be at least 10 characters.",
  }),
  type: z.enum(["personal", "team", "organization"], {
    required_error: "Please select a workspace type.",
  }),
  owner: z.string({
    required_error: "Please select a workspace owner.",
  }),
  members: z.array(z.string()).min(1, {
    message: "Please select at least one team member.",
  }),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()),
})

export default function CreateWorkspaceForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "team",
      members: [],
      isPublic: false,
      tags: [],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    // Here you would typically send the form data to your backend
    console.log(values)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    router.push('/workspaces')
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Create New Workspace</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter workspace name" {...field} />
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
                <FormLabel>Workspace Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter workspace description"
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workspace type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="owner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace Owner</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workspace owner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="john-doe">John Doe</SelectItem>
                    <SelectItem value="jane-smith">Jane Smith</SelectItem>
                    <SelectItem value="bob-johnson">Bob Johnson</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="members"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace Members</FormLabel>
                <FormDescription>
                  Select members for this workspace.
                </FormDescription>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange([...field.value, value])}
                    value={field.value[field.value.length - 1]}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add workspace members" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alice-williams">Alice Williams</SelectItem>
                      <SelectItem value="charlie-brown">Charlie Brown</SelectItem>
                      <SelectItem value="david-miller">David Miller</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                {field.value.length > 0 && (
                  <div className="mt-2">
                    {field.value.map((member, index) => (
                      <Badge key={index} className="mr-2 mb-2">
                        {member}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-auto p-0 text-base"
                          onClick={() => {
                            const newValue = [...field.value];
                            newValue.splice(index, 1);
                            field.onChange(newValue);
                          }}
                        >
                          &times;
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Public Workspace
                  </FormLabel>
                  <FormDescription>
                    Make this workspace visible to non-members
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace Tags</FormLabel>
                <FormDescription>
                  Add tags to categorize your workspace (optional).
                </FormDescription>
                <FormControl>
                  <Input
                    placeholder="Enter tags (comma-separated)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        const value = e.currentTarget.value.trim();
                        if (value && !field.value.includes(value)) {
                          field.onChange([...field.value, value]);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </FormControl>
                {field.value.length > 0 && (
                  <div className="mt-2">
                    {field.value.map((tag, index) => (
                      <Badge key={index} className="mr-2 mb-2">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-auto p-0 text-base"
                          onClick={() => {
                            const newValue = [...field.value];
                            newValue.splice(index, 1);
                            field.onChange(newValue);
                          }}
                        >
                          &times;
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Workspace
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}