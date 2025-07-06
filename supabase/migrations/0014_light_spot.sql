-- Custom SQL migration file, put your code below! --

-- Drop the existing index first
DROP INDEX IF EXISTS "embeddingIndex";

-- Drop existing embedding column and recreate with 512 dimensions
ALTER TABLE "embeddings" DROP COLUMN IF EXISTS "embedding";
ALTER TABLE "embeddings" ADD COLUMN "embedding" vector(512);

-- Recreate the HNSW index for 512-dimension vectors
CREATE INDEX IF NOT EXISTS "embeddingIndex" ON "embeddings" USING hnsw (embedding vector_cosine_ops);