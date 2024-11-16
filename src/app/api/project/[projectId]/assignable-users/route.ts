import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = await params;

  try {
    // Check if the project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const workspaceId = project.workspaceId;

    // Fetch users assigned either via workspace or directly to the project
    const workspaceMembers = workspaceId
      ? await prisma.projectWorkspaceMember.findMany({
          where: { workspaceId },
          include: { user: true },
        })
      : [];

    const projectMembers = await prisma.projectWorkspaceMember.findMany({
      where: { projectId },
      include: { user: true },
    });

    // Combine and deduplicate users from both sources
    const allMembers = [...workspaceMembers, ...projectMembers];
    const uniqueUsers = Array.from(
      new Map(allMembers.map((member) => [member.userId, member.user]))
    ).map(([_, user]) => user);

    return NextResponse.json({ users: uniqueUsers });
  } catch (error: any) {
    console.error("Error fetching assignable users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
