-- Custom SQL migration file, put your code below! --

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing embedding column and recreate with proper vector type
ALTER TABLE "embeddings" DROP COLUMN IF EXISTS "embedding";
ALTER TABLE "embeddings" ADD COLUMN "embedding" vector(1536);