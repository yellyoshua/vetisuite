import type { ListPage } from '@/hooks/use-list-query'
import type { Batch, BatchListQuery } from './batches.schema'

const batchesService = {
  list(_query: BatchListQuery): Promise<ListPage<Batch>> {
    throw new Error('Not implemented: batchesService.list')
  },
}

export default batchesService
