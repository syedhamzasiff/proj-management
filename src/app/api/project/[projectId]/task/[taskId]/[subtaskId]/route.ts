import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { projectId: string; taskId: string; subtaskId: string } }) {
  const { projectId, taskId, subtaskId } = await params;
  const { title, description, priority, due_date, status, type } = await req.json(); // Extracting updated data

  try {
    // Update the subtask
    const updatedSubtask = await prisma.task.update({
      where: { id: subtaskId },
      data: {
        title,
        description,
        priority,
        due_date,
        status, // Update the status of the subtask if provided
        type,
      },
    });

    return NextResponse.json({ data: updatedSubtask });
  } catch (error) {
    console.error("Error updating subtask:", error);
    return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 });
  }
}
