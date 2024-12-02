// app/api/workspaces/[workspaceId]/project/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId, name, description, status } = await request.json();
    const workspaceId = params.workspaceId;

    if (!workspaceId || typeof workspaceId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing workspaceId' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing userId' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing name' },
        { status: 400 }
      );
    }

    if (!status || typeof status !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing status' },
        { status: 400 }
      );
    }

    const startDate = new Date();

    // Validate optional fields
    if (description && typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Invalid description' },
        { status: 400 }
      );
    }

    // Create the project and assign the creator as Project Leader
    const project = await prisma.project.create({
      data: {
        workspaceId,
        name,
        description: description || null,
        status,
        start_date: startDate,
      },
    });

    // Assign the creator as the Project Leader
    await prisma.projectWorkspaceMember.create({
      data: {
        userId,
        projectId: project.id,
        workspaceRole: 'OWNER',
        projectRole: 'LEADER',
        joined_at: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: 'Project created successfully',
        project: {
          id: project.id,
          workspaceId: project.workspaceId,
          name: project.name,
          description: project.description,
          status: project.status,
          startDate: project.start_date.toISOString(),
          createdAt: project.created_at.toISOString(),
          updatedAt: project.updated_at.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
