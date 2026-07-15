# 01 · Estructura del monorepo

Objetivo: pasar del repo actual (una sola SPA en la raíz) a un monorepo con
tres paquetes. Usamos **bun workspaces** (ya se usa bun).

## Layout destino

```
vetisuite/
  package.json            → raíz: workspaces + scripts orquestadores
  bun.lock                → único lockfile
  tsconfig.base.json      → config TS compartida
  packages/
    landing/              → sitio estático (Vite)
      package.json
      vite.config.ts
      vercel.json
      index.html
      src/
    web/                  → la SPA actual (movida aquí)
      package.json
      vite.config.ts
      vercel.json
      index.html
      src/
      public/
    server/               → backend Nitro
      package.json
      nitro.config.ts
      routes/
  docs/                   → este plan
```

## Pasos

### 1. Crear la carpeta de paquetes

```sh
mkdir -p packages/web packages/landing packages/server
```

### 2. Mover la SPA actual a `packages/web`

```sh
git mv src public index.html vite.config.ts eslint.config.js \
       tsconfig.app.json tsconfig.node.json packages/web/
```

`tsconfig.json`, `AGENTS.md`, `DESIGN.md`, `README.md`, `CLAUDE.md` se quedan en
la raíz. El `package.json` actual se convierte en `packages/web/package.json`
(ver paso 4).

### 3. `package.json` raíz

Reemplazar el actual por uno de workspace (sin dependencias de web):

```json
{
  "name": "vetisuite",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "workspaces": ["packages/*"],
  "scripts": {
    "dev:web": "bun --filter ./packages/web dev",
    "dev:landing": "bun --filter ./packages/landing dev",
    "dev:server": "bun --filter ./packages/server dev",
    "build:web": "bun --filter ./packages/web build",
    "build:landing": "bun --filter ./packages/landing build",
    "build:server": "bun --filter ./packages/server build",
    "lint": "bun --filter '*' lint"
  }
}
```

### 4. `packages/web/package.json`

El `package.json` original movido, renombrado. Cambiar `name` a `@vetisuite/web`.
Mantiene sus propias dependencias (React, Vite, etc.) y scripts `dev/build/lint/preview`.

```json
{
  "name": "@vetisuite/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

(las secciones `dependencies`/`devDependencies` son las que ya tenías).

### 5. `tsconfig.base.json` (raíz)

Extraer lo común. Cada paquete hace `extends: "../../tsconfig.base.json"`.
Ponytail: si no molesta, deja los tsconfig de web como están dentro de
`packages/web` y crea `tsconfig.base.json` solo cuando el landing lo necesite.

### 6. Reinstalar

```sh
bun install
```

bun resuelve el workspace y crea un único `bun.lock` en la raíz.

### 7. `.gitignore` raíz

Añadir salidas de build y artefactos Vercel:

```
node_modules
dist
.vercel
.output
```

### 8. Verificación

```sh
bun run build:web      # debe compilar como antes
bun run dev:web        # HMR ok en el puerto de Vite
```

Si el build de web pasa, la reestructura está bien. Landing y server se añaden
en los docs siguientes.

## Nota sobre la config de Vite

`packages/web/vite.config.ts` no necesita cambios de `base` porque la web se
sirve en la **raíz de su propio dominio** (`web.vetisuite.com/`), no en un
subpath. Lo mismo la landing. Por eso separar por subdominio evita el infierno
de `base: '/web/'`.
