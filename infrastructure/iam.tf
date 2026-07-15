data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name               = "${var.project}-api-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

# Logs a CloudWatch. Añade aquí más policies (DynamoDB, S3, Secrets…) cuando el
# backend las necesite — un aws_iam_role_policy_attachment por permiso.
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
