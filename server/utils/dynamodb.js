import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient, UpdateCommand} from '@aws-sdk/lib-dynamodb';

const dynamodb = {
  rateLimits: rateLimitsInstance(),
  publicRateLimits: publicRateLimitsInstance()
};

export default dynamodb;

function rateLimitsInstance () {
  const table = `vetisuite-${process.env.APP_ENV}-rate-limits`;
  const limit = Number(process.env.RATE_LIMIT_COUNT) || 100;
  const windowSeconds = 10;
  const banSeconds = 5 * 60;
  const recordSeconds = 24 * 60 * 60;
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({
    maxAttempts: 1,
    requestHandler: {connectionTimeout: 300, requestTimeout: 500}
  }));

  return {
    async enforce (sessionId) {
      const now = Math.floor(Date.now() / 1000);
      const bucket = Math.floor(now / windowSeconds);

      const counted = await client.send(new UpdateCommand({
        TableName: table,
        Key: {key: sessionId},
        UpdateExpression: 'ADD #bucket :one SET #ttl = if_not_exists(#ttl, :ttl) REMOVE #previous',
        ExpressionAttributeNames: {'#bucket': `w${bucket}`, '#previous': `w${bucket - 1}`, '#ttl': 'ttl'},
        ExpressionAttributeValues: {':one': 1, ':ttl': now + recordSeconds},
        ReturnValues: 'ALL_NEW'
      }));

      if (counted.Attributes.banUntil > now) {
        throw {error: 'errors.too_many_requests', status: 429, retryAfter: counted.Attributes.banUntil - now};
      }

      if (counted.Attributes[`w${bucket}`] <= limit) {
        return;
      }

      const banned = await client.send(new UpdateCommand({
        TableName: table,
        Key: {key: sessionId},
        UpdateExpression: 'SET #banUntil = :now + if_not_exists(#banSeconds, :ban), #banSeconds = if_not_exists(#banSeconds, :ban) + :ban',
        ExpressionAttributeNames: {'#banUntil': 'banUntil', '#banSeconds': 'banSeconds'},
        ExpressionAttributeValues: {':now': now, ':ban': banSeconds},
        ReturnValues: 'ALL_NEW'
      }));

      throw {error: 'errors.too_many_requests', status: 429, retryAfter: banned.Attributes.banUntil - now};
    }
  };
}

function publicRateLimitsInstance () {
  const table = `vetisuite-${process.env.APP_ENV}-public-rate-limits`;
  const limit = Number(process.env.PUBLIC_RATE_LIMIT_COUNT) || 300;
  const windowSeconds = 10;
  const banSeconds = 5 * 60;
  const recordSeconds = 24 * 60 * 60;
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({
    maxAttempts: 1,
    requestHandler: {connectionTimeout: 300, requestTimeout: 500}
  }));

  return {
    async enforce (hashId) {
      const now = Math.floor(Date.now() / 1000);
      const bucket = Math.floor(now / windowSeconds);

      const counted = await client.send(new UpdateCommand({
        TableName: table,
        Key: {key: hashId},
        UpdateExpression: 'ADD #bucket :one SET #ttl = if_not_exists(#ttl, :ttl) REMOVE #previous',
        ExpressionAttributeNames: {'#bucket': `w${bucket}`, '#previous': `w${bucket - 1}`, '#ttl': 'ttl'},
        ExpressionAttributeValues: {':one': 1, ':ttl': now + recordSeconds},
        ReturnValues: 'ALL_NEW'
      }));

      if (counted.Attributes.banUntil > now) {
        throw {error: 'errors.too_many_requests', status: 429, retryAfter: counted.Attributes.banUntil - now};
      }

      if (counted.Attributes[`w${bucket}`] <= limit) {
        return;
      }

      const banned = await client.send(new UpdateCommand({
        TableName: table,
        Key: {key: hashId},
        UpdateExpression: 'SET #banUntil = :now + if_not_exists(#banSeconds, :ban), #banSeconds = if_not_exists(#banSeconds, :ban) + :ban',
        ExpressionAttributeNames: {'#banUntil': 'banUntil', '#banSeconds': 'banSeconds'},
        ExpressionAttributeValues: {':now': now, ':ban': banSeconds},
        ReturnValues: 'ALL_NEW'
      }));

      throw {error: 'errors.too_many_requests', status: 429, retryAfter: banned.Attributes.banUntil - now};
    }
  };
}
