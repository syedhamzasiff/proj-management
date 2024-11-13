'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Task, RecentTask, Deadline, ActivityData, DashboardData } from '@/types';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const params = useParams();
  const userId = params?.userId as string | undefined;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;

      try {
        const res = await fetch(`/api/dashboard/${userId}`);
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [userId]);

  if (!userId) {
    return <div className="flex items-center justify-center h-screen">User ID not found</div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const { userName, tasks, recentTasks, upcomingDeadlines, activityData } = data;

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
              day: 'numeric',
            })}
          </p>
        </div>
        <Avatar className="h-12 w-12">
          <AvatarImage src="/placeholder-avatar.jpg" alt={userName} />
          <AvatarFallback>{userName ? userName[0] : "?"}</AvatarFallback>

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
  );
}

function TaskCard({ task }: { task: Task }) {
  const statusColors = {
    todo: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2">{task.title}</h3>
        <div className="flex justify-between items-center">
          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[task.status]}`}>
            {task.status}
          </span>
          <span className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentTaskList({ tasks }: { tasks: RecentTask[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🕒 Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex justify-between items-center">
              <span>{task.title}</span>
              <span className="text-sm text-gray-500">
                {new Date(task.updatedAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function UpcomingDeadlinesList({ deadlines }: { deadlines: Deadline[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📅 Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {deadlines.map((deadline) => (
            <li key={deadline.id} className="flex justify-between items-center">
              <span>{deadline.title}</span>
              <span className="text-sm text-gray-500">
                {new Date(deadline.dueDate).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
