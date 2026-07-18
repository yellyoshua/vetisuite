# 00 · Visión general del despliegue

Plan para servir **landing** (estáticos) en `vetisuite.com/*` y la **app** (SPA, `client/`)
en `app.vetisuite.com/*`, con un **backend Nitro** en `api.vetisuite.com/*`, todo
alojado en Vercel, **sin integración Git**, y con CI que despliega cada pieza de
forma independiente.

## Decisión de arquitectura

**Un monorepo (bun workspaces) → tres proyectos Vercel independientes.**

| Pieza    | Paquete            | Proyecto Vercel      | Dominio                 | Tipo                     |
|----------|--------------------|----------------------|-------------------------|--------------------------|
| Landing  | `landing/`| `vetisuite-landing`  | `vetisuite.com`         | Estático (Astro)         |
| App      | `client/`    | `vetisuite-client`      | `app.vetisuite.com`     | SPA estática (Vite)      |
| Server   | `server/` | `vetisuite-server`   | `api.vetisuite.com`     | Nitro (preset `vercel`)  |

### Por qué 3 proyectos y no 1 con rewrites

- **Despliegue independiente**: cada proyecto Vercel tiene su propio deployment y
  su propio `VERCEL_PROJECT_ID`. Desplegar el client no toca la landing ni el server.
  Esto es exactamente el requisito de "lanzar independientemente".
- **Subdominios gratis**: en Vercel cada proyecto puede reclamar su dominio. No
  hace falta enrutar `app.*` con rewrites internos ni proxys. Menos config, menos
  fallos.
- **Superficies de fallo aisladas**: un mal deploy del server no rompe la landing.

Alternativa (1 proyecto + `rewrites`/`Middleware` para separar host) queda
descartada: acopla los deploys y complica el CI sin beneficio aquí.

### Por qué monorepo y no repos separados

Un repo = un pipeline, un `bun install`, lockfile compartido. El CI filtra por
rutas para decidir qué desplegar. Se puede separar en repos más adelante sin
cambiar la arquitectura de Vercel (los 3 proyectos siguen siendo independientes).

## Modelo de red

```
Navegador
  ├─ GET vetisuite.com/*        → proyecto landing  (estático)
  ├─ GET app.vetisuite.com/*    → proyecto client   (SPA, fallback a index.html)
  └─ fetch api.vetisuite.com/*  → proyecto server   (Nitro, funciones)
```

La app es 100% cliente: hace `fetch` a `https://api.vetisuite.com`. Es
cross-origin → el server debe emitir **CORS** para `https://app.vetisuite.com`
(ver `04-server-nitro.md`).

## Despliegue sin Git

No se conecta el repo a Vercel. Todo pasa por la **Vercel CLI** desde GitHub
Actions con tokens:

```
vercel pull   → trae settings + env del proyecto
vercel build  → build local → .vercel/output   (o `nitro build` para el server)
vercel deploy --prebuilt --prod   → sube el output ya construido
```

Cada job del CI exporta el `VERCEL_PROJECT_ID` de su pieza. Ver
`06-ci-github-actions.md`.

## Orden de lectura

1. `01-monorepo-structure.md` — reestructurar el repo a workspaces.
2. `02-landing.md` — paquete landing.
3. `03-client.md` — mover la SPA actual a `client`.
4. `04-server-nitro.md` — backend Nitro con preset Vercel.
5. `05-vercel-projects-domains.md` — crear proyectos, dominios, DNS, env.
6. `06-ci-github-actions.md` — pipeline de deploy independiente.
7. `07-runbook.md` — comandos diarios, rollback, troubleshooting.
