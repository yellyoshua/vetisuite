variable "project" {
  description = "Prefijo de nombres de recursos."
  type        = string
  default     = "vetisuite"
}

variable "environment" {
  description = "Entorno lógico (dev | staging | prod). Va en el nombre de cada recurso."
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment debe ser 'dev', 'staging' o 'prod'."
  }
}

variable "aws_region" {
  description = "Región AWS. La cert ACM del custom domain vive aquí (API HTTP = cert regional)."
  type        = string
  default     = "us-east-1"
}

variable "api_domain" {
  description = "Dominio público de la API. Ej: api.vetisuite.com o api-dev.vetisuite.com."
  type        = string
}

variable "web_origin" {
  description = "Origen permitido por CORS (la web-app)."
  type        = string
  default     = "https://app.vetisuite.com"
}

variable "lambda_runtime" {
  description = "Runtime Node de la Lambda."
  type        = string
  default     = "nodejs20.x"
}

variable "lambda_memory" {
  description = "Memoria (MB) de la Lambda."
  type        = number
  default     = 256
}

variable "lambda_timeout" {
  description = "Timeout (s) de la Lambda."
  type        = number
  default     = 15
}

# --- CI/CD (AWS CodePipeline) ---

variable "github_repo" {
  description = "Repo GitHub como owner/name. Ej: yellyoshua/vetisuite."
  type        = string
}

variable "source_branch" {
  description = "Rama que alimenta la pipeline de este entorno."
  type        = string
  default     = "main"
}

variable "pipeline_auto_trigger" {
  description = "true = la pipeline arranca sola en cada push a source_branch (DetectChanges). false = arranque manual."
  type        = bool
  default     = false
}

variable "pipeline_require_approval" {
  description = "true = acción de aprobación manual antes de desplegar (opción 'auto' = false)."
  type        = bool
  default     = true
}
