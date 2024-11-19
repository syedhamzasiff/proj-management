import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = await params;

  if (!projectId) {
    return NextResponse.json({ success: false, error: "Project ID is missing" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { title, description, status, priority, dueDate, assignedUserIds } = body;

    if (!title || priority == null || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: 'title', 'priority', or 'status'" },
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
        priority,
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

    console.log(task)

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred while creating the task. Please try again later." },
      { status: 500 }
    );
  }
}
