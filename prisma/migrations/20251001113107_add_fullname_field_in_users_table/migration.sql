/*
  Warnings:

  - A unique constraint covering the columns `[nis,id_year_period]` on the table `detail_students` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."nis";

-- DropIndex
DROP INDEX "public"."nis_2";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "fullname" TEXT NOT NULL DEFAULT 'nama default';

-- CreateIndex
CREATE INDEX "detail_students_year_period_foreign" ON "public"."detail_students"("id_year_period");

-- CreateIndex
CREATE UNIQUE INDEX "unique_student_year" ON "public"."detail_students"("nis", "id_year_period");
