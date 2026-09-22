#!/usr/bin/env bash
set -euo pipefail

: "${DOCKER_IMAGE_PATH:?}"
: "${LAMBDA_FUNCTION_NAME:?}"

cd "$(dirname "$0")/../.."

aws lambda update-function-code --function-name "$LAMBDA_FUNCTION_NAME" --image-uri "${DOCKER_IMAGE_PATH}:$(git rev-parse HEAD)" --publish
aws lambda wait function-updated-v2 --function-name "$LAMBDA_FUNCTION_NAME"
