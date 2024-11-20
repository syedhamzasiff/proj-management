import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 


export async function GET(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = await params;

  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true
          },
        },
      },
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
  }
}
