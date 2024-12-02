import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { projectId: string; taskId: string } }) {
  const { projectId, taskId } = await params;
  const { title, description, priority, due_date, type } = await req.json(); // Extracting input data from the request body

  try {
    // Create the subtask
    const subtask = await prisma.task.create({
      data: {
        projectId,
        parentTaskId: taskId, // Associate this task as a subtask of the parent task
        title,
        description,
        priority,
        due_date,
        type,
      },
    });

    return NextResponse.json({ data: subtask }, { status: 201 });
  } catch (error) {
    console.error("Error creating subtask:", error);
    return NextResponse.json({ error: "Failed to create subtask" }, { status: 500 });
  }
}
