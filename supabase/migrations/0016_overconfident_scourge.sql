ALTER TABLE "reminders" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."category";--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('Health', 'Home', 'Placement', 'School');--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "category" SET DATA TYPE "public"."category" USING "category"::"public"."category";--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "category" SET DATA TYPE "public"."category" USING "category"::"public"."category";