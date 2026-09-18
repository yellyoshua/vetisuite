import type { ListPage } from '@/hooks/use-list-query'
import type { Portal, PortalListQuery } from './portals.schema'

const portalsService = {
  list(_query: PortalListQuery): Promise<ListPage<Portal>> {
    throw new Error('Not implemented: portalsService.list')
  },
}

export default portalsService
