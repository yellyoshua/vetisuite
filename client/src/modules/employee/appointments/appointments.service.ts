import type { ListPage } from '@/hooks/use-list-query'
import type { Appointment, AppointmentListQuery, AppointmentsAgenda } from './appointments.schema'

const appointmentsService = {
  list(_query: AppointmentListQuery): Promise<ListPage<Appointment>> {
    throw new Error('Not implemented: appointmentsService.list')
  },
  getAgenda(_date: string): Promise<AppointmentsAgenda> {
    throw new Error('Not implemented: appointmentsService.getAgenda')
  },
}

export default appointmentsService
