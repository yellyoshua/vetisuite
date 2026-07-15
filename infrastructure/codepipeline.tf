# Pipeline por entorno: Source (GitHub) → Build → [Approval opcional] → Deploy.
# El approval y el arranque automático se controlan por variables (los toggles
# "auto" viven en los .tfvars del entorno).
resource "aws_codepipeline" "app" {
  name     = "${var.project}-${var.environment}"
  role_arn = aws_iam_role.codepipeline.arn

  artifact_store {
    location = aws_s3_bucket.artifacts.bucket
    type     = "S3"
  }

  stage {
    name = "Source"
    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["source_output"]
      configuration = {
        ConnectionArn    = aws_codestarconnections_connection.github.arn
        FullRepositoryId = var.github_repo
        BranchName       = var.source_branch
        DetectChanges    = tostring(var.pipeline_auto_trigger)
      }
    }
  }

  # Gate de aprobación manual (se omite si pipeline_require_approval = false).
  dynamic "stage" {
    for_each = var.pipeline_require_approval ? [1] : []
    content {
      name = "Approve"
      action {
        name     = "Approve"
        category = "Approval"
        owner    = "AWS"
        provider = "Manual"
        version  = "1"
      }
    }
  }

  # Compila y despliega en una sola acción.
  stage {
    name = "Deploy"
    action {
      name            = "Deploy"
      category        = "Build"
      owner           = "AWS"
      provider        = "CodeBuild"
      version         = "1"
      input_artifacts = ["source_output"]
      configuration   = { ProjectName = aws_codebuild_project.app.name }
    }
  }
}
