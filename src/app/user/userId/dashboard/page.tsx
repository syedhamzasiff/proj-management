'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import TaskCard from '@/components/dashboard/TaskCard'
import RecentTaskList from '@/components/dashboard/RecentTaskList'
import UpcomingDeadlinesList from '@/components/dashboard/UpcomingDeadlinesList'

interface Activity {
  day: string
  tasks: number
}

interface Task {
  id: number
  title: string
  status: 'Not Started' | 'In Progress' | 'Completed'
  priority: 'High' | 'Medium' | 'Low'
  progress: number
}

interface RecentTask {
  id: number
  title: string
  status: 'Not Started' | 'In Progress' | 'Completed'
}

interface Deadline {
  id: number
  title: string
  date: string
}

const activityData: Activity[] = [
  { day: 'Mon', tasks: 5 },
  { day: 'Tue', tasks: 8 },
  { day: 'Wed', tasks: 6 },
  { day: 'Thu', tasks: 9 },
  { day: 'Fri', tasks: 4 },
  { day: 'Sat', tasks: 3 },
  { day: 'Sun', tasks: 2 },
]

const tasks: Task[] = [
  { id: 1, title: 'Design new landing page', status: 'In Progress', priority: 'High', progress: 60 },
  { id: 2, title: 'Update user documentation', status: 'Not Started', priority: 'Medium', progress: 0 },
  { id: 3, title: 'Fix payment gateway bug', status: 'Completed', priority: 'High', progress: 100 },
  { id: 4, title: 'Implement new feature', status: 'In Progress', priority: 'Low', progress: 30 },
]

const recentTasks: RecentTask[] = [
  { id: 1, title: 'Review team performance', status: 'In Progress' },
  { id: 2, title: 'Prepare quarterly report', status: 'Not Started' },
  { id: 3, title: 'Client meeting preparation', status: 'Completed' },
]

const upcomingDeadlines: Deadline[] = [
  { id: 1, title: 'Project proposal submission', date: '2024-03-15' },
  { id: 2, title: 'Team building event', date: '2024-03-20' },
  { id: 3, title: 'Product launch', date: '2024-04-01' },
]

export default function Dashboard() {
  const [userName, setUserName] = useState<string>('John Doe')

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <header className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {userName}</h1>
          <p className="text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <Avatar className="h-12 w-12">
          <AvatarImage src="/placeholder-avatar.jpg" alt={userName} />
          <AvatarFallback>{userName[0]}</AvatarFallback>
        </Avatar>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>📌 Pinned Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>📊 Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentTaskList tasks={recentTasks} />
        <UpcomingDeadlinesList deadlines={upcomingDeadlines} />
      </section>
    </div>
  )
}