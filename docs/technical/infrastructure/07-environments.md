# Infra 07 · Entornos y promoción

Tres entornos: **dev**, **staging**, **prod**. Cada uno = un workspace de Terraform
Cloud + un `.tfvars` + una CodePipeline propia.

## Qué difiere por entorno

| Recurso / valor           | dev                       | staging                       | prod                     |
|---------------------------|---------------------------|-------------------------------|--------------------------|
| Workspace TFC             | `vetisuite-infra-dev`     | `vetisuite-infra-staging`     | `vetisuite-infra-prod`   |
| `api_domain`              | `api-dev.vetisuite.com`   | `api-staging.vetisuite.com`   | `api.vetisuite.com`      |
| `web_origin` (CORS)       | `app-dev.vetisuite.com`   | `app-staging.vetisuite.com`   | `app.vetisuite.com`      |
| Lambda mem/timeout        | 256 MB / 15 s             | 512 MB / 30 s                 | 512 MB / 30 s            |
| Rama fuente (pipeline)    | `develop`                 | `staging`                     | `main`                   |
| `pipeline_auto_trigger`   | true                      | true                          | false (arranque manual)  |
| `pipeline_require_approval` | false (**auto**)        | true                          | true                     |
| Nombres de recursos       | `vetisuite-*-dev`         | `vetisuite-*-staging`         | `vetisuite-*-prod`       |

Valores en `infrastructure/environments/{dev,staging,prod}.tfvars`. Los sensibles
(`cloudflare_*`) en variables del workspace, no en el `.tfvars`.

## Promoción del código (vía ramas)

Cada pipeline escucha su rama; promocionar = mover el código por las ramas:

```
feature ─► develop ─► staging ─► main
            │           │          │
          dev auto   staging      prod
          (deploy)   (build →      (arranque manual →
                      approve →     approve → deploy)
                      deploy)
```

1. Merge a `develop` → pipeline dev despliega solo (sin aprobación).
2. Verificar en `api-dev`. Merge `develop` → `staging`.
3. Pipeline staging construye y **espera aprobación**; apruebas → deploy.
4. Verificar en `api-staging`. Merge `staging` → `main`.
5. Pipeline prod: **Release change** (manual) → build → **aprobación** → deploy.

## Promoción de la infra (vía Terraform)

Mismo código Terraform, distinto workspace + `-var-file`:

```
1. Cambias un .tf → plan en dev → apply dev (bootstrap)
2. apply staging  (TF_WORKSPACE=vetisuite-infra-staging -var-file=environments/staging.tfvars)
3. apply prod     (idem prod)
```

Comandos en `08-runbook.md`.

## Cambiar un entorno a "auto"

`pipeline_require_approval = false` en su `.tfvars` + `terraform apply` a ese
workspace. Quita la etapa `Approve` de esa pipeline. Igual para el arranque
automático con `pipeline_auto_trigger`.

## Aislamiento

Este plan usa **una cuenta AWS** y separa por nombre + tags. Si necesitas
aislamiento fuerte (blast radius, facturación separada), pasa a **una cuenta AWS
por entorno**: mismo código, credenciales distintas por workspace. No cambia la
estructura de `infrastructure/`.
