import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, userId, type = 'personal' } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Workspace name is required and must be a string' }, { status: 400 });
    }
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'User ID is required and must be a string' }, { status: 400 });
    }
    if (type !== 'personal' && type !== 'shared') {
      return NextResponse.json({ error: "Type must be 'personal' or 'shared'" }, { status: 400 });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description: description || null,
        members: {
          create: {
            userId,
            workspaceRole: 'OWNER',
          },
        }, 
      },
    });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}
