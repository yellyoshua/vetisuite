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

export function baseSqsHandler(_handleRecord: SqsRecordHandler): SqsHandler {
  throw new Error('Not implemented: baseSqsHandler')
}
