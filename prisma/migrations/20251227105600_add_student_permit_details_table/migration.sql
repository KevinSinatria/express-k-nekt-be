-- DropForeignKey
ALTER TABLE "public"."student_permit_details" DROP CONSTRAINT "student_permit_details_student_permit_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."student_permit_details" ADD CONSTRAINT "student_permit_details_student_permit_id_fkey" FOREIGN KEY ("student_permit_id") REFERENCES "public"."student_permits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
