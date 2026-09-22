import {SQSClient, SendMessageCommand, GetQueueUrlCommand} from '@aws-sdk/client-sqs';
import logger from './logger.js';

const events = {
  emailAccountManager: {publish: (detail, params) => publish('email-account-manager', detail, params)}
};

export default events;

const client = new SQSClient({});

const queueUrls = new Map();

async function publish (task, detail, {requestId}) {
  const startedAt = Date.now();

  logger.info('[sqs] publish.started', {event: 'sqs.publish.started', requestId, task});

  try {
    const queue = await resolveQueueUrl(task);

    await client.send(new SendMessageCommand({
      QueueUrl: queue,
      MessageBody: JSON.stringify({requestId, type: task, detail})
    }));

    logger.info('[sqs] publish.completed', {event: 'sqs.publish.completed', requestId, task, queue, durationMs: Date.now() - startedAt});

    return true;
  } catch (error) {
    logger.error('[sqs] publish.failed', {event: 'sqs.publish.failed', requestId, task, durationMs: Date.now() - startedAt, error});

    return false;
  }
}

async function resolveQueueUrl (task) {
  const cached = queueUrls.get(task);

  if (cached) {
    return cached;
  }

  const queueName = `vetisuite-${process.env.APP_ENV}-cloudtask-${task}`;
  const {QueueUrl} = await client.send(new GetQueueUrlCommand({QueueName: queueName}));

  queueUrls.set(task, QueueUrl);

  return QueueUrl;
}
