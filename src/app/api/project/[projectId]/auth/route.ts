import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { isAuth, userId } = await verifySession();

  if (!isAuth || !userId) {
    return NextResponse.json({ authorized: false }, { status: 401 });
  }

  const { projectId } = await params;

  try {
    // Check if the user is the leader for the project
    const isAuthorized = await prisma.projectWorkspaceMember.findFirst({
      where: {
        userId,
        projectId,
        projectRole: 'LEADER',
      },
    });

    return NextResponse.json({ authorized: !!isAuthorized });
  } catch (error) {
    console.error('Error verifying roles:', error);
    return NextResponse.json(
      { authorized: false, error: 'Failed to verify roles' },
      { status: 500 }
    );
  }
}
