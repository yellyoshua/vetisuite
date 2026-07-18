# 06 · CI — deploy independiente con GitHub Actions

Pipeline que despliega **landing**, **client** y **server** por separado, sin
integración Git de Vercel. Dos disparadores:

1. **Automático por push**: filtra por rutas cambiadas → solo despliega lo tocado.
2. **Manual (`workflow_dispatch`)**: eliges qué pieza lanzar desde la UI de Actions.

## Secrets del repo

En GitHub → Settings → Secrets and variables → Actions:

| Secret                       | Valor                                   |
|------------------------------|-----------------------------------------|
| `VERCEL_TOKEN`               | token de cuenta (Account → Tokens)      |
| `VERCEL_ORG_ID`              | `orgId` común (doc 05)                  |
| `VERCEL_PROJECT_ID_LANDING`  | `projectId` de vetisuite-landing        |
| `VERCEL_PROJECT_ID_CLIENT`      | `projectId` de vetisuite-client            |
| `VERCEL_PROJECT_ID_SERVER`   | `projectId` de vetisuite-server         |

`VERCEL_ORG_ID` + `VERCEL_PROJECT_ID` en el entorno hacen que `vercel pull/build/
deploy` operen sobre el proyecto correcto **sin** `.vercel/project.json`.

## Cómo despliega cada pieza

Patrón estático (landing / client):

```sh
vercel pull   --yes --environment=production --token=$VERCEL_TOKEN
vercel build  --prod --token=$VERCEL_TOKEN
vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```

Patrón server (Nitro ya produce el output → no `vercel build`):

```sh
vercel pull   --yes --environment=production --token=$VERCEL_TOKEN
bun run build                                   # NITRO_PRESET=vercel → .vercel/output
vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```

## Workflow

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      target:
        description: Qué desplegar
        type: choice
        options: [all, landing, client, server]
        default: all

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}

jobs:
  # Detecta qué paquetes cambiaron (solo en push)
  changes:
    runs-on: ubuntu-latest
    outputs:
      landing: ${{ steps.f.outputs.landing }}
      client: ${{ steps.f.outputs.client }}
      server: ${{ steps.f.outputs.server }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: f
        with:
          filters: |
            landing: ['landing/**']
            client: ['client/**']
            server: ['server/**']

  landing:
    needs: changes
    if: >-
      (github.event_name == 'push' && needs.changes.outputs.landing == 'true') ||
      (github.event_name == 'workflow_dispatch' &&
       contains(fromJSON('["all","landing"]'), inputs.target))
    runs-on: ubuntu-latest
    env:
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_LANDING }}
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bunx vercel pull --yes --environment=production --token=$VERCEL_TOKEN
        env: { VERCEL_TOKEN: '${{ secrets.VERCEL_TOKEN }}' }
      - run: bunx vercel build --prod --token=$VERCEL_TOKEN
        env: { VERCEL_TOKEN: '${{ secrets.VERCEL_TOKEN }}' }
      - run: bunx vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
        env: { VERCEL_TOKEN: '${{ secrets.VERCEL_TOKEN }}' }

  client:
    needs: changes
    if: >-
      (github.event_name == 'push' && needs.changes.outputs.client == 'true') ||
      (github.event_name == 'workflow_dispatch' &&
       contains(fromJSON('["all","client"]'), inputs.target))
    runs-on: ubuntu-latest
    env:
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_CLIENT }}
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bunx vercel pull --yes --environment=production --token=$VERCEL_TOKEN
        env: { VERCEL_TOKEN: '${{ secrets.VERCEL_TOKEN }}' }
      - run: bunx vercel build --prod --token=$VERCEL_TOKEN
        env: { VERCEL_TOKEN: '${{ secrets.VERCEL_TOKEN }}' }
      - run: bunx vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
        env: { VERCEL_TOKEN: '${{ secrets.VERCEL_TOKEN }}' }

  server:
    needs: changes
    if: >-
      (github.event_name == 'push' && needs.changes.outputs.server == 'true') ||
      (github.event_name == 'workflow_dispatch' &&
       contains(fromJSON('["all","server"]'), inputs.target))
    runs-on: ubuntu-latest
    env:
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_SERVER }}
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bunx vercel pull --yes --environment=production --token=$VERCEL_TOKEN
        env: { VERCEL_TOKEN: '${{ secrets.VERCEL_TOKEN }}' }
      - run: bun --filter ./server build      # NITRO_PRESET=vercel → .vercel/output
      - run: bunx vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN --cwd server
        env: { VERCEL_TOKEN: '${{ secrets.VERCEL_TOKEN }}' }
```

### Notas de implementación

- **`--cwd <carpeta>`**: `vercel pull/build/deploy` deben correr en el dir del
  paquete para que tomen su `vercel.json`. Los jobs estáticos (landing/client) usan
  el `Root Directory` del proyecto en Vercel; si prefieres, añade `--cwd
  landing` a sus tres comandos vercel para no depender del dashboard.
  Sé consistente: o Root Directory en Vercel, o `--cwd` en todos.
- **Independencia**: cada job tiene su propio `VERCEL_PROJECT_ID`. Nunca se pisan.
  El dispatch con `target: server` solo corre el job server.
- **Filtro de rutas**: un cambio en `client/**` solo dispara el job `client`.
  Cambios en la raíz (p.ej. lockfile) no disparan nada — añade una regla
  `shared: ['bun.lock','package.json']` y ponla como dependencia de todos si
  quieres redeploy global en esos casos.
- **Gate de calidad**: opcional añadir `bun run lint` / `bun --filter ./client
  build` como step previo al deploy. `vercel build` ya compila, así que un lint
  basta para fallar temprano.

## Disparo manual independiente

GitHub → Actions → Deploy → **Run workflow** → eliges `landing` | `client` |
`server` | `all`. Cumple "lanzar independientemente".
