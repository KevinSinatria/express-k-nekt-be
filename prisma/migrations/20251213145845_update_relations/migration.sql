/*
  Warnings:

  - You are about to drop the column `usersId` on the `teacher_assignments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."teacher_assignments" DROP CONSTRAINT "teacher_assignments_class_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_assignments" DROP CONSTRAINT "teacher_assignments_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_assignments" DROP CONSTRAINT "teacher_assignments_teacher_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_assignments" DROP CONSTRAINT "teacher_assignments_usersId_fkey";

-- AlterTable
ALTER TABLE "public"."teacher_assignments" DROP COLUMN "usersId";

-- AddForeignKey
ALTER TABLE "public"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_teacher_user_id_fkey" FOREIGN KEY ("teacher_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
