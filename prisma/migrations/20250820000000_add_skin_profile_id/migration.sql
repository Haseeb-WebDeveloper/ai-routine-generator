-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN "skin_profile_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_skin_profile_id_key" ON "public"."users"("skin_profile_id");
