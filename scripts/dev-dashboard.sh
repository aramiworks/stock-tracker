#!/usr/bin/env bash
set -euo pipefail

# stock-tracker — mprocs wrapper
# 1. Cleans up leftover processes/sockets from previous sessions
# 2. Installs dependencies (fast no-op when up to date)
# 3. Builds shared packages so backend services can start
# 4. Launches mprocs
# 5. Cleans up on exit (quit, Ctrl+C, pane close)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cleanup() {
  "$SCRIPT_DIR/cleanup-ports.sh"
}

log() { printf "\033[0;36m[dev]\033[0m %s\n" "$*"; }

trap cleanup EXIT HUP INT TERM

cd "$REPO_ROOT"

# Export ports so mprocs and all child processes inherit them
set -a; . "$SCRIPT_DIR/ports.env"; set +a

log "Cleaning up previous session..."
cleanup

log "Installing dependencies..."
npm install --quiet

log "Building shared packages..."
npx turbo run build --filter='./packages/*' --log-prefix=none

log "Starting mprocs..."
mprocs
