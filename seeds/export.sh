#!/bin/bash

set -e

cd "$(dirname "$0")/.."

DB_URI="${DATABASE_URL:-postgresql://postgres@localhost:5432/vetisuite}"

echo "📦 Exportando datos a seeds/db/fixtures.sql..."
pg_dump --clean --if-exists -O -x -n public --file="seeds/db/fixtures.sql" "$DB_URI"

echo "📦 Exportando migraciones a seeds/db/migrations.sql..."
pg_dump --clean --if-exists -O -x -n drizzle --file="seeds/db/migrations.sql" "$DB_URI"

echo "✅ ¡Base de datos exportada con éxito en seeds/db/!"
