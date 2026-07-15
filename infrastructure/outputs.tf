output "api_url" {
  description = "URL pública de la API (custom domain)."
  value       = "https://${var.api_domain}"
}

output "api_gateway_endpoint" {
  description = "Endpoint por defecto de API Gateway (fallback / debug)."
  value       = aws_apigatewayv2_api.api.api_endpoint
}

output "lambda_function_name" {
  description = "Nombre de la Lambda — lo usa el CI de la app para update-function-code."
  value       = aws_lambda_function.api.function_name
}

# Registros DNS a crear A MANO en Cloudflare (todos DNS-only / sin proxy).
output "acm_validation_records" {
  description = "CNAME(s) de validación del certificado ACM. Créalos en Cloudflare para que el cert quede ISSUED."
  value = {
    for o in aws_acm_certificate.api.domain_validation_options :
    o.domain_name => { name = o.resource_record_name, type = o.resource_record_type, value = o.resource_record_value }
  }
}

output "api_cname_target" {
  description = "Crea en Cloudflare: CNAME ${var.api_domain} → este valor (DNS-only)."
  value       = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].target_domain_name
}

output "pipeline_name" {
  description = "Nombre de la CodePipeline del entorno."
  value       = aws_codepipeline.app.name
}

output "codestar_connection_arn" {
  description = "ARN de la conexión GitHub — hay que autorizarla a mano una vez (estado PENDING → AVAILABLE)."
  value       = aws_codestarconnections_connection.github.arn
}
