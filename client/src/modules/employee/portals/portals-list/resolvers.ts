import type { Params } from 'react-router'
import type { ResolverSearch } from '@/hooks/use-resolver'
import portalsService from '@/modules/employee/portals/portals.service'
import portalsCountService from '@/modules/employee/portals/portals-count.service'
import type { Portal } from '../portals.schema'

export default {
  portals: async (_params: Readonly<Params>, search: ResolverSearch) => {
    const [portals] = await Promise.all([
      portalsService.get<Portal[]>({
        search: search.search ? String(search.search) : undefined,
        purpose: search.purpose ? String(search.purpose) : (search.type ? String(search.type) : undefined),
        preset: search.preset ? String(search.preset) : undefined,
        page: search.page,
      }),
      portalsCountService.get<{ value: number }>({
        search: search.search ? String(search.search) : undefined,
        purpose: search.purpose ? String(search.purpose) : (search.type ? String(search.type) : undefined),
        preset: search.preset ? String(search.preset) : undefined,
      }),
    ])

    return portals || []
  },
}
