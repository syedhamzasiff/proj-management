'use client'

import TaskCard from "@/components/projects/TaskCard"
import TeamMemberAvatar from "@/components/projects/TeamMemberAvatar"
import { TabsContent } from "@/components/ui/tabs"
import { Clock, Columns, FileText } from 'lucide-react'

const projectData = {
  name: "Project Alpha",
  progress: 65,
  tasks: {
    total: 50,
    completed: 30,
    inProgress: 15,
    notStarted: 5
  },
  team: [
    { name: "John Doe", avatar: "/avatars/john-doe.jpg" },
    { name: "Jane Smith", avatar: "/avatars/jane-smith.jpg" },
    { name: "Bob Johnson", avatar: "/avatars/bob-johnson.jpg" },
  ],
  timeTracked: "120h 45m",
  currentSprint: {
    name: "Sprint 7",
    endDate: "2024-03-15"
  }
}

export default function ProjectDashboard() {
  return (
    <TabsContent value="overview">
      <div className="space-y-6">
        {/* Task Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <TaskCard 
            title="Total Tasks" 
            value={projectData.tasks.total} 
            icon={Columns} 
            progress={projectData.progress} 
          />
          <TaskCard 
            title="In Progress" 
            value={projectData.tasks.inProgress} 
            icon={Clock} 
          />
          <TaskCard 
            title="Completed" 
            value={projectData.tasks.completed} 
            icon={FileText} 
          />
          <TaskCard 
            title="Time Tracked" 
            value={projectData.timeTracked} 
            icon={Clock} 
          />
        </div>

        {/* Sprint and Team Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <TaskCard 
              title="Current Sprint" 
              value={projectData.currentSprint.name} 
              icon={Columns} 
              subtitle={`Ends: ${projectData.currentSprint.endDate}`}
            />
          </div>
          <div>
            <TeamMemberAvatar members={projectData.team} />
          </div>
        </div>
      </div>
    </TabsContent>
  )
}