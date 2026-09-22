#!/usr/bin/env bash
set -euo pipefail

: "${APP_ENV:?APP_ENV requerido: development | production}"
: "${AWS_REGION:?AWS_REGION requerido}"
: "${APP_DOMAIN:?APP_DOMAIN requerido, con esquema y sin barra final}"
: "${ALARM_EMAIL:?ALARM_EMAIL requerido}"

export AWS_PAGER=''

ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
PREFIX="vetisuite-${APP_ENV}"
REPOSITORY="vetisuite/${APP_ENV}-api-server"
FUNCTION="${PREFIX}-api-server"
QUEUE="${PREFIX}-cloudtask-email-account-manager"
BUCKET="${PREFIX}-storage"
ALARMS_TOPIC="arn:aws:sns:${AWS_REGION}:${ACCOUNT}:${PREFIX}-alarms"
TAGS_KV="Key=organization,Value=vetisuite Key=environment,Value=${APP_ENV}"
TAGS_MAP="organization=vetisuite,environment=${APP_ENV}"

ecr () {
  aws ecr create-repository --region "$AWS_REGION" --repository-name "$REPOSITORY" --image-scanning-configuration scanOnPush=true --image-tag-mutability MUTABLE --tags $TAGS_KV
  aws ecr put-lifecycle-policy --region "$AWS_REGION" --repository-name "$REPOSITORY" --lifecycle-policy-text '{"rules":[{"rulePriority":1,"description":"Conservar las ultimas 10 imagenes","selection":{"tagStatus":"any","countType":"imageCountMoreThan","countNumber":10},"action":{"type":"expire"}}]}'
  aws ecr set-repository-policy --region "$AWS_REGION" --repository-name "$REPOSITORY" --policy-text '{"Version":"2012-10-17","Statement":[{"Sid":"LambdaECRImageRetrievalPolicy","Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":["ecr:BatchGetImage","ecr:GetDownloadUrlForLayer"]}]}'
}

sqs () {
  aws sqs create-queue --region "$AWS_REGION" --queue-name "${QUEUE}-dlq" --attributes MessageRetentionPeriod=1209600 --tags "$TAGS_MAP"
  aws sqs create-queue --region "$AWS_REGION" --queue-name "$QUEUE" --attributes "{\"VisibilityTimeout\":\"360\",\"MessageRetentionPeriod\":\"345600\",\"RedrivePolicy\":\"{\\\"deadLetterTargetArn\\\":\\\"arn:aws:sqs:${AWS_REGION}:${ACCOUNT}:${QUEUE}-dlq\\\",\\\"maxReceiveCount\\\":\\\"3\\\"}\"}" --tags "$TAGS_MAP"
}

iam () {
  aws iam create-role --role-name "${FUNCTION}-lambda" --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' --tags $TAGS_KV
  aws iam put-role-policy --role-name "${FUNCTION}-lambda" --policy-name "${FUNCTION}-lambda" --policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[
    {\"Sid\":\"Logs\",\"Effect\":\"Allow\",\"Action\":[\"logs:CreateLogGroup\",\"logs:CreateLogStream\",\"logs:PutLogEvents\"],\"Resource\":\"arn:aws:logs:${AWS_REGION}:${ACCOUNT}:*\"},
    {\"Sid\":\"PublishEvents\",\"Effect\":\"Allow\",\"Action\":[\"sqs:SendMessage\",\"sqs:GetQueueUrl\",\"sqs:GetQueueAttributes\"],\"Resource\":\"arn:aws:sqs:${AWS_REGION}:${ACCOUNT}:${PREFIX}-cloudtask-*\"},
    {\"Sid\":\"Storage\",\"Effect\":\"Allow\",\"Action\":[\"s3:ListBucket\",\"s3:GetBucketLocation\"],\"Resource\":\"arn:aws:s3:::${PREFIX}-*\"},
    {\"Sid\":\"StorageObjects\",\"Effect\":\"Allow\",\"Action\":[\"s3:GetObject\",\"s3:PutObject\",\"s3:DeleteObject\",\"s3:GetObjectTagging\",\"s3:PutObjectTagging\"],\"Resource\":\"arn:aws:s3:::${PREFIX}-*/*\"},
    {\"Sid\":\"RateLimits\",\"Effect\":\"Allow\",\"Action\":[\"dynamodb:GetItem\",\"dynamodb:PutItem\",\"dynamodb:UpdateItem\"],\"Resource\":[\"arn:aws:dynamodb:${AWS_REGION}:${ACCOUNT}:table/${PREFIX}-rate-limits\",\"arn:aws:dynamodb:${AWS_REGION}:${ACCOUNT}:table/${PREFIX}-public-rate-limits\"]}
  ]}"
}

ci_user () {
  aws iam create-user --user-name "${PREFIX}-ci" --tags $TAGS_KV
  aws iam put-user-policy --user-name "${PREFIX}-ci" --policy-name "${PREFIX}-ci" --policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[
    {\"Sid\":\"EcrLogin\",\"Effect\":\"Allow\",\"Action\":\"ecr:GetAuthorizationToken\",\"Resource\":\"*\"},
    {\"Sid\":\"EcrPush\",\"Effect\":\"Allow\",\"Action\":[\"ecr:BatchCheckLayerAvailability\",\"ecr:InitiateLayerUpload\",\"ecr:UploadLayerPart\",\"ecr:CompleteLayerUpload\",\"ecr:PutImage\",\"ecr:BatchGetImage\",\"ecr:GetDownloadUrlForLayer\",\"ecr:GetRepositoryPolicy\"],\"Resource\":\"arn:aws:ecr:${AWS_REGION}:${ACCOUNT}:repository/vetisuite/${APP_ENV}-*\"},
    {\"Sid\":\"LambdaDeploy\",\"Effect\":\"Allow\",\"Action\":[\"lambda:UpdateFunctionCode\",\"lambda:PublishVersion\",\"lambda:GetFunction\",\"lambda:GetFunctionConfiguration\"],\"Resource\":\"arn:aws:lambda:${AWS_REGION}:${ACCOUNT}:function:${PREFIX}-*\"}
  ]}"
  aws iam create-access-key --user-name "${PREFIX}-ci"
}

storage () {
  if [ "$AWS_REGION" = "us-east-1" ]; then
    aws s3api create-bucket --region "$AWS_REGION" --bucket "$BUCKET"
  else
    aws s3api create-bucket --region "$AWS_REGION" --bucket "$BUCKET" --create-bucket-configuration "LocationConstraint=${AWS_REGION}"
  fi

  aws s3api put-public-access-block --region "$AWS_REGION" --bucket "$BUCKET" --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
  aws s3api put-bucket-ownership-controls --region "$AWS_REGION" --bucket "$BUCKET" --ownership-controls '{"Rules":[{"ObjectOwnership":"BucketOwnerEnforced"}]}'
  aws s3api put-bucket-lifecycle-configuration --region "$AWS_REGION" --bucket "$BUCKET" --lifecycle-configuration '{"Rules":[{"ID":"expirar-temporal","Status":"Enabled","Filter":{"Prefix":"temporal/"},"Expiration":{"Days":7}}]}'
  aws s3api put-bucket-cors --region "$AWS_REGION" --bucket "$BUCKET" --cors-configuration "{\"CORSRules\":[{\"AllowedOrigins\":[\"${APP_DOMAIN}\"],\"AllowedMethods\":[\"POST\"],\"AllowedHeaders\":[\"Content-Type\"],\"ExposeHeaders\":[],\"MaxAgeSeconds\":3000}]}"
}

rate_limits () {
  for table in "${PREFIX}-rate-limits" "${PREFIX}-public-rate-limits"; do
    aws dynamodb create-table --region "$AWS_REGION" --table-name "$table" --attribute-definitions AttributeName=key,AttributeType=S --key-schema AttributeName=key,KeyType=HASH --billing-mode PAY_PER_REQUEST --tags $TAGS_KV
    aws dynamodb wait table-exists --region "$AWS_REGION" --table-name "$table"
    aws dynamodb update-time-to-live --region "$AWS_REGION" --table-name "$table" --time-to-live-specification Enabled=true,AttributeName=ttl
  done
}

lambda () {
  aws logs create-log-group --region "$AWS_REGION" --log-group-name "/aws/lambda/${FUNCTION}" --tags "$TAGS_MAP"
  aws logs put-retention-policy --region "$AWS_REGION" --log-group-name "/aws/lambda/${FUNCTION}" --retention-in-days 14
  aws lambda create-function --region "$AWS_REGION" --function-name "$FUNCTION" --package-type Image --code "ImageUri=${ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPOSITORY}:latest" --role "arn:aws:iam::${ACCOUNT}:role/${FUNCTION}-lambda" --architectures x86_64 --memory-size 1024 --timeout 30 --tags "$TAGS_MAP"
  aws lambda wait function-active-v2 --region "$AWS_REGION" --function-name "$FUNCTION"
}

api_gateway () {
  aws apigatewayv2 create-api --region "$AWS_REGION" --name "$FUNCTION" --protocol-type HTTP --tags "$TAGS_MAP"
  API_ID="$(aws apigatewayv2 get-apis --region "$AWS_REGION" --query "Items[?Name=='${FUNCTION}'].ApiId | [0]" --output text)"
  aws logs create-log-group --region "$AWS_REGION" --log-group-name "/aws/apigateway/${FUNCTION}"
  aws logs put-retention-policy --region "$AWS_REGION" --log-group-name "/aws/apigateway/${FUNCTION}" --retention-in-days 14
  aws apigatewayv2 create-stage --region "$AWS_REGION" --api-id "$API_ID" --stage-name '$default' --auto-deploy --access-log-settings "{\"DestinationArn\":\"arn:aws:logs:${AWS_REGION}:${ACCOUNT}:log-group:/aws/apigateway/${FUNCTION}\",\"Format\":\"{\\\"requestId\\\":\\\"\$context.requestId\\\",\\\"ip\\\":\\\"\$context.identity.sourceIp\\\",\\\"method\\\":\\\"\$context.httpMethod\\\",\\\"path\\\":\\\"\$context.path\\\",\\\"status\\\":\\\"\$context.status\\\",\\\"latency\\\":\\\"\$context.responseLatency\\\",\\\"integrationError\\\":\\\"\$context.integration.error\\\",\\\"userAgent\\\":\\\"\$context.identity.userAgent\\\"}\"}"
}

alarms () {
  aws sns create-topic --region "$AWS_REGION" --name "${PREFIX}-alarms"
  aws sns subscribe --region "$AWS_REGION" --topic-arn "$ALARMS_TOPIC" --protocol email --notification-endpoint "$ALARM_EMAIL"
  aws logs put-metric-filter --region "$AWS_REGION" --log-group-name "/aws/lambda/${FUNCTION}" --filter-name "${FUNCTION}-errors" --filter-pattern '{ $.level = "error" }' --metric-transformations "metricName=ApiServerErrors,metricNamespace=vetisuite/${APP_ENV},metricValue=1,defaultValue=0"
  aws cloudwatch put-metric-alarm --region "$AWS_REGION" --alarm-name "${FUNCTION}-errors" --namespace "vetisuite/${APP_ENV}" --metric-name ApiServerErrors --statistic Sum --period 60 --evaluation-periods 1 --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold --treat-missing-data notBreaching --alarm-actions "$ALARMS_TOPIC"
  aws cloudwatch put-metric-alarm --region "$AWS_REGION" --alarm-name "${FUNCTION}-lambda-errors" --namespace AWS/Lambda --metric-name Errors --dimensions "Name=FunctionName,Value=${FUNCTION}" --statistic Sum --period 60 --evaluation-periods 1 --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold --treat-missing-data notBreaching --alarm-actions "$ALARMS_TOPIC"
  aws cloudwatch put-metric-alarm --region "$AWS_REGION" --alarm-name "${QUEUE}-dlq" --namespace AWS/SQS --metric-name ApproximateNumberOfMessagesVisible --dimensions "Name=QueueName,Value=${QUEUE}-dlq" --statistic Maximum --period 60 --evaluation-periods 1 --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold --treat-missing-data notBreaching --alarm-actions "$ALARMS_TOPIC"
}

case "${1:-}" in
  base)
    ecr
    sqs
    iam
    ci_user
    storage
    rate_limits
    ;;
  lambda)
    lambda
    api_gateway
    alarms
    ;;
  *)
    echo "Uso: bootstrap.sh base | lambda   (lambda va después del primer image.sh)" >&2
    exit 1
    ;;
esac
