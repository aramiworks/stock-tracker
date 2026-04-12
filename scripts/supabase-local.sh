#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PRISMA_DIR="$REPO_ROOT/packages/prisma"

echo "[supabase] Starting local Supabase..."
cd "$PRISMA_DIR"
supabase start

echo "[supabase] Pushing Prisma schema..."
npx prisma db push --skip-generate

echo "[supabase] Seeding dev data..."
npx tsx prisma/seed-dev.ts

echo "[supabase] Ready. Tailing logs (Ctrl+C to stop)..."
supabase logs --follow
