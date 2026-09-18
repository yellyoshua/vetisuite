import type { ListPage } from '@/hooks/use-list-query'
import type { Product, ProductListQuery } from './inventory.schema'

const inventoryService = {
  list(_query: ProductListQuery): Promise<ListPage<Product>> {
    throw new Error('Not implemented: inventoryService.list')
  },
}

export default inventoryService
