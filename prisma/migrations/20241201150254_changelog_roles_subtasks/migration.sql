/*
  Warnings:

  - The values [LEADER] on the enum `ProjectRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('FEATURE', 'BUG', 'TASK');

-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('USER', 'SYSTEM');

-- AlterEnum
BEGIN;
CREATE TYPE "ProjectRole_new" AS ENUM ('LEAD', 'MEMBER', 'VIEWER');
ALTER TABLE "project_workspace_members" ALTER COLUMN "projectRole" DROP DEFAULT;
ALTER TABLE "project_workspace_members" ALTER COLUMN "projectRole" TYPE "ProjectRole_new" USING ("projectRole"::text::"ProjectRole_new");
ALTER TYPE "ProjectRole" RENAME TO "ProjectRole_old";
ALTER TYPE "ProjectRole_new" RENAME TO "ProjectRole";
DROP TYPE "ProjectRole_old";
ALTER TABLE "project_workspace_members" ALTER COLUMN "projectRole" SET DEFAULT 'MEMBER';
COMMIT;

-- AlterEnum
ALTER TYPE "WorkspaceRole" ADD VALUE 'OWNER';

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_taskId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_userId_fkey";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "parentTaskId" TEXT,
ADD COLUMN     "type" "TaskType" NOT NULL;

-- DropTable
DROP TABLE "comments";

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "type" "CommentType" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "changelogs" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "completedBy" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "changelogs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changelogs" ADD CONSTRAINT "changelogs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changelogs" ADD CONSTRAINT "changelogs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changelogs" ADD CONSTRAINT "changelogs_completedBy_fkey" FOREIGN KEY ("completedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
