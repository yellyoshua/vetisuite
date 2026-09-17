# Infra 01 · Prerrequisitos

Cuentas, credenciales y secrets antes de tocar Terraform.

## 1. Cuentas

- **AWS**: una cuenta (o una por entorno si quieres aislamiento fuerte; este plan
  usa una cuenta y separa por nombre de recurso + entorno).
- **Terraform Cloud (HCP)**: organización `vetisuite`.
- **Cloudflare**: zona `vetisuite.com` ya existente (nameservers en Cloudflare).

## 2. Credenciales AWS para Terraform Cloud

Terraform Cloud ejecuta los runs remotamente → necesita credenciales AWS.
Recomendado: **OIDC dinámico** (sin llaves de larga vida). Alternativa rápida:
un IAM user con access keys.

### Opción A — OIDC (recomendado)

1. En AWS IAM → Identity providers → añade `app.terraform.io` como OIDC provider.
2. Crea un rol con trust policy hacia esa org/workspace de Terraform Cloud.
3. En el workspace, variables de entorno:
   - `TFC_AWS_PROVIDER_AUTH = true`
   - `TFC_AWS_RUN_ROLE_ARN = arn:aws:iam::<acct>:role/<rol-tfc>`

### Opción B — Access keys (rápido, menos seguro)

Variables de entorno **sensibles** en el workspace:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Permisos del rol/user (mínimo para este stack): Lambda, API Gateway v2, IAM
(crear rol + attach), ACM, CloudWatch Logs. Empieza amplio en dev, restringe
en prod.

## 3. Cloudflare (a mano, sin token)

Terraform **no** toca Cloudflare. Solo necesitas **acceso al dashboard** de la
zona `vetisuite.com` para añadir 2-3 registros DNS a mano durante el bootstrap
(validación ACM + CNAME de la API, ver `04`). No hay provider ni token de
Cloudflare en el stack.

## 4. Acceso a Terraform Cloud (bootstrap)

Terraform se corre como **bootstrap**, no en un pipeline (ver `00`). El operador
se autentica en local con `terraform login` (guarda el token de Terraform Cloud).
No hace falta ningún secret de GitHub para Terraform.

## 5. GitHub para CodePipeline

CodePipeline lee el repo por **CodeStar Connections** (GitHub App), no por
secrets. Requisitos:
- Permiso de **admin** en el repo/org para instalar la app *AWS Connector for
  GitHub* al autorizar la conexión (paso post-apply, ver `06`).
- Ramas por entorno creadas: `develop` (dev), `staging`, `main` (prod).

**No** se guardan credenciales AWS ni tokens en GitHub: CodePipeline y CodeBuild
usan roles IAM que crea Terraform (`cicd-iam.tf`).

## 6. Resumen de credenciales

| Dónde                     | Nombre                      | Uso |
|---------------------------|-----------------------------|-----|
| Local (operador)          | `terraform login` token     | Correr el bootstrap de Terraform |
| Terraform Cloud (env var) | AWS creds u OIDC            | Runs de Terraform (crear infra) |
| AWS (rol IAM, lo crea TF) | `vetisuite-codebuild-*`     | Deploy a Lambda desde CodePipeline |
| GitHub (App CodeStar)     | conexión autorizada a mano  | CodePipeline lee el repo |
| Cloudflare (dashboard)    | acceso de usuario           | Añadir registros DNS a mano (`04`) |

## 7. Herramientas locales

```sh
terraform -version    # >= 1.9
aws --version         # AWS CLI v2 (consultas / operación)
```
