# Infra 05 · Build y deploy del código Lambda

Terraform crea la Lambda con un placeholder. El **código real** (el server Nitro)
se compila con el preset `aws-lambda` y se sube con `aws lambda
update-function-code` — **fuera de Terraform**, por **CodePipeline** (`06`). Las
etapas de abajo son exactamente lo que corre CodeBuild (buildspecs inline en
`codebuild.tf`); los comandos manuales sirven para depurar en local.

## 1. Preset de Nitro

El server (`server`) se compila para AWS Lambda:

```sh
NITRO_PRESET=aws-lambda nitro build
```

Salida en `.output/server/` con un handler exportado en `index.mjs`. El handler
de la Lambda es `index.handler` (coincide con `lambda.tf`).

Añade el script en `server/package.json`:

```json
{
  "scripts": {
    "build:lambda": "NITRO_PRESET=aws-lambda nitro build"
  }
}
```

> El preset `vercel` del plan anterior queda obsoleto para el backend; puedes
> borrarlo o dejar ambos scripts (`build` = vercel, `build:lambda` = aws). Este
> plan usa `build:lambda`.

## 2. Empaquetar

```sh
cd server
bun run build:lambda
cd .output/server
zip -r ../../function.zip .        # zip del CONTENIDO de .output/server
```

## 3. Subir el código

Necesitas el nombre de la función (output de Terraform
`lambda_function_name`, p.ej. `vetisuite-api-prod`):

```sh
aws lambda update-function-code \
  --function-name vetisuite-api-prod \
  --zip-file fileb://server/function.zip \
  --publish
```

Rápido (segundos), no toca infraestructura. Por eso el deploy de código y el
`terraform apply` son pipelines independientes.

## 4. Artefactos grandes (> 50 MB)

Si el zip supera el límite de subida directa, pásalo por S3:

```sh
aws s3 cp function.zip s3://<bucket>/vetisuite-api-prod/$(git rev-parse --short HEAD).zip
aws lambda update-function-code \
  --function-name vetisuite-api-prod \
  --s3-bucket <bucket> --s3-key vetisuite-api-prod/<sha>.zip --publish
```

El bucket sería otro recurso Terraform (`s3.tf`) si llegas a necesitarlo.
Ponytail: no lo crees hasta que el zip lo pida.

## 5. Permisos del deployer

El deploy lo hace el **rol de CodeBuild** (`vetisuite-codebuild-<env>`, en
`cicd-iam.tf`), no un IAM user con llaves. Ya trae:

```
lambda:UpdateFunctionCode / PublishVersion   (sobre la función del entorno)
s3:GetObject / PutObject                      (bucket de artefactos)
logs:*                                        (CloudWatch)
```

Sin credenciales en GitHub: CodePipeline asume estos roles. Separado de las
credenciales que usa Terraform Cloud.

## 6. Verificación

```sh
curl -s https://api.vetisuite.com/health     # respuesta real de Nitro, no el placeholder
```

Si sigue devolviendo `{"placeholder":true}`, el `update-function-code` no corrió
o apuntó a otra función.
