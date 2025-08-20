-- AlterEnum
ALTER TYPE "public"."ProductType" ADD VALUE 'FACE_CREAM';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."SkinConcern" ADD VALUE 'CHAPPED_LIPS';
ALTER TYPE "public"."SkinConcern" ADD VALUE 'LOSS_OF_FIRMNESS';
ALTER TYPE "public"."SkinConcern" ADD VALUE 'ELASTICITY';
ALTER TYPE "public"."SkinConcern" ADD VALUE 'UNEVEN_TONE';

-- AlterEnum
ALTER TYPE "public"."SkinType" ADD VALUE 'ALL';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Texture" ADD VALUE 'FLUID';
ALTER TYPE "public"."Texture" ADD VALUE 'LIQUID';

-- AlterEnum
ALTER TYPE "public"."UseTime" ADD VALUE 'DAY';
