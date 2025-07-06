ALTER TABLE "daily_summaries" DROP CONSTRAINT "daily_summaries_date_unique";--> statement-breakpoint
ALTER TABLE "daily_summaries" DROP CONSTRAINT "daily_summaries_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "daily_summaries" ALTER COLUMN "summary" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_summaries" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "daily_summaries" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "daily_summaries" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "daily_summaries" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "daily_summaries" ADD CONSTRAINT "daily_summaries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;