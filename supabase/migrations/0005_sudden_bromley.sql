CREATE TYPE "public"."mood" AS ENUM('Excellent', 'Good', 'Neutral', 'Poor', 'Terrible');--> statement-breakpoint
ALTER TABLE "daily_logs" RENAME COLUMN "description" TO "content";--> statement-breakpoint
ALTER TABLE "daily_logs" ADD COLUMN "mood" "mood";--> statement-breakpoint
ALTER TABLE "daily_logs" ADD COLUMN "productivity_score" integer;--> statement-breakpoint
ALTER TABLE "daily_logs" ADD COLUMN "highlights" text[];--> statement-breakpoint
ALTER TABLE "daily_logs" ADD COLUMN "challenges" text;--> statement-breakpoint
ALTER TABLE "daily_logs" ADD COLUMN "lessons_learned" text;--> statement-breakpoint
ALTER TABLE "daily_logs" ADD COLUMN "goals_for_tomorrow" text;--> statement-breakpoint
ALTER TABLE "daily_logs" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;