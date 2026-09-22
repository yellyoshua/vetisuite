#!/usr/bin/env bash
set -euo pipefail

: "${DOCKER_REGISTRY:?}"
: "${DOCKER_IMAGE_PATH:?}"

cd "$(dirname "$0")/../.."

aws ecr get-login-password | docker login --username AWS --password-stdin "$DOCKER_REGISTRY"

docker build --platform linux/amd64 -f infrastructure/server/Dockerfile -t "${DOCKER_IMAGE_PATH}:$(git rev-parse HEAD)" -t "${DOCKER_IMAGE_PATH}:latest" .
docker push "${DOCKER_IMAGE_PATH}:$(git rev-parse HEAD)"
docker push "${DOCKER_IMAGE_PATH}:latest"
