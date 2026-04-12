#!/usr/bin/env bash
set -euo pipefail

# stock-tracker — Service launcher
# Starts dev services in the background with Doppler env injection
# and pipes output to logs/*.log so the dashboard can tail them.
#
# Usage:
#   ./scripts/start.sh api            # tRPC service (:4010)
#   ./scripts/start.sh subgraph       # Apollo subgraph (:4011)
#   ./scripts/start.sh router         # Apollo Router (:4012)
#   ./scripts/start.sh ios            # Expo iOS (:8092)
#   ./scripts/start.sh android        # Expo Android (:8093)
#   ./scripts/start.sh web            # Expo Web (:8094)
#   ./scripts/start.sh supabase       # Local Supabase (Docker)
#   ./scripts/start.sh storybook      # Storybook web (:6006)
#   ./scripts/start.sh backend        # supabase + api + subgraph + router
#   ./scripts/start.sh all            # Everything
#   ./scripts/start.sh stop           # Kill all managed services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOGS_DIR="$REPO_ROOT/logs"
PIDS_DIR="$REPO_ROOT/logs/pids"
DOPPLER="doppler run --project stock-tracker --config local --"

mkdir -p "$LOGS_DIR" "$PIDS_DIR"

log() { printf "\033[0;36m[start]\033[0m %s\n" "$*"; }
err() { printf "\033[0;31m[start]\033[0m %s\n" "$*" >&2; }

start_service() {
  local name="$1"
  local cmd="$2"
  local logfile="$LOGS_DIR/${name}.log"
  local pidfile="$PIDS_DIR/${name}.pid"

  if [[ -f "$pidfile" ]]; then
    local existing_pid
    existing_pid=$(cat "$pidfile")
    if kill -0 "$existing_pid" 2>/dev/null; then
      log "$name already running (pid $existing_pid)"
      return
    fi
    rm -f "$pidfile"
  fi

  log "Starting $name → logs/${name}.log"
  : > "$logfile"
  bash -c "cd '$REPO_ROOT' && $cmd" >> "$logfile" 2>&1 &
  echo $! > "$pidfile"
  log "$name started (pid $!)"
}

kill_tree() {
  local pid="$1"
  local child
  for child in $(pgrep -P "$pid" 2>/dev/null); do
    kill_tree "$child"
  done
  kill "$pid" 2>/dev/null || true
}

stop_service() {
  local name="$1"
  local pidfile="$PIDS_DIR/${name}.pid"

  if [[ ! -f "$pidfile" ]]; then
    return
  fi

  local pid
  pid=$(cat "$pidfile")
  if kill -0 "$pid" 2>/dev/null; then
    log "Stopping $name (pid $pid)"
    kill_tree "$pid"
    sleep 1
    kill_tree "$pid"
    kill -9 "$pid" 2>/dev/null || true
  fi
  rm -f "$pidfile"
}

API_DIR="$REPO_ROOT/apps/api"
SUBGRAPH_DIR="$REPO_ROOT/apps/subgraphs/tracker"
ROUTER_DIR="$REPO_ROOT/apps/router"
MOBILE_DIR="$REPO_ROOT/apps/mobile"
STORYBOOK_DIR="$REPO_ROOT/apps/storybook"
PRISMA_DIR="$REPO_ROOT/packages/prisma"
ALL_SERVICES="supabase api subgraph router ios android web storybook"

cmd="${1:-all}"

case "$cmd" in
  supabase)
    start_service "supabase" "$DOPPLER bash '$REPO_ROOT/scripts/supabase-local.sh'"
    ;;
  api)
    start_service "api" "cd '$API_DIR' && PORT=4010 $DOPPLER npx tsx watch src/server.ts"
    ;;
  subgraph)
    start_service "subgraph" "cd '$SUBGRAPH_DIR' && PORT=4011 $DOPPLER npx tsx watch src/server.ts"
    ;;
  router)
    start_service "router" "cd '$ROUTER_DIR' && $DOPPLER rover dev --name tracker --url http://localhost:4011 --router-config router.yaml --supergraph-port 4012"
    ;;
  ios)
    start_service "ios" "cd '$MOBILE_DIR' && $DOPPLER npx expo run:ios --port 8092"
    ;;
  android)
    start_service "android" "cd '$MOBILE_DIR' && $DOPPLER npx expo run:android --port 8093"
    ;;
  web)
    start_service "web" "cd '$MOBILE_DIR' && $DOPPLER npx expo start --port 8094 --web"
    ;;
  storybook)
    start_service "storybook" "cd '$STORYBOOK_DIR' && $DOPPLER npx storybook dev -p 6006"
    ;;
  backend)
    start_service "supabase" "$DOPPLER bash '$REPO_ROOT/scripts/supabase-local.sh'"
    start_service "api" "cd '$API_DIR' && PORT=4010 $DOPPLER npx tsx watch src/server.ts"
    start_service "subgraph" "cd '$SUBGRAPH_DIR' && PORT=4011 $DOPPLER npx tsx watch src/server.ts"
    start_service "router" "cd '$ROUTER_DIR' && $DOPPLER rover dev --name tracker --url http://localhost:4011 --router-config router.yaml --supergraph-port 4012"
    ;;
  all)
    start_service "supabase" "$DOPPLER bash '$REPO_ROOT/scripts/supabase-local.sh'"
    start_service "api" "cd '$API_DIR' && PORT=4010 $DOPPLER npx tsx watch src/server.ts"
    start_service "subgraph" "cd '$SUBGRAPH_DIR' && PORT=4011 $DOPPLER npx tsx watch src/server.ts"
    start_service "router" "cd '$ROUTER_DIR' && $DOPPLER rover dev --name tracker --url http://localhost:4011 --router-config router.yaml --supergraph-port 4012"
    start_service "ios" "cd '$MOBILE_DIR' && $DOPPLER npx expo run:ios --port 8092"
    start_service "android" "cd '$MOBILE_DIR' && $DOPPLER npx expo run:android --port 8093"
    start_service "web" "cd '$MOBILE_DIR' && $DOPPLER npx expo start --port 8094 --web"
    start_service "storybook" "cd '$STORYBOOK_DIR' && $DOPPLER npx storybook dev -p 6006"
    ;;
  stop)
    for svc in $ALL_SERVICES; do
      stop_service "$svc"
    done
    log "Stopping Supabase containers..."
    cd "$PRISMA_DIR" && supabase stop 2>/dev/null || true
    log "All services stopped"
    ;;
  *)
    err "Unknown command: $cmd"
    echo "Usage: $0 [api|subgraph|router|ios|android|web|storybook|backend|all|stop]"
    exit 1
    ;;
esac
