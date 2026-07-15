# Infra 04 · Red, DNS y TLS (Cloudflare a mano)

Cómo `api.vetisuite.com` llega a la Lambda. Terraform gestiona **todo AWS**; los
**registros DNS se ponen a mano en Cloudflare** (2-3 registros, una vez por
entorno — no es tedioso y evita meter el provider/token de Cloudflare en el stack).

## Cadena de red

```
Cliente ─► https://api.vetisuite.com
             │  (CNAME DNS-only en Cloudflare, manual)
             ▼
        API Gateway custom domain  (cert ACM, TLS_1_2)
             │  api mapping → stage $default
             ▼
        Integración AWS_PROXY ─► Lambda (Nitro)
```

## 1. Certificado (ACM, validación DNS)

`acm.tf` crea la cert para `api_domain` con `validation_method = "DNS"` y un
`aws_acm_certificate_validation` que **espera** a que quede ISSUED.

## 2. Flujo del primer apply (con paso manual)

```
1. terraform apply
2. El apply se DETIENE en aws_acm_certificate_validation (espera el cert).
3. Copia el registro de validación:
     - del output `acm_validation_records`, o
     - de la consola AWS → ACM → el cert → "Create records in Route 53"
       (no lo crees en Route53; solo lee name/type/value).
4. En Cloudflare añade ese CNAME (DNS-only, sin proxy).
5. ACM valida en segundos → el apply continúa y crea el custom domain.
```

Es un paso manual **una sola vez** por entorno (la cert luego se renueva sola si
el registro de validación sigue puesto).

## 3. CNAME final de la API

Tras el apply, del output `api_cname_target`, crea en Cloudflare:

```
CNAME  api.vetisuite.com  →  <api_cname_target>   (DNS-only, sin proxy)
```

> **DNS-only (sin nube naranja)**: si proxeas por Cloudflare, el proxy termina el
> TLS y rompe el match cert/SNI del custom domain de API Gateway. Todo lo que
> apunte a APIGW va sin proxy.

## 4. Registros por entorno

| Entorno | Registro API                   | Validación ACM |
|---------|--------------------------------|----------------|
| dev     | `api-dev.vetisuite.com`        | 1 CNAME (output) |
| staging | `api-staging.vetisuite.com`    | 1 CNAME (output) |
| prod    | `api.vetisuite.com`            | 1 CNAME (output) |

## 5. CORS

Lo maneja **API Gateway** (`cors_configuration` en `apigateway.tf`), no Nitro.
Origen permitido = `var.web_origin`.

> Importante: **desactiva el CORS en el server Nitro** para no duplicar cabeceras.
> En `nitro.config.ts`, quita `routeRules['/**'].cors` y las cabeceras
> `Access-Control-*`.

## Región

La cert ACM de un HTTP API custom domain es **regional**: misma región que la API
(`var.aws_region`, default `us-east-1`).

## Verificación tras el apply

```sh
dig +short api.vetisuite.com          # resuelve al target de APIGW
curl -i https://api.vetisuite.com/health
```
