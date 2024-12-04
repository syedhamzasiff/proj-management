/*
  Warnings:

  - You are about to drop the `project_invitation_links` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workspace_invitation_links` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "project_invitation_links" DROP CONSTRAINT "project_invitation_links_projectId_fkey";

-- DropForeignKey
ALTER TABLE "workspace_invitation_links" DROP CONSTRAINT "workspace_invitation_links_workspaceId_fkey";

-- DropTable
DROP TABLE "project_invitation_links";

-- DropTable
DROP TABLE "workspace_invitation_links";

-- CreateTable
CREATE TABLE "workspace_invitations" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "status" "InvitationStatus" NOT NULL DEFAULT 'ACTIVE',
    "usage_limit" INTEGER NOT NULL DEFAULT 1,
    "remaining_uses" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "workspace_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_invitations" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "ProjectRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "status" "InvitationStatus" NOT NULL DEFAULT 'ACTIVE',
    "usage_limit" INTEGER NOT NULL DEFAULT 1,
    "remaining_uses" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "project_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_invitations_token_key" ON "workspace_invitations"("token");

-- CreateIndex
CREATE INDEX "workspace_invitations_token_status_idx" ON "workspace_invitations"("token", "status");

-- CreateIndex
CREATE UNIQUE INDEX "project_invitations_token_key" ON "project_invitations"("token");

-- CreateIndex
CREATE INDEX "project_invitations_token_status_idx" ON "project_invitations"("token", "status");

-- AddForeignKey
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_invitations" ADD CONSTRAINT "project_invitations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
