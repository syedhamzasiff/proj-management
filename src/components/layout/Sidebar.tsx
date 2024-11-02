'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  FolderKanban,
  Calendar,
  Building2,
  Settings,
  HelpCircle,
  Menu,
  ChevronDown,
  Plus,
  Pin,
  Search
} from 'lucide-react'
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

interface NavItem {
  icon: typeof Home
  label: string
  href: string
}

interface Workspace {
  id: string
  name: string
  projects: Project[]
}

interface Project {
  id: string
  name: string
  isPinned?: boolean
}

// Mock data - replace with real data from your backend
const workspaces: Workspace[] = [
  {
    id: '1',
    name: 'Personal',
    projects: [
      { id: 'p1', name: 'Side Project', isPinned: true },
      { id: 'p2', name: 'Blog Redesign' },
    ]
  },
  {
    id: '2',
    name: 'Team Alpha',
    projects: [
      { id: 'p3', name: 'Project Management Tool', isPinned: true },
      { id: 'p4', name: 'Client Dashboard' },
    ]
  }
]

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<string[]>(['1'])
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      setIsMobile(width < 640) // sm breakpoint
    }
    
    // Initial call
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Updated sidebar state logic
  const getSidebarState = () => {
    if (isMobile) {
      // Mobile: fully hidden when closed, full width when open
      return {
        width: isOpen ? 'w-[280px]' : 'w-[280px] -translate-x-full',
        showOverlay: isOpen,
        position: 'fixed'
      }
    }
    
    // All other screen sizes: expandable
    return {
      width: isOpen ? 'w-64' : 'w-16',
      showOverlay: false,
      position: 'fixed'
    }
  }

  const sidebarState = getSidebarState()

  const toggleWorkspace = (workspaceId: string) => {
    setExpandedWorkspaces(prev => 
      prev.includes(workspaceId) 
        ? prev.filter(id => id !== workspaceId)
        : [...prev, workspaceId]
    )
  }

  const NavItem = ({ icon: Icon, label, href, className = '' }: NavItem & { className?: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="default"
          className={cn(
            'w-full justify-start',
            sidebarState.width === 'w-64' ? 'px-4' : 'px-2 justify-center',
            className
          )}
          asChild
        >
          <Link href={href}>
            <Icon className={`h-5 w-5 ${sidebarState.width === 'w-64' ? 'mr-3' : ''}`} />
            {sidebarState.width === 'w-64' && <span>{label}</span>}
          </Link>
        </Button>
      </TooltipTrigger>
      {sidebarState.width !== 'w-64' && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  )

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "inset-y-0 left-0 z-50 flex flex-col bg-background border-r transition-all duration-300 ease-in-out",
          sidebarState.width,
          sidebarState.position
        )}
      >
        {/* Logo/Brand */}
        <div className={`h-16 flex items-center ${
          sidebarState.width === 'w-64' ? 'px-4' : 'justify-center'
        }`}>
          {sidebarState.width === 'w-64' ? (
            <h1 className="text-xl font-bold">Projectify</h1>
          ) : (
            <span className="text-xl font-bold">P</span>
          )}
        </div>

        <Separator />

        {/* Search Bar - Only show when fully expanded */}
        {sidebarState.width === 'w-64' && (
          <div className="px-4 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <ScrollArea className="flex-1">
          <div className="py-2">
            <NavItem icon={Home} label="Dashboard" href="/dashboard" />
            <NavItem icon={Calendar} label="Calendar" href="/calendar" />
            
            {/* Workspaces Section */}
            {sidebarState.width === 'w-64' ? (
              <div className="mt-4">
                <div className="px-4 flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Workspaces</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {workspaces.map((workspace) => (
                  <div key={workspace.id} className="mb-2">
                    <Button
                      variant="ghost"
                      size="default"
                      className="w-full px-4 justify-between h-8"
                      onClick={() => toggleWorkspace(workspace.id)}
                    >
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        <span className="text-sm">{workspace.name}</span>
                      </div>
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expandedWorkspaces.includes(workspace.id) ? "transform rotate-180" : ""
                        )}
                      />
                    </Button>
                    
                    {expandedWorkspaces.includes(workspace.id) && (
                      <div className="ml-4 space-y-1">
                        {workspace.projects.map((project) => (
                          <Button
                            key={project.id}
                            variant="ghost"
                            size="default"
                            className="w-full px-4 justify-between h-8"
                            asChild
                          >
                            <Link href={`/projects/${project.id}`}>
                              <div className="flex items-center">
                                <FolderKanban className="h-4 w-4 mr-2" />
                                <span className="text-sm">{project.name}</span>
                              </div>
                              {project.isPinned && <Pin className="h-3 w-3" />}
                            </Link>
                          </Button>
                        ))}
                        <Button
                          variant="ghost"
                          size="default"
                          className="w-full px-4 justify-start h-8 text-muted-foreground"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          <span className="text-sm">New Project</span>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Collapsed workspace view
              <div className="py-2">
                <Button
                  variant="ghost"
                  size="default"
                  className="w-full px-2 justify-center"
                >
                  <Building2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="default"
                  className="w-full px-2 justify-center"
                >
                  <FolderKanban className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Bottom Section */}
        <div className="py-4 space-y-2">
          <NavItem icon={Settings} label="Settings" href="/settings" />
          <NavItem icon={HelpCircle} label="Help" href="/help" />
        </div>

        {/* User Profile */}
        <div className="p-4 border-t">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full h-12",
                  sidebarState.width === 'w-64' ? 'justify-start px-2' : 'justify-center'
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                {sidebarState.width === 'w-64' && (
                  <div className="ml-3 text-left">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">john@example.com</p>
                  </div>
                )}
              </Button>
            </TooltipTrigger>
            {sidebarState.width !== 'w-64' && (
              <TooltipContent side="right">
                <p className="font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">john@example.com</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Toggle Button - Show on all non-mobile screens */}
        {!isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 left-4 z-50 rounded-full"
            onClick={onToggle}
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Mobile Overlay */}
      {sidebarState.showOverlay && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={onToggle}
        />
      )}
    </TooltipProvider>
  )
}