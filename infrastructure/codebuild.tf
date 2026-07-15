# Un solo proyecto: compila el server Nitro (preset aws-lambda) y sube el zip a
# la Lambda del entorno en la misma corrida. LAMBDA_NAME inyectado.
resource "aws_codebuild_project" "app" {
  name         = "${var.project}-deploy-${var.environment}"
  service_role = aws_iam_role.codebuild.arn

  artifacts { type = "CODEPIPELINE" }

  environment {
    type         = "LINUX_CONTAINER"
    compute_type = "BUILD_GENERAL1_SMALL"
    image        = "aws/codebuild/amazonlinux2-x86_64-standard:5.0"

    environment_variable {
      name  = "LAMBDA_NAME"
      value = aws_lambda_function.api.function_name
    }
  }

  source {
    type = "CODEPIPELINE"
    buildspec = yamlencode({
      version = "0.2"
      phases = {
        install = { commands = ["npm install -g bun"] }
        build = {
          commands = [
            "bun install --frozen-lockfile",
            "bun --filter ./packages/server build:lambda",
            "cd packages/server/.output/server && zip -r /tmp/function.zip .",
            "aws lambda update-function-code --function-name \"$LAMBDA_NAME\" --zip-file fileb:///tmp/function.zip --publish",
          ]
        }
      }
    })
  }
}
