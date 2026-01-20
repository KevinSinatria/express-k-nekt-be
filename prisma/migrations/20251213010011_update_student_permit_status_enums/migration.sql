/*
  Warnings:

  - You are about to drop the column `usersId` on the `student_permits` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."student_permits" DROP CONSTRAINT "student_permits_usersId_fkey";

-- AlterTable
ALTER TABLE "public"."student_permits" DROP COLUMN "usersId";
