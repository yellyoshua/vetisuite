# El código real lo sube el CI de la app con `aws lambda update-function-code`
# (ver docs/infrastructure/05-lambda-deploy.md). Terraform solo CREA la función
# con un placeholder e IGNORA cambios posteriores de código → infra y deploy de
# app quedan desacoplados (se lanzan por separado).
data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/.build/placeholder.zip"

  source {
    filename = "index.mjs"
    content  = "export const handler = async () => ({ statusCode: 200, headers: { \"content-type\": \"application/json\" }, body: JSON.stringify({ ok: true, placeholder: true }) });\n"
  }
}

resource "aws_lambda_function" "api" {
  function_name = "${var.project}-api-${var.environment}"
  role          = aws_iam_role.lambda.arn
  runtime       = var.lambda_runtime
  handler       = "index.handler"

  filename         = data.archive_file.placeholder.output_path
  source_code_hash = data.archive_file.placeholder.output_base64sha256

  memory_size = var.lambda_memory
  timeout     = var.lambda_timeout

  environment {
    variables = {
      NODE_ENV   = var.environment
      WEB_ORIGIN = var.web_origin
    }
  }

  lifecycle {
    # El CI actualiza el código fuera de Terraform; no lo trates como drift.
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = 14
}
