# Infra 06 · CI/CD con AWS CodePipeline

El deploy del código lo corre **AWS CodePipeline**, conectado a GitHub por
**CodeStar Connections**. **Terraform NO despliega** — solo crea la pipeline (y el
resto de infra) una vez. Cada `git push` lo maneja CodePipeline, no Terraform.

## Una pipeline por entorno

Cada workspace de Terraform (dev/staging/prod) crea su propia pipeline
`vetisuite-<env>`. Encaja con el modelo workspace-por-entorno y permite lanzar
cada entorno de forma independiente.

```
GitHub (rama del entorno)
   │  CodeStar Connection
   ▼
Source
   │
[Approve]  ← acción Manual, opcional (pipeline_require_approval)
   │
   ▼
Deploy (un CodeBuild: nitro build:lambda → zip → update-function-code)
```

Build y deploy van en **una sola acción CodeBuild** (`codebuild.tf`): compila y
sube el zip a la Lambda en la misma corrida. El approval, si está, va antes.

Recursos Terraform que lo montan: `codestar.tf`, `s3.tf` (artefactos, obligatorio
para la pipeline), `codebuild.tf` (1 proyecto), `codepipeline.tf`, `cicd-iam.tf`.

## Gate de aprobación + opción auto

El gate es una **acción de aprobación manual** nativa de CodePipeline. Dos toggles
por entorno, en los `.tfvars`:

| Variable                    | Qué hace |
|-----------------------------|----------|
| `pipeline_require_approval` | `true` → inserta la etapa `Approve` antes de `Deploy`. `false` → sin gate ("auto"). |
| `pipeline_auto_trigger`     | `true` → arranca sola en cada push (DetectChanges). `false` → arranque manual. |

Valores por entorno:

| Entorno  | rama      | auto_trigger | require_approval | Efecto |
|----------|-----------|--------------|------------------|--------|
| dev      | `develop` | true         | false            | push → build → deploy directo |
| staging  | `staging` | true         | true             | push → build → **espera aprobación** → deploy |
| prod     | `main`    | false        | true             | arranque manual → build → **aprobación** → deploy |

Cambiar un entorno a "auto" = poner `pipeline_require_approval = false` en su
`.tfvars` y `terraform apply` a ese workspace. Es un toggle de infra, no tocas la
pipeline a mano.

## Aprobar / lanzar

- **Aprobar**: consola AWS → CodePipeline → `vetisuite-prod` → la etapa `Approve`
  muestra *Review* → Approve/Reject. (Se puede notificar a SNS/Slack; fuera de
  alcance.)
- **Lanzar manual** (prod): consola → la pipeline → **Release change**. O:
  ```sh
  aws codepipeline start-pipeline-execution --name vetisuite-prod
  ```

## Autorización de la conexión GitHub (una vez)

`codestar.tf` crea la conexión en estado **PENDING**. Hay que autorizarla a mano:

1. Consola AWS → Developer Tools → Settings → **Connections**.
2. La conexión `vetisuite-<env>` → **Update pending connection**.
3. Instala/autoriza la **AWS Connector for GitHub** app sobre el repo.

Hasta que pase a **AVAILABLE**, la pipeline no puede leer el repo. El ARN sale en
el output `codestar_connection_arn`.

### Repo privado

Funciona igual, sin cambios en Terraform. La GitHub App lee repos privados si le
das acceso al autorizar: en *Install AWS Connector for GitHub* → **Only select
repositories** → marca `vetisuite`. No hacen falta PAT, deploy keys ni webhook
secrets.

> Si el repo está en una **organización** con restricciones de GitHub Apps de
> terceros, un **owner de la org** debe aprobar la instalación de la app (o tú la
> solicitas y un owner la aprueba). Repo personal privado → lo instalas directo.

## Ramas por entorno

Cada pipeline escucha una rama (`source_branch`): `develop`→dev, `staging`→staging,
`main`→prod. Promoción = merge entre ramas (`develop` → `staging` → `main`). Así
un push no dispara los tres entornos a la vez.

> ¿Prefieres una sola rama y promoción por aprobaciones encadenadas en una única
> pipeline (Source→Build→dev→approve→staging→approve→prod)? Se puede, pero rompe
> el modelo workspace-por-entorno (la pipeline sería un recurso global aparte).
> Este plan usa pipeline-por-entorno por simplicidad y despliegue independiente.

## Qué NO está en CodePipeline

- **Infra (Terraform)**: se aplica como *bootstrap* (ver `02` y `08`), no por
  CodePipeline.
- **Landing / web-app**: su propio pipeline en Vercel
  (`docs/06-ci-github-actions.md`). Ajeno a AWS.
