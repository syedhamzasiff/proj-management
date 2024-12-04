/*
  Warnings:

  - You are about to drop the `workspace_invitations` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "InvitationType" AS ENUM ('WORKSPACE', 'PROJECT');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED');

-- DropForeignKey
ALTER TABLE "workspace_invitations" DROP CONSTRAINT "workspace_invitations_workspaceId_fkey";

-- DropTable
DROP TABLE "workspace_invitations";

-- CreateTable
CREATE TABLE "workspace_invitation_links" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "status" "InvitationStatus" NOT NULL DEFAULT 'ACTIVE',
    "usage_limit" INTEGER NOT NULL DEFAULT 1,
    "remaining_uses" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "workspace_invitation_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_invitation_links" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "status" "InvitationStatus" NOT NULL DEFAULT 'ACTIVE',
    "usage_limit" INTEGER NOT NULL DEFAULT 1,
    "remaining_uses" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "project_invitation_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_invitation_links_token_key" ON "workspace_invitation_links"("token");

-- CreateIndex
CREATE INDEX "workspace_invitation_links_token_status_idx" ON "workspace_invitation_links"("token", "status");

-- CreateIndex
CREATE UNIQUE INDEX "project_invitation_links_token_key" ON "project_invitation_links"("token");

-- CreateIndex
CREATE INDEX "project_invitation_links_token_status_idx" ON "project_invitation_links"("token", "status");

-- AddForeignKey
ALTER TABLE "workspace_invitation_links" ADD CONSTRAINT "workspace_invitation_links_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_invitation_links" ADD CONSTRAINT "project_invitation_links_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
