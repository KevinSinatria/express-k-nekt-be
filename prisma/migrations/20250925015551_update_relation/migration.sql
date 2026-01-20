-- DropForeignKey
ALTER TABLE "public"."violations" DROP CONSTRAINT "violations_ibfk_1";

-- DropIndex
DROP INDEX "public"."violations_student_id_key";

-- AddForeignKey
ALTER TABLE "public"."violations" ADD CONSTRAINT "violations_ibfk_1" FOREIGN KEY ("student_id") REFERENCES "public"."detail_students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
