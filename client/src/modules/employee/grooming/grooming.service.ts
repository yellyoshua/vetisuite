import type { ListPage } from '@/hooks/use-list-query'
import type { GroomingListQuery, GroomingService } from './grooming.schema'

const groomingService = {
  list(_query: GroomingListQuery): Promise<ListPage<GroomingService>> {
    throw new Error('Not implemented: groomingService.list')
  },
}

export default groomingService
