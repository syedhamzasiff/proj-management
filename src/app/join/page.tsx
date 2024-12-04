'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { useUser } from '@/context/UserContext'; // Import the useUser hook

const joinSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
});

type JoinFormValues = z.infer<typeof joinSchema>;

export default function JoinPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Use the useUser hook to get the current userId from the context
  const { userId, isAuth, loading } = useUser();

  const form = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      token: '',
    },
  });

  const onSubmit = async (data: JoinFormValues) => {
    if (!isAuth) {
      toast({
        title: "Error",
        description: "You must be authenticated to join.",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is missing. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/join', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: data.token,
          userId: userId, // Use the userId from context
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join');
      }

      toast({
        title: "Success",
        description: result.message || "You have successfully joined.",
      });

      // Redirect to appropriate page (e.g., dashboard)
      router.push('/dashboard');
    } catch (error) {
      console.error('Error joining:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If still loading user context, show a loading state
  if (loading) {
    return <div>Loading user info...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Join Workspace or Project</CardTitle>
          <CardDescription>Enter your invitation token to join</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invitation Token</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your invitation token" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the token you received in the invitation link
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
