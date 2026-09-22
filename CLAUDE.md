# CLAUDE.md

## Qué es este proyecto

**Veti Suite**: plataforma de gestión para clínicas veterinarias. Monorepo con
bun workspaces, tres proyectos + infraestructura:

| Carpeta           | Dominio           | Rol |
|-------------------|-------------------|-----|
| `client/`         | app.vetisuite.com | SPA de gestión (React 19 + Vite 8 + TS strict). El producto: dashboard, clientes/pacientes, citas, peluquería, clínica/laboratorio, inventario y facturación. UI en español. Demo MVP sin backend real: estado en memoria (zustand) con datos semilla; `client/src/lib/api.ts` simula la API. Recargar reinicia los datos. |
| `server/`         | api.vetisuite.com | API backend en JavaScript (Nitro 2 / h3 1). Tres capas: `api/<modulo>.<verbo>.js` → `modules/<modulo>/` (repository · schema · service) → `@vetisuite/database`; `core/` (baseRoute, repository, auth-core), `middleware/`, `permissions/` (pkit; auditoría de rutas privadas en `permissions/README.md`), `migrations/deltas/` (datos). Sesión en cookie httpOnly vía OAuth2 propio; archivos por presigned POST a S3; eventos a SQS; rate limit en DynamoDB. Una sola Lambda de imagen (preset `aws-lambda`). Dominio hoy: `clients`, `clients-count`, `clients-patients`. |
| `packages/database/` | —            | `@vetisuite/database` (TS): schemas, enums, migraciones de drizzle-kit y conexión (postgres-js). Único dueño de `drizzle-orm`; el server importa sus re-exports con extensión (`@vetisuite/database/db.js`, `orm.js`, `schemas/schemas.js`). |
| `infrastructure/server/`, `setup-local/`, `.semaphore/` | — | Dockerfile + `image.sh`/`deploy.sh`/`bootstrap.sh` de la Lambda; scripts de floci (S3, DynamoDB, SQS) para local; CI y promotions manuales (Migration Drizzle → Deploy server → Migration Deltas). |
| `landing/`        | vetisuite.com     | Sitio público de marketing (Astro + `astro-aws-amplify`). Hoy un hello world. Build a `landing/.amplify-hosting/`. |
| `amplify.yml`     | —                 | Build spec de AWS Amplify Hosting: una app por `appRoot` (`client`, `landing`). Instala bun en la imagen AL2023. Las apps Amplify se crean en la consola. |
| `docs/`           | —                 | Documentación: `docs/product/` (negocio, modelo SaaS, roles, módulos) y `docs/technical/` (arquitectura, deploy, runbook). |

Cada app se sirve en la raíz de su propio subdominio → ningún proyecto necesita
`base` en Vite/Astro.

## Comandos (raíz)

```sh
bun install                        # instala todos los workspaces (lockfile único)
bun run dev                        # dev del client
bun run dev:setup                  # docker compose (postgres + floci) + bucket, tablas y colas locales
bun run dev:server                 # dev del server (localhost:4000)
bun run --filter landing dev       # dev de la landing (localhost:4321)
bun run build                      # build de todos los workspaces
bun run build:server               # build del server para Lambda
bun run test:server                # tests del server (Vitest + PGlite, sin Docker)
bun run lint                       # eslint desde la raíz (config compartida)
bun run drizzle:migrate:generate   # SQL nuevo desde los schemas de packages/database
bun run drizzle:migrate:apply      # aplica migraciones de esquema
bun run deltas:launch              # aplica migraciones de datos (server/migrations/deltas)
```

El server tiene tests: `test:server`, `lint` y `build:server` en verde antes de dar
algo por terminado. Client y landing no tienen tests: su puerta es `build` + `lint`
limpios + verificación manual en navegador.

## Entornos

- `APP_ENV` vale `development` o `production`. `development` es a la vez la máquina
  local y el ambiente cloud de desarrollo (rama `main`); `production` sale de la rama
  `production`. Solo arma los nombres de recursos AWS (`vetisuite-<APP_ENV>-storage`,
  `-rate-limits`, `-public-rate-limits`, `-cloudtask-<tarea>`) y el guard de la delta de
  cuentas demo. Nunca `NODE_ENV`.
- `IS_LOCAL="true"` marca solo la máquina del desarrollador (`server/.env.local`) y
  nunca va en la nube. La lee únicamente `server/utils/environment.js`: cookie sin
  `Secure`, logs planos en vez de JSON y rate limit desactivado.
- `AWS_ENDPOINT_URL` (floci, `localhost:4566`) tampoco va en la nube; la promotion de
  deltas lo pisa vacío porque carga `server/.env.local`.
- `server/.env.local` y `packages/database/.env.local` están versionados sin secretos.
  `server/.env` (gitignored) es la copia de cada máquina: `bun run dev:server` (Nitro)
  lee solo ese archivo; `deltas:launch` carga `.env.local` y encima `.env`;
  `drizzle-kit` carga `packages/database/.env.local`; los tests fijan sus variables en
  `server/tests/setup.js`. En la nube, las variables se cargan en la consola de la
  Lambda.

## Arquitectura del client

```
client/src/
  App.tsx                  → un `if`: perfil staff → <StaffRoutes />, si no null
  routes/staff.routes.tsx  → rutas del panel interno, envueltas en CustomLayout
  states/app.state.tsx     → store del dominio (useVetStore, tipado con VetState)
  states/auth.store.tsx    → sesión (useAuthStore); claves planas, hoy quemadas
  lib/                     → constants.ts (tokens T/F, catálogos), types.ts, api.ts (API simulada)
  components/              → compartidos: ui.tsx (Btn, Badge, Card, Modal, Field…),
                             layouts/custom-layout (sidebar + drawer),
                             toast (provider sonner + showToast),
                             pages/custom-page (cáscara de toda pantalla),
                             resource-list-item, info-grid, resource-not-found,
                             client-search, patient-picker
  modules/[module]/        → page.tsx (índice) + new-page / show-page / edit-page + components/
```

Rutas por acción: `/[module]`, `/[module]/new`, `/[module]/show/:id`,
`/[module]/edit/:id`. Excepciones: **clinic** no tiene edit (historial
append-only) y usa acciones propias (`/clinic/consultation/:patientId`,
`apply-product`, `lab-order`, `prescription`); **grooming** y **billing** no
tienen edit; **appointments-clinics** (disponibilidad de la clínica) es una
única pantalla en su ruta base, sin fila en el sidebar porque es configuración
—`/appointments/settings` redirige ahí con `replace`, ruta transitoria.
Ningún módulo independiente vive anidado bajo la ruta base de otro. Ids con
`useParams`, presets y estado de listado con `useSearchParams`. Toda pantalla
con `:id` renderiza `ResourceNotFound` si el recurso no existe; las
precondiciones de negocio usan su propio mensaje (`NoActiveConsultation`).

## Convenciones críticas

- **Código en inglés, UI en español**: identificadores/archivos/rutas en inglés
  (kebab-case); solo el texto visible al usuario va en español. Los valores de
  estado (`"pendiente"`, `"confirmada"`…) están en español a propósito.
- **Imports con `@/`**: `@/` apunta a `client/src/` y a la raíz de `server/`.
  Todo lo que suba de carpeta va con alias (`@/lib/constants`, `@/core/base-route.js`);
  los hermanos siguen relativos (`./repository`). Cada alias vive en los sitios
  que lo resuelven y deben decir lo mismo: en el client, `paths` del tsconfig y
  `resolve.alias` de `client/vite.config.ts`; en el server, `paths` de
  `server/jsconfig.json` (editor y Bun), `alias` de `server/nitro.config.js` y de
  `server/vitest.config.js`. Si falta uno, revienta en runtime o en tests.
  Excepción: los schemas de `packages/database` se importan relativos —
  drizzle-kit los lee con su propio bundler, que no conoce `@/`.
- **Reusar los componentes compartidos** (`client/src/components/`) — nunca
  crear botones/badges/cards/headers ad-hoc.
- **Estilos**: la paleta se define como variables CSS en el bloque `@theme` de
  `client/src/index.css` — de ahí salen tanto las utilidades Tailwind
  (`bg-green-soft`, `text-sub`, `border-line`) como los tokens `T`/`F` de
  `client/src/lib/constants.ts`, que solo referencian esas variables con
  `var()`. Prohibido hex fuera de `@theme`. Detalle en `client/DESIGN.md`.
- **Effects**: prohibido `setState` síncrono en effects (lint lo bloquea) —
  estado derivado, resets en handlers o URL como fuente de verdad
  (`client/AGENTS.md` §3).
- **Foco visible**: una regla global `:focus-visible` en `client/src/index.css`.
  Prohibido `outline: "none"` en cualquier estilo inline o de componente.
- **Sin canal externo**: el client no tiene mensajería ni ninguna llamada de red
  de dominio. Las únicas URLs externas son Google Fonts, el logo semilla de
  `placehold.co` y un `placeholder` de formulario.
- Acciones del store notifican con `notify()`; las que validan devuelven `boolean`.

## Referencias

- Manual completo del client (estilo, testing, deploy): **`client/AGENTS.md`**
- Reglas del server y del monorepo: **`AGENTS.md`** (y `.agent/rules/`); arquitectura
  del server paso a paso: **`migration-plan/`**; auditoría de rutas privadas y
  permisos: **`server/permissions/README.md`**
- Sistema de diseño: **`client/DESIGN.md`**
- Estructura técnica y de producto: **`docs/`** (`docs/product/` y `docs/technical/`)
