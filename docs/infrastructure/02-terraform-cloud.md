# Infra 02 · Terraform Cloud (estado + runs)

Configurar la organización, un workspace por entorno, y las variables. Terraform
se corre como **bootstrap de infraestructura** (no despliega código, ver `00`):
el operador lanza los runs con la CLI y Terraform Cloud guarda el state y ejecuta
remoto. Sin conexión VCS. El gate de aprobación de despliegues **no** vive aquí,
sino en CodePipeline (`06`).

## 1. Organización

Terraform Cloud → crea la org **`vetisuite`** (coincide con `backend.tf`).

## 2. Workspaces (uno por entorno)

El `backend.tf` selecciona workspaces por **tag** `vetisuite-infra`. Crea tres,
todos con ese tag:

| Workspace                 | Tag              | Execution | Apply |
|---------------------------|------------------|-----------|-------|
| `vetisuite-infra-dev`     | `vetisuite-infra`| Remote    | Manual apply |
| `vetisuite-infra-staging` | `vetisuite-infra`| Remote    | Manual apply |
| `vetisuite-infra-prod`    | `vetisuite-infra`| Remote    | Manual apply |

- **Execution Mode: Remote** — el run corre en Terraform Cloud.
- **Apply Method: Manual apply** — el operador confirma cada apply en la UI de
  Terraform Cloud. Como Terraform es bootstrap (no CD), esta confirmación humana
  es el control suficiente; el gate de *despliegue de código* es aparte, en
  CodePipeline.

Crea los workspaces por UI, o por API/CLI. El operador elige cuál con
`TF_WORKSPACE` (`vetisuite-infra-dev` | `-staging` | `-prod`).

## 3. Variables por workspace

### Terraform variables

No hay variables sensibles de Terraform que cargar: todo lo del entorno
(`environment`, `api_domain`, `web_origin`, `github_repo`, toggles de pipeline…)
llega por `-var-file` (`environments/<env>.tfvars`). Cloudflare es manual (sin
token en el stack).

### Environment variables (credenciales AWS)

Según `01-prerequisites.md`: OIDC (`TFC_AWS_PROVIDER_AUTH` + `TFC_AWS_RUN_ROLE_ARN`)
o access keys (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` 🔒).

> Tip: usa un **Variable Set** compartido para las credenciales AWS y aplícalo a
> los tres workspaces.

## 4. Conexión CLI-driven

`backend.tf` ya trae el bloque `cloud`. En local:

```sh
cd infrastructure
export TF_WORKSPACE=vetisuite-infra-dev
terraform login          # guarda el token de Terraform Cloud
terraform init           # vincula al workspace remoto
```

No hay pipeline de Terraform: los apply de bootstrap se corren desde local (o la
UI de Terraform Cloud) por el operador. Ver los comandos en `08-runbook.md`.

## 5. Primer plan de humo

```sh
cd infrastructure
export TF_WORKSPACE=vetisuite-infra-dev
terraform init
terraform plan -var-file=environments/dev.tfvars
```

El plan corre en Terraform Cloud (verás el enlace al run). Si planea sin errores,
la conexión y las variables están bien. El `apply` de bootstrap se confirma en la
UI de Terraform Cloud (o `terraform apply` local); ver `08-runbook.md`.
