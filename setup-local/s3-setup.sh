#!/usr/bin/env bash
set -euo pipefail

export AWS_ENDPOINT_URL="http://localhost:4566"
export AWS_DEFAULT_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_PAGER=''

bucket="vetisuite-development-storage"

aws s3api head-bucket --bucket "$bucket" >/dev/null 2>&1 \
  && aws s3 rb "s3://$bucket" --force >/dev/null \
  || true

aws s3api create-bucket --bucket "$bucket" >/dev/null
aws s3api put-bucket-cors --bucket "$bucket" --cors-configuration '{"CORSRules":[{"AllowedOrigins":["http://localhost:3000"],"AllowedMethods":["POST"],"AllowedHeaders":["Content-Type"],"ExposeHeaders":[],"MaxAgeSeconds":3000}]}'
aws s3api put-bucket-lifecycle-configuration --bucket "$bucket" --lifecycle-configuration '{"Rules":[{"ID":"expirar-temporal","Status":"Enabled","Filter":{"Prefix":"temporal/"},"Expiration":{"Days":7}}]}' >/dev/null

echo "s3: $bucket"
