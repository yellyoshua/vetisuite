#!/usr/bin/env bash
set -euo pipefail

SEEDS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$(dirname "$SEEDS_DIR")/docker-compose.yaml"

restore() {
  local file="$SEEDS_DIR/db/$1.sql"
  if [ ! -s "$file" ]; then
    echo "Omitido $1.sql (vacío o inexistente)"
    return
  fi
  docker compose -f "$COMPOSE_FILE" exec -T -e PGPASSWORD=vetisuite postgres \
    psql -U vetisuite -d vetisuite -v ON_ERROR_STOP=1 <"$file"
}

restore migrations
restore fixtures

echo "Restaurado desde $SEEDS_DIR/db"
