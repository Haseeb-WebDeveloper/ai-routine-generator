/*
  Warnings:

  - The values [ASPHYXIATED,DEHYDRATED,ACNE_PRONE] on the enum `SkinType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `age` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `allergies` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `budget` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `climate` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `concerns` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `skin_summary` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `skin_type` on the `users` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."SkinType_new" AS ENUM ('OILY', 'COMBINATION', 'DRY', 'NORMAL', 'SENSITIVE', 'MATURE');
ALTER TABLE "public"."products" ALTER COLUMN "skin_types" TYPE "public"."SkinType_new"[] USING ("skin_types"::text::"public"."SkinType_new"[]);
ALTER TYPE "public"."SkinType" RENAME TO "SkinType_old";
ALTER TYPE "public"."SkinType_new" RENAME TO "SkinType";
DROP TYPE "public"."SkinType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "age",
DROP COLUMN "allergies",
DROP COLUMN "budget",
DROP COLUMN "climate",
DROP COLUMN "concerns",
DROP COLUMN "gender",
DROP COLUMN "skin_summary",
DROP COLUMN "skin_type";

-- CreateTable
CREATE TABLE "public"."skin_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "skin_type" TEXT,
    "concerns" TEXT[],
    "budget" TEXT,
    "climate" TEXT,
    "allergies" TEXT[],
    "skin_summary" TEXT,

    CONSTRAINT "skin_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skin_profiles_user_id_key" ON "public"."skin_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "public"."skin_profiles" ADD CONSTRAINT "skin_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
