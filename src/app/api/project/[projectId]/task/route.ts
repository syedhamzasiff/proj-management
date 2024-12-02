import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TaskPriority, TaskStatus } from "@/types";
import { TaskType } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = await params;

  if (!projectId) {
    return NextResponse.json({ success: false, error: "Project ID is missing" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { title, description, status, priority, dueDate, assignedUserIds, type } = body;

    if (!type || !["FEATURE", "BUG", "TASK"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'type' field. Allowed values: 'FEATURE', 'BUG', 'TASK'." },
        { status: 400 }
      );
    }

    if (!title || !priority || !["HIGH", "MEDIUM", "LOW"].includes(priority)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'priority' field. Allowed values: 'HIGH', 'MEDIUM', 'LOW'." },
        { status: 400 }
      );
    }

    if (dueDate && new Date(dueDate) < new Date()) {
      return NextResponse.json(
        { success: false, error: "'dueDate' cannot be in the past" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        status,
        priority: priority as TaskPriority,
        type: type as TaskType,
        due_date: dueDate ? new Date(dueDate) : null,
        assignments: assignedUserIds
      ? {
          create: assignedUserIds.map((userId: string) => ({ userId })),
        }
      : undefined,
  },
      include: {
        assignments: { 
          include: { 
            user: true 
          } 
        },
      },
    });

    task.assignments = task.assignments || []
    
    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred while creating the task. Please try again later." },
      { status: 500 }
    );
  }
}
