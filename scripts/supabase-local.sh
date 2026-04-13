#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PRISMA_DIR="$REPO_ROOT/packages/prisma"

echo "[supabase] Starting local Supabase..."
cd "$PRISMA_DIR"
supabase start

echo "[supabase] Pushing Prisma schema..."
npm run db:push

echo "[supabase] Seeding dev data..."
npm run seed:dev

echo "[supabase] Ready. Tailing auth logs (Ctrl+C to stop)..."
docker logs "supabase_auth_$(grep '^project_id' "$PRISMA_DIR/supabase/config.toml" | sed 's/.*= *"\(.*\)"/\1/')" --follow
