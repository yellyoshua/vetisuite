import type { Params } from 'react-router'
import type { ResolverSearch } from '@/hooks/use-resolver'
import inventoryService from '@/modules/employee/inventory/inventory.service'
import inventoryCountService from '@/modules/employee/inventory/inventory-count.service'
import type { Product } from '@/modules/employee/inventory/inventory.schema'

export default {
  products: async (_params: Readonly<Params>, search: ResolverSearch) => {
    const [products] = await Promise.all([
      inventoryService.get<Product[]>({
        search: search.search ? String(search.search) : undefined,
        category: search.category ? String(search.category) : undefined,
        page: search.page,
      }),
      inventoryCountService.get<{ value: number }>({
        search: search.search ? String(search.search) : undefined,
        category: search.category ? String(search.category) : undefined,
      }),
    ])

    return products || []
  },
}
