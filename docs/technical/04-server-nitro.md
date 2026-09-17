# 04 · Backend Nitro (`server`)

> **OBSOLETO como target de deploy.** El backend ya no se sirve en Vercel: pasa a
> AWS Lambda (preset `aws-lambda`) provisionado con Terraform. Ver
> `docs/infrastructure/`. Este doc se conserva por el código Nitro (`routes/`,
> etc.), pero el preset, el CORS y el despliegue quedan sustituidos por el plan de
> infraestructura. CORS ahora lo maneja API Gateway, no `nitro.config.ts`.


API en `api.vetisuite.com/*`. Nitro con el preset `vercel`, que emite el
formato Build Output API de Vercel (`.vercel/output`). Se despliega como
**prebuilt** — Nitro construye, Vercel solo sube.

## Pasos

### 1. Crear el paquete

```sh
cd server
bun init -y
bun add nitropack
bun add -D typescript
```

### 2. `server/package.json`

```json
{
  "name": "server",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nitro dev",
    "build": "NITRO_PRESET=vercel nitro build",
    "preview": "node .output/server/index.mjs"
  },
  "dependencies": {
    "nitropack": "^2.10.0"
  }
}
```

`NITRO_PRESET=vercel` hace que `nitro build` produzca `.vercel/output` en la raíz
del paquete, listo para `vercel deploy --prebuilt`.

### 3. `server/nitro.config.ts`

```ts
import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  srcDir: '.',
  routeRules: {
    // CORS para la app (cross-origin app.vetisuite.com → api.vetisuite.com)
    '/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': 'https://app.vetisuite.com',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },
  },
})
```

> `Access-Control-Allow-Origin` con un único origen es lo correcto en producción.
> No uses `*` si vas a mandar cookies/Authorization.

### 4. Rutas de ejemplo

Nitro enruta por sistema de archivos en `routes/`.

`server/routes/healthcheck.get.ts`:

```ts
export default defineEventHandler(() => ({ ok: true }))
```

`server/routes/clients/index.get.ts`:

```ts
export default defineEventHandler(() => {
  return [{ id: '1', nombre: 'Demo' }]
})
```

Esto responde a `GET api.vetisuite.com/healthcheck` y `GET api.vetisuite.com/clients`.

### 5. Preflight OPTIONS

Con `routeRules.cors: true` Nitro responde el preflight `OPTIONS` automáticamente.
Si necesitas control fino, añade un middleware en `server/middleware/`.

### 6. Verificación local

```sh
bun run dev              # nitro dev en http://localhost:3000
curl localhost:3000/healthcheck   # {"status":"ok"}

bun run build            # genera .vercel/output
ls .vercel/output        # config.json + functions/ + static/
```

Si `.vercel/output` existe tras el build, está listo para deploy prebuilt.

## Cómo lo despliega el CI

El server **no** usa `vercel build` (Nitro ya produce el output nativo). El job:

```sh
cd server
bun install
bun run build                          # NITRO_PRESET=vercel → .vercel/output
vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```

Detalle completo en `06-ci-github-actions.md`.

## Persistencia

Nitro en Vercel corre como funciones serverless (sin estado entre invocaciones).
Para datos reales usa un servicio externo (Postgres/Redis gestionado) vía
`useStorage()` o un cliente DB. Fuera del alcance de este plan de hosting.
