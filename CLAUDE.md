# CLAUDE.md

## Qué es este proyecto

**Veti Suite**: plataforma de gestión para clínicas veterinarias. Monorepo con
bun workspaces, tres proyectos + infraestructura:

| Carpeta           | Dominio           | Rol |
|-------------------|-------------------|-----|
| `client/`         | app.vetisuite.com | SPA de gestión (React 19 + Vite 8 + TS strict). El producto: dashboard, clientes/pacientes, citas, peluquería, clínica/laboratorio, inventario y facturación. UI en español. Demo MVP sin backend real: estado en memoria (zustand) con datos semilla; `client/src/lib/api.ts` simula la API. Recargar reinicia los datos. |
| `server/`         | api.vetisuite.com | API backend (Nitro). Hoy solo `GET /healthcheck`; crecerá cuando el client deje de simular la API. Se despliega como AWS Lambda (`build:lambda`, preset `aws-lambda`) vía la infraestructura Terraform. |
| `landing/`        | vetisuite.com     | Sitio público de marketing (Astro). Hoy un hello world. |
| `infrastructure/` | —                 | Terraform (AWS): Lambda + API Gateway + ACM + CodePipeline/CodeBuild. Entornos en `infrastructure/environments/*.tfvars`. |
| `docs/`           | —                 | Documentación de arquitectura, deploy y runbook. |

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
  App.tsx                  → layout + rutas anidadas
  states/app.state.tsx     → único store zustand (useVetStore, tipado con VetState)
  lib/                     → constants.ts (tokens T/F, catálogos), types.ts, api.ts (API simulada)
  components/              → compartidos: ui.tsx (Btn, Badge, Card, Modal, Field…),
                             page-header, resource-list-item, info-grid, resource-not-found,
                             client-search, patient-picker, layout, toasts
  modules/[module]/        → page.tsx (índice) + new-page / show-page / edit-page + components/
```

Rutas por acción: `/[module]`, `/[module]/new`, `/[module]/show/:id`,
`/[module]/edit/:id`. Excepciones: **clinic** no tiene edit (historial
inmutable) y usa acciones propias (`/clinic/consultation/:patientId`,
`apply-product`, `lab-order`, `prescription`); **grooming** y **billing** no
tienen edit. Ids con `useParams`, presets con `useSearchParams`. Toda pantalla
con `:id` renderiza `ResourceNotFound` si el recurso no existe.

## Convenciones críticas

- **Código en inglés, UI en español**: identificadores/archivos/rutas en inglés
  (kebab-case); solo el texto visible al usuario va en español. Los valores de
  estado (`"pendiente"`, `"confirmada"`…) están en español a propósito.
- **Reusar los componentes compartidos** (`client/src/components/`) — nunca
  crear botones/badges/cards/headers ad-hoc.
- **Estilos**: Tailwind + estilos inline con los tokens `T`/`F` de
  `client/src/lib/constants.ts`. Prohibido hex fuera de `T`. Detalle en
  `client/DESIGN.md`.
- **Effects**: prohibido `setState` síncrono en effects (lint lo bloquea) —
  estado derivado, resets en handlers o URL como fuente de verdad
  (`client/AGENTS.md` §3).
- Acciones del store notifican con `notify()`; las que validan devuelven `boolean`.

## Referencias

- Manual completo del client (estilo, testing, deploy): **`client/AGENTS.md`**
- Sistema de diseño: **`client/DESIGN.md`**
- Estructura del monorepo y deploy: **`docs/`**
