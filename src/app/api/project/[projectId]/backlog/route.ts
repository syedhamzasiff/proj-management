import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth'; // Use your own auth functions
import { TaskStatus, TaskType, TaskPriority } from '@prisma/client';

// GET: Fetch backlog tasks for a specific project
export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  // Verify the session using your custom auth function
  const { isAuth, userId } = await verifySession();
  if (!isAuth || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { projectId } = params;

  try {
    // Check if the user is a project member with the required roles
    const projectMember = await prisma.projectWorkspaceMember.findFirst({
      where: {
        userId,
        projectId,
        projectRole: { in: ['LEAD', 'MEMBER'] },
      },
    });

    if (!projectMember) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch backlog tasks
    const backlogTasks = await prisma.task.findMany({
      where: {
        projectId,
        status: TaskStatus.BACKLOG,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        priority: true,
        status: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return NextResponse.json({ tasks: backlogTasks });
  } catch (error) {
    console.error('Error fetching backlog tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backlog tasks' },
      { status: 500 }
    );
  }
}

// PUT: Update backlog tasks for a specific project
export async function PUT(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  // Verify the session using your custom auth function
  const { isAuth, userId } = await verifySession();
  if (!isAuth || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { projectId } = params;

  try {
    // Check if the user is a project member with the required roles
    const projectMember = await prisma.projectWorkspaceMember.findFirst({
      where: {
        userId,
        projectId,
        projectRole: { in: ['LEAD', 'MEMBER'] },
      },
    });

    if (!projectMember) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { tasks } = await request.json();

    // Update or create tasks using Prisma transactions
    const updatedTasks = await prisma.$transaction(
      tasks.map((task: any) =>
        prisma.task.upsert({
          where: { id: task.id || 'new-id' },
          update: {
            title: task.title,
            description: task.description,
            type: task.type as TaskType,
            priority: task.priority as TaskPriority,
            status: task.status as TaskStatus,
          },
          create: {
            projectId,
            title: task.title,
            description: task.description,
            type: task.type as TaskType,
            priority: task.priority as TaskPriority,
            status: task.status as TaskStatus,
          },
        })
      )
    );

    return NextResponse.json({ tasks: updatedTasks });
  } catch (error) {
    console.error('Error updating backlog tasks:', error);
    return NextResponse.json(
      { error: 'Failed to update backlog tasks' },
      { status: 500 }
    );
  }
}
