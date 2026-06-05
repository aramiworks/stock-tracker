-- Add discovered_products: live products seen in a brand's category sweep
-- (INF-1558). A freshness substrate only — decoupled from watchable_units/skus.
-- The daily discovery job upserts one row per live article code (advancing
-- last_seen_at); rows not seen for the stale TTL are flipped is_stale.
CREATE TABLE "discovered_products" (
  "id"            UUID         NOT NULL DEFAULT gen_random_uuid(),
  "brand"         TEXT         NOT NULL,
  "article_code"  TEXT         NOT NULL,
  "url"           TEXT         NOT NULL,
  "model_hint"    TEXT,
  "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_seen_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "is_stale"      BOOLEAN      NOT NULL DEFAULT false,
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "discovered_products_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "discovered_products_brand_article_code_key"
  ON "discovered_products" ("brand", "article_code");

CREATE INDEX "discovered_products_brand_is_stale_idx"
  ON "discovered_products" ("brand", "is_stale");

CREATE INDEX "discovered_products_last_seen_at_idx"
  ON "discovered_products" ("last_seen_at");
