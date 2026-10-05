import { log } from './logger'

export type SqsRecord = {
  messageId: string
  body: string
}

export type SqsEvent = {
  Records: SqsRecord[]
}

export type SqsBatchItemFailure = {
  itemIdentifier: string
}

export type SqsBatchResponse = {
  batchItemFailures: SqsBatchItemFailure[]
}

export type SqsRecordHandler = (record: SqsRecord) => Promise<void>

export type SqsHandler = (event: SqsEvent) => Promise<SqsBatchResponse>

// Cada registro falla por separado: SQS solo reentrega los que aparecen en batchItemFailures.
export function baseSqsHandler(handleRecord: SqsRecordHandler): SqsHandler {
  return async function handleEvent(event) {
    const results = await Promise.allSettled(event.Records.map(handleRecord))

    const batchItemFailures = results.flatMap((result, index) => {
      if (result.status === 'fulfilled') {
        return []
      }

      log('error', 'sqs.record.failed', { messageId: event.Records[index]!.messageId, error: String(result.reason) })

      return [{ itemIdentifier: event.Records[index]!.messageId }]
    })

    return { batchItemFailures }
  }
}
