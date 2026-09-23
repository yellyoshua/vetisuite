import type { Params } from 'react-router'
import type { ResolverSearch } from '@/hooks/use-resolver'
import visitsGroomingService from '@/modules/employee/grooming/visits-grooming.service'
import visitsGroomingCountService from '@/modules/employee/grooming/visits-grooming-count.service'
import type { GroomingService } from '../grooming.schema'

export default {
  services: async (_params: Readonly<Params>, search: ResolverSearch) => {
    const [services] = await Promise.all([
      visitsGroomingService.get<GroomingService[]>({
        search: search.search ? String(search.search) : undefined,
        status: search.status ? String(search.status) : undefined,
        preset: search.preset ? String(search.preset) : undefined,
        page: search.page ? Number(search.page) : undefined,
      }),
      visitsGroomingCountService.get<{ value: number }>({
        search: search.search ? String(search.search) : undefined,
        status: search.status ? String(search.status) : undefined,
        preset: search.preset ? String(search.preset) : undefined,
      }),
    ])

    return services || []
  },
}
