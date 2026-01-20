/*
  Warnings:

  - The values [pending,approved,rejected] on the enum `student_permit_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."student_permit_status_new" AS ENUM ('PENDING_MAPEL', 'PENDING_PIKET', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."student_permits" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."student_permits" ALTER COLUMN "status" TYPE "public"."student_permit_status_new" USING ("status"::text::"public"."student_permit_status_new");
ALTER TYPE "public"."student_permit_status" RENAME TO "student_permit_status_old";
ALTER TYPE "public"."student_permit_status_new" RENAME TO "student_permit_status";
DROP TYPE "public"."student_permit_status_old";
ALTER TABLE "public"."student_permits" ALTER COLUMN "status" SET DEFAULT 'PENDING_MAPEL';
COMMIT;

-- AlterTable
ALTER TABLE "public"."student_permits" ALTER COLUMN "status" SET DEFAULT 'PENDING_MAPEL';
