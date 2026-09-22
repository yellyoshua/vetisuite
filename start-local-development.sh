#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

docker compose up -d --wait

bash setup-local/sqs-setup.sh
bash setup-local/s3-setup.sh
bash setup-local/dynamodb-setup.sh
