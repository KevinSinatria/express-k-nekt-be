-- CreateEnum
CREATE TYPE "public"."users_role" AS ENUM ('admin', 'kesiswaan');

-- CreateTable
CREATE TABLE "public"."cache" (
    "key" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    "expiration" INTEGER NOT NULL,

    CONSTRAINT "cache_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."cache_locks" (
    "key" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255) NOT NULL,
    "expiration" INTEGER NOT NULL,

    CONSTRAINT "cache_locks_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."classes" (
    "id" SERIAL NOT NULL,
    "class" VARCHAR(50) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."detail_students" (
    "id" SERIAL NOT NULL,
    "nis" INTEGER NOT NULL,
    "id_year" SMALLINT NOT NULL,
    "id_class" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "detail_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."failed_jobs" (
    "id" SERIAL NOT NULL,
    "uuid" VARCHAR(255) NOT NULL,
    "connection" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "exception" TEXT NOT NULL,
    "failed_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_batches" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "total_jobs" INTEGER NOT NULL,
    "pending_jobs" INTEGER NOT NULL,
    "failed_jobs" INTEGER NOT NULL,
    "failed_job_ids" TEXT NOT NULL,
    "options" TEXT,
    "cancelled_at" INTEGER,
    "created_at" INTEGER NOT NULL,
    "finished_at" INTEGER,

    CONSTRAINT "job_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jobs" (
    "id" SERIAL NOT NULL,
    "queue" VARCHAR(255) NOT NULL,
    "payload" TEXT NOT NULL,
    "attempts" SMALLINT NOT NULL,
    "reserved_at" INTEGER,
    "available_at" INTEGER NOT NULL,
    "created_at" INTEGER NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_reset_tokens" (
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0),

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "public"."personal_access_tokens" (
    "id" SERIAL NOT NULL,
    "tokenable_type" VARCHAR(255) NOT NULL,
    "tokenable_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "abilities" TEXT,
    "last_used_at" TIMESTAMP(0),
    "expires_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "personal_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" INTEGER,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "payload" TEXT NOT NULL,
    "last_activity" INTEGER NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."students" (
    "nis" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "point" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("nis")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "public"."users_role" NOT NULL DEFAULT 'kesiswaan',
    "api_token" VARCHAR(255),
    "remember_token" VARCHAR(255),
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."violation_categories" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "violation_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."violation_category" (
    "id" SMALLSERIAL NOT NULL,
    "name" VARCHAR(25) NOT NULL,

    CONSTRAINT "violation_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."violation_type" (
    "id" SMALLSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "point" SMALLINT NOT NULL,
    "punishment" VARCHAR(50) NOT NULL,
    "category_id" SMALLINT NOT NULL,

    CONSTRAINT "violation_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."violations" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "type_id" SMALLINT NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "implemented" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."years" (
    "id" SMALLSERIAL NOT NULL,
    "year" VARCHAR(10) NOT NULL,

    CONSTRAINT "years_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "classes_class_unique" ON "public"."classes"("class");

-- CreateIndex
CREATE UNIQUE INDEX "detail_students_nis_key" ON "public"."detail_students"("nis");

-- CreateIndex
CREATE INDEX "detail_students_id_class_foreign" ON "public"."detail_students"("id_class");

-- CreateIndex
CREATE INDEX "detail_students_id_year_foreign" ON "public"."detail_students"("id_year");

-- CreateIndex
CREATE INDEX "nis" ON "public"."detail_students"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "nis_2" ON "public"."detail_students"("nis", "id_year", "id_class");

-- CreateIndex
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" ON "public"."failed_jobs"("uuid");

-- CreateIndex
CREATE INDEX "jobs_queue_index" ON "public"."jobs"("queue");

-- CreateIndex
CREATE UNIQUE INDEX "personal_access_tokens_token_unique" ON "public"."personal_access_tokens"("token");

-- CreateIndex
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_index" ON "public"."personal_access_tokens"("tokenable_type", "tokenable_id");

-- CreateIndex
CREATE INDEX "sessions_last_activity_index" ON "public"."sessions"("last_activity");

-- CreateIndex
CREATE INDEX "sessions_user_id_index" ON "public"."sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "username" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "api_token" ON "public"."users"("api_token");

-- CreateIndex
CREATE INDEX "category_id" ON "public"."violation_type"("category_id");

-- CreateIndex
CREATE INDEX "student_id" ON "public"."violations"("student_id");

-- CreateIndex
CREATE INDEX "teacher_id" ON "public"."violations"("teacher_id");

-- CreateIndex
CREATE INDEX "type_id" ON "public"."violations"("type_id");

-- CreateIndex
CREATE UNIQUE INDEX "years_year_unique" ON "public"."years"("year");

-- AddForeignKey
ALTER TABLE "public"."detail_students" ADD CONSTRAINT "detail_students_ibfk_1" FOREIGN KEY ("nis") REFERENCES "public"."students"("nis") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detail_students" ADD CONSTRAINT "detail_students_id_class_fkey" FOREIGN KEY ("id_class") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detail_students" ADD CONSTRAINT "detail_students_id_year_fkey" FOREIGN KEY ("id_year") REFERENCES "public"."years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."violation_type" ADD CONSTRAINT "violation_type_ibfk_1" FOREIGN KEY ("category_id") REFERENCES "public"."violation_category"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."violations" ADD CONSTRAINT "violations_ibfk_1" FOREIGN KEY ("student_id") REFERENCES "public"."detail_students"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."violations" ADD CONSTRAINT "violations_ibfk_2" FOREIGN KEY ("type_id") REFERENCES "public"."violation_type"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."violations" ADD CONSTRAINT "violations_ibfk_3" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
