-- DropForeignKey
ALTER TABLE "public"."violations" DROP CONSTRAINT "violations_ibfk_4";

-- DropIndex
DROP INDEX "public"."violations_nis_key";

-- AlterTable
ALTER TABLE "public"."students" ADD COLUMN     "violationsId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_violationsId_fkey" FOREIGN KEY ("violationsId") REFERENCES "public"."violations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
