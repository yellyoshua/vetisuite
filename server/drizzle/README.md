# `drizzle/` — esquema y migraciones

ORM: [drizzle](https://orm.drizzle.team) sobre **PostgreSQL** (`pg-core`), con el
driver [`postgres`](https://github.com/porsager/postgres) (`postgres-js`).

```
drizzle.config.ts             → configuración de drizzle-kit
drizzle/
  db.ts                       → conexión Postgres + instancia de drizzle
  schema.js                   → barrel de tablas. Lo consume db.ts.
  <modulo>/                   → una carpeta por módulo, en plural
    <tablas>.table.js         → definición de la tabla
    <tablas>.rls.js           → políticas RLS de esa tabla
  migrations/                 → SQL generado. Se versiona; no se edita a mano.
```

## `db.ts` — el único acceso a la base

`import { db } from "../../drizzle/db"`. Nadie más instancia un cliente Postgres.

Un cliente `postgres` con `max: 1`: en Lambda cada invocación es secuencial, un
pool grande solo agota los slots del servidor. Con concurrencia real hay que
poner delante un pooler (RDS Proxy / pgBouncer), no subir `max`.

`DATABASE_URL` se lee de entorno. La conexión es perezosa: el proceso arranca sin
base (por eso `GET /healthcheck` responde aunque Postgres esté caído).

Quien lo consume son los `repository.ts` de `modules/`. Un `service.ts` que
importe `db` directamente se está saltando su repositorio.

## Organización: una carpeta por módulo, tabla + RLS en pareja

Cada tabla son **dos archivos con el mismo prefijo**, dentro de la carpeta del
módulo al que pertenece (misma nomenclatura que `modules/`: inglés, plural,
kebab-case):

```
drizzle/clients/clients.table.js     drizzle/clients/clients.rls.js
drizzle/patients/patients.table.js   drizzle/patients/patients.rls.js
```

La pareja es obligatoria aunque el `.rls.js` esté vacío: un archivo de políticas
ausente no se distingue de "aún no lo pensamos", y así el `git diff` de una tabla
nueva enseña de inmediato si su acceso quedó sin definir.

Los `.rls.js` de hoy no exportan nada — todavía no hay tenant ni roles. La forma
está comentada dentro de cada uno; dos detalles que cuestan una migración vacía
si se ignoran:

- **Una política = un export con nombre propio.** Un array
  (`export const clientsPolicies = [...]`) drizzle-kit lo ignora **en silencio**:
  busca instancias de `PgPolicy` entre los exports del módulo, no dentro de
  colecciones. Comprobado con `db:generate`.
- **`.link(tabla)` ya emite `ENABLE ROW LEVEL SECURITY`.** No añadas
  `.enableRLS()` en el `.table.js`. Y ten claro que desde la primera política la
  tabla deniega todo lo que ninguna cubra.

Un módulo puede tener varias tablas (`drizzle/appointments/appointments.table.js`
y `appointment-slots.table.js`); cada una con su `.rls.js`.

## Por qué los esquemas son `.js`

Es una decisión explícita del proyecto (el resto del server es TypeScript).
Consecuencias que hay que conocer:

- El editor infiere los tipos de las tablas gracias a `allowJs`, que ya viene
  activo en el tsconfig que genera Nitro. Sin eso, `$inferSelect` no te da nada.
- Los imports **entre esquemas llevan la extensión** (`from "../clients/clients.table.js"`).
- No hay chequeo de tipos en el build (`nitro build` no ejecuta `tsc`): córrelo
  aparte con `bun run typecheck`. El esquema en sí lo valida
  `drizzle-kit generate`, que lo parsea sin necesitar base.
- **`eslint` no cubre esta carpeta**: la config raíz filtra `**/*.{ts,tsx}`.
  Es a propósito — ampliar el glob a `.js` arrastraría las reglas de React
  (`react-hooks`, `react-refresh`) sobre el server. Revisa estos archivos a mano.

## Comandos

```sh
bun run db:generate    # esquemas → SQL en drizzle/migrations/. No necesita base.
bun run db:migrate     # aplica las migraciones pendientes. Necesita DATABASE_URL.
bun run db:studio      # explorador web del esquema. Necesita DATABASE_URL.
```

`db:generate` es la comprobación barata: si un esquema está mal, falla ahí, sin
levantar Postgres. Ejecútalo siempre después de tocar una tabla.

## Añadir una tabla

1. `drizzle/<modulo>/<tablas>.table.js` — nombre de archivo y de tabla en plural.
2. `drizzle/<modulo>/<tablas>.rls.js` — aunque quede vacío. Copia la cabecera de
   `clients.rls.js` para dejar dicho qué falta.
3. Reexporta **solo el `.table.js`** desde `drizzle/schema.js`. Ese barrel es el
   objeto `schema` que recibe `drizzle()`: si metes políticas ahí acaban en el
   constructor de queries relacionales. El `.rls.js` no necesita barrel — llega a
   drizzle-kit por el glob `drizzle/*/*.rls.js` de la config.
4. `bun run db:generate` y **revisa el SQL** antes de commitear. Renombrar una
   columna se ve como `DROP` + `ADD` si no confirmas el rename en el prompt.
5. Commitea el `.sql` junto al cambio de esquema.

## Convenciones del esquema

- `id`: `uuid().primaryKey().defaultRandom()`.
- Nombres de columna en `snake_case` (`casing: "snake_case"` en la config y en
  `drizzle/db.ts`); las propiedades JS van en `camelCase`.
- **Dinero en `numeric`, nunca `real`/`double`.** El redondeo binario en saldos
  es un bug de facturación, no un detalle.
- Fechas con `timestamp({ withTimezone: true })`.
- Toda FK declara su `onDelete`.
- Índice en las columnas por las que se filtra o se ordena (`clients.name`,
  `patients.client_id`).

## Estado actual

`clients` y `patients` — la raíz del expediente. El resto del dominio (citas,
peluquería, inventario, facturación) se modela cuando su módulo se implemente;
hoy el client lo simula en memoria (`client/src/lib/api.ts`).
