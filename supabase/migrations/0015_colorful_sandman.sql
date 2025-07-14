CREATE TYPE "public"."meal_type" AS ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other');--> statement-breakpoint
CREATE TABLE "daily_nutrition_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"total_calories" integer DEFAULT 0 NOT NULL,
	"total_protein" integer DEFAULT 0 NOT NULL,
	"total_carbs" integer DEFAULT 0 NOT NULL,
	"total_fat" integer DEFAULT 0 NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"calories" integer NOT NULL,
	"protein" integer,
	"carbs" integer,
	"fat" integer,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit" text DEFAULT 'serving' NOT NULL,
	"meal_type" "meal_type" NOT NULL,
	"notes" text,
	"date" date NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nutrition_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"calorie_goal" integer DEFAULT 2000 NOT NULL,
	"protein_goal" integer DEFAULT 150 NOT NULL,
	"carbs_goal" integer DEFAULT 250 NOT NULL,
	"fat_goal" integer DEFAULT 65 NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "embedding" SET DATA TYPE vector(512);--> statement-breakpoint
ALTER TABLE "daily_nutrition_summaries" ADD CONSTRAINT "daily_nutrition_summaries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_entries" ADD CONSTRAINT "food_entries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_goals" ADD CONSTRAINT "nutrition_goals_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;