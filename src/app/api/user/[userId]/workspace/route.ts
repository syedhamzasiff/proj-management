import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    const body = await request.json();
    const { name, description, type, members } = body;

    if (!name || !type || (type !== 'personal' && type !== 'shared')) {
      return NextResponse.json(
        { error: 'Invalid input. Provide name, description, and type (personal/shared).' },
        { status: 400 }
      );
    }

    // Create the workspace
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        members: {
          create: [
            {
              userId,
              role: 'OWNER',
            },
          ],
        },
      },
    });

    if (type === 'shared' && members && Array.isArray(members)) {
      // Create invitations for members
      await prisma.workspaceInvitation.createMany({
        data: members.map((email: string) => ({
          workspaceId: workspace.id,
          invitedEmail: email,
        })),
      });
    }

    return NextResponse.json({ message: 'Workspace created successfully', workspace }, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}
