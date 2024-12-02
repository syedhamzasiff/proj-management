/*
  Warnings:

  - The values [LEAD] on the enum `ProjectRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [LEADER] on the enum `WorkspaceRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProjectRole_new" AS ENUM ('LEADER', 'MEMBER', 'VIEWER');
ALTER TABLE "project_workspace_members" ALTER COLUMN "projectRole" DROP DEFAULT;
ALTER TABLE "project_workspace_members" ALTER COLUMN "projectRole" TYPE "ProjectRole_new" USING ("projectRole"::text::"ProjectRole_new");
ALTER TYPE "ProjectRole" RENAME TO "ProjectRole_old";
ALTER TYPE "ProjectRole_new" RENAME TO "ProjectRole";
DROP TYPE "ProjectRole_old";
ALTER TABLE "project_workspace_members" ALTER COLUMN "projectRole" SET DEFAULT 'MEMBER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "WorkspaceRole_new" AS ENUM ('OWNER', 'MEMBER');
ALTER TABLE "project_workspace_members" ALTER COLUMN "workspaceRole" DROP DEFAULT;
ALTER TABLE "project_workspace_members" ALTER COLUMN "workspaceRole" TYPE "WorkspaceRole_new" USING ("workspaceRole"::text::"WorkspaceRole_new");
ALTER TYPE "WorkspaceRole" RENAME TO "WorkspaceRole_old";
ALTER TYPE "WorkspaceRole_new" RENAME TO "WorkspaceRole";
DROP TYPE "WorkspaceRole_old";
ALTER TABLE "project_workspace_members" ALTER COLUMN "workspaceRole" SET DEFAULT 'MEMBER';
COMMIT;
