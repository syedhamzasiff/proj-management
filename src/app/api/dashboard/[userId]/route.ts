import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = await params;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'User ID is required and must be a string' }, { status: 400 });
    }

    // Fetch the user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, avatar_url: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Fetch all tasks assigned to the user
    const tasks = await prisma.task.findMany({
      where: {
        assignments: { some: { userId } }
      },
      orderBy: { created_at: 'desc' },
    });

    // Calculate tasks due today
    const tasksDueToday = tasks.filter((task) => {
      const dueDate = task.due_date ? new Date(task.due_date) : null;
      return dueDate && dueDate.toDateString() === today.toDateString();
    }).length;

    // Calculate tasks due this week
    const tasksDueThisWeek = tasks.filter((task) => {
      const dueDate = task.due_date ? new Date(task.due_date) : null;
      return dueDate && dueDate >= weekAgo && dueDate <= today;
    }).length;

    // Calculate overdue tasks
    const overdueTasks = tasks.filter((task) => {
      const dueDate = task.due_date ? new Date(task.due_date) : null;
      return dueDate && dueDate < today && task.status !== 'DONE';
    }).length;

    // Fetch pinned tasks directly
    const pinnedTasks = await prisma.task.findMany({
      where: {
        assignments: { some: { userId } },
        isPinned: true,
      },
    });

    // Fetch upcoming deadlines
    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        assignments: { some: { userId } },
        due_date: { gt: new Date() },
      },
      orderBy: { due_date: 'asc' },
      take: 3,
    });

    // Fetch in-progress tasks
    const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS');

    // Return the complete response
    return NextResponse.json({
      userName: user.name,
      avatar_url: user.avatar_url,
      tasksOverview: {
        dueToday: tasksDueToday,
        dueThisWeek: tasksDueThisWeek,
        overdue: overdueTasks,
        total: tasks.length,
      },
      pinnedTasks,
      upcomingDeadlines,
      inProgressTasks,
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
