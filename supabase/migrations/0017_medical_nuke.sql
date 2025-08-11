ALTER TABLE "todos" ALTER COLUMN "priority" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."priority";--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('Important & Urgent', 'Important & Not Urgent', 'Not Important & Urgent', 'Not Important & Not Urgent');--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "priority" SET DATA TYPE "public"."priority" USING "priority"::"public"."priority";