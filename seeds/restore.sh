#!/bin/bash

set -e

cd "$(dirname "$0")/.."

DB_URI="${DATABASE_URL:-postgresql://postgres@localhost:5432/vetisuite}"

echo "🔄 Restaurando base de datos desde seeds/db/..."

psql "$DB_URI" -q -v ON_ERROR_STOP=1 --single-transaction \
  -c 'DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS drizzle CASCADE; CREATE SCHEMA public;' \
  -f "seeds/db/fixtures.sql" \
  -f "seeds/db/migrations.sql" > /dev/null

echo "✅ ¡Base de datos restaurada con éxito desde seeds/db/!"
