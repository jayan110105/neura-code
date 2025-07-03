ALTER TABLE "todos" ALTER COLUMN "category" SET DATA TYPE "public"."category" USING "category"::"public"."category";--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "reminder_time" time;