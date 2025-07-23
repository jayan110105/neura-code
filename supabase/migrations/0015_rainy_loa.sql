ALTER TABLE "embeddings" ALTER COLUMN "embedding" SET DATA TYPE vector(512);--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "completed_date" timestamp;