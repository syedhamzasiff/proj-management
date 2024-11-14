import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {

    const { userId } = await params;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'User ID is required and must be a string' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, avatar_url: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const tasks = await prisma.task.findMany({
      where: {
        assignments: {
          some: {
            userId: userId,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const recentTasks = await prisma.taskAssignment.findMany({
      where: { userId },
      include: {
        task: true,
      },
      orderBy: { assigned_at: 'desc' },
      take: 5,
    });

    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        due_date: {
          gt: new Date(),
        },
      },
      orderBy: { due_date: 'asc' },
      take: 3,
    });

    const activityData = [
      { day: 'Mon', tasks: 5 },
      { day: 'Tue', tasks: 8 },
      { day: 'Wed', tasks: 6 },
      { day: 'Thu', tasks: 9 },
      { day: 'Fri', tasks: 4 },
      { day: 'Sat', tasks: 3 },
      { day: 'Sun', tasks: 2 },
    ];

    return NextResponse.json({
      tasks,
      recentTasks: recentTasks.map(({ task }) => task),
      upcomingDeadlines,
      activityData,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}