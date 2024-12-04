import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { WorkspaceRole, ProjectRole } from "@prisma/client";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(req: NextRequest) {
    try {
      const { token, userId } = await req.json();
  
      if (!userId) {
        return errorResponse("User ID is required for this action", 401);
      }
  
      // Find the invitation (workspace or project)
      const workspaceInvitation = await prisma.workspaceInvitation.findUnique({ where: { token } });
      const projectInvitation = await prisma.projectInvitation.findUnique({ where: { token } });
  
      const invitation = workspaceInvitation || projectInvitation;
  
      if (!invitation || invitation.status !== "ACTIVE") {
        return errorResponse("Invalid or expired invitation token");
      }
  
      // Type guard to differentiate between workspace and project invitations
      const isWorkspaceInvitation = (invitation: typeof workspaceInvitation | typeof projectInvitation): invitation is typeof workspaceInvitation => {
        return !!workspaceInvitation;
      };
  
      // Handle expiration
      if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
        if (isWorkspaceInvitation(invitation)) {
          await prisma.workspaceInvitation.update({
            where: { token },
            data: { status: "EXPIRED" },
          });
        } else {
          await prisma.projectInvitation.update({
            where: { token },
            data: { status: "EXPIRED" },
          });
        }
        return errorResponse("The invitation link has expired");
      }
  
      // Handle remaining uses
      if (invitation.remaining_uses <= 0) {
        if (isWorkspaceInvitation(invitation)) {
          await prisma.workspaceInvitation.update({
            where: { token },
            data: { status: "USED" },
          });
        } else {
          await prisma.projectInvitation.update({
            where: { token },
            data: { status: "USED" },
          });
        }
        return errorResponse("No remaining uses for this invitation");
      }
  
      // Add the user to the appropriate entity and decrement remaining uses
      await prisma.$transaction(async (tx) => {
        if (isWorkspaceInvitation(invitation)) {
          // Add user to workspace
          await tx.projectWorkspaceMember.create({
            data: {
              userId,
              workspaceId: invitation.workspaceId,
              workspaceRole: invitation.role as WorkspaceRole,
            },
          });
  
          // Decrement remaining uses for workspace invitation
          await tx.workspaceInvitation.update({
            where: { token },
            data: {
              remaining_uses: { decrement: 1 },
            },
          });
        } else {
          // Add user to project
          await tx.projectWorkspaceMember.create({
            data: {
              userId,
              projectId: invitation.projectId,
              projectRole: invitation.role as ProjectRole,
            },
          });
  
          // Decrement remaining uses for project invitation
          await tx.projectInvitation.update({
            where: { token },
            data: {
              remaining_uses: { decrement: 1 },
            },
          });
        }
      });
  
      return NextResponse.json({ success: true, message: "Joined successfully" });
    } catch (error) {
      console.error("Error handling invitation:", error);
      return errorResponse("Failed to process the request", 500);
    }
  }
  