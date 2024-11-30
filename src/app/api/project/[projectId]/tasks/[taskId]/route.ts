import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import { TaskPriority, TaskStatus } from '@prisma/client'; 

export async function PATCH(request: Request, { params }: { params: { projectId: string, taskId: string } }) {
  const { projectId, taskId } = await params;

  try {
    const body = await request.json();
    
    const { status, priority } = body;

    if (status && !Object.values(TaskStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status provided" }, { status: 400 });
    }

    if (priority && !["HIGH", "MEDIUM", "LOW"].includes(priority)) {
      return NextResponse.json(
        { error: "Invalid priority provided. Allowed values: 'HIGH', 'MEDIUM', 'LOW'." },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
        projectId: projectId,
      },
      data: {
        ...(status && { status: status as TaskStatus }),
        ...(priority && { priority: priority as TaskPriority }),
      },
    });


    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update task status' }, { status: 500 });
  }
}
