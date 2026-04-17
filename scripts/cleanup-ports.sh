#!/usr/bin/env bash

# stock-tracker — Kill dev processes and free ports
# Runs automatically after mprocs exits.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$SCRIPT_DIR/ports.env" ] || { printf "\033[0;31m[cleanup] ERROR: ports.env not found\033[0m\n" >&2; exit 1; }
set -a; . "$SCRIPT_DIR/ports.env"; set +a

PORTS=("$API_PORT" "$SUBGRAPH_PORT" "$ROUTER_PORT" "$IOS_PORT" "$ANDROID_PORT" "$WEB_PORT" "$STORYBOOK_PORT")

pkill -f "rover dev" 2>/dev/null && printf "\033[0;36m[cleanup]\033[0m Killed rover processes\n"
if ls /tmp/supergraph-*.sock 2>/dev/null | grep -q .; then
  rm -f /tmp/supergraph-*.sock
  printf "\033[0;36m[cleanup]\033[0m Removed rover session sockets\n"
fi

for port in "${PORTS[@]}"; do
  pid=$(lsof -iTCP:"$port" -sTCP:LISTEN -P -t 2>/dev/null)
  if [[ -n "$pid" ]]; then
    while IFS= read -r p; do
      printf "\033[0;36m[cleanup]\033[0m Killing port %s (pid %s)\n" "$port" "$p"
      kill "$p" 2>/dev/null || true
    done <<< "$pid"
  fi
done

sleep 1

for port in "${PORTS[@]}"; do
  pid=$(lsof -iTCP:"$port" -sTCP:LISTEN -P -t 2>/dev/null)
  if [[ -n "$pid" ]]; then
    while IFS= read -r p; do
      kill -9 "$p" 2>/dev/null || true
    done <<< "$pid"
  fi
done

printf "\033[0;36m[cleanup]\033[0m All dev ports cleared\n"
