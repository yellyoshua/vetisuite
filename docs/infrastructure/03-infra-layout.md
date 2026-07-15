# Infra 03 · Layout de `infrastructure/`

Un archivo por recurso lógico. Sin módulos (YAGNI): el stack es pequeño y un solo
root module con archivos por recurso se lee y revisa mejor. Si algún día hay que
reutilizarlo entre stacks, se extrae a módulo entonces.

## Archivos

| Archivo             | Contenido | Recursos clave |
|---------------------|-----------|----------------|
| `versions.tf`       | Versión de Terraform y providers | `required_providers` (aws, archive) |
| `backend.tf`        | Estado remoto | bloque `cloud` (Terraform Cloud) |
| `providers.tf`      | Config de providers | `provider "aws"` |
| `variables.tf`      | Entradas | todas las `variable` |
| `outputs.tf`        | Salidas | `api_url`, `lambda_function_name`, `acm_validation_records`, `api_cname_target` |
| `iam.tf`            | Permisos de la Lambda | `aws_iam_role` + attach logs |
| `lambda.tf`         | Función + logs | `aws_lambda_function`, `aws_cloudwatch_log_group`, `archive_file` (placeholder inline) |
| `apigateway.tf`     | API HTTP + custom domain | `aws_apigatewayv2_*`, `aws_lambda_permission` |
| `acm.tf`            | Certificado TLS | `aws_acm_certificate` + `_validation` (DNS a mano en Cloudflare) |
| `data.tf`           | Datos de la cuenta | `aws_caller_identity` |
| `s3.tf`             | Artefactos de CI/CD | `aws_s3_bucket` (artifacts) |
| `codestar.tf`       | Conexión GitHub | `aws_codestarconnections_connection` |
| `codebuild.tf`      | Build + deploy (1 proyecto) | `aws_codebuild_project.app` |
| `codepipeline.tf`   | Pipeline del entorno | `aws_codepipeline` (source→[approve]→deploy) |
| `cicd-iam.tf`       | Roles CI/CD | roles de CodePipeline y CodeBuild |
| `environments/`     | Valores por entorno | `dev.tfvars`, `staging.tfvars`, `prod.tfvars` |

El placeholder de la Lambda va **inline** en `archive_file` (dentro de
`lambda.tf`); no hay carpeta `lambda-src/`. El DNS **no** lo gestiona Terraform:
se añade a mano en Cloudflare (ver `04`).

## Grafo de dependencias (resumido)

```
variables ─► iam ─► lambda ─► apigateway ─► (custom domain)
                     │              ▲
              acm.certificate ─► acm.validation   (espera DNS manual en Cloudflare)

s3 + codestar ─► codepipeline   (cicd-iam da permisos)
lambda ─────────► codebuild.app  (build + update-function-code)
```

Terraform resuelve el orden solo por las referencias; no hay `depends_on`
manuales salvo los implícitos.

## Convenciones

- **Nombres**: `${var.project}-<recurso>-${var.environment}` → p.ej.
  `vetisuite-api-prod`. Entra en `default_tags` también (Project/Environment).
- **Un recurso ≠ un archivo estricto**: recursos íntimamente acoplados viven
  juntos (la Lambda y su log group; la API y su integración/route/stage). El
  criterio es "una pieza de infraestructura por archivo", no "un `resource` por
  archivo".
- **Nada de secrets en `.tfvars`**: las credenciales AWS van en variables de
  Terraform Cloud. Los `.tfvars` solo llevan valores no sensibles y versionables.
- **`.build/` y `.terraform/`** ignorados (`infrastructure/.gitignore`).

## Añadir un recurso nuevo

1. Crea `infrastructure/<recurso>.tf`.
2. Si necesita entrada, añade la `variable` en `variables.tf` y su valor en los
   `.tfvars` (o en Terraform Cloud si es sensible).
3. Expón lo relevante en `outputs.tf`.
4. `terraform plan` en dev → revisa → apply por el pipeline.

Ejemplo típico siguiente: `dynamodb.tf` para persistencia, más un
`aws_iam_role_policy_attachment` en `iam.tf` dando acceso a la Lambda.
