import 'dotenv/config';
import path from 'node:path';
import _ from 'underscore';
import glob from 'fast-glob';
import {db} from '@vetisuite/database/db.js';
import logger from '@/utils/logger.js';
import {migrationsTable} from '@vetisuite/database/schemas/migrations.table.js';
import {desc} from '@vetisuite/database/orm.js';

const directory = path.dirname(new URL(import.meta.url).pathname);

async function launchMigration () {
  await db.execute('SELECT 1');

  const lastMigration = await getLastMigration();
  const deltas = pendingDeltas(lastMigration);

  logger.info(`[deltas] Last migration: ${lastMigration.delta} - ${lastMigration.name}`);
  logger.info(`[deltas] Pending migrations: ${deltas.length}`);

  for (const delta of deltas) {
    const migrationModule = await import(delta.importPath);
    const migration = migrationModule.default;

    logger.info(`[deltas] Applying ${delta.delta} - ${delta.name}`);
    try {
      await migration.execute();
    } catch (error) {
      logger.error(`[deltas] Failed ${delta.delta} - ${delta.name}`, {error});
      process.exit(1);
    }

    logger.info(`[deltas] Applied ${delta.delta} - ${delta.name}`);

    await db.insert(migrationsTable).values({
      name: delta.name,
      delta: delta.delta,
      description: migration.description
    }).returning({id: migrationsTable.id});
  }

  process.exit(0);
}

async function getLastMigration () {
  const [lastMigration] = await db.select().from(migrationsTable).orderBy(desc(migrationsTable.delta)).limit(1);

  return lastMigration || {name: 'initial', description: '', delta: 0};
}

function pendingDeltas (lastMigration) {
  const migrations = listMigrations();

  return _(migrations).filter((migration) => {
    return migration.delta > lastMigration.delta;
  });
}

function listMigrations () {
  const pattern = path.join(directory, 'deltas/*/migration.js');
  const migrationsPaths = glob.sync(pattern);

  const deltas = _(migrationsPaths).map((migrationPath) => {
    const lastFolder = path.basename(path.dirname(migrationPath));
    const delta = lastFolder.split('-')[0];

    return {
      delta: Number(delta),
      name: lastFolder,
      importPath: `./deltas/${lastFolder}/migration.js`
    };
  });

  return _(deltas).sortBy('delta');
}

await launchMigration();
