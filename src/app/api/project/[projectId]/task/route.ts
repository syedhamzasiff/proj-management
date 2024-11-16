import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = await params;

  try {
    const body = await req.json();
    const { title, description, status, priority, dueDate, assignedUserIds } = body;

    if (!title || priority == null || !status) {
      return NextResponse.json({ error: "Missing required fields: title, priority, or status" }, { status: 400 });
    }

    if (assignedUserIds && !Array.isArray(assignedUserIds)) {
      return NextResponse.json({ error: "'assignedUserIds' must be an array of user IDs" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
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
              create: assignedUserIds.map((userId: string) => ({
                userId,
              })),
            }
          : undefined,
      },
      include: {
        assignments: true, 
      },
    });

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "An error occurred while creating the task" }, { status: 500 });
  }
}
