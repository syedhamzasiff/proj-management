'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/hooks/use-toast";
import { Loader2 } from 'lucide-react';

const inviteSchema = z.object({
  type: z.enum(['WORKSPACE', 'PROJECT']),
  targetId: z.string().min(1, 'Target ID is required'),
  role: z.string().min(1, 'Role is required'),
  expiresAt: z.string().optional(),
  usageLimit: z.number().int().positive().optional(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export default function InvitePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      type: 'WORKSPACE',
      targetId: '',
      role: '',
      expiresAt: '',
      usageLimit: 1,
    },
  });

  const onSubmit = async (data: InviteFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create invitation');
      }

      const result = await response.json();
      setInviteLink(result.link);
      toast({
        title: "Invitation Created",
        description: "The invitation link has been generated successfully.",
      });
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast({
        title: "Error",
        description: "Failed to create invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Invitation</CardTitle>
          <CardDescription>Generate an invitation link for a workspace or project</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invitation Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select invitation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WORKSPACE">Workspace</SelectItem>
                        <SelectItem value="PROJECT">Project</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter workspace or project ID" {...field} />
                    </FormControl>
                    <FormDescription>
                      The ID of the workspace or project you're inviting to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {form.watch('type') === 'WORKSPACE' ? (
                          <>
                            <SelectItem value="OWNER">Owner</SelectItem>
                            <SelectItem value="LEADER">Leader</SelectItem>
                            <SelectItem value="MEMBER">Member</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="LEAD">Lead</SelectItem>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="VIEWER">Viewer</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave blank for no expiration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Limit</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10))} />
                    </FormControl>
                    <FormDescription>
                      Number of times this invitation can be used
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Invitation
                  </>
                ) : (
                  'Create Invitation'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        {inviteLink && (
          <CardFooter>
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-2">Invitation Link:</h3>
              <div className="bg-gray-100 p-4 rounded-md break-all">
                {inviteLink}
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}