/*
  Warnings:

  - You are about to drop the column `end_date` on the `projects` table. All the data in the column will be lost.
  - Changed the type of `priority` on the `tasks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "end_date";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "priority",
ADD COLUMN     "priority" "TaskPriority" NOT NULL;
