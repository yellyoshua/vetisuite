# 12 · Deploy

## Propósito

Publica el cliente en AWS Amplify Hosting desde Semaphore. Amplify construye y sirve el sitio
estático; Semaphore solo decide **cuándo** se publica, con una promotion manual por rama. Se usa en la
**Fase 9 · Deploy**, cuando el cliente ya compila con `bun run build:app`
([03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#scripts)).

Piezas: `client/amplify.yml` (cómo construye Amplify), `infrastructure/client/deploy.sh` (dispara el
release y espera), `.semaphore/deploy-app.yml` (un bloque por ambiente) y la promotion en
`.semaphore/semaphore.yml`. La app de Amplify, sus ramas y sus variables se crean una vez a mano en la
consola.

## amplify.yml

Path: `client/amplify.yml`

```yaml
version: 1
applications:
  - appRoot: app
    frontend:
      buildPath: '/'
      phases:
        preBuild:
          commands:
            - curl -fsSL https://bun.sh/install | bash
            - export PATH="$HOME/.bun/bin:$PATH"
            - bun --version
            - bun install
        build:
          commands:
            - export PATH="$HOME/.bun/bin:$PATH"
            - bun run build:app
      artifacts:
        baseDirectory: client/dist
        files:
          - '**/*'
      cache:
        paths:
          - $HOME/.bun/install/cache/**/*
```

- **`applications` con `appRoot: app`.** Formato monorepo de Amplify: la app de Amplify apunta a la
  carpeta `client/` del repo. Amplify debe tener marcada la opción de monorepo con esa misma raíz
  (se configura al crear la app, ver [Infraestructura a mano](#infraestructura-a-mano)).
- **`buildPath: '/'`.** Los comandos corren desde la raíz del repo, no desde `client/`. Hace falta
  porque el workspace se instala desde la raíz ([03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#workspace-y-linker))
  y el script `build:app` vive en el `package.json` raíz.
- **`preBuild` instala Bun en cada build**: la imagen de Amplify no lo trae. `bun --version` deja la
  versión usada en el log del build. Cada fase es un shell nuevo, por eso `build` vuelve a exportar
  el `PATH`.
- **`bun install` sin lockfile versionado** resuelve versiones en cada build; las versiones exactas
  de `client/package.json` acotan la deriva.
- **`build`** corre `bun run build:app` (`vite build` en `client/`). Las variables `PROYECTO_*` las toma
  del entorno del build, cargadas en la consola ([Variables en Amplify](#variables-en-amplify)).
- **`artifacts.baseDirectory: client/dist`**, relativo a `buildPath`: es la salida de Vite. Se publica
  todo su contenido.
- **`cache` guarda la caché global de Bun, no un árbol de `node_modules`.** Con el linker isolated
  los paquetes viven en `node_modules/.bun/` y cada workspace tiene su propio `node_modules` de
  symlinks; cachear `node_modules` guardaría symlinks sin sentido. La caché de descargas en
  `$HOME/.bun/install/cache` es lo que ahorra tiempo en el siguiente `bun install`.

## deploy.sh

Path: `infrastructure/client/deploy.sh` (ejecutable)

```bash
#!/usr/bin/env bash
set -euo pipefail

aws amplify update-branch --app-id "$AMPLIFY_APP_ID" --branch-name "$AMPLIFY_BRANCH" --no-enable-auto-build

JOB_ID="$(aws amplify start-job --app-id "$AMPLIFY_APP_ID" --branch-name "$AMPLIFY_BRANCH" --job-type RELEASE --query 'jobSummary.jobId' --output text)"

echo "==> Amplify app ${AMPLIFY_APP_ID}, rama ${AMPLIFY_BRANCH}, job ${JOB_ID}"

until aws amplify get-job --app-id "$AMPLIFY_APP_ID" --branch-name "$AMPLIFY_BRANCH" --job-id "$JOB_ID" --query 'job.summary.status' --output text | grep -qE 'SUCCEED|FAILED|CANCELLED'; do sleep 15; done

aws amplify get-job --app-id "$AMPLIFY_APP_ID" --branch-name "$AMPLIFY_BRANCH" --job-id "$JOB_ID" --query 'job.summary.status' --output text | grep -q SUCCEED

echo "==> job ${JOB_ID} SUCCEED"
```

El script dispara un release en Amplify y espera el resultado. El build lo hace Amplify con
`client/amplify.yml` y las variables de su consola; el script solo decide cuándo.

- **Configuración solo por variables de entorno**, sin argumentos ni valores por defecto:

  | Variable | Qué es |
  |---|---|
  | `AWS_REGION`, `AWS_DEFAULT_REGION` | Región de la app de Amplify. Van las dos porque SDK y CLI leen una distinta. |
  | `AMPLIFY_APP_ID` | Id de la app (`aws amplify list-apps`). |
  | `AMPLIFY_BRANCH` | Rama conectada en Amplify (`main` o `production`). |
  | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Credenciales del usuario de CI; llegan por el secret de Semaphore. |

  En el pipeline las declara el bloque de `deploy-app.yml`; a mano se exportan en el shell. Si falta
  una, `set -u` mata el script en la línea que la usa, antes de tocar nada.
- **`update-branch --no-enable-auto-build`**: deploy centralizado. Amplify no construye solo en cada
  push; el único que dispara un build es este script. Se repite en cada corrida para que un cambio
  manual en la consola no reactive el auto build.
- **`start-job --job-type RELEASE` construye la punta de la rama, no el commit que probó el CI.**
  `--commit-id` solo aplica a jobs `MANUAL`. Si llegan dos pushes seguidos y se promueve el primero,
  se publica el segundo. Es una simplificación deliberada con techo conocido: si hace falta publicar
  exactamente el sha verificado, el paso siguiente es un job `MANUAL` con `--commit-id`.
- **Espera con `until … sleep 15`**: el CLI de AWS no tiene *waiter* para jobs de Amplify, así que
  se pregunta el estado cada 15 segundos hasta que sea terminal (`SUCCEED`, `FAILED` o `CANCELLED`).
- **La última consulta rompe el pipeline** si el estado final no es `SUCCEED`: `grep -q` devuelve
  error y `set -e` corta con código distinto de cero. Así la promotion queda roja cuando el build de
  Amplify falla.
- **Plano a propósito**: sin funciones, sin condicionales, sin `case`. Un script por componente.

Correrlo a mano, con credenciales de AWS en el shell:

```bash
export AWS_REGION=<region> AWS_DEFAULT_REGION=<region>
export AMPLIFY_APP_ID=<amplify-app-id> AMPLIFY_BRANCH=main
infrastructure/client/deploy.sh
```

## Promotion por rama

Path: `.semaphore/deploy-app.yml`

```yaml
version: v1.0
name: Deploy app

agent:
  machine:
    type: r1-standard-2
    os_image: ubuntu2404

blocks:
  - name: Deploy app (development)
    run:
      when: "branch = 'main'"
    task:
      secrets:
        - name: development-deployment
      env_vars:
        - name: AWS_REGION
          value: <region>
        - name: AWS_DEFAULT_REGION
          value: <region>
        - name: AMPLIFY_APP_ID
          value: "<amplify-app-id>"
        - name: AMPLIFY_BRANCH
          value: main
      jobs:
        - name: amplify release
          commands:
            - checkout
            - infrastructure/client/deploy.sh

  - name: Deploy app (production)
    run:
      when: "branch = 'production'"
    task:
      secrets:
        - name: production-deployment
      env_vars:
        - name: AWS_REGION
          value: <region>
        - name: AWS_DEFAULT_REGION
          value: <region>
        - name: AMPLIFY_APP_ID
          value: "<amplify-app-id>"
        - name: AMPLIFY_BRANCH
          value: production
      jobs:
        - name: amplify release
          commands:
            - checkout
            - infrastructure/client/deploy.sh
```

**La rama decide el ambiente.** Hay un bloque por ambiente, elegido con `run.when`; no hay lógica de
ambientes en bash:

| Rama | Ambiente | Secret | Rama de Amplify |
|---|---|---|---|
| `main` | development | `development-deployment` | `main` |
| `production` | production | `production-deployment` | `production` |
| cualquier otra | ninguno | — | — |

- **Secret `<env>-deployment`**, uno por ambiente, con `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY`
  del usuario de CI de ese ambiente. Semaphore inyecta un secret solo en los bloques que lo declaran,
  así que el bloque de `main` nunca ve credenciales de producción.
- **`<amplify-app-id>` es distinto en cada bloque**: el de la app de Amplify de ese ambiente. `<region>`
  es la región donde se creó.
- **Promover desde una rama de feature no rompe nada**: los dos bloques quedan omitidos por
  `run.when` y el pipeline pasa sin publicar.
- El job solo hace `checkout` y llama al script: el mismo que se corre a mano con las mismas
  variables. El agente es la máquina estándar de Semaphore con Ubuntu 24.04, que ya trae el CLI de
  AWS.

La promotion se declara en el pipeline de CI (`.semaphore/semaphore.yml`) **sin `auto_promote`**: se
dispara con el botón de la promotion sobre el workflow que se quiere publicar. Ver el extracto en
[Bloque Verify](#bloque-verify).

## Variables en Amplify

Las variables del build se cargan en la consola de Amplify (*Hosting → Environment variables*), por
rama:

| Variable | development (`main`) | production (`production`) |
|---|---|---|
| `PROYECTO_API_DOMAIN` | `https://api-dev.dominio.com` | `https://api.dominio.com` |
| `PROYECTO_LANDING_DOMAIN` | `https://dev.dominio.com` | `https://dominio.com` |

Los valores de development son ejemplos: usa los subdominios que tenga el destino.

- **Son las mismas dos variables de `client/.env.local`** con valores de la nube. Vite da prioridad a las
  variables del proceso sobre los archivos `.env*`, así que las de la consola ganan sobre el
  `.env.local` versionado que también está en el checkout.
- **Todo lo que se carga aquí termina en el bundle público.** Ningún secreto va en las variables de
  la app de Amplify.
- **Se leen en tiempo de build.** Cambiar una variable no cambia el sitio publicado: hace falta un
  nuevo release (promotion o *Redeploy this version*).
- Sin barra final y con `https://`: `core/service.js` concatena `/api/...`.
- El dominio de la app (`https://app.dominio.com`) no es una variable del cliente, pero el server lo
  necesita como origen permitido de CORS; si cambia el dominio de la app, cambia la variable del
  server, no la de aquí.

## Bloque Verify

Extracto de `.semaphore/semaphore.yml`: solo lo que toca al cliente.

```yaml
version: v1.0
name: proyecto

agent:
  machine:
    type: r1-standard-2
    os_image: ubuntu2404

global_job_config:
  prologue:
    commands:
      - checkout
      - bun install

blocks:
  - name: Verify
    dependencies: []
    task:
      jobs:
        - name: lint
          commands:
            - bun run lint

promotions:
  - name: Deploy app
    pipeline_file: deploy-app.yml
```

- **El CI corre en todas las ramas**; para el cliente solo verifica `bun run lint`. El `prologue`
  instala el workspace desde la raíz en cada job.
- **El CI no construye la app.** El build lo hace Amplify en el release. Un error de compilación
  aparece como job `FAILED` de Amplify y `deploy.sh` rompe la promotion. Si el destino quiere detectarlo
  antes del botón, agrega `bun run build:app` como job de `Verify`.
- **Promotion manual.** Sin `auto_promote`, nada se publica solo. Semaphore permite promover aunque el
  CI del workflow haya fallado: mira que esté verde antes de apretar el botón.

## Rollback

En la consola de Amplify, en la rama del ambiente, abre el historial de builds, elige el último
build bueno y usa **Redeploy this version**. Amplify vuelve a servir ese artefacto sin reconstruir.

- No hace falta revertir el commit para recuperar el servicio; el revert se hace después, con calma,
  y se publica con una promotion normal.
- Como `deploy.sh` publica la punta de la rama, **una promotion posterior pisa el rollback** si el
  commit malo sigue en la rama. Revierte antes de volver a promover.

## Infraestructura a mano

Los scripts publican **solo código**. La infraestructura se crea una vez a mano y después se
administra en la consola; no hay IaC ni el CI la toca.

Qué se crea una vez por ambiente:

1. **App de Amplify Hosting** conectada al repo, con la opción de monorepo y raíz `app`, y la rama del
   ambiente conectada (`main` o `production`). Su id va en `AMPLIFY_APP_ID` de `deploy-app.yml`.
2. **Auto build apagado** en la rama; igual `deploy.sh` lo apaga en cada corrida.
3. **Variables de entorno** de la rama: `PROYECTO_API_DOMAIN` y `PROYECTO_LANDING_DOMAIN`
   ([Variables en Amplify](#variables-en-amplify)).
4. **Dominio personalizado** (`app.dominio.com`) y su certificado, desde la consola de Amplify.
5. **Regla de reescritura para SPA**: toda ruta que no sea un archivo estático debe servir
   `index.html` con código 200, o las URLs profundas (`/members/show/:id`) dan 404 al recargar. En el
   repo no hay rastro de esta regla porque vive en la consola; su existencia en el origen es **no
   verificado**.
6. **Usuario de CI de AWS** por ambiente con permisos mínimos sobre las apps de Amplify:
   `amplify:UpdateBranch`, `amplify:StartJob` y `amplify:GetJob`.
7. **Secret de Semaphore** `<env>-deployment` con `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` de ese
   usuario.

## Reglas de uso

- **Publica siempre por promotion**, no desde la consola de Amplify: así queda registrado qué
  workflow se promovió y la rama de Amplify sigue sin auto build.
- **No agregues lógica de ambientes a `deploy.sh`**: un ambiente nuevo es un bloque nuevo en
  `deploy-app.yml` con su rama, su secret y su app id.
- **No pongas valores por defecto en el script**: que falte una variable debe romper, no publicar en
  el ambiente equivocado.
- **No versiones valores de la nube en `client/.env.local`**: ese archivo es solo local; los de la nube
  viven en la consola de Amplify.
- **Promueve solo workflows con CI verde** y, si hubo pushes posteriores en la rama, recuerda que se
  publica la punta, no el commit del botón.

## Checklist del ejecutor

- [ ] `client/amplify.yml` con `appRoot: app`, `buildPath: '/'`, `bun run build:app`, artefactos en
      `client/dist` y caché en `$HOME/.bun/install/cache`.
- [ ] `infrastructure/client/deploy.sh` copiado y con permiso de ejecución (`chmod +x`).
- [ ] `.semaphore/deploy-app.yml` con un bloque por ambiente, `<region>` y `<amplify-app-id>`
      reemplazados, y secrets `development-deployment` / `production-deployment`.
- [ ] `.semaphore/semaphore.yml` con el job `lint` en `Verify` y la promotion `Deploy app` sin
      `auto_promote`.
- [ ] App de Amplify por ambiente creada a mano, con monorepo `app`, rama conectada, auto build
      apagado, dominio y regla de reescritura para SPA.
- [ ] `PROYECTO_API_DOMAIN` y `PROYECTO_LANDING_DOMAIN` cargadas en la consola de Amplify por rama.
- [ ] Una promotion desde `main` termina con `==> job <id> SUCCEED` y la app responde en su dominio.
- [ ] Probado un *Redeploy this version* sobre un build anterior.
