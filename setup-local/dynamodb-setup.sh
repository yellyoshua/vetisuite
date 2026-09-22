#!/usr/bin/env bash
set -euo pipefail

export AWS_ENDPOINT_URL="http://localhost:4566"
export AWS_DEFAULT_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_PAGER=''

for table in vetisuite-development-rate-limits vetisuite-development-public-rate-limits; do
  aws dynamodb describe-table --table-name "$table" >/dev/null 2>&1 \
    && aws dynamodb delete-table --table-name "$table" >/dev/null \
    && aws dynamodb wait table-not-exists --table-name "$table" \
    || true

  aws dynamodb create-table --table-name "$table" --attribute-definitions AttributeName=key,AttributeType=S --key-schema AttributeName=key,KeyType=HASH --billing-mode PAY_PER_REQUEST >/dev/null
  aws dynamodb update-time-to-live --table-name "$table" --time-to-live-specification Enabled=true,AttributeName=ttl >/dev/null 2>&1 || echo "TTL no configurable en este emulador"
  echo "dynamodb: $table"
done
