-- Add last_paged_at to sku_stock_state so the scraper's Slack pager can
-- dedupe pages inside a cooldown window. Nullable: existing rows continue
-- to surface as eligible for the first page; subsequent firings set the
-- timestamp and the dedupe window kicks in from there.
ALTER TABLE "sku_stock_state"
ADD COLUMN "last_paged_at" TIMESTAMP(3);
