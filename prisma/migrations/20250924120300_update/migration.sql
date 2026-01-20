/*
  Warnings:

  - You are about to drop the column `year_periodId` on the `detail_students` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."detail_students" DROP CONSTRAINT "detail_students_year_periodId_fkey";

-- AlterTable
ALTER TABLE "public"."detail_students" DROP COLUMN "year_periodId";

-- AddForeignKey
ALTER TABLE "public"."detail_students" ADD CONSTRAINT "detail_students_id_year_period_fkey" FOREIGN KEY ("id_year_period") REFERENCES "public"."year_period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
