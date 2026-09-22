# AGENTS.md — `packages/database/`

Reglas del paquete `@vetisuite/database` (`packages/database/`): schemas, migraciones y conexión.
Complementa `/AGENTS.md`, que tiene las reglas de todo el monorepo: leé ambos.

## Monorepo

`packages/database` (`@vetisuite/database`) es el único paquete que declara
`drizzle-orm`, `postgres`, `@neondatabase/serverless` y `drizzle-kit`: los consumidores no las declaran
(con linker `isolated` no las resolverían) y las importan re-exportadas desde ahí — `db.js`,
`schemas/schemas.js`, `orm.js` (`drizzle-orm`), `pg-core.js`, `pglite.js` y `kit-api.js` (tests),
`postgres.js` — siempre con extensión (Node ESM los carga sin bundler). Así hay una sola instancia
del ORM y una sola versión que subir. Su `.env.local` (`IS_LOCAL`, `DATABASE_URL`) permite generar y
aplicar migraciones sin levantar `server/`. Lo usan `server/` y, del lado de
las tasks, aquellas que escriben tokens o mueven estados críticos (ej. `cloudtasks/email-account-manager`),
que no pueden permitirse una copia del esquema que se desincronice.

## Nombres

### Archivos

| Tipo | Patrón |
|---|---|
| Tabla Drizzle | `<nombre>.table.ts` |

### Código

- Tablas Drizzle: plural + sufijo `Table` (`usersTable`). FK en singular camelCase, sin sufijo `Id`
  (`user`, no `userId`).

## Base de datos (`packages/database`)

PostgreSQL (Neon) con Drizzle. UUID como PK y timestamps con zona horaria en todas las tablas. La
config de drizzle-kit vive en `packages/database/`, junto a los schemas y las migraciones generadas.

Aplica a `packages/database/src/schemas/**/*.table.ts` y a las migraciones.

### Paquete

- Único lugar que declara `drizzle-orm`, `postgres`, `@neondatabase/serverless` y `drizzle-kit`. Los
  consumidores importan las re-exportaciones, siempre con extensión.

### Tablas

- Export en plural con sufijo `Table`, igual al archivo (`usersTable`).
- Toda tabla lleva `id` (uuid PK, `defaultRandom()`) y `createdAt`; `updatedAt` si se actualiza.
- Enums en `enums.ts`; todo se reexporta desde `schemas.ts`.
- Integridad en la base antes que en código: `notNull`, `unique`, FK y `check` donde apliquen.

### Columnas

- Fechas: `timestamp({mode: 'date', withTimezone: true})`, sin excepciones. Nunca `mode: 'string'`
  ni `timestamp()` pelado.
- FK en singular camelCase, **nunca** con sufijo `Id` (`user`, no `userId`).
- FK siempre con `onDelete` y `onUpdate` explícitos:

| Relación | `onDelete` | `onUpdate` |
|---|---|---|
| Obligatoria (`.notNull()`) | `cascade` | `cascade` |
| Opcional (nullable) | `set null` | `cascade` |
| Integridad crítica | `restrict` | `cascade` |

### Migraciones

- Esquema: `bun run drizzle:migrate:generate` y `bun run drizzle:migrate:apply`.
- **Nunca edites una migración existente**; si quedó mal, cambiá el schema y generá otra.
- Datos: deltas en `server/migrations/deltas/`.
