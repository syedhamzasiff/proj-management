import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TaskPriority, TaskStatus, TaskType } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: { projectId: string; taskId: string } }
) {
  const { projectId, taskId } = await params;

  try {
    const body = await request.json();

    // Validate Enums
    if (body.status && !Object.values(TaskStatus).includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 }
      );
    }
    if (body.type && !Object.values(TaskType).includes(body.type)) {
      return NextResponse.json(
        { error: "Invalid task type provided" },
        { status: 400 }
      );
    }
    if (body.priority && !Object.values(TaskPriority).includes(body.priority)) {
      return NextResponse.json(
        { error: "Invalid priority provided" },
        { status: 400 }
      );
    }

    // Validate Relationships
    if (body.parentTaskId) {
      const parentTask = await prisma.task.findUnique({
        where: { id: body.parentTaskId },
      });
      if (!parentTask) {
        return NextResponse.json(
          { error: "Invalid parent task ID provided" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.type && { type: body.type as TaskType }),
      ...(body.status && { status: body.status as TaskStatus }),
      ...(body.isCompleted !== undefined && { isCompleted: body.isCompleted }),
      ...(body.isPinned !== undefined && { isPinned: body.isPinned }),
      ...(body.priority && { priority: body.priority as TaskPriority }),
      ...(body.due_date && { due_date: new Date(body.due_date) }),
      ...(body.parentTaskId && { parentTaskId: body.parentTaskId }),
    };

    // Update the task
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
        projectId,
      },
      data: updateData,
    });

    // Handle Task Assignments if provided
    if (body.assignedUserIds) {
      // Remove existing assignments
      await prisma.taskAssignment.deleteMany({ where: { taskId } });

      // Add new assignments
      await prisma.taskAssignment.createMany({
        data: body.assignedUserIds.map((userId: string) => ({
          taskId,
          userId,
        })),
      });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
