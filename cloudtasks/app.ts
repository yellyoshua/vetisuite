import { DeleteMessageCommand, GetQueueUrlCommand, ReceiveMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import whatsappUtilityMessage from './whatsapp-utility-message/whatsapp-utility-message'
import type { SqsEvent, SqsBatchResponse } from '@/utils/base-sqs-handler'
import { log } from '@/utils/logger'

type TaskHandler = (event: SqsEvent) => Promise<SqsBatchResponse>

// Consumidor local: cada handler se ata a su cola en una línea. En la nube lo reemplaza el trigger
// SQS → Lambda de cada task.
const HANDLERS: Record<string, TaskHandler> = {
  'whatsapp-utility-message': whatsappUtilityMessage,
}

const WAIT_SECONDS = 10

const client = new SQSClient({})

async function consume(task: string, handler: TaskHandler): Promise<never> {
  const { QueueUrl } = await client.send(
    new GetQueueUrlCommand({ QueueName: `vetisuite-${process.env.APP_ENV ?? 'development'}-cloudtask-${task}` }),
  )

  log('info', 'cloudtask.listening', { task })

  for (;;) {
    const { Messages = [] } = await client.send(
      new ReceiveMessageCommand({ QueueUrl, MaxNumberOfMessages: 10, WaitTimeSeconds: WAIT_SECONDS }),
    )

    for (const message of Messages) {
      const { batchItemFailures } = await handler({ Records: [{ messageId: message.MessageId!, body: message.Body! }] })

      if (batchItemFailures.length === 0) {
        await client.send(new DeleteMessageCommand({ QueueUrl, ReceiptHandle: message.ReceiptHandle! }))
      }
    }
  }
}

await Promise.all(Object.entries(HANDLERS).map(([task, handler]) => consume(task, handler)))
