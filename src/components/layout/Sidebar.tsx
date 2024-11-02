'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ChevronDown,
  ChevronRight,
  Search,
  Star,
  Folder,
  ChevronLeft,
  ChevronLeftSquare,
  ChevronRightSquare,
} from 'lucide-react'

const workspaces = [
  { id: 1, name: 'Personal' },
  { id: 2, name: 'Work' },
  { id: 3, name: 'Side Projects' },
]

const projects = [
  { id: 1, name: 'Project A', favorite: true },
  { id: 2, name: 'Project B', favorite: false },
  { id: 3, name: 'Project C', favorite: true },
  { id: 4, name: 'Project D', favorite: false },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0])

  return (
    <div className={`relative h-screen bg-slate-900 text-slate-200 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* User Profile */}
        <div className="p-4 flex items-center space-x-4">
          {!isCollapsed && (
            <>
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">John Doe</p>
                <p className="text-sm text-slate-400">john@example.com</p>
              </div>
            </>
          )}
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="px-4 mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400"
              />
            </div>
          </div>
        )}

        <ScrollArea className="flex-1">
          {/* Workspaces Dropdown */}
          {!isCollapsed && (
            <div className="px-4 mb-4">
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span>{activeWorkspace.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {workspaces.map((workspace) => (
                    <Button
                      key={workspace.id}
                      variant="ghost"
                      className="w-full justify-start pl-6"
                      onClick={() => setActiveWorkspace(workspace)}
                    >
                      {workspace.name}
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Favorites Section */}
          <div className="mb-4">
            <h3 className={`px-4 mb-2 text-sm font-semibold text-slate-400 ${isCollapsed ? 'text-center' : ''}`}>
              {isCollapsed ? <Star className="h-4 w-4 mx-auto" /> : 'Favorites'}
            </h3>
            {projects.filter(p => p.favorite).map((project) => (
              <Button
                key={project.id}
                variant="ghost"
                className={`w-full justify-start ${isCollapsed ? 'px-0' : 'px-4'}`}
                asChild
              >
                <Link href={`/projects/${project.id}`}>
                  {isCollapsed ? (
                    <Star className="h-4 w-4 mx-auto" />
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      {project.name}
                    </>
                  )}
                </Link>
              </Button>
            ))}
          </div>

          {/* Private Projects Section */}
          <div>
            <h3 className={`px-4 mb-2 text-sm font-semibold text-slate-400 ${isCollapsed ? 'text-center' : ''}`}>
              {isCollapsed ? <Folder className="h-4 w-4 mx-auto" /> : 'Private Projects'}
            </h3>
            {projects.map((project) => (
              <Button
                key={project.id}
                variant="ghost"
                className={`w-full justify-start ${isCollapsed ? 'px-0' : 'px-4'}`}
                asChild
              >
                <Link href={`/projects/${project.id}`}>
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 mx-auto" />
                  ) : (
                    <>
                      <ChevronRight className="h-4 w-4 mr-2" />
                      {project.name}
                    </>
                  )}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-4 right-4"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRightSquare className="h-6 w-6" />
        ) : (
          <ChevronLeftSquare className="h-6 w-6" />
        )}
      </Button>
    </div>
  )
}