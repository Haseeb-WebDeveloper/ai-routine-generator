/*
  Warnings:

  - The values [AGE_0_1,AGE_1_3,AGE_4_12,AGE_13_17,AGE_18_25,AGE_26_35,AGE_36_45,AGE_46_60,AGE_60_PLUS] on the enum `AgeRange` will be removed. If these variants are still used in the database, this will fail.
  - Changed the column `age` on the `products` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AgeRange_new" AS ENUM ('KIDS', 'TEEN', 'YOUNG', 'MATURE', 'SENIOR', 'ALL');
ALTER TABLE "public"."products" ALTER COLUMN "age" TYPE "public"."AgeRange_new"[] USING ("age"::text::"public"."AgeRange_new"[]);
ALTER TYPE "public"."AgeRange" RENAME TO "AgeRange_old";
ALTER TYPE "public"."AgeRange_new" RENAME TO "AgeRange";
DROP TYPE "public"."AgeRange_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."products" ALTER COLUMN "age" SET DATA TYPE "public"."AgeRange"[];
