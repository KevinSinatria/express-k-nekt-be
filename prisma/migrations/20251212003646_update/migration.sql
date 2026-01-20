-- CreateEnum
CREATE TYPE "public"."student_permit_status" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "nip" TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."subjects" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."piket_schedules" (
    "id" SERIAL NOT NULL,
    "teacher_user_id" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,

    CONSTRAINT "piket_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teacher_assignments" (
    "id" SERIAL NOT NULL,
    "teacher_user_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "assignment_details" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "usersId" INTEGER,

    CONSTRAINT "teacher_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_permits" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "hours_start" INTEGER NOT NULL,
    "hours_end" INTEGER,
    "status" "public"."student_permit_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "student_nis" TEXT NOT NULL,
    "piket_user_id" INTEGER NOT NULL,
    "mapel_user_id" INTEGER NOT NULL,
    "usersId" INTEGER,

    CONSTRAINT "student_permits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."piket_schedules" ADD CONSTRAINT "piket_schedules_teacher_user_id_fkey" FOREIGN KEY ("teacher_user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_teacher_user_id_fkey" FOREIGN KEY ("teacher_user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_permits" ADD CONSTRAINT "student_permits_student_nis_fkey" FOREIGN KEY ("student_nis") REFERENCES "public"."students"("nis") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_permits" ADD CONSTRAINT "student_permits_piket_user_id_fkey" FOREIGN KEY ("piket_user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_permits" ADD CONSTRAINT "student_permits_mapel_user_id_fkey" FOREIGN KEY ("mapel_user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_permits" ADD CONSTRAINT "student_permits_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
