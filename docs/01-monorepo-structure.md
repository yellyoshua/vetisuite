# 01 · Estructura del monorepo

Monorepo con **bun workspaces**: tres proyectos en carpetas de primer nivel,
cada uno atado a un subdominio.

## Layout

```
vetisuite/
  package.json          → raíz: workspaces + eslint + scripts orquestadores
  bun.lock              → único lockfile
  eslint.config.js      → config eslint compartida
  CLAUDE.md             → guía del repo (estructura + convenciones)
  client/               → SPA React (Vite)        → app.vetisuite.com
  server/               → API Nitro               → api.vetisuite.com
  landing/              → sitio Astro             → vetisuite.com
  infrastructure/       → Terraform (AWS)
  docs/                 → esta documentación
```

## `package.json` raíz

```json
{
  "name": "vetisuite",
  "private": true,
  "type": "module",
  "workspaces": ["client", "server", "landing"],
  "scripts": {
    "dev": "bun run --filter client dev",
    "build": "bun run --filter '*' build",
    "lint": "eslint ."
  }
}
```

Las devDependencies de eslint viven en la raíz (config compartida); cada
proyecto mantiene sus propias dependencias en su `package.json`.

## Comandos

```sh
bun install                     # instala todos los workspaces
bun run dev                     # client con HMR
bun run --filter server dev     # api en :3000
bun run --filter landing dev    # landing en :4321
bun run build                   # build de los tres
bun run lint                    # eslint desde la raíz
```

## Nota sobre `base` en Vite/Astro

Ningún proyecto necesita `base`: cada app se sirve en la **raíz de su propio
subdominio** (`app.vetisuite.com/`, no un subpath). Separar por subdominio
evita el infierno de `base: '/web/'`.
