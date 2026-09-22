#!/usr/bin/env bash
set -euo pipefail

export AWS_ENDPOINT_URL="http://localhost:4566"
export AWS_DEFAULT_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_PAGER=''

for queue in vetisuite-development-cloudtask-email-account-manager; do
  aws sqs get-queue-url --queue-name "$queue" >/dev/null 2>&1 \
    && aws sqs delete-queue --queue-url "$(aws sqs get-queue-url --queue-name "$queue" --query QueueUrl --output text)" \
    || true

  aws sqs create-queue --queue-name "$queue" >/dev/null
  echo "sqs: $queue"
done
