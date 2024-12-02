import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { projectId: string; taskId: string } }) {
  const { projectId, taskId } = await params;
  const { userId, content, parentCommentId, type } = await req.json(); // Extracting input data

  try {
    // Create a new comment
    const comment = await prisma.comment.create({
      data: {
        taskId,
        userId,
        content,
        parentCommentId, // Optional: for threaded comments
        type: type || "USER", // Default to "USER" comment type
      },
    });

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
