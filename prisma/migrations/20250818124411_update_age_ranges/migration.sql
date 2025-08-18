-- CreateEnum
CREATE TYPE "public"."CampaignStatus" AS ENUM ('draft', 'scheduled', 'sent', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."ProductType" AS ENUM ('CLEANSER', 'MOISTURIZER', 'SUNSCREEN', 'TONER', 'ESSENCE', 'HYDRATOR', 'SERUM', 'AMPOULE', 'SPOT_TREATMENT', 'EXFOLIANT', 'RETINOID', 'PEPTIDE', 'VITAMIN_C', 'NIACINAMIDE', 'BRIGHTENING', 'ANTI_AGING', 'SLEEPING_MASK', 'NIGHT_CREAM', 'FACE_OIL', 'EYE_CREAM', 'EYE_SERUM', 'LIP_BALM', 'LIP_CARE', 'MAKEUP_REMOVER', 'CLEANSING_BALM', 'MICELLAR_WATER', 'OIL_CLEANSER', 'FACE_MASK', 'SHEET_MASK', 'CLAY_MASK', 'PEEL_MASK', 'SCRUB_MASK', 'HYDRATING_MASK', 'DETOX_MASK', 'BARRIER_CREAM', 'CICA_CREAM', 'SOOTHING_CREAM', 'ANTI_REDNESS', 'PORE_MINIMIZER', 'SEBUM_CONTROL');

-- CreateEnum
CREATE TYPE "public"."SkinType" AS ENUM ('OILY', 'COMBINATION', 'DRY', 'NORMAL', 'SENSITIVE', 'ASPHYXIATED', 'DEHYDRATED', 'MATURE', 'ACNE_PRONE');

-- CreateEnum
CREATE TYPE "public"."SkinConcern" AS ENUM ('ACNE', 'BLACKHEADS', 'DULLNESS', 'HYPERPIGMENTATION', 'FINE_LINES', 'WRINKLES', 'DEHYDRATION', 'DRYNESS', 'REDNESS', 'SENSITIVITY', 'PORES', 'OILINESS', 'UNEVEN_TEXTURE', 'DARK_CIRCLES', 'PUFFINESS', 'SCARRING', 'SUN_DAMAGE');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'UNISEX');

-- CreateEnum
CREATE TYPE "public"."BudgetRange" AS ENUM ('BUDGET_FRIENDLY', 'MID_RANGE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "public"."Texture" AS ENUM ('GEL', 'CREAM', 'LOTION', 'FOAM', 'OIL', 'SPRAY', 'MASK', 'BALM');

-- CreateEnum
CREATE TYPE "public"."UseTime" AS ENUM ('MORNING', 'NIGHT');

-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('CORE', 'TREATMENT', 'HYDRATION', 'SPECIAL', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "public"."AgeRange" AS ENUM ('AGE_0_1', 'AGE_1_3', 'AGE_4_12', 'AGE_13_17', 'AGE_18_25', 'AGE_26_35', 'AGE_36_45', 'AGE_46_60', 'AGE_60_PLUS');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT DEFAULT 'User',
    "password_hash" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "quiz_completed" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quiz_responses" (
    "id" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "skin_type" TEXT NOT NULL,
    "concerns" TEXT[],
    "age" INTEGER NOT NULL,
    "budget" TEXT NOT NULL,
    "skin_sensitivity" TEXT NOT NULL,
    "climate" TEXT NOT NULL,
    "lifestyle" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template_id" TEXT NOT NULL,
    "selected_users" TEXT[],
    "status" "public"."CampaignStatus" NOT NULL DEFAULT 'draft',
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "stats" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "type" "public"."ProductType" NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "age" "public"."AgeRange" NOT NULL,
    "budget" "public"."BudgetRange" NOT NULL,
    "category" "public"."Category" NOT NULL,
    "use_time" "public"."UseTime"[],
    "skin_types" "public"."SkinType"[],
    "skin_concerns" "public"."SkinConcern"[],
    "ingredients" JSONB NOT NULL,
    "texture" "public"."Texture" NOT NULL,
    "fragrance_free" BOOLEAN NOT NULL,
    "alcohol_free" BOOLEAN NOT NULL,
    "instructions" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "purchase_link" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversations" (
    "id" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "title" TEXT DEFAULT 'New Conversation',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."quiz_responses" ADD CONSTRAINT "quiz_responses_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaigns" ADD CONSTRAINT "campaigns_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
