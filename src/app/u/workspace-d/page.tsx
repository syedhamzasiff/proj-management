'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useUser } from '@/context/UserContext'
import { Plus } from 'lucide-react'

interface Member {
  id: string
  name: string
  avatarUrl: string
}

interface Workspace {
  id: string
  name: string
  members: Member[]
  isPersonal: boolean
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userId } = useUser()
  const router = useRouter()

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!userId) return
      try {
        const response = await fetch(`/api/user/${userId}/workspaces`)
        if (!response.ok) {
          throw new Error('Failed to fetch workspaces')
        }
        const data = await response.json()
        setWorkspaces(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching workspaces')
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchWorkspaces()
  }, [userId])  

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  if (workspaces.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">No Workspaces Found</h1>
        <p className="mb-4">You don't have any workspaces yet. Create your first workspace to get started!</p>
        <Button onClick={() => router.push('/w/new')}>
          <Plus className="mr-2 h-4 w-4" /> Create New Workspace
        </Button>
      </div>
    )
  }

  const personalWorkspaces = workspaces.filter(workspace => workspace.isPersonal)
  const sharedWorkspaces = workspaces.filter(workspace => !workspace.isPersonal)

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Workspaces</h1>
        <Button onClick={() => router.push('/w/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Workspace
        </Button>
      </div>
      
      <WorkspaceSection title="Personal Workspaces" workspaces={personalWorkspaces} />
    </div>
  )
}

function WorkspaceSection({ title, workspaces }: { title: string; workspaces: Workspace[] }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map(workspace => (
          <WorkspaceCard key={workspace.id} workspace={workspace} />
        ))}
      </div>
    </section>
  )
}

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <Link href={`/w/${workspace.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 truncate">{workspace.name}</h3>
          <div className="flex -space-x-2 overflow-hidden">
            {workspace.members.slice(0, 3).map(member => (
              <Avatar key={member.id} className="inline-block border-2 border-white">
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
            ))}
            {workspace.members.length > 3 && (
              <Avatar className="inline-block border-2 border-white">
                <AvatarFallback>+{workspace.members.length - 3}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function LoadingState() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <Skeleton className="h-8 w-64 mb-4" />
      {[...Array(2)].map((_, sectionIndex) => (
        <div key={sectionIndex} className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, cardIndex) => (
              <Card key={cardIndex}>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-full mb-2" />
                  <div className="flex -space-x-2 overflow-hidden">
                    {[...Array(3)].map((_, avatarIndex) => (
                      <Skeleton key={avatarIndex} className="inline-block w-8 h-8 rounded-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
      <p className="text-gray-700">{message}</p>
    </div>
  )
}