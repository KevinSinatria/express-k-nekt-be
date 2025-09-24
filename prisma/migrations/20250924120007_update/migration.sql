/*
  Warnings:

  - You are about to drop the column `id_year` on the `detail_students` table. All the data in the column will be lost.
  - You are about to drop the `years` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nis,id_class]` on the table `detail_students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_id]` on the table `violations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nis]` on the table `violations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nis` to the `violations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."detail_students" DROP CONSTRAINT "detail_students_id_year_fkey";

-- DropIndex
DROP INDEX "public"."detail_students_id_year_foreign";

-- DropIndex
DROP INDEX "public"."nis_2";

-- AlterTable
ALTER TABLE "public"."detail_students" DROP COLUMN "id_year",
ADD COLUMN     "id_year_period" SMALLINT NOT NULL DEFAULT 1,
ADD COLUMN     "year_periodId" INTEGER;

-- AlterTable
ALTER TABLE "public"."violations" ADD COLUMN     "nis" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."years";

-- CreateTable
CREATE TABLE "public"."year_period" (
    "id" SMALLSERIAL NOT NULL,
    "start_year" INTEGER NOT NULL DEFAULT 2025,
    "end_year" INTEGER NOT NULL DEFAULT 2026,
    "display_name" TEXT NOT NULL DEFAULT 'Tahun Ajaran 2025/2026',

    CONSTRAINT "year_period_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "year_period_display_name_key" ON "public"."year_period"("display_name");

-- CreateIndex
CREATE UNIQUE INDEX "nis_2" ON "public"."detail_students"("nis", "id_class");

-- CreateIndex
CREATE UNIQUE INDEX "violations_student_id_key" ON "public"."violations"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "violations_nis_key" ON "public"."violations"("nis");

-- CreateIndex
CREATE INDEX "student_nis" ON "public"."violations"("nis");

-- AddForeignKey
ALTER TABLE "public"."detail_students" ADD CONSTRAINT "detail_students_year_periodId_fkey" FOREIGN KEY ("year_periodId") REFERENCES "public"."year_period"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."violations" ADD CONSTRAINT "violations_ibfk_4" FOREIGN KEY ("nis") REFERENCES "public"."students"("nis") ON DELETE CASCADE ON UPDATE CASCADE;
