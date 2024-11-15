import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { workspaceId, name, description, status, startDate, endDate } = await request.json();

    if (!workspaceId || typeof workspaceId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing workspaceId' },
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

    if (!startDate || isNaN(Date.parse(startDate))) {
      return NextResponse.json(
        { error: 'Invalid or missing startDate' },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (description && typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Invalid description' },
        { status: 400 }
      );
    }

    if (endDate && isNaN(Date.parse(endDate))) {
      return NextResponse.json(
        { error: 'Invalid endDate' },
        { status: 400 }
      );
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        workspaceId,
        name,
        description: description || null,
        status,
        start_date: new Date(startDate),
        end_date: endDate ? new Date(endDate) : null,
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
          endDate: project.end_date?.toISOString() || null,
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