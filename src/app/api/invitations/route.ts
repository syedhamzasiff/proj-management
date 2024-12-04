import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { WorkspaceRole, ProjectRole } from "@prisma/client";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const { type, targetId, role, expiresAt, usageLimit } = await req.json();
    const BASE_URL =  "http://localhost:3000/";

    // Validate type and role
    if (!["WORKSPACE", "PROJECT"].includes(type)) {
      return errorResponse("Invalid invitation type");
    }
    if (!targetId) {
      return errorResponse("Target ID is required");
    }

    const isWorkspace = type === "WORKSPACE";
    const validRoles = isWorkspace ? WorkspaceRole : ProjectRole;
    if (!Object.values(validRoles).includes(role)) {
      return errorResponse(`Invalid ${type.toLowerCase()} role`);
    }

    // Verify target existence
    const targetExists = isWorkspace
      ? await prisma.workspace.findUnique({ where: { id: targetId } })
      : await prisma.project.findUnique({ where: { id: targetId } });

    if (!targetExists) {
      return errorResponse(`${type} not found`, 404);
    }

    const token = crypto.randomUUID();
    const invitation = await prisma.$transaction(async (tx) => {
      const data = {
        token,
        role,
        expires_at: expiresAt ? new Date(expiresAt) : null,
        usage_limit: usageLimit || 1,
        remaining_uses: usageLimit || 1,
      };
      return isWorkspace
        ? tx.workspaceInvitation.create({
            data: { ...data, workspaceId: targetId },
          })
        : tx.projectInvitation.create({
            data: { ...data, projectId: targetId },
          });
    });

    return NextResponse.json({
      link: `${BASE_URL}/join?token=${token}`,
      expiresAt: invitation.expires_at,
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return errorResponse("Failed to create invitation link", 500);
  }
}
