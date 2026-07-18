# Infra 00 · Visión general

Provisionar el **backend** de Veti Suite en **AWS Lambda** con **Terraform**
(solo bootstrap de infra), estado en **Terraform Cloud**, DNS en **Cloudflare**
(sin mover nameservers a AWS), y **CI/CD con AWS CodePipeline** conectado a GitHub,
con aprobación manual por entorno (opción a auto). Tres entornos: **dev, staging,
prod**.

## Qué cambia respecto al plan de hosting

El backend **deja de ser Nitro-en-Vercel** (antiguo `docs/04-server-nitro.md`) y
pasa a **Nitro compilado con el preset `aws-lambda`**, corriendo en AWS Lambda
detrás de API Gateway HTTP. Landing y web-app **siguen estáticos en Vercel**.

```
Vercel (estáticos)          AWS (Terraform crea, CodePipeline despliega)
  vetisuite.com    landing    Lambda(Nitro aws-lambda) ◄─ CodePipeline ◄─ GitHub
  app.vetisuite.com  client ─fetch──►  API Gateway HTTP        (CodeStar Connection)
                             + ACM cert + IAM + Logs
                                       ▲
                             Cloudflare DNS: CNAME api → APIGW (DNS-only)
```

## Decisiones (y por qué)

| Tema             | Decisión                          | Motivo |
|------------------|-----------------------------------|--------|
| Cómputo backend  | AWS Lambda + API Gateway HTTP     | Serverless, sin servidor que mantener. |
| IaC              | Terraform, un archivo por recurso | Diffs legibles, revisión por recurso. |
| Rol de Terraform | **Solo bootstrap de infra**       | Crea recursos (incl. la pipeline); no despliega código. |
| Estado           | Terraform Cloud (HCP)             | State gestionado, ejecución remota, sin S3/DynamoDB propios. |
| CI/CD            | **AWS CodePipeline** vía GitHub   | Deploy de código nativo en AWS, con approval integrado. |
| DNS              | Cloudflare **a mano**             | No mover nameservers a Route53; 2-3 registros manuales, sin provider en el stack. |
| TLS              | ACM, validación DNS manual        | Cert gestionada por AWS; el CNAME de validación se pone a mano en Cloudflare. |
| Entornos         | dev + staging + prod              | Una pipeline y un workspace por entorno. |
| Aprobación       | Manual por entorno, opción auto   | Acción Manual de CodePipeline; toggle `pipeline_require_approval`. |

## Separación infra ↔ código de app

- **Terraform (bootstrap)** crea la Lambda con un placeholder e **ignora** cambios
  de código (`lifecycle.ignore_changes`). Gestiona: función, rol IAM, API Gateway,
  cert, DNS, logs, **y la CodePipeline/CodeBuild** de cada entorno.
- **CodePipeline** compila Nitro (`aws-lambda`) y hace
  `aws lambda update-function-code`. Terraform no interviene en el deploy.

Así un cambio de código no dispara `terraform apply` y viceversa — cumple
"lanzar independientemente". `terraform apply` solo se corre cuando cambia la
infraestructura.

## Etapas (orden de lectura)

1. `01-prerequisites.md` — cuentas, tokens, secrets.
2. `02-terraform-cloud.md` — org, workspaces por entorno, variables.
3. `03-infra-layout.md` — mapa de `infrastructure/` (archivo por recurso).
4. `04-networking-dns-tls.md` — API Gateway custom domain, ACM, Cloudflare.
5. `05-lambda-deploy.md` — build Nitro aws-lambda + deploy de código.
6. `06-cicd-pipeline.md` — pipelines, aprobación manual, opción auto.
7. `07-environments.md` — dev/prod, tfvars, promoción.
8. `08-runbook.md` — comandos, rollback, drift, troubleshooting.

## Layout de código

```
infrastructure/              → Terraform (un .tf por recurso)
  versions.tf backend.tf providers.tf variables.tf outputs.tf data.tf
  iam.tf lambda.tf apigateway.tf acm.tf                 → backend
  s3.tf codestar.tf codebuild.tf codepipeline.tf cicd-iam.tf  → CI/CD
  environments/{dev,staging,prod}.tfvars
docs/infrastructure/         → esta documentación por etapas
```
Placeholder de la Lambda inline en `lambda.tf`; DNS a mano en Cloudflare.
