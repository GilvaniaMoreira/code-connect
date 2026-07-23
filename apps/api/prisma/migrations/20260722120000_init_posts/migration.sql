-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Wrapper IMMUTABLE para unaccent (o unaccent nativo é STABLE e não pode
-- ser usado em colunas geradas STORED nem em índices de expressão).
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
STRICT
AS $$ SELECT unaccent('unaccent'::regdictionary, $1) $$;

-- Wrapper IMMUTABLE que monta o tsvector de busca dos posts.
-- to_tsvector também é STABLE no catálogo do Postgres, então precisa
-- ser encapsulado para poder ser usado em coluna gerada STORED.
CREATE OR REPLACE FUNCTION posts_search_document(
    title text,
    description text,
    tags text[]
) RETURNS tsvector
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
    SELECT setweight(to_tsvector('portuguese', immutable_unaccent(coalesce(title, ''))), 'A') ||
           setweight(to_tsvector('portuguese', immutable_unaccent(coalesce(description, ''))), 'B') ||
           setweight(to_tsvector('portuguese', immutable_unaccent(coalesce(array_to_string(tags, ' '), ''))), 'C')
$$;

-- CreateTable: users (idempotente para bases já criadas via db push)
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateTable: posts
CREATE TABLE "posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "thumbnail" TEXT,
    "author_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");
CREATE INDEX "posts_created_at_idx" ON "posts"("created_at" DESC);

-- Coluna gerada com tsvector combinando título + descrição + tags para full-text search
-- Usamos configuração "portuguese" com unaccent para tolerar acentuação
ALTER TABLE "posts"
    ADD COLUMN "search_document" tsvector
    GENERATED ALWAYS AS (posts_search_document("title", "description", "tags")) STORED;

CREATE INDEX "posts_search_document_idx" ON "posts" USING GIN ("search_document");

-- CreateTable: likes
CREATE TABLE "likes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "likes_post_id_user_id_key" ON "likes"("post_id", "user_id");

-- CreateTable: comments
CREATE TABLE "comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "comments_post_id_created_at_idx" ON "comments"("post_id", "created_at");
