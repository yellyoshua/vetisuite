import baseRoute from '@/core/base-route.js';
import {listAppointmentsSchema} from '@/modules/appointments/appointments.schema.js';
import appointmentsRepository from '@/modules/appointments/appointments.repository.js';
import {toWallClock} from '@/utils/timezone.js';

export default baseRoute(async (params, context) => {
  const appointments = await appointmentsRepository.find({organization: context.profile.organization, archivedAt: null, ...pickFilters(params)}, {
    select: {id: true, startsAt: true, timezone: true, durationMinutes: true, reason: true, status: true, source: true, createdAt: true, updatedAt: true},
    join: {patient: 'id name', vet: 'id firstName lastName'},
    search: params.search,
    searchFields: ['reason'],
    page: params.page,
    limit: params.limit,
    orderBy: {startsAt: params.order}
  });

  return appointments.map((appointment) => ({...appointment, startsAt: toWallClock(appointment.startsAt)}));
}, listAppointmentsSchema, {module: 'appointments'});

function pickFilters (params) {
  return {
    ...(params.id ? {id: params.id} : {}),
    ...(params.date ? {date: params.date} : {}),
    ...(params.status ? {status: params.status} : {}),
    ...(params.vet ? {vet: params.vet} : {}),
    ...(params.patient ? {patient: params.patient} : {})
  };
}
