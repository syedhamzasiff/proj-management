'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Loader2, Copy } from 'lucide-react'

const workspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100, "Workspace name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  type: z.enum(["personal", "shared"]),
})

export default function NewWorkspacePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof workspaceSchema>>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "personal",
    },
  })

  const workspaceType = form.watch("type")

  useEffect(() => {
    if (workspaceType === "shared") {
      generateInviteLink()
    } else {
      setInviteLink(null)
    }
  }, [workspaceType])

  const generateInviteLink = () => {
    // In a real application, you would generate this link on the server
    const link = `https://yourapp.com/invite/${Math.random().toString(36).substr(2, 9)}`
    setInviteLink(link)
  }

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard",
      })
    }
  }

  const onSubmit = async (values: z.infer<typeof workspaceSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          inviteLink: inviteLink,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create workspace')
      }

      const data = await response.json()
      toast({
        title: "Workspace created successfully",
        description: `"${values.name}" has been created.`,
        action: (
          <ToastAction altText="View workspace">View workspace</ToastAction>
        ),
      })
      router.push(`/workspace/${data.workspace.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workspace. Please try again.",
        variant: "destructive",
        action: (
          <ToastAction altText="Try again">Try again</ToastAction>
        ),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Create New Workspace</CardTitle>
        <CardDescription>Set up a new workspace for your projects</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter workspace name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Choose a name for your new workspace.
                  </FormDescription>
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
                      placeholder="Enter workspace description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Briefly describe the purpose of this workspace (optional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Workspace Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="personal" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Personal Workspace
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="shared" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Shared Workspace
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Select whether this is a personal or shared workspace.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {workspaceType === "shared" && inviteLink && (
              <FormItem>
                <FormLabel>Invite Link</FormLabel>
                <div className="flex items-center space-x-2">
                  <Input
                    readOnly
                    value={inviteLink}
                    className="flex-grow"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyInviteLink}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <FormDescription>
                  Use this link to invite members to your workspace.
                </FormDescription>
              </FormItem>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Workspace
                </>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}