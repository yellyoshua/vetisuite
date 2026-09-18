#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

docker compose up -d

bun run --filter client dev &
client_pid=$!

bun run --filter landing dev &
landing_pid=$!

bun run --filter server dev &
server_pid=$!

trap 'kill "$client_pid" "$landing_pid" "$server_pid" 2>/dev/null || true' EXIT INT TERM

wait -n "$client_pid" "$landing_pid" "$server_pid"
