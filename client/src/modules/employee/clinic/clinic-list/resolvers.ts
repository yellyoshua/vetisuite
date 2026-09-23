import type { Params } from 'react-router'
import type { ResolverSearch } from '@/hooks/use-resolver'
import clinicService from '@/modules/employee/clinic/clinic.service'
import clinicCountService from '@/modules/employee/clinic/clinic-count.service'
import type { ClinicRecord } from '../clinic.schema'

export default {
  records: async (_params: Readonly<Params>, search: ResolverSearch) => {
    const [records] = await Promise.all([
      clinicService.get<ClinicRecord[]>({
        search: search.search ? String(search.search) : undefined,
        kind: search.kind ? String(search.kind) : undefined,
        status: search.status ? String(search.status) : undefined,
        preset: search.preset ? String(search.preset) : undefined,
        page: search.page,
      }),
      clinicCountService.get<{ value: number }>({
        search: search.search ? String(search.search) : undefined,
        kind: search.kind ? String(search.kind) : undefined,
        status: search.status ? String(search.status) : undefined,
        preset: search.preset ? String(search.preset) : undefined,
      }),
    ])

    return records || []
  },
}
