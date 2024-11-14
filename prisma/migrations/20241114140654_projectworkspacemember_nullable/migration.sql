-- DropForeignKey
ALTER TABLE "project_workspace_members" DROP CONSTRAINT "project_workspace_members_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_workspace_members" DROP CONSTRAINT "project_workspace_members_workspaceId_fkey";

-- AlterTable
ALTER TABLE "project_workspace_members" ALTER COLUMN "workspaceId" DROP NOT NULL,
ALTER COLUMN "projectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "project_workspace_members" ADD CONSTRAINT "project_workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_workspace_members" ADD CONSTRAINT "project_workspace_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
