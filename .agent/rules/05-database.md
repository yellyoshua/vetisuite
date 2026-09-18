---
trigger: always_on
---

# Base de datos (`packages/db`)

Aplica a `packages/db/src/schemas/**/*.table.js` y a las migraciones.

## Paquete

- Único lugar que declara `drizzle-orm`, `postgres`, `@neondatabase/serverless` y `drizzle-kit`. Los
  consumidores importan las re-exportaciones, siempre con extensión.

## Tablas

- Export en plural con sufijo `Table`, igual al archivo (`usersTable`).
- Toda tabla lleva `id` (uuid PK, `defaultRandom()`) y `createdAt`; `updatedAt` si se actualiza.
- Enums en `enums.js`; todo se reexporta desde `schemas.js`.
- Integridad en la base antes que en código: `notNull`, `unique`, FK y `check` donde apliquen.

## Columnas

- Fechas: `timestamp({mode: 'date', withTimezone: true})`. Nunca `timestamp({mode: 'string'})` ni
  `timestamp()` pelado.
- Única excepción: fechas de calendario sin hora (nacimiento, caducidad, próxima dosis) van como
  `date({mode: 'string'})` (`'YYYY-MM-DD'`), para que ninguna zona horaria corra el día.
- FK en singular camelCase, **nunca** con sufijo `Id` (`user`, no `userId`).
- FK siempre con `onDelete` y `onUpdate` explícitos:

| Relación | `onDelete` | `onUpdate` |
|---|---|---|
| Obligatoria (`.notNull()`) | `cascade` | `cascade` |
| Opcional (nullable) | `set null` | `cascade` |
| Nunca se borra (`clients`, `patients`) | `no action` | `cascade` |

`no action` bloquea el borrado de un registro referenciado; el cascade al borrar la organización
entera sigue funcionando.

## Migraciones

- Esquema: `bun run drizzle:migrate:generate` y `bun run drizzle:migrate:apply`.
- **Nunca edites una migración existente**; si quedó mal, cambiá el schema y generá otra.
- Datos: deltas en `server/migrations/deltas/`.
