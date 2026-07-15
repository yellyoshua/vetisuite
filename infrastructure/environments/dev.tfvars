environment = "dev"
api_domain  = "api-dev.vetisuite.com"
web_origin  = "https://web-dev.vetisuite.com"

lambda_memory  = 256
lambda_timeout = 15

# CI/CD: dev despliega solo en cada push, sin aprobación ("auto").
github_repo               = "yellyoshua/vetisuite"
source_branch             = "develop"
pipeline_auto_trigger     = true
pipeline_require_approval = false
