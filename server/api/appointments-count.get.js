import baseRoute from '@/core/base-route.js';
import {countAppointmentsSchema} from '@/modules/appointments/appointments.schema.js';
import appointmentsRepository from '@/modules/appointments/appointments.repository.js';

export default baseRoute(async (params, context) => {
  const value = await appointmentsRepository.count({organization: context.profile.organization, archivedAt: null, ...pickFilters(params)}, {
    search: params.search,
    searchFields: ['reason']
  });

  return {value};
}, countAppointmentsSchema, {module: 'appointments-count'});

function pickFilters (params) {
  return {
    ...(params.date ? {date: params.date} : {}),
    ...(params.status ? {status: params.status} : {}),
    ...(params.vet ? {vet: params.vet} : {}),
    ...(params.patient ? {patient: params.patient} : {})
  };
}
