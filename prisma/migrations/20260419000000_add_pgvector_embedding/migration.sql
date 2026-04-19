-- Enable pgvector extension for visual search
CREATE EXTENSION IF NOT EXISTS vector;

-- Convert embedding column from text/Float[] to vector(512)
-- Step 1: Add new vector column
ALTER TABLE "Product" ADD COLUMN embedding_vector vector(512);

-- Step 2: Copy data from text column (format: '[0.1, 0.2, ...]') to vector
UPDATE "Product" SET embedding_vector = embedding::vector(512) WHERE embedding IS NOT NULL AND embedding != '{}';

-- Step 3: Drop old column
ALTER TABLE "Product" DROP COLUMN embedding;

-- Step 4: Rename new column
ALTER TABLE "Product" RENAME COLUMN embedding_vector TO embedding;

-- Step 5: Create index for vector similarity search (optional but recommended)
-- Note: Only create if you have pgvector 0.5.0+ and have data
CREATE INDEX IF NOT EXISTS "Product_embedding_idx" ON "Product" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
