-- Add availability snapshot to discovered_products (INF-1624). The monitor job
-- resolves each non-stale row's stock through the hardened read path and stores
-- the result here, so "what's in stock now" is a DB query. All nullable
-- (existing rows are simply unchecked until the first monitor run). Not wired to
-- drop_events/alerts — a pure availability snapshot.
ALTER TABLE "discovered_products"
  ADD COLUMN "in_stock"        BOOLEAN,
  ADD COLUMN "last_checked_at" TIMESTAMP(3),
  ADD COLUMN "last_changed_at" TIMESTAMP(3);

CREATE INDEX "discovered_products_brand_in_stock_idx"
  ON "discovered_products" ("brand", "in_stock");
