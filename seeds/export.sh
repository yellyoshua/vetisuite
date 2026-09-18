#!/usr/bin/env bash
set -euo pipefail

SEEDS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$(dirname "$SEEDS_DIR")/docker-compose.yaml"

dump() {
  docker compose -f "$COMPOSE_FILE" exec -T -e PGPASSWORD=vetisuite postgres \
    pg_dump -U vetisuite -d vetisuite --no-owner --no-privileges "$@"
}

dump --schema-only >"$SEEDS_DIR/db/migrations.sql"
dump --data-only --column-inserts >"$SEEDS_DIR/db/fixtures.sql"

echo "Exportado a $SEEDS_DIR/db"
