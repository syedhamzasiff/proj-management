'use client'

import { useState, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/hooks/use-toast'
import { Upload, Loader2, LogOut } from 'lucide-react'
import { deleteSession } from '@/lib/auth'

export default function ProfileSettings() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [about, setAbout] = useState('')
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()

  const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicture(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveChanges = async (field: string) => {
    setIsLoading(true)
    try {
      let body: Record<string, any> = {}
      switch (field) {
        case 'name':
          body.name = name
          break
        case 'email':
          body.email = email
          break
        case 'password':
          if (password !== confirmPassword) {
            toast({
              title: "Error",
              description: "Passwords do not match",
              variant: "destructive",
            })
            return
          }
          body.password = password
          body.confirmPassword = confirmPassword
          break
        case 'about':
          body.about = about
          break
        case 'profile-picture':
          body.profilePicture = profilePicture
          break
        default:
          throw new Error('Invalid field')
      }

      const response = await fetch(`/api/profile/${field}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      toast({
        title: "Success",
        description: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await deleteSession()
      toast({
        title: "Success",
        description: "You have been logged out successfully",
      })
      router.push('/auth/login') 
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <Button onClick={() => handleSaveChanges('name')} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Name
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
          />
          <Button onClick={() => handleSaveChanges('email')} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Email
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
          />
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
          <Button onClick={() => handleSaveChanges('password')} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update Password
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Profile Picture</Label>
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profilePicture || undefined} alt="Profile picture" />
              <AvatarFallback>
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="profile-picture" className="cursor-pointer">
                <div className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-4 py-2">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload new picture
                </div>
              </Label>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>
          </div>
          {profilePicture && (
            <Button onClick={() => handleSaveChanges('profile-picture')} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Profile Picture
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Changes are saved individually for each field. You can update your information at any time.
        </p>
      </CardFooter>
    </Card>
  )
}