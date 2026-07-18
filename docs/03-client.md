# 03 · App SPA (`client/`)

La SPA (React 19 + Vite + react-router) vive en `client/`. Se sirve en
`app.vetisuite.com/*`. Aquí: config Vercel para SPA y la conexión al backend.

## 1. Fallback SPA (crítico)

react-router usa rutas cliente (`/clients/show/:id`, etc.). Al recargar una URL
profunda, Vercel debe devolver `index.html` en vez de 404. Se configura con un
rewrite catch-all.

### `client/vercel.json`

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Regla: **cualquier** ruta que no sea un asset devuelve `index.html`; react-router
resuelve el resto en cliente. Vercel sirve los archivos estáticos reales (JS/CSS
en `/assets/*`) antes de aplicar el rewrite, así que los assets no se rompen.

## 2. URL del backend por variable de entorno

La app hace `fetch` a `https://api.vetisuite.com`. Esa URL no se hardcodea:
va en una env var de Vite (`VITE_` se inyecta en build).

### `client/.env.production`

```
VITE_API_URL=https://api.vetisuite.com
```

### `client/.env.development`

```
VITE_API_URL=http://localhost:3000
```

### Uso en código

Hoy el estado vive en memoria (`src/lib/api.ts` simula latencia). Cuando se
conecte el backend real, centraliza la base URL:

```ts
// src/lib/api.ts
const BASE = import.meta.env.VITE_API_URL

export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}
```

Ponytail: mientras siga siendo demo en memoria, **no toques nada**. Esta env var
solo importa el día que exista backend real. Déjala documentada y sigue.

> Nota: en Vercel, las `VITE_*` deben existir también como env vars del proyecto
> (Production) para que el build en CI las tenga. Ver `05-vercel-projects-domains.md`.

## 3. Verificación local

```sh
cd client
bun run build       # tsc -b + vite build → dist/
bun run preview     # sirve dist/, prueba recargar /clients/show/1
```

Recargar una ruta profunda en el preview debe cargar la app (no 404). Si da 404
en `preview`, añade a `vite.config.ts` nada — `vite preview` ya hace fallback SPA;
el `vercel.json` cubre producción.
