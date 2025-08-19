-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "allergies" TEXT[],
ADD COLUMN     "budget" TEXT,
ADD COLUMN     "climate" TEXT,
ADD COLUMN     "concerns" TEXT[],
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "skin_summary" TEXT,
ADD COLUMN     "skin_type" TEXT;
