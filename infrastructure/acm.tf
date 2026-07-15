# Certificado para el custom domain de la API. Validación por DNS: el/los
# registro(s) CNAME de validación se añaden A MANO en Cloudflare (ver output
# `acm_validation_records`). Durante el primer apply, este recurso ESPERA a que
# el cert quede ISSUED — añade el registro en Cloudflare y el apply continúa.
resource "aws_acm_certificate" "api" {
  domain_name       = var.api_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "api" {
  certificate_arn = aws_acm_certificate.api.arn
}
