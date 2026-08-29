# `server/` — API de Veti Suite (`api.vetisuite.com`)

Nitro + drizzle sobre PostgreSQL. Compila a AWS Lambda (`bun run build:lambda`,
preset `aws-lambda`).

## Estructura

| Carpeta | Rol | Detalle |
|---|---|---|
| `routes/` | Enrutado por sistema de archivos (convención de Nitro). Sin lógica: adaptan petición ↔ servicio. | — |
| `core/` | Capas por las que pasa toda petición: manejo de errores, paginación. | [`core/README.md`](core/README.md) |
| `constants/` | Valores `UPPER_SNAKE_CASE` usados en 3+ sitios. | [`constants/README.md`](constants/README.md) |
| `modules/` | Lógica de negocio por dominio (`clients`, `appointments`, `upload-massive-clients`…). | [`modules/README.md`](modules/README.md) |
| `drizzle/` | Persistencia completa: `db.ts` (conexión), esquema por módulo (`<modulo>/<tablas>.table.js` + `.rls.js`) y migraciones SQL. | [`drizzle/README.md`](drizzle/README.md) |

Dirección de las dependencias, en un solo sentido:

```
routes/  →  modules/  →  core/        (http: errores, paginación)
               └──────→  drizzle/     (db.ts + tablas, desde los repository.ts)
                            ↖ constants/ (lo usa cualquiera)
```

`routes/`, `api/`, `middleware/`, `plugins/`, `utils/`, `assets/` y `tasks/` son
carpetas de convención que Nitro escanea; `core/`, `constants/`, `modules/` y
`drizzle/` son normales, se importan explícitamente.

## Nitro 3 — tres cosas que muerden

1. **`serverDir` vale `false` por defecto.** Sin `serverDir: './'` en
   `nitro.config.ts`, Nitro **no escanea nada** y todas las rutas dan 404 sin un
   solo aviso en el log. Es el primer sitio donde mirar si una ruta "desaparece".
2. **No hay auto-imports de h3.** En Nitro 2, `defineEventHandler`, `getQuery` o
   `readBody` aparecían solos; en 3 hay que importarlos:
   ```ts
   import { defineHandler, HTTPError } from "nitro";   // handlers y errores
   import { getQuery, readBody } from "nitro/h3";      // el resto de utilidades
   ```
   h3 v2 viaja dentro de `nitro` — **no lo instales suelto**, tendrías dos copias
   y una de ellas con otra versión.
3. **`createError` → `HTTPError`.** `throw new HTTPError({ status, message })`.
   La guía completa de v2→v3 viaja en el propio paquete:
   `node_modules/nitro/dist/docs/0.docs/15.migration.md`, o `bunx nitro docs`.

## Imports: `@/` → raíz del server

```ts
import { defineApiHandler } from "@/core/http";   // sube de carpeta → alias
import * as repository from "./repository";       // hermano → relativo
```

El alias está declarado **dos veces y a propósito**:

| Dónde | Para qué |
|---|---|
| `paths` en `tsconfig.json` | tsc y el editor |
| `alias` en `nitro.config.ts` | el bundler |

Nitro 2 traía el primero de fábrica; el base de Nitro 3 (`nitro/tsconfig`) no
trae ninguno, por eso está declarado a mano. Con solo el tsconfig,
`bun run build` y `bun run typecheck` pasan los dos y el server arranca — y la
primera petición muere con `ERR_MODULE_NOT_FOUND: Cannot find package '@/core'`.
Comprobado. Si tocas el alias, verifícalo levantando el build, no compilándolo.

Los esquemas `.js` de drizzle son la excepción: se importan relativos
(`../clients/clients.table.js`) porque drizzle-kit los lee con su propio bundler,
ajeno a esta config.

## Comandos

```sh
bun run dev            # nitro dev en localhost:3000
bun run build          # .output/ (node-server)
bun run build:lambda   # .output/ con preset aws-lambda
bun run db:generate    # esquemas → SQL, sin necesidad de base
bun run db:migrate     # aplica migraciones (necesita DATABASE_URL)
bun run typecheck      # tsc --noEmit (el build de Nitro no chequea tipos)
```

## Entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Cadena de conexión Postgres. La lee `drizzle/db.ts` y `drizzle.config.ts`. |

La conexión es perezosa: el server arranca sin base y `GET /healthcheck` responde
igual — útil para el health check del balanceador.

## Rutas

| Método | Ruta | Módulo |
|---|---|---|
| GET | `/healthcheck` | — |
| GET | `/clients` | `clients` (`?search=`, `?page=`, `?pageSize=`) |
| POST | `/clients` | `clients` |
| GET | `/clients/:id` | `clients` |
