# 07 · Runbook — operación diaria

Comandos y procedimientos para trabajar y desplegar tras montar todo.

## Desarrollo local

```sh
bun install                 # una vez / tras cambiar deps

bun run dev                      # client (SPA) con HMR
bun run --filter landing dev     # landing
bun run --filter server dev      # nitro dev (api en :3000)
```

Levantar los tres a la vez: tres terminales, o `bun run dev & bun run --filter
server dev`. La app en dev apunta a `http://localhost:3000` (`.env.development`).

## Deploy manual (sin esperar al CI)

Desde el paquete correspondiente:

```sh
# landing / app
cd client
vercel pull --yes --environment=production --token=$VERCEL_TOKEN
vercel build --prod --token=$VERCEL_TOKEN
vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN

# server
cd server
vercel pull --yes --environment=production --token=$VERCEL_TOKEN
bun run build
vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```

## Deploy vía CI

- **Push a `main`** tocando `client/**` → despliega solo la app.
- **Manual**: Actions → Deploy → Run workflow → elige pieza.

## Rollback

Vercel guarda todos los deployments. Para volver a uno anterior:

```sh
vercel ls vetisuite-client --token=$VERCEL_TOKEN         # lista deployments
vercel promote <deployment-url> --token=$VERCEL_TOKEN # promueve a producción
```

O en el dashboard: Project → Deployments → (⋯) → Promote to Production.
Instantáneo, sin rebuild. Cada proyecto se revierte por separado.

## Preview deployments

Sin `--prod`, `vercel deploy` crea una URL de preview (no toca producción). Útil
para validar antes de promover:

```sh
vercel deploy --prebuilt --token=$VERCEL_TOKEN    # → https://<hash>.vercel.app
```

## Troubleshooting

| Síntoma                                  | Causa / fix                                                                      |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| App da 404 al recargar `/clients/show/1` | Falta el rewrite SPA en `client/vercel.json` (doc 03).                     |
| `fetch` a la api bloqueado por CORS      | `Access-Control-Allow-Origin` del server ≠ `https://app.vetisuite.com` (doc 04). |
| Build de app no ve `VITE_API_URL`        | Falta la env var en el proyecto Vercel (doc 05 §5), no solo en `.env`.           |
| CI despliega al proyecto equivocado      | `VERCEL_PROJECT_ID` cruzado en los secrets (doc 06).                             |
| `vercel deploy` pide login en CI         | Falta `--token=$VERCEL_TOKEN` o el secret está vacío.                            |
| Cambio en `server` no despliega | El filtro de rutas no matchea; revisa `paths-filter` (doc 06).                   |
| Dominio no resuelve / sin TLS            | DNS mal apuntado; usa los valores exactos que muestra Vercel (doc 05).           |
| Server responde pero pierde datos        | Nitro serverless es sin estado; necesita DB externa (doc 04).                    |

## Checklist de "todo sano"

```
[ ] vetisuite.com          → landing carga
[ ] app.vetisuite.com      → app carga; recarga profunda sin 404
[ ] api.vetisuite.com/healthcheck → {"status":"ok"}
[ ] app hace fetch a la api sin error CORS
[ ] deploy manual de cada pieza funciona
[ ] workflow_dispatch con target=client solo redepliega el client
```

## Mapa de responsabilidades (quién sirve qué)

- **Vercel** sirve: estáticos de landing, estáticos de la app (SPA), y el server
  Nitro como funciones. Un solo proveedor de hosting para las tres piezas —
  cumple el requisito.
- **GitHub Actions** orquesta: build + deploy vía Vercel CLI, sin integración Git
  de Vercel.
