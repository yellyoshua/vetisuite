import type { SqsBatchResponse, SqsEvent } from '@/utils/base-sqs-handler'

async function main(_event: SqsEvent): Promise<SqsBatchResponse> {
  throw new Error('Not implemented: main')
}

export default main
