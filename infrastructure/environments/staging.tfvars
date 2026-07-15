environment = "staging"
api_domain  = "api-staging.vetisuite.com"
web_origin  = "https://web-staging.vetisuite.com"

lambda_memory  = 512
lambda_timeout = 30

# CI/CD: staging arranca solo en push a su rama, pero exige aprobación manual.
github_repo               = "yellyoshua/vetisuite"
source_branch             = "staging"
pipeline_auto_trigger     = true
pipeline_require_approval = true
