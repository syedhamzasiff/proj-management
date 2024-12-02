import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth'; // Your custom auth functions
import { TaskStatus, TaskType, TaskPriority } from '@prisma/client';

// GET: Fetch backlog tasks for a specific project
export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { isAuth, userId } = await verifySession();
  if (!isAuth || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { projectId } = await params;

  try {
    const projectMember = await prisma.projectWorkspaceMember.findFirst({
      where: {
        userId,
        projectId,
        projectRole: 'LEADER',
      },
    });

    if (!projectMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
        assignments: {
          select: {
            userId: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json({ tasks: backlogTasks || [] });
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
  try {
    // Verify user session
    const { isAuth, userId } = await verifySession();
    if (!isAuth || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = params;
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Check if the user is a project leader
    const projectMember = await prisma.projectWorkspaceMember.findFirst({
      where: {
        userId,
        projectId,
        projectRole: 'LEADER',
      },
    });

    if (!projectMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const { tasks } = body;

    if (!Array.isArray(tasks)) {
      return NextResponse.json({ error: 'Invalid tasks format' }, { status: 400 });
    }

    // Fetch existing tasks for the project
    const existingTasks = await prisma.task.findMany({
      where: { projectId },
    });

    // Determine tasks to delete
    const submittedTaskIds = tasks
      .map((task: any) => task.id)
      .filter(Boolean); // Ignore new tasks with no ID
    const taskIdsToDelete = existingTasks
      .filter((task) => !submittedTaskIds.includes(task.id))
      .map((task) => task.id);

    if (taskIdsToDelete.length > 0) {
      // Delete related task assignments
      await prisma.taskAssignment.deleteMany({
        where: { taskId: { in: taskIdsToDelete } },
      });

      // Delete tasks
      await prisma.task.deleteMany({
        where: { id: { in: taskIdsToDelete } },
      });
    }

    // Upsert tasks
    const updatedTasks = await prisma.$transaction(
      tasks.map((task: any) => {
        if (!task.title || !task.type || !task.priority || !task.status) {
          throw new Error(`Task with ID ${task.id || 'new'} is missing required fields.`);
        }

        return prisma.task.upsert({
          where: { id: task.id || '' }, // If no ID, attempt to create
          update: {
            title: task.title,
            description: task.description || '',
            type: task.type as TaskType,
            priority: task.priority as TaskPriority,
            status: task.status as TaskStatus,
          },
          create: {
            projectId,
            title: task.title,
            description: task.description || '',
            type: task.type as TaskType,
            priority: task.priority as TaskPriority,
            status: task.status as TaskStatus,
          },
        });
      })
    );

    // Return updated tasks
    return NextResponse.json({ tasks: updatedTasks });
  } catch (error: any) {
    console.error('Error updating backlog tasks:', error.message);

    if (error instanceof Error && error.message.includes('missing required fields')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to update backlog tasks' },
      { status: 500 }
    );
  }
}
