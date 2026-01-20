/*
  Warnings:

  - You are about to drop the column `violationsId` on the `students` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."students" DROP CONSTRAINT "students_violationsId_fkey";

-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "violationsId";

-- AddForeignKey
ALTER TABLE "public"."violations" ADD CONSTRAINT "violations_nis_fkey" FOREIGN KEY ("nis") REFERENCES "public"."students"("nis") ON DELETE CASCADE ON UPDATE CASCADE;
