# Estado y ejecución remota en Terraform Cloud (HCP Terraform).
# Un workspace por entorno, seleccionados por tag. El CI fija cuál con
# TF_WORKSPACE (p.ej. vetisuite-infra-dev / vetisuite-infra-prod).
# La org y los nombres de workspace no admiten variables aquí: son literales.
terraform {
  cloud {
    organization = "vetisuite"

    workspaces {
      tags = ["vetisuite-infra"]
    }
  }
}
