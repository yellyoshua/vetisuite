import type { ListPage } from '@/hooks/use-list-query'
import type { ClinicRecord, ClinicRecordListQuery } from './clinic.schema'

const clinicService = {
  list(_query: ClinicRecordListQuery): Promise<ListPage<ClinicRecord>> {
    throw new Error('Not implemented: clinicService.list')
  },
}

export default clinicService
