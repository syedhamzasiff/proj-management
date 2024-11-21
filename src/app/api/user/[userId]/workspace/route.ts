import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, userId, type, members } = body;

    // Validate the input
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Workspace name is required and must be a string' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required and must be a string' },
        { status: 400 }
      );
    }

    if (type !== 'personal' && type !== 'shared') {
      return NextResponse.json(
        { error: "Type must be 'personal' or 'shared'" },
        { status: 400 }
      );
    }

    // Create the workspace
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description: description || null,
        members: {
          create: {
            userId,
            role: 'OWNER', // Assign the owner role to the creator
          },
        },
      },
    });

    // If it's a shared workspace, invite other members
    if (type === 'shared' && members && Array.isArray(members)) {
      await prisma.workspaceInvitation.createMany({
        data: members.map((email: string) => ({
          workspaceId: workspace.id,
          invitedEmail: email,
        })),
      });
    }

    return NextResponse.json(
      { message: 'Workspace created successfully', workspace },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}
