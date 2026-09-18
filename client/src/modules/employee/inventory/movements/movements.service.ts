import type { ListPage } from '@/hooks/use-list-query'
import type { Movement, MovementListQuery } from './movements.schema'

const movementsService = {
  list(_query: MovementListQuery): Promise<ListPage<Movement>> {
    throw new Error('Not implemented: movementsService.list')
  },
}

export default movementsService
