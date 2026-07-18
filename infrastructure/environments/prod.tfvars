environment = "prod"
api_domain  = "api.vetisuite.com"
web_origin  = "https://app.vetisuite.com"

lambda_memory  = 512
lambda_timeout = 30

# CI/CD: prod arranca manual y exige aprobación (doble control).
github_repo               = "yellyoshua/vetisuite"
source_branch             = "main"
pipeline_auto_trigger     = false
pipeline_require_approval = true
