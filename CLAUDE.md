# CLAUDE.md

## Qué es este proyecto

**Veti Suite**: plataforma de gestión para clínicas veterinarias. Monorepo con
bun workspaces, tres proyectos + infraestructura:

| Carpeta           | Dominio           | Rol |
|-------------------|-------------------|-----|
| `client/`         | app.vetisuite.com | SPA de gestión (React 19 + Vite 8 + TS strict). El producto: dashboard, clientes/pacientes, citas, peluquería, clínica/laboratorio, inventario y facturación. UI en español. Demo MVP sin backend real: estado en memoria (zustand) con datos semilla; `client/src/lib/api.ts` simula la API. Recargar reinicia los datos. |
| `server/`         | api.vetisuite.com | API backend (Nitro + drizzle/Postgres). Estructura en `routes/` → `modules/` → `core/` → `drizzle/`, con `constants/` transversal; `clients` es el módulo de referencia cableado de punta a punta. Compila a AWS Lambda (`build:lambda`, preset `aws-lambda`); sin infra de deploy hoy. Manual: `server/README.md`. |
| `landing/`        | vetisuite.com     | Sitio público de marketing (Astro + `astro-aws-amplify`). Hoy un hello world. Build a `landing/.amplify-hosting/`. |
| `amplify.yml`     | —                 | Build spec de AWS Amplify Hosting: una app por `appRoot` (`client`, `landing`). Instala bun en la imagen AL2023. Las apps Amplify se crean en la consola. |
| `docs/`           | —                 | Documentación: `docs/product/` (negocio, modelo SaaS, roles, módulos) y `docs/technical/` (arquitectura, deploy, runbook). |

Cada app se sirve en la raíz de su propio subdominio → ningún proyecto necesita
`base` en Vite/Astro.

## Comandos (raíz)

```sh
bun install                     # instala todos los workspaces (lockfile único)
bun run dev                     # dev del client
bun run --filter server dev     # dev del server (localhost:3000)
bun run --filter landing dev    # dev de la landing (localhost:4321)
bun run build                   # build de los tres
bun run lint                    # eslint desde la raíz (config compartida)
```

No hay tests: la puerta de calidad es `build` + `lint` limpios + verificación
manual en navegador (checklist en `client/AGENTS.md` §4).

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
  Todo lo que suba de carpeta va con alias (`@/lib/constants`, `@/core/http`);
  los hermanos siguen relativos (`./repository`). Cada alias vive en **dos**
  sitios que deben decir lo mismo: `paths` del tsconfig (para tsc y el editor) y
  el bundler (`resolve.alias` en `client/vite.config.ts`, `alias` en
  `server/nitro.config.ts`). Si solo pones el tsconfig, compila y revienta en
  runtime. Excepción: los esquemas `.js` de drizzle se importan relativos —
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
- Estructura y convenciones del server: **`server/README.md`** (y los README de
  `server/core/`, `server/constants/`, `server/modules/`, `server/drizzle/`)
- Sistema de diseño: **`client/DESIGN.md`**
- Estructura técnica y de producto: **`docs/`** (`docs/product/` y `docs/technical/`)
