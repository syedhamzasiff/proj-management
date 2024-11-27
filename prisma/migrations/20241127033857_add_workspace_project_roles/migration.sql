/*
  Warnings:

  - You are about to drop the column `role` on the `project_workspace_members` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('LEADER', 'MEMBER');

-- AlterTable
ALTER TABLE "project_workspace_members" DROP COLUMN "role",
ADD COLUMN     "projectRole" "ProjectRole" NOT NULL DEFAULT 'MEMBER',
ADD COLUMN     "workspaceRole" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER';
