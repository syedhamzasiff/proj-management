import { LoginForm } from './form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-100">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary/90" href="/auth/signup">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}