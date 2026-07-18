# Infra 08 · Runbook

Operación diaria del backend AWS.

## Bootstrap de infra (Terraform, operador)

```sh
cd infrastructure
export TF_WORKSPACE=vetisuite-infra-dev      # o -staging / -prod
terraform login                              # una vez
terraform init
terraform plan  -var-file=environments/dev.tfvars
terraform apply -var-file=environments/dev.tfvars
```

> Terraform es bootstrap: solo se corre cuando cambia la infraestructura. Los
> deploys de código NO pasan por aquí.

## Deploy de código

Normal: **por CodePipeline** (push a la rama del entorno → build → approve →
deploy). Para prod, arranque manual:

```sh
aws codepipeline start-pipeline-execution --name vetisuite-prod
# aprobar: consola → CodePipeline → vetisuite-prod → etapa Approve → Approve
```

Manual/debug (salta la pipeline; úsalo solo para probar en dev):

```sh
cd server
bun run build:lambda
( cd .output/server && zip -r ../../function.zip . )
aws lambda update-function-code \
  --function-name vetisuite-api-dev \
  --zip-file fileb://function.zip --publish
```

## Rollback

### Código Lambda

Cada `--publish` crea una versión. Opción simple: re-ejecuta la pipeline sobre el
commit bueno (revert + push, o `start-pipeline-execution` tras revert):

```sh
aws lambda list-versions-by-function --function-name vetisuite-api-prod
git revert <commit-malo> && git push        # dispara/relanza la pipeline del entorno
```

### Infra

```sh
git revert <commit>                          # revierte el cambio .tf
export TF_WORKSPACE=vetisuite-infra-prod
terraform apply -var-file=environments/prod.tfvars    # aplica el estado revertido
```

Terraform Cloud guarda historial de states; en la UI puedes ver y comparar runs.

## Drift

```sh
cd infrastructure
export TF_WORKSPACE=vetisuite-infra-prod
terraform plan -var-file=environments/prod.tfvars   # plan vacío = sin drift
```

Recuerda: el **código** de la Lambda no es drift (está en `ignore_changes`). Un
plan que quiera cambiar `filename`/`source_code_hash` significaría que quitaste
ese `lifecycle` — no lo hagas.

## Logs

```sh
aws logs tail /aws/lambda/vetisuite-api-prod --follow
```

## Troubleshooting

| Síntoma                                   | Causa / fix |
|-------------------------------------------|-------------|
| `curl api...` devuelve `{"placeholder":true}` | Falta el deploy de código (doc 05); Terraform solo puso el placeholder. |
| `apply` colgado en `acm_certificate_validation` | Falta añadir el CNAME de validación en Cloudflare; míralo en el output `acm_validation_records` o en ACM y créalo DNS-only (doc 04). |
| `api.vetisuite.com` no resuelve           | Falta crear a mano el CNAME → `api_cname_target` en Cloudflare (doc 04). |
| Error TLS / cert no coincide              | El CNAME está **proxied**; ponlo DNS-only (doc 04). |
| CORS duplicado o bloqueado                | CORS en APIGW **y** en Nitro; deja solo APIGW (doc 04). |
| Pipeline falla en Source                  | Conexión CodeStar en PENDING; autorízala en la consola (doc 06). |
| Pipeline no arranca en push               | `pipeline_auto_trigger = false` o push a otra rama que `source_branch` (doc 07). |
| Deploy no espera aprobación               | `pipeline_require_approval = false` en ese `.tfvars` (doc 07). |
| CodeBuild `update-function-code` AccessDenied | Rol `vetisuite-codebuild-*` sin permiso o función de otro entorno (doc 05). |
| Plan quiere recrear el custom domain      | Cambió la región o el `api_domain`; revisa `.tfvars`. |

## Checklist "todo sano"

```
[ ] terraform plan (dev/staging/prod) → sin cambios inesperados
[ ] https://api.vetisuite.com/health → respuesta real de Nitro
[ ] CORS: la web-app hace fetch sin error
[ ] conexión CodeStar en AVAILABLE
[ ] push a develop → dev despliega sin aprobación
[ ] pipeline staging/prod → espera aprobación en la etapa Approve
[ ] logs de la Lambda visibles en CloudWatch
```
