import baseRoute from '@/core/base-route.js';
import {listAppointmentsAvailabilitySchema} from '@/modules/appointments-availability/appointments-availability.schema.js';
import appointmentsAvailabilityRepository from '@/modules/appointments-availability/appointments-availability.repository.js';

export default baseRoute(async (params, context) => {
  return appointmentsAvailabilityRepository.find({organization: context.profile.organization, archivedAt: null, ...pickFilters(params)}, {
    select: {
      id: true,
      timezone: true,
      week: true,
      overrides: true,
      slotMinutes: true,
      bufferBefore: true,
      bufferAfter: true,
      minNoticeHours: true,
      maxAdvanceDays: true,
      maxPerDay: true,
      onlineBooking: true,
      autoConfirm: true,
      createdAt: true,
      updatedAt: true
    },
    page: params.page,
    limit: params.limit,
    orderBy: {createdAt: params.order}
  });
}, listAppointmentsAvailabilitySchema, {module: 'appointments-availability'});

function pickFilters (params) {
  return params.id ? {id: params.id} : {};
}
