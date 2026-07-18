# 05 · Proyectos Vercel, dominios y DNS

Crear los tres proyectos, asignar dominios, cargar env vars. **Sin conectar Git.**
Todo con la Vercel CLI.

## 0. Preparación

```sh
bun add -g vercel
vercel login          # una vez, interactivo, en tu máquina
```

## 1. Crear y enlazar cada proyecto

`vercel link` crea el proyecto (si no existe) y escribe `.vercel/project.json`
con `orgId` y `projectId`. Se hace **por paquete**.

```sh
# Landing
cd landing
vercel link --project vetisuite-landing --yes

# App
cd ../client
vercel link --project vetisuite-client --yes

# Server
cd ../server
vercel link --project vetisuite-server --yes
```

> `.vercel/` está en `.gitignore`. Para el CI **no** dependemos de esos archivos:
> pasamos `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID` por env (ver paso 5).

## 2. Anotar los IDs

Tras enlazar, cada `<carpeta>/.vercel/project.json` contiene:

```json
{ "orgId": "team_xxx", "projectId": "prj_xxx" }
```

- `orgId` es el mismo para los tres.
- `projectId` es distinto por proyecto → son los secrets del CI.

Guarda los tres `projectId` (landing/client/server) y el `orgId` común.

## 3. Framework preset por proyecto (dashboard o CLI)

En el dashboard de cada proyecto → Settings → General:

| Proyecto            | Framework Preset | Root Directory     | Build Command       | Output Directory |
|---------------------|------------------|--------------------|---------------------|------------------|
| vetisuite-landing   | Vite / Other     | `landing` | `bun run build`     | `dist`           |
| vetisuite-client       | Vite             | `client`     | `bun run build`     | `dist`           |
| vetisuite-server    | Nitro / Other    | `server`  | (prebuilt, ver 04)  | (Build Output)   |

El `vercel.json` de cada paquete ya fija `buildCommand`/`outputDirectory`, así
que el dashboard es respaldo. Para el server desplegamos `--prebuilt`, no hace
falta Build Command en Vercel.

## 4. Dominios

En Vercel, asigna un dominio por proyecto:

```sh
# apex → landing
vercel domains add vetisuite.com          # (o en dashboard)
# luego en el proyecto landing:
vercel alias / project domain → vetisuite.com  (dashboard: Settings → Domains)
```

Práctico hazlo en el dashboard (Project → Settings → Domains → Add):

| Proyecto            | Dominio a añadir      |
|---------------------|-----------------------|
| vetisuite-landing   | `vetisuite.com` (+ `www` redirect) |
| vetisuite-client       | `app.vetisuite.com`   |
| vetisuite-server    | `api.vetisuite.com`   |

### DNS

Configura en tu proveedor DNS (o usa los nameservers de Vercel):

| Registro | Nombre | Valor                   |
|----------|--------|-------------------------|
| A        | `@`    | `76.76.21.21` (Vercel)  |
| CNAME    | `www`  | `cname.vercel-dns.com`  |
| CNAME    | `app`  | `cname.vercel-dns.com`  |
| CNAME    | `api`  | `cname.vercel-dns.com`  |

Vercel emite los certs TLS automáticamente al verificar cada dominio.
Los valores exactos los muestra Vercel al añadir cada dominio — usa esos.

## 5. Variables de entorno

### App (build-time, `VITE_*`)

En vetisuite-client → Settings → Environment Variables (Production):

```
VITE_API_URL = https://api.vetisuite.com
```

O por CLI desde `client`:

```sh
vercel env add VITE_API_URL production
# pega: https://api.vetisuite.com
```

### Server (runtime)

En vetisuite-server → Settings → Environment Variables las que necesite el
backend (DB URL, secrets, etc.). Nitro las lee con `process.env`.

### Landing

Normalmente ninguna.

## 6. Primer deploy manual (smoke test)

Antes de montar el CI, prueba cada proyecto a mano desde su paquete:

```sh
cd landing && vercel --prod
cd ../client            && vercel --prod
cd ../server         && bun run build && vercel deploy --prebuilt --prod
```

Comprueba:
- `https://vetisuite.com` → landing
- `https://app.vetisuite.com` → app, recarga ruta profunda sin 404
- `https://api.vetisuite.com/healthcheck` → `{"status":"ok"}`
- desde la app, un `fetch` a la api no da error CORS

Si los tres responden, automatiza en `06-ci-github-actions.md`.
