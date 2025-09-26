/*
  Warnings:

  - The primary key for the `students` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."detail_students" DROP CONSTRAINT "detail_students_ibfk_1";

-- DropForeignKey
ALTER TABLE "public"."violations" DROP CONSTRAINT "violations_nis_fkey";

-- AlterTable
ALTER TABLE "public"."detail_students" ALTER COLUMN "nis" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."students" DROP CONSTRAINT "students_pkey",
ALTER COLUMN "nis" DROP DEFAULT,
ALTER COLUMN "nis" SET DATA TYPE TEXT,
ADD CONSTRAINT "students_pkey" PRIMARY KEY ("nis");
DROP SEQUENCE "students_nis_seq";

-- AlterTable
ALTER TABLE "public"."violations" ALTER COLUMN "nis" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "public"."detail_students" ADD CONSTRAINT "detail_students_ibfk_1" FOREIGN KEY ("nis") REFERENCES "public"."students"("nis") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."violations" ADD CONSTRAINT "violations_nis_fkey" FOREIGN KEY ("nis") REFERENCES "public"."students"("nis") ON DELETE CASCADE ON UPDATE CASCADE;
