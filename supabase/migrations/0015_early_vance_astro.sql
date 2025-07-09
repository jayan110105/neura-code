CREATE TABLE "tweet_ideas" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"source_data" text,
	"is_used" boolean DEFAULT false NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tweet_style_references" (
	"id" serial PRIMARY KEY NOT NULL,
	"tweet_text" text NOT NULL,
	"tweet_url" text,
	"author" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "embedding" SET DATA TYPE vector(512);--> statement-breakpoint
ALTER TABLE "tweet_ideas" ADD CONSTRAINT "tweet_ideas_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tweet_style_references" ADD CONSTRAINT "tweet_style_references_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;