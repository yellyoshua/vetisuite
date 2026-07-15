# Conexión a GitHub (CodeStar Connections). Terraform la crea en estado PENDING;
# hay que AUTORIZARLA una vez a mano en la consola AWS (Developer Tools →
# Settings → Connections → Update pending connection → instalar la GitHub App).
# Hasta autorizarla, la pipeline no puede leer el repo.
resource "aws_codestarconnections_connection" "github" {
  name          = "${var.project}-${var.environment}"
  provider_type = "GitHub"
}
