import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {db} from '@vetisuite/database/db.js';
import {PgTable} from '@vetisuite/database/pg-core.js';
import {is, getTableName, sql} from '@vetisuite/database/orm.js';
import * as schema from '@vetisuite/database/schemas/schemas.js';
import {generateDrizzleJson, generateMigration} from '@vetisuite/database/kit-api.js';

const CASING = 'snake_case';

export async function loadSchemas () {
  const empty = generateDrizzleJson({}, undefined, undefined, CASING);
  const current = generateDrizzleJson({...schema}, undefined, undefined, CASING);
  const statements = await generateMigration(empty, current);

  for (const statement of statements) {
    await db.execute(sql.raw(statement));
  }
}

export const loadFixtures = async (fixtures = []) => {
  for (const fixture of fixtures) {
    if (!fixture.table) {
      throw new Error('El fixture debe exportar "table" con la tabla de Drizzle destino.');
    }

    const rows = fixture.default;

    if (!Array.isArray(rows)) {
      throw new Error('El fixture debe exportar un "default" con un array de filas.');
    }

    if (rows.length > 0) {
      await db.insert(fixture.table).values(rows);
    }
  }
};

export const resetAndLoad = async (fixtures = []) => {
  await truncateAll();
  const importedFixtures = await Promise.all(fixtures.map(loadFixtureModule));

  await loadFixtures(importedFixtures);
};

async function loadFixtureModule (fixturePath) {
  if (fixturePath instanceof URL) {
    return import(fixturePath.href);
  }

  if (typeof fixturePath === 'string' && fixturePath.startsWith('file:')) {
    return import(fixturePath);
  }

  if (typeof fixturePath === 'string' && fixturePath.startsWith('/')) {
    return import(pathToFileURL(fixturePath).href);
  }

  if (typeof fixturePath === 'string') {
    const absolutePath = path.resolve(process.cwd(), fixturePath);

    return import(pathToFileURL(absolutePath).href);
  }

  throw new Error('resetAndLoad requiere rutas de archivos de fixtures como strings relativas al repo o rutas absolutas.');
}

async function truncateAll () {
  const tableNames = Object.values(schema)
  .filter((value) => is(value, PgTable))
  .map((table) => `"${getTableName(table)}"`);

  await db.execute(sql.raw(`TRUNCATE ${tableNames.join(', ')} CASCADE`));
}
