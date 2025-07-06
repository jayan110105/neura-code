ALTER TABLE "daily_logs" RENAME COLUMN "content" TO "description";--> statement-breakpoint
ALTER TABLE "daily_logs" DROP COLUMN "mood";--> statement-breakpoint
ALTER TABLE "daily_logs" DROP COLUMN "productivity_score";--> statement-breakpoint
ALTER TABLE "daily_logs" DROP COLUMN "highlights";--> statement-breakpoint
ALTER TABLE "daily_logs" DROP COLUMN "challenges";--> statement-breakpoint
ALTER TABLE "daily_logs" DROP COLUMN "lessons_learned";--> statement-breakpoint
ALTER TABLE "daily_logs" DROP COLUMN "goals_for_tomorrow";--> statement-breakpoint
ALTER TABLE "daily_logs" DROP COLUMN "updated_at";--> statement-breakpoint
DROP TYPE "public"."mood";