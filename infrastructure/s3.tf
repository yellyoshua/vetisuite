# Bucket de artefactos de CodePipeline (obligatorio para la pipeline). El nombre
# de bucket es global; se cierra con la account id. force_destroy: los artefactos
# son efímeros, así Terraform puede destruirlo limpio. Los buckets nuevos ya
# bloquean acceso público por defecto (no hace falta public_access_block).
resource "aws_s3_bucket" "artifacts" {
  bucket        = "${var.project}-artifacts-${var.environment}-${data.aws_caller_identity.current.account_id}"
  force_destroy = true
}
