import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'User ID is required and must be a string' }, { status: 400 });
    }

    // Query workspaces that the user is a member of
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId }  // Only workspaces where the user is a member
        }
      },
      include: {
        members: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                avatar_url: true,
              }
            }
          }
        }
      }
    });

    // Format the response to match your desired structure
    const responseWorkspaces = workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      members: workspace.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        avatarUrl: member.user.avatar_url || '',
      })),
      isPersonal: workspace.members.length === 1,  // Assuming personal workspace has one member
    }));

    return NextResponse.json(responseWorkspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
  }
}