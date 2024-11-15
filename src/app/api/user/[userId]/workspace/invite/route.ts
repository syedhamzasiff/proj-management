import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(request: Request, { params }: { params: { userId: string } }) {
    try {
      const { userId } = params;
      const { invitationId } = await request.json();
  
      if (!invitationId) {
        return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
      }
  
      // Validate invitation
      const invitation = await prisma.workspaceInvitation.findUnique({
        where: { id: invitationId },
        include: { workspace: true },
      });
  
      if (!invitation || invitation.status !== 'PENDING') {
        return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 400 });
      }
  
      // Add the user to the workspace
      await prisma.projectWorkspaceMember.create({
        data: {
          userId,
          workspaceId: invitation.workspaceId,
          role: 'MEMBER',
        },
      });
  
      // Mark the invitation as accepted
      await prisma.workspaceInvitation.update({
        where: { id: invitationId },
        data: { status: 'ACCEPTED' },
      });
  
      return NextResponse.json({ message: 'Successfully joined the workspace' }, { status: 200 });
    } catch (error) {
      console.error('Error joining workspace:', error);
      return NextResponse.json({ error: 'Failed to join workspace' }, { status: 500 });
    }
  }
  