# Infraestructura de AWS en Terraform — BrunerKids

Este documento define la especificación completa de infraestructura como código (**IaC**) en **Terraform** para la plataforma **BrunerKids**, traduciendo y modernizando los scripts imperativos de despliegue (`infrastructure/aws/01-ecr.sh` a `09-dynamodb.sh`, Amplify y CI/CD) bajo los estándares oficiales del **AWS Provider v5.x** de HashiCorp.

---

## Índice

1. [Arquitectura y Principios de Diseño](#1-arquitectura-y-principios-de-diseño)
2. [Estructura del Proyecto y Configuración de Proveedores](#2-estructura-del-proyecto-y-configuración-de-proveedores)
3. [Variables Globales y Valores Locales (`locals`)](#3-variables-globales-y-valores-locales-locals)
4. [Repositorios de Contenedores (`Amazon ECR`)](#4-repositorios-de-contenedores-amazon-ecr)
5. [Colas de Mensajería Asíncrona y DLQ (`Amazon SQS`)](#5-colas-de-mensajería-asíncrona-y-dlq-amazon-sqs)
6. [Gestión de Identidad y Accesos (`AWS IAM`)](#6-gestión-de-identidad-y-accesos-aws-iam)
7. [Cómputo Backend de la API (`AWS Lambda Server`)](#7-cómputo-backend-de-la-api-aws-lambda-server)
8. [Pasarela HTTP y Dominio Personalizado (`Amazon API Gateway HTTP v2` & `ACM`)](#8-pasarela-http-y-dominio-personalizado-amazon-api-gateway-http-v2--acm)
9. [Tareas Asíncronas en Segundo Plano (`AWS Lambda Cloudtasks`)](#9-tareas-asíncronas-en-segundo-plano-aws-lambda-cloudtasks)
10. [Almacenamiento de Archivos (`Amazon S3`)](#10-almacenamiento-de-archivos-amazon-s3)
11. [Observabilidad, Métricas y Alarmas (`Amazon CloudWatch` & `SNS`)](#11-observabilidad-métricas-y-alarmas-amazon-cloudwatch--sns)
12. [Almacenamiento Clave-Valor para Rate Limiting (`Amazon DynamoDB`)](#12-almacenamiento-clave-valor-para-rate-limiting-amazon-dynamodb)
13. [Hosting Frontend Estático (`AWS Amplify Hosting`)](#13-hosting-frontend-estático-aws-amplify-hosting)
14. [Gestión de Secretos y Parámetros (`AWS SSM & Secrets Manager`)](#14-gestión-de-secretos-y-parámetros-aws-ssm--secrets-manager)
15. [Guía de Migración, Importación (`terraform import`) y Operación](#15-guía-de-migración-importación-terraform-import-y-operación)

---

## 1. Arquitectura y Principios de Diseño

### 1.1 Diagrama de Topología Cloud

```mermaid
flowchart TD
    subgraph Clientes ["Clientes y Navegadores"]
        WebBrowser["Navegador Web (Estudiante / Tutor / Admin)"]
    end

    subgraph FrontendHosting ["Frontend Hosting (Amplify)"]
        AmplifyApp["Amplify: Panel SPA (app/)"]
        AmplifyLanding["Amplify: Landing (landing/)"]
    end

    subgraph Ingestion ["Ingesta y Red de Borde"]
        ACM["ACM SSL/TLS (api-dev.brunerkids.com)"]
        APIGW["Amazon API Gateway HTTP v2 ($default)"]
    end

    subgraph Compute ["Cómputo Serverless (Lambda Container)"]
        LambdaServer["Lambda: API Server (Nitro/Node.js)"]
        LambdaTask1["Lambda: email-account-manager"]
        LambdaTask2["Lambda: meeting-resolver"]
        LambdaTask3["Lambda: payment-webhook-verifier"]
    end

    subgraph StorageAndDB ["Persistencia y Datos"]
        S3Storage["S3 Bucket: brunerkids-*-storage (temporal/, images/, ...)"]
        DynamoLimits["DynamoDB: rate-limits & public-rate-limits"]
        PostgresDB[("PostgreSQL (Drizzle ORM)")]
    end

    subgraph Messaging ["Mensajería y Eventos"]
        SQSEmail["SQS: email-account-manager (+DLQ)"]
        SQSMeeting["SQS: meeting-resolver (+DLQ)"]
        SQSPayment["SQS: payment-webhook-verifier (+DLQ)"]
    end

    subgraph Observability ["Observabilidad y Alertas"]
        CWLogs["CloudWatch Logs (/aws/lambda/*, /aws/apigateway/*)"]
        MetricFilters["Metric Filter: ApiServerErrors"]
        CWAlarms["CloudWatch Metric Alarms"]
        SNSTopic["SNS Topic: brunerkids-*-alarms"]
    end

    WebBrowser -->|HTTPS| AmplifyApp
    WebBrowser -->|HTTPS| AmplifyLanding
    WebBrowser -->|Llamadas API| ACM -.-> APIGW
    WebBrowser -->|Upload directo Presigned POST| S3Storage

    APIGW -->|AWS_PROXY Payload 2.0| LambdaServer
    LambdaServer -->|Consultas| PostgresDB
    LambdaServer -->|Rate Limiting| DynamoLimits
    LambdaServer -->|Presign / CopyObject| S3Storage
    LambdaServer -->|SendMessage| SQSEmail & SQSMeeting & SQSPayment

    SQSEmail -->|Batch 1| LambdaTask1
    SQSMeeting -->|Batch 1| LambdaTask2
    SQSPayment -->|Batch 1| LambdaTask3

    LambdaServer & LambdaTask1 & LambdaTask2 & LambdaTask3 & APIGW --> CWLogs
    CWLogs --> MetricFilters --> CWAlarms --> SNSTopic
```

### 1.2 Principios Clave
1. **Desacoplamiento de CI/CD e IaC:** Terraform crea la infraestructura base (repositorios, roles, buckets, colas, funciones Lambda). El pipeline de CI/CD (Semaphore) despliega código compilado (`image.sh` + `deploy.sh`), por lo que las Lambdas utilizan `lifecycle { ignore_changes = [image_uri] }` para evitar que Terraform sobreescriba los tags de versión de producción.
2. **Convenciones de Recursos y Nomenclatura:** Todos los recursos siguen el prefijo `${var.project_name}-${var.environment}-*` y aplican `default_tags` unificados en el proveedor (`organization = "brunerkids"`, `environment = var.environment`).
3. **Mínimo Privilegio (Least Privilege):** Las políticas IAM se segregan por servicio (rol de la API Server, rol compartido de Cloudtasks, usuario CI/CD).
4. **AWS Provider v5.x Nativo:** Configuración de S3 con recursos atómicos (`aws_s3_bucket_cors_configuration`, `aws_s3_bucket_lifecycle_configuration`, `aws_s3_bucket_ownership_controls`, `aws_s3_bucket_public_access_block`), evitando los atributos inline obsoletos.

---

## 2. Estructura del Proyecto y Configuración de Proveedores

Se recomienda organizar el repositorio de infraestructura de la siguiente forma:

```text
infrastructure/terraform/
├── environments/
│   ├── development/
│   │   ├── terraform.tfvars
│   │   └── backend.hcl
│   └── production/
│       ├── terraform.tfvars
│       └── backend.hcl
├── modules/
│   ├── ecr/
│   ├── sqs/
│   ├── iam/
│   ├── lambda_server/
│   ├── api_gateway/
│   ├── lambda_cloudtasks/
│   ├── s3/
│   ├── dynamodb/
│   ├── monitoring/
│   └── amplify/
├── main.tf
├── variables.tf
├── locals.tf
├── outputs.tf
└── providers.tf
```

### Bloque de Terraform y Provider AWS (`providers.tf`)

```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }

  backend "s3" {
    # Los valores se parametrizan en el init con -backend-config=backend.hcl
    bucket         = "brunerkids-terraform-state-233013921888"
    key            = "brunerkids/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "brunerkids-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      organization = var.project_name
      environment  = var.environment
      managed_by   = "terraform"
    }
  }
}
```

---

## 3. Variables Globales y Valores Locales (`locals`)

### Declaración de Variables (`variables.tf`)

```hcl
variable "aws_region" {
  type        = string
  description = "Región de despliegue en AWS"
  default     = "us-east-2"
}

variable "aws_account_id" {
  type        = string
  description = "ID de la cuenta de AWS"
  default     = "233013921888"
}

variable "project_name" {
  type        = string
  description = "Nombre identificador del proyecto"
  default     = "brunerkids"
}

variable "environment" {
  type        = string
  description = "Entorno de ejecución (development o production)"
  default     = "development"

  validation {
    condition     = contains(["development", "production"], var.environment)
    error_message = "El entorno debe ser 'development' o 'production'."
  }
}

variable "domain_name" {
  type        = string
  description = "Dominio principal de la plataforma"
  default     = "brunerkids.com"
}

variable "api_subdomain" {
  type        = string
  description = "Subdominio asignado al API Gateway"
  default     = "api-dev"
}

variable "app_subdomain" {
  type        = string
  description = "Subdominio asignado a la aplicación frontend de panel"
  default     = "app-dev"
}

variable "alert_email" {
  type        = string
  description = "Dirección de correo para suscripción a las alertas SNS de CloudWatch"
  default     = "dev-alerts@brunerkids.com"
}

variable "cloudtasks" {
  type        = list(string)
  description = "Lista de nombres de tareas asíncronas para cómputo desacoplado"
  default = [
    "email-account-manager",
    "meeting-resolver",
    "payment-webhook-verifier"
  ]
}
```

### Valores Derivados (`locals.tf`)

```hcl
locals {
  name_prefix     = "${var.project_name}-${var.environment}"
  ecr_prefix      = "${var.project_name}/${var.environment}"
  full_api_domain = "${var.api_subdomain}.${var.domain_name}"
  full_app_domain = "${var.app_subdomain}.${var.domain_name}"

  # ARN helpers
  s3_bucket_name = "${local.name_prefix}-storage"
}
```

---

## 4. Repositorios de Contenedores (`Amazon ECR`)

Equivalente declarativo a `infrastructure/aws/01-ecr.sh`. Define los repositorios de imágenes Docker tanto para la API Server como para cada una de las Cloudtasks, con escaneo automático al publicar, política de retención de las últimas 10 imágenes y política de acceso para Lambda.

```hcl
# ------------------------------------------------------------------------------
# 4.1 Repositorio ECR: API Server
# ------------------------------------------------------------------------------
resource "aws_ecr_repository" "api_server" {
  name                 = "${local.ecr_prefix}-api-server"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${local.ecr_prefix}-api-server"
  }
}

# ------------------------------------------------------------------------------
# 4.2 Repositorios ECR: Cloudtasks
# ------------------------------------------------------------------------------
resource "aws_ecr_repository" "cloudtasks" {
  for_each             = toset(var.cloudtasks)
  name                 = "${local.ecr_prefix}-cloudtask-${each.key}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${local.ecr_prefix}-cloudtask-${each.key}"
  }
}

# ------------------------------------------------------------------------------
# 4.3 Política de Ciclo de Vida: Conservar solo las últimas 10 imágenes
# ------------------------------------------------------------------------------
locals {
  ecr_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Conservar las ultimas 10 imagenes"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "api_server" {
  repository = aws_ecr_repository.api_server.name
  policy     = local.ecr_lifecycle_policy
}

resource "aws_ecr_lifecycle_policy" "cloudtasks" {
  for_each   = aws_ecr_repository.cloudtasks
  repository = each.value.name
  policy     = local.ecr_lifecycle_policy
}

# ------------------------------------------------------------------------------
# 4.4 Política de Acceso: Permitir al servicio AWS Lambda leer las imágenes
# ------------------------------------------------------------------------------
data "aws_iam_policy_document" "lambda_ecr_retrieval" {
  statement {
    sid    = "LambdaECRImageRetrievalPolicy"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = [
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer"
    ]
  }
}

resource "aws_ecr_repository_policy" "api_server" {
  repository = aws_ecr_repository.api_server.name
  policy     = data.aws_iam_policy_document.lambda_ecr_retrieval.json
}

resource "aws_ecr_repository_policy" "cloudtasks" {
  for_each   = aws_ecr_repository.cloudtasks
  repository = each.value.name
  policy     = data.aws_iam_policy_document.lambda_ecr_retrieval.json
}
```

---

## 5. Colas de Mensajería Asíncrona y DLQ (`Amazon SQS`)

Equivalente declarativo a `infrastructure/aws/02-sqs.sh`. Para cada tarea en `var.cloudtasks`, se crea una cola principal y su respectiva Dead Letter Queue (DLQ).
- **VisibilityTimeout = 360 segundos:** Corresponde a 6 veces el timeout de la Lambda procesadora (60 s), según la recomendación oficial de AWS para evitar reentregas prematuras.
- **MessageRetentionPeriod de la DLQ = 14 días (1,209,600 s):** Garantiza margen de tiempo para inspección manual y redrive.
- **RedrivePolicy:** Envía el mensaje a la DLQ tras 3 reintentos fallidos (`maxReceiveCount = 3`).

```hcl
# ------------------------------------------------------------------------------
# 5.1 Colas de Mensajes Muertos (DLQ)
# ------------------------------------------------------------------------------
resource "aws_sqs_queue" "cloudtask_dlq" {
  for_each                   = toset(var.cloudtasks)
  name                       = "${local.name_prefix}-cloudtask-${each.key}-dlq"
  message_retention_seconds  = 1209600 # 14 dias

  tags = {
    Name = "${local.name_prefix}-cloudtask-${each.key}-dlq"
  }
}

# ------------------------------------------------------------------------------
# 5.2 Colas Principales con RedrivePolicy vinculada a su respectiva DLQ
# ------------------------------------------------------------------------------
resource "aws_sqs_queue" "cloudtask" {
  for_each                   = toset(var.cloudtasks)
  name                       = "${local.name_prefix}-cloudtask-${each.key}"
  visibility_timeout_seconds = 360     # 6x timeout de Lambda (60 s)
  message_retention_seconds  = 345600  # 4 dias

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.cloudtask_dlq[each.key].arn
    maxReceiveCount     = 3
  })

  tags = {
    Name = "${local.name_prefix}-cloudtask-${each.key}"
  }
}

# ------------------------------------------------------------------------------
# 5.3 Redrive Allow Policy (Mejor Práctica AWS v5): Restringir la DLQ
# ------------------------------------------------------------------------------
resource "aws_sqs_queue_redrive_allow_policy" "cloudtask_dlq" {
  for_each  = aws_sqs_queue.cloudtask_dlq
  queue_url = each.value.id

  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue"
    sourceQueueArns   = [aws_sqs_queue.cloudtask[each.key].arn]
  })
}
```

---

## 6. Gestión de Identidad y Accesos (`AWS IAM`)

Equivalente declarativo a `infrastructure/aws/03-iam.sh`. Define:
1. **Rol de la Lambda API Server:** logs, publicación en colas SQS de cloudtasks, acceso a prefijos del bucket S3, lectura/escritura en DynamoDB.
2. **Rol de las Lambdas Cloudtasks:** logs, recepción/borrado de mensajes en SQS, publicación en SQS y operaciones de objetos S3.
3. **Usuario IAM para CI/CD:** credencial utilizada por Semaphore para construir/publicar imágenes en ECR, actualizar código de Lambdas e invocar jobs de Amplify.

```hcl
# Documento genérico de asunción de rol por parte de AWS Lambda
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# ------------------------------------------------------------------------------
# 6.1 Rol y Política para Lambda API Server
# ------------------------------------------------------------------------------
resource "aws_iam_role" "api_server_lambda" {
  name               = "${local.name_prefix}-api-server-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = {
    Name = "${local.name_prefix}-api-server-lambda"
  }
}

data "aws_iam_policy_document" "api_server_policy" {
  statement {
    sid       = "Logs"
    effect    = "Allow"
    actions   = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["arn:aws:logs:${var.aws_region}:${var.aws_account_id}:*"]
  }

  statement {
    sid       = "PublishEvents"
    effect    = "Allow"
    actions   = [
      "sqs:SendMessage",
      "sqs:GetQueueUrl",
      "sqs:GetQueueAttributes"
    ]
    resources = ["arn:aws:sqs:${var.aws_region}:${var.aws_account_id}:${local.name_prefix}-cloudtask-*"]
  }

  statement {
    sid       = "StorageBucket"
    effect    = "Allow"
    actions   = [
      "s3:ListBucket",
      "s3:GetBucketLocation"
    ]
    resources = ["arn:aws:s3:::${local.s3_bucket_name}"]
  }

  statement {
    sid       = "StorageObjects"
    effect    = "Allow"
    actions   = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:GetObjectTagging",
      "s3:PutObjectTagging"
    ]
    resources = ["arn:aws:s3:::${local.s3_bucket_name}/*"]
  }

  statement {
    sid       = "RateLimits"
    effect    = "Allow"
    actions   = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem"
    ]
    resources = [
      "arn:aws:dynamodb:${var.aws_region}:${var.aws_account_id}:table/${local.name_prefix}-rate-limits",
      "arn:aws:dynamodb:${var.aws_region}:${var.aws_account_id}:table/${local.name_prefix}-public-rate-limits"
    ]
  }
}

resource "aws_iam_role_policy" "api_server_lambda" {
  name   = "${local.name_prefix}-api-server-lambda"
  role   = aws_iam_role.api_server_lambda.id
  policy = data.aws_iam_policy_document.api_server_policy.json
}

# ------------------------------------------------------------------------------
# 6.2 Rol y Política para Lambdas Cloudtasks
# ------------------------------------------------------------------------------
resource "aws_iam_role" "cloudtask_lambda" {
  name               = "${local.name_prefix}-cloudtask-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = {
    Name = "${local.name_prefix}-cloudtask-lambda"
  }
}

data "aws_iam_policy_document" "cloudtask_policy" {
  statement {
    sid       = "Logs"
    effect    = "Allow"
    actions   = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["arn:aws:logs:${var.aws_region}:${var.aws_account_id}:*"]
  }

  statement {
    sid       = "ConsumeQueue"
    effect    = "Allow"
    actions   = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ChangeMessageVisibility"
    ]
    resources = ["arn:aws:sqs:${var.aws_region}:${var.aws_account_id}:${local.name_prefix}-cloudtask-*"]
  }

  statement {
    sid       = "PublishEvents"
    effect    = "Allow"
    actions   = [
      "sqs:SendMessage",
      "sqs:GetQueueUrl"
    ]
    resources = ["arn:aws:sqs:${var.aws_region}:${var.aws_account_id}:${local.name_prefix}-cloudtask-*"]
  }

  statement {
    sid       = "StorageBucket"
    effect    = "Allow"
    actions   = [
      "s3:ListBucket",
      "s3:GetBucketLocation"
    ]
    resources = ["arn:aws:s3:::${local.s3_bucket_name}"]
  }

  statement {
    sid       = "StorageObjects"
    effect    = "Allow"
    actions   = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:GetObjectTagging",
      "s3:PutObjectTagging"
    ]
    resources = ["arn:aws:s3:::${local.s3_bucket_name}/*"]
  }
}

resource "aws_iam_role_policy" "cloudtask_lambda" {
  name   = "${local.name_prefix}-cloudtask-lambda"
  role   = aws_iam_role.cloudtask_lambda.id
  policy = data.aws_iam_policy_document.cloudtask_policy.json
}

# ------------------------------------------------------------------------------
# 6.3 Usuario IAM y Permisos de Despliegue para CI/CD (Semaphore)
# ------------------------------------------------------------------------------
resource "aws_iam_user" "ci_deployer" {
  name = "${local.name_prefix}-ci"

  tags = {
    Name = "${local.name_prefix}-ci"
  }
}

data "aws_iam_policy_document" "ci_deployer_policy" {
  statement {
    sid       = "EcrLogin"
    effect    = "Allow"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid       = "EcrPush"
    effect    = "Allow"
    actions   = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer",
      "ecr:GetRepositoryPolicy"
    ]
    resources = ["arn:aws:ecr:${var.aws_region}:${var.aws_account_id}:repository/${var.project_name}/${var.environment}-*"]
  }

  statement {
    sid       = "LambdaDeploy"
    effect    = "Allow"
    actions   = [
      "lambda:UpdateFunctionCode",
      "lambda:PublishVersion",
      "lambda:GetFunction",
      "lambda:GetFunctionConfiguration"
    ]
    resources = ["arn:aws:lambda:${var.aws_region}:${var.aws_account_id}:function:${local.name_prefix}-*"]
  }

  statement {
    sid       = "AmplifyRelease"
    effect    = "Allow"
    actions   = [
      "amplify:UpdateBranch",
      "amplify:StartJob",
      "amplify:GetJob"
    ]
    resources = ["arn:aws:amplify:${var.aws_region}:${var.aws_account_id}:apps/*"]
  }
}

resource "aws_iam_user_policy" "ci_deployer" {
  name   = "${local.name_prefix}-ci"
  user   = aws_iam_user.ci_deployer.name
  policy = data.aws_iam_policy_document.ci_deployer_policy.json
}

# Access Key para inyectar en los secrets de Semaphore CI
resource "aws_iam_access_key" "ci_deployer" {
  user = aws_iam_user.ci_deployer.name
}
```

---

## 7. Cómputo Backend de la API (`AWS Lambda Server`)

Equivalente declarativo a `infrastructure/aws/04-lambda-server.sh`. Implementa:
- Log Group de CloudWatch explícito con retención de 14 días.
- Función Lambda empaquetada como imagen de contenedor (`linux/amd64`).
- Memoria configurada en 1024 MB y timeout de 30 s.
- `lifecycle { ignore_changes = [image_uri] }` para posibilitar el flujo continuo de `infrastructure/server/deploy.sh` sin desincronizar Terraform.

```hcl
# ------------------------------------------------------------------------------
# 7.1 CloudWatch Log Group con retención de 14 días
# ------------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "api_server" {
  name              = "/aws/lambda/${local.name_prefix}-api-server"
  retention_in_days = 14

  tags = {
    Name = "/aws/lambda/${local.name_prefix}-api-server"
  }
}

# ------------------------------------------------------------------------------
# 7.2 Función Lambda de la API Server
# ------------------------------------------------------------------------------
resource "aws_lambda_function" "api_server" {
  function_name = "${local.name_prefix}-api-server"
  description   = "API Nitro de brunerkids (${var.environment})"
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.api_server.repository_url}:latest"
  role          = aws_iam_role.api_server_lambda.arn
  architectures = ["x86_64"]
  memory_size   = 1024
  timeout       = 30

  # Variables de entorno declaradas según especificación de desarrollo/producción
  environment {
    variables = {
      APP_ENV                  = var.environment
      BRUNERKIDS_API_DOMAIN    = "https://${local.full_api_domain}"
      BRUNERKIDS_APP_DOMAIN    = "https://${local.full_app_domain}"
      BRUNERKIDS_LANDING_DOMAIN = "https://${var.domain_name}"
      RATE_LIMIT_COUNT         = "100"
      PUBLIC_RATE_LIMIT_COUNT  = "300"
      # Nota: Secrets sensibles como DATABASE_URL, JWT_SECRET, PAYPHONE_TOKEN
      # se inyectan mediante SSM Parameter Store o Secrets Manager (Sección 14)
    }
  }

  lifecycle {
    # Evita que Terraform revierta la imagen cuando Semaphore publica :<git-sha>
    ignore_changes = [
      image_uri,
      environment[0].variables["DATABASE_URL"],
      environment[0].variables["JWT_SECRET"],
      environment[0].variables["DAILY_CO_API_KEY"],
      environment[0].variables["PAYPHONE_TOKEN"]
    ]
  }

  depends_on = [
    aws_cloudwatch_log_group.api_server,
    aws_iam_role_policy.api_server_lambda
  ]

  tags = {
    Name = "${local.name_prefix}-api-server"
  }
}
```

---

## 8. Pasarela HTTP y Dominio Personalizado (`Amazon API Gateway HTTP v2` & `ACM`)

Equivalente declarativo y automatizado de `infrastructure/aws/05-api-gateway.sh`. Elimina por completo los pasos manuales de configuración en la consola de AWS:
1. HTTP API v2 (`$default` stage con auto-deploy).
2. Formato de log de acceso estructurado en JSON directo a CloudWatch.
3. Integración proxy con la Lambda del servidor (payload format `2.0`).
4. Ruta `$default` conectada a la integración.
5. Permiso de invocación en Lambda (`aws_lambda_permission`).
6. Certificado TLS regional en AWS Certificate Manager (ACM).
7. Dominio personalizado en API Gateway mapeado al stage `$default`.

```hcl
# ------------------------------------------------------------------------------
# 8.1 API Gateway HTTP v2 (Sin CORS en GW: lo resuelve Nitro)
# ------------------------------------------------------------------------------
resource "aws_apigatewayv2_api" "http_api" {
  name          = "${local.name_prefix}-api-server"
  protocol_type = "HTTP"
  description   = "API de brunerkids (${var.environment})"

  tags = {
    Name = "${local.name_prefix}-api-server"
  }
}

# ------------------------------------------------------------------------------
# 8.2 Log Group para Access Logs de API Gateway
# ------------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "api_gateway_access_logs" {
  name              = "/aws/apigateway/${local.name_prefix}-api-server"
  retention_in_days = 14

  tags = {
    Name = "/aws/apigateway/${local.name_prefix}-api-server"
  }
}

# ------------------------------------------------------------------------------
# 8.3 Stage $default con Auto-Deploy y Formato de Logs JSON
# ------------------------------------------------------------------------------
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway_access_logs.arn
    format = jsonencode({
      requestId        = "$context.requestId"
      ip               = "$context.identity.sourceIp"
      requestTime      = "$context.requestTime"
      method           = "$context.httpMethod"
      path             = "$context.path"
      routeKey         = "$context.routeKey"
      status           = "$context.status"
      latency          = "$context.responseLatency"
      integrationError = "$context.integration.error"
      userAgent        = "$context.identity.userAgent"
    })
  }

  tags = {
    Name = "${local.name_prefix}-api-stage-default"
  }
}

# ------------------------------------------------------------------------------
# 8.4 Integración Proxy con la Lambda del Servidor
# ------------------------------------------------------------------------------
resource "aws_apigatewayv2_integration" "api_server" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api_server.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
  description            = "Integracion con Lambda API Server Nitro"
}

# ------------------------------------------------------------------------------
# 8.5 Ruta $default apuntando a la Integración
# ------------------------------------------------------------------------------
resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.api_server.id}"
}

# ------------------------------------------------------------------------------
# 8.6 Permiso de Invocación desde API Gateway hacia Lambda
# ------------------------------------------------------------------------------
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_server.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

# ------------------------------------------------------------------------------
# 8.7 Certificado SSL/TLS ACM Regional para el Dominio de la API
# ------------------------------------------------------------------------------
resource "aws_acm_certificate" "api_cert" {
  domain_name       = local.full_api_domain
  validation_method = "DNS"
  key_algorithm     = "RSA_2048"

  tags = {
    Name = local.full_api_domain
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ------------------------------------------------------------------------------
# 8.8 Nombre de Dominio Personalizado en API Gateway (Regional, TLS 1.2)
# ------------------------------------------------------------------------------
resource "aws_apigatewayv2_domain_name" "api" {
  domain_name = local.full_api_domain

  domain_name_configuration {
    certificate_arn = aws_acm_certificate.api_cert.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  tags = {
    Name = local.full_api_domain
  }
}

# ------------------------------------------------------------------------------
# 8.9 API Mapping: Conectar el Dominio Personalizado al API y Stage $default
# ------------------------------------------------------------------------------
resource "aws_apigatewayv2_api_mapping" "api" {
  api_id      = aws_apigatewayv2_api.http_api.id
  domain_name = aws_apigatewayv2_domain_name.api.id
  stage       = aws_apigatewayv2_stage.default.id
}
```

---

## 9. Tareas Asíncronas en Segundo Plano (`AWS Lambda Cloudtasks`)

Equivalente declarativo a `infrastructure/aws/06-lambda-cloudtasks.sh`. Implementa las funciones de procesamiento asíncrono para eventos desacoplados mediante un loop declarativo con `for_each`:
- Log Group dedicado con 14 días de retención.
- Función Lambda basada en imagen de contenedor (512 MB, 60 s).
- Event Source Mapping vinculado a su cola SQS con `batch_size = 1`.
- `lifecycle { ignore_changes = [image_uri] }`.

```hcl
# ------------------------------------------------------------------------------
# 9.1 Log Groups para cada Cloudtask
# ------------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "cloudtasks" {
  for_each          = toset(var.cloudtasks)
  name              = "/aws/lambda/${local.name_prefix}-cloudtask-${each.key}"
  retention_in_days = 14

  tags = {
    Name = "/aws/lambda/${local.name_prefix}-cloudtask-${each.key}"
  }
}

# ------------------------------------------------------------------------------
# 9.2 Funciones Lambda Cloudtasks
# ------------------------------------------------------------------------------
resource "aws_lambda_function" "cloudtasks" {
  for_each      = toset(var.cloudtasks)
  function_name = "${local.name_prefix}-cloudtask-${each.key}"
  description   = "Cloudtask ${each.key} (${var.environment})"
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.cloudtasks[each.key].repository_url}:latest"
  role          = aws_iam_role.cloudtask_lambda.arn
  architectures = ["x86_64"]
  memory_size   = 512
  timeout       = 60

  environment {
    variables = {
      APP_ENV               = var.environment
      BRUNERKIDS_APP_DOMAIN = "https://${local.full_app_domain}"
      # Las variables especificas por task (RESEND_API_KEY, DAILY_CO_API_KEY,
      # PAYPHONE_TOKEN, etc.) se inyectan en runtime via SSM/Secrets Manager.
    }
  }

  lifecycle {
    ignore_changes = [
      image_uri,
      environment[0].variables["DATABASE_URL"],
      environment[0].variables["RESEND_API_KEY"],
      environment[0].variables["DAILY_CO_API_KEY"],
      environment[0].variables["PAYPHONE_TOKEN"]
    ]
  }

  depends_on = [
    aws_cloudwatch_log_group.cloudtasks,
    aws_iam_role_policy.cloudtask_lambda
  ]

  tags = {
    Name = "${local.name_prefix}-cloudtask-${each.key}"
  }
}

# ------------------------------------------------------------------------------
# 9.3 Event Source Mapping: Disparador SQS -> Lambda (Batch 1)
# ------------------------------------------------------------------------------
resource "aws_lambda_event_source_mapping" "cloudtask_sqs_trigger" {
  for_each         = toset(var.cloudtasks)
  event_source_arn = aws_sqs_queue.cloudtask[each.key].arn
  function_name    = aws_lambda_function.cloudtasks[each.key].arn
  batch_size       = 1
  enabled          = true

  tags = {
    Name = "${local.name_prefix}-cloudtask-${each.key}-trigger"
  }
}
```

---

## 10. Almacenamiento de Archivos (`Amazon S3`)

Equivalente declarativo a `infrastructure/aws/07-s3.sh`. Se apega estrictamente a las buenas prácticas de AWS Provider v5 (recursos independientes en lugar de atributos inline obsoletos).
- **Acceso Privado Absoluto:** `aws_s3_bucket_public_access_block` con todos los bloqueos habilitados.
- **Ownership Controls:** `BucketOwnerEnforced` (desactiva ACLs antiguas).
- **Ciclo de Vida:** Los archivos subidos directamente por el navegador al prefijo temporal (`temporal/`) que no hayan sido consolidados por el servidor expiran en 7 días.
- **CORS Estricto:** Permite únicamente el método `POST` desde el origen web del panel (`https://app-dev.brunerkids.com`), necesario para el flujo de carga presignada directa.
- **Cifrado en Reposo (SSE):** Cifrado AES256 obligatorio.

```hcl
# ------------------------------------------------------------------------------
# 10.1 Bucket S3 Principal
# ------------------------------------------------------------------------------
resource "aws_s3_bucket" "storage" {
  bucket = local.s3_bucket_name

  tags = {
    Name = local.s3_bucket_name
  }
}

# ------------------------------------------------------------------------------
# 10.2 Bloqueo de Acceso Público
# ------------------------------------------------------------------------------
resource "aws_s3_bucket_public_access_block" "storage" {
  bucket = aws_s3_bucket.storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ------------------------------------------------------------------------------
# 10.3 Control de Propietario (Bucket Owner Enforced: Desactiva ACLs)
# ------------------------------------------------------------------------------
resource "aws_s3_bucket_ownership_controls" "storage" {
  bucket = aws_s3_bucket.storage.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# ------------------------------------------------------------------------------
# 10.4 Cifrado en Reposo por Defecto (SSE-S3 / AES256)
# ------------------------------------------------------------------------------
resource "aws_s3_bucket_server_side_encryption_configuration" "storage" {
  bucket = aws_s3_bucket.storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# ------------------------------------------------------------------------------
# 10.5 Regla de Ciclo de Vida: Expiración de Objetos en temporal/ a los 7 Días
# ------------------------------------------------------------------------------
resource "aws_s3_bucket_lifecycle_configuration" "storage" {
  bucket = aws_s3_bucket.storage.id

  rule {
    id     = "expirar-temporal"
    status = "Enabled"

    filter {
      prefix = "temporal/"
    }

    expiration {
      days = 7
    }
  }
}

# ------------------------------------------------------------------------------
# 10.6 Configuración de CORS para Subidas Directas vía Presigned POST
# ------------------------------------------------------------------------------
resource "aws_s3_bucket_cors_configuration" "storage" {
  bucket = aws_s3_bucket.storage.id

  cors_rule {
    allowed_origins = ["https://${local.full_app_domain}"]
    allowed_methods = ["POST"]
    allowed_headers = ["Content-Type"]
    expose_headers  = []
    max_age_seconds = 3000
  }
}
```

---

## 11. Observabilidad, Métricas y Alarmas (`Amazon CloudWatch` & `SNS`)

Equivalente declarativo a `infrastructure/aws/08-alarms.sh`. Configura la capa de monitoreo reactivo:
1. **Tópico SNS y suscripción de correo:** Destino de todas las notificaciones de emergencia.
2. **Metric Filter en Logs del Server:** Monitorea las entradas JSON con `{ $.level = "error" }` generadas por `server/utils/logger.js`.
3. **Alarma de Errores de API (5xx / errores de aplicación):** Dispara si se detecta >= 1 error en 1 minuto.
4. **Alarma de Fallos de Cómputo Lambda:** Monitorea `AWS/Lambda Errors` de la función server (cold-starts fallidos, OOM, timeouts).
5. **Alarmas de DLQ en Cloudtasks:** Disparan inmediatamente si cualquier mensaje cae en la cola de mensajes muertos (`ApproximateNumberOfMessagesVisible >= 1`).

```hcl
# ------------------------------------------------------------------------------
# 11.1 Tópico SNS para Notificación de Alarmas
# ------------------------------------------------------------------------------
resource "aws_sns_topic" "alarms" {
  name = "${local.name_prefix}-alarms"

  tags = {
    Name = "${local.name_prefix}-alarms"
  }
}

resource "aws_sns_topic_subscription" "email_alerts" {
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ------------------------------------------------------------------------------
# 11.2 Metric Filter: Errores JSON del Servidor en CloudWatch Logs
# ------------------------------------------------------------------------------
resource "aws_cloudwatch_log_metric_filter" "api_server_errors" {
  name           = "${local.name_prefix}-api-server-errors"
  pattern        = "{ $.level = \"error\" }"
  log_group_name = aws_cloudwatch_log_group.api_server.name

  metric_transformation {
    name          = "ApiServerErrors"
    namespace     = "${var.project_name}/${var.environment}"
    value         = "1"
    default_value = 0
  }
}

# ------------------------------------------------------------------------------
# 11.3 Alarma: Errores de Aplicación en la API (>= 1 en 60 segundos)
# ------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "api_server_errors" {
  alarm_name          = "${local.name_prefix}-api-server-errors"
  alarm_description   = "El API respondio 5xx o logueo un error de aplicacion"
  namespace           = "${var.project_name}/${var.environment}"
  metric_name         = "ApiServerErrors"
  statistic           = "Sum"
  period              = 60
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  tags = {
    Name = "${local.name_prefix}-api-server-errors"
  }
}

# ------------------------------------------------------------------------------
# 11.4 Alarma: Fallos No Controlados de Lambda Server (Init, Timeout, OOM)
# ------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "api_server_lambda_errors" {
  alarm_name          = "${local.name_prefix}-api-server-lambda-errors"
  alarm_description   = "La Lambda del API fallo (init, timeout o memoria)"
  namespace           = "AWS/Lambda"
  metric_name         = "Errors"
  statistic           = "Sum"
  period              = 60
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    FunctionName = aws_lambda_function.api_server.function_name
  }

  tags = {
    Name = "${local.name_prefix}-api-server-lambda-errors"
  }
}

# ------------------------------------------------------------------------------
# 11.5 Alarmas para Mensajes en las DLQs de Cloudtasks (Fallo tras 3 Reintentos)
# ------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "cloudtask_dlq" {
  for_each            = toset(var.cloudtasks)
  alarm_name          = "${local.name_prefix}-cloudtask-${each.key}-dlq"
  alarm_description   = "cloudtask ${each.key}: mensajes presentes en la DLQ"
  namespace           = "AWS/SQS"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    QueueName = aws_sqs_queue.cloudtask_dlq[each.key].name
  }

  tags = {
    Name = "${local.name_prefix}-cloudtask-${each.key}-dlq"
  }
}
```

---

## 12. Almacenamiento Clave-Valor para Rate Limiting (`Amazon DynamoDB`)

Equivalente declarativo a `infrastructure/aws/09-dynamodb.sh`. Provee las dos tablas utilizadas por `server/utils/dynamodb.js` para control de tráfico:
1. `${local.name_prefix}-rate-limits`: Llave = Session ID del usuario autenticado.
2. `${local.name_prefix}-public-rate-limits`: Llave = `sha256(ip:userAgent)` para rutas públicas.

Ambas tablas operan bajo facturación on-demand (`PAY_PER_REQUEST`), con partición primaria en `key` y expiración automática mediante TTL en el atributo `ttl`.

```hcl
# ------------------------------------------------------------------------------
# 12.1 Tabla de Rate Limits de Sesión Autenticada
# ------------------------------------------------------------------------------
resource "aws_dynamodb_table" "rate_limits" {
  name         = "${local.name_prefix}-rate-limits"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "key"

  attribute {
    name = "key"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${local.name_prefix}-rate-limits"
  }
}

# ------------------------------------------------------------------------------
# 12.2 Tabla de Rate Limits Públicos (Hash IP + UserAgent)
# ------------------------------------------------------------------------------
resource "aws_dynamodb_table" "public_rate_limits" {
  name         = "${local.name_prefix}-public-rate-limits"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "key"

  attribute {
    name = "key"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${local.name_prefix}-public-rate-limits"
  }
}
```

---

## 13. Hosting Frontend Estático (`AWS Amplify Hosting`)

Equivalente declarativo de las aplicaciones frontend (`app/` y `landing/`), permitiendo gestionar mediante Terraform su creación, build specs y redirecciones SPA.

```hcl
# ------------------------------------------------------------------------------
# 13.1 Amplify App: Panel SPA (React / Vite en app/)
# ------------------------------------------------------------------------------
resource "aws_amplify_app" "app" {
  name       = "${local.name_prefix}-app"
  repository = "https://github.com/yellyoshua/linguikids"

  build_spec = <<-EOT
    version: 1
    applications:
      - appRoot: app
        frontend:
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
            baseDirectory: app/dist
            files:
              - '**/*'
          cache:
            paths:
              - $HOME/.bun/install/cache/**/*
  EOT

  # Redirección SPA para React Router (todas las rutas no-estáticas devuelven 200 a index.html)
  custom_rule {
    source = "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>"
    status = "200"
    target = "/index.html"
  }

  environment_variables = {
    VITE_API_URL = "https://${local.full_api_domain}"
    APP_ENV      = var.environment
  }

  tags = {
    Name = "${local.name_prefix}-app"
  }
}

# Rama asociada a la app: Desactiva auto-build para delegar la publicación al CI
resource "aws_amplify_branch" "app_branch" {
  app_id            = aws_amplify_app.app.id
  branch_name       = var.environment == "production" ? "production" : "main"
  enable_auto_build = false

  tags = {
    Name = "${local.name_prefix}-app-branch"
  }
}

# ------------------------------------------------------------------------------
# 13.2 Amplify App: Landing Page (Astro en landing/)
# ------------------------------------------------------------------------------
resource "aws_amplify_app" "landing" {
  name       = "${local.name_prefix}-landing"
  repository = "https://github.com/yellyoshua/linguikids"

  build_spec = <<-EOT
    version: 1
    applications:
      - appRoot: landing
        frontend:
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
                - bun run build:landing
          artifacts:
            baseDirectory: landing/dist
            files:
              - '**/*'
          cache:
            paths:
              - $HOME/.bun/install/cache/**/*
              - landing/.astro/**/*
  EOT

  custom_rule {
    source = "/<*>"
    status = "200"
    target = "/index.html"
  }

  tags = {
    Name = "${local.name_prefix}-landing"
  }
}

resource "aws_amplify_branch" "landing_branch" {
  app_id            = aws_amplify_app.landing.id
  branch_name       = var.environment == "production" ? "production" : "main"
  enable_auto_build = false

  tags = {
    Name = "${local.name_prefix}-landing-branch"
  }
}
```

---

## 14. Gestión de Secretos y Parámetros (`AWS SSM & Secrets Manager`)

Para sustituir la configuración manual en la consola de AWS sin exponer credenciales en el repositorio:

```hcl
# ------------------------------------------------------------------------------
# 14.1 Secretos en AWS Secrets Manager
# ------------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = "${local.name_prefix}-secrets"
  description             = "Credenciales sensibles para backend y cloudtasks (${var.environment})"
  recovery_window_in_days = 0 # Eliminación inmediata en caso de destroy

  tags = {
    Name = "${local.name_prefix}-secrets"
  }
}

# Ejemplo de estructura de secretos esperados
resource "aws_secretsmanager_secret_version" "app_secrets_template" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    DATABASE_URL               = "postgresql://usuario:password@host/db"
    JWT_SECRET                 = "clave-secreta-de-firmado-jwt"
    RESEND_API_KEY             = "re_xxx"
    DAILY_CO_API_KEY           = "daily_xxx"
    DAILY_CO_WEBHOOK_SECRET    = "daily_wh_xxx"
    PAYPHONE_TOKEN             = "payphone_token_xxx"
    PAYPHONE_STORE_ID          = "payphone_store_xxx"
    PAYPHONE_WEBHOOK_SECRET    = "payphone_wh_xxx"
  })

  lifecycle {
    # Permite editar los valores reales en la consola o CLI sin que Terraform los sobreescriba
    ignore_changes = [secret_string]
  }
}

# ------------------------------------------------------------------------------
# 14.2 Concesión de Lectura al Rol de Lambda
# ------------------------------------------------------------------------------
data "aws_iam_policy_document" "secrets_read" {
  statement {
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_secretsmanager_secret.app_secrets.arn]
  }
}

resource "aws_iam_role_policy" "api_server_secrets" {
  name   = "${local.name_prefix}-secrets-read"
  role   = aws_iam_role.api_server_lambda.id
  policy = data.aws_iam_policy_document.secrets_read.json
}
```

---

## 15. Guía de Migración, Importación (`terraform import`) y Operación

### 15.1 Mapeo de Comandos Bash a Recursos de Terraform

| Script Original Bash | Recurso Terraform HCL Correspondiente |
|---|---|
| `01-ecr.sh` | `aws_ecr_repository`, `aws_ecr_lifecycle_policy`, `aws_ecr_repository_policy` |
| `02-sqs.sh` | `aws_sqs_queue` (normal y `-dlq`), `aws_sqs_queue_redrive_allow_policy` |
| `03-iam.sh` | `aws_iam_role`, `aws_iam_role_policy`, `aws_iam_user`, `aws_iam_user_policy`, `aws_iam_access_key` |
| `04-lambda-server.sh` | `aws_cloudwatch_log_group`, `aws_lambda_function.api_server` |
| `05-api-gateway.sh` | `aws_apigatewayv2_api`, `aws_apigatewayv2_stage`, `aws_apigatewayv2_integration`, `aws_apigatewayv2_route`, `aws_acm_certificate`, `aws_apigatewayv2_domain_name`, `aws_apigatewayv2_api_mapping` |
| `06-lambda-cloudtasks.sh`| `aws_cloudwatch_log_group.cloudtasks`, `aws_lambda_function.cloudtasks`, `aws_lambda_event_source_mapping` |
| `07-s3.sh` | `aws_s3_bucket`, `aws_s3_bucket_public_access_block`, `aws_s3_bucket_ownership_controls`, `aws_s3_bucket_lifecycle_configuration`, `aws_s3_bucket_cors_configuration` |
| `08-alarms.sh` | `aws_sns_topic`, `aws_sns_topic_subscription`, `aws_cloudwatch_log_metric_filter`, `aws_cloudwatch_metric_alarm` |
| `09-dynamodb.sh` | `aws_dynamodb_table.rate_limits`, `aws_dynamodb_table.public_rate_limits` |

---

### 15.2 Comandos de Importación para Adoptar Recursos Existentes

Si los recursos ya fueron creados previamente mediante los scripts bash en `development`, ejecute los siguientes comandos `terraform import` para sincronizarlos con el estado de Terraform sin provocar destrucción ni caída de servicio:

```bash
# ECR
terraform import aws_ecr_repository.api_server brunerkids/development-api-server
terraform import 'aws_ecr_repository.cloudtasks["email-account-manager"]' brunerkids/development-cloudtask-email-account-manager
terraform import 'aws_ecr_repository.cloudtasks["meeting-resolver"]' brunerkids/development-cloudtask-meeting-resolver
terraform import 'aws_ecr_repository.cloudtasks["payment-webhook-verifier"]' brunerkids/development-cloudtask-payment-webhook-verifier

# SQS
terraform import 'aws_sqs_queue.cloudtask_dlq["email-account-manager"]' https://sqs.us-east-2.amazonaws.com/233013921888/brunerkids-development-cloudtask-email-account-manager-dlq
terraform import 'aws_sqs_queue.cloudtask["email-account-manager"]' https://sqs.us-east-2.amazonaws.com/233013921888/brunerkids-development-cloudtask-email-account-manager

terraform import 'aws_sqs_queue.cloudtask_dlq["meeting-resolver"]' https://sqs.us-east-2.amazonaws.com/233013921888/brunerkids-development-cloudtask-meeting-resolver-dlq
terraform import 'aws_sqs_queue.cloudtask["meeting-resolver"]' https://sqs.us-east-2.amazonaws.com/233013921888/brunerkids-development-cloudtask-meeting-resolver

terraform import 'aws_sqs_queue.cloudtask_dlq["payment-webhook-verifier"]' https://sqs.us-east-2.amazonaws.com/233013921888/brunerkids-development-cloudtask-payment-webhook-verifier-dlq
terraform import 'aws_sqs_queue.cloudtask["payment-webhook-verifier"]' https://sqs.us-east-2.amazonaws.com/233013921888/brunerkids-development-cloudtask-payment-webhook-verifier

# IAM
terraform import aws_iam_role.api_server_lambda brunerkids-development-api-server-lambda
terraform import aws_iam_role.cloudtask_lambda brunerkids-development-cloudtask-lambda
terraform import aws_iam_user.ci_deployer brunerkids-development-ci

# Lambda Server y Logs
terraform import aws_cloudwatch_log_group.api_server /aws/lambda/brunerkids-development-api-server
terraform import aws_lambda_function.api_server brunerkids-development-api-server

# API Gateway HTTP v2
terraform import aws_apigatewayv2_api.http_api qaw1ddqxtc
terraform import aws_cloudwatch_log_group.api_gateway_access_logs /aws/apigateway/brunerkids-development-api-server
terraform import aws_apigatewayv2_stage.default qaw1ddqxtc/\$default

# S3
terraform import aws_s3_bucket.storage brunerkids-development-storage
terraform import aws_s3_bucket_public_access_block.storage brunerkids-development-storage
terraform import aws_s3_bucket_ownership_controls.storage brunerkids-development-storage

# DynamoDB
terraform import aws_dynamodb_table.rate_limits brunerkids-development-rate-limits
terraform import aws_dynamodb_table.public_rate_limits brunerkids-development-public-rate-limits

# CloudWatch & SNS
terraform import aws_sns_topic.alarms arn:aws:sns:us-east-2:233013921888:brunerkids-development-alarms
terraform import aws_cloudwatch_metric_alarm.api_server_errors brunerkids-development-api-server-errors
terraform import aws_cloudwatch_metric_alarm.api_server_lambda_errors brunerkids-development-api-server-lambda-errors
```

---

### 15.3 Flujo de Despliegue de Terraform

```bash
# 1. Inicializar el backend y los proveedores
terraform init

# 2. Validar sintaxis y coherencia semántica
terraform validate

# 3. Planificar cambios frente al ambiente seleccionado
terraform plan -var-file="environments/development/terraform.tfvars" -out="tfplan.binary"

# 4. Aplicar cambios de forma controlada
terraform apply "tfplan.binary"
```

---

### 15.4 Outputs Principales (`outputs.tf`)

```hcl
output "ecr_api_server_repository_url" {
  description = "URL del repositorio ECR del API Server"
  value       = aws_ecr_repository.api_server.repository_url
}

output "api_gateway_endpoint" {
  description = "Endpoint default asignado por AWS al API Gateway"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

output "custom_domain_api_url" {
  description = "URL publica del API Gateway bajo dominio personalizado"
  value       = "https://${local.full_api_domain}"
}

output "s3_storage_bucket_name" {
  description = "Nombre del bucket S3 de almacenamiento de la plataforma"
  value       = aws_s3_bucket.storage.id
}

output "ci_deployer_access_key_id" {
  description = "Access Key ID del usuario CI/CD para Semaphore"
  value       = aws_iam_access_key.ci_deployer.id
}

output "ci_deployer_secret_access_key" {
  description = "Secret Access Key del usuario CI/CD (sensible)"
  value       = aws_iam_access_key.ci_deployer.secret
  sensitive   = true
}
```
