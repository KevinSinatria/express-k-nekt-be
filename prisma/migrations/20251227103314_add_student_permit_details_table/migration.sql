/*
  Warnings:

  - You are about to drop the column `student_nis` on the `student_permits` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."student_permits" DROP CONSTRAINT "student_permits_student_nis_fkey";

-- AlterTable
ALTER TABLE "public"."student_permits" DROP COLUMN "student_nis",
ADD COLUMN     "studentsNis" TEXT;

-- CreateTable
CREATE TABLE "public"."student_permit_details" (
    "id" SERIAL NOT NULL,
    "student_permit_id" INTEGER NOT NULL,
    "student_nis" TEXT NOT NULL,

    CONSTRAINT "student_permit_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."student_permits" ADD CONSTRAINT "student_permits_studentsNis_fkey" FOREIGN KEY ("studentsNis") REFERENCES "public"."students"("nis") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_permit_details" ADD CONSTRAINT "student_permit_details_student_permit_id_fkey" FOREIGN KEY ("student_permit_id") REFERENCES "public"."student_permits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_permit_details" ADD CONSTRAINT "student_permit_details_student_nis_fkey" FOREIGN KEY ("student_nis") REFERENCES "public"."students"("nis") ON DELETE RESTRICT ON UPDATE CASCADE;
