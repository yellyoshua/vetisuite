import baseRoute from '@/core/base-route.js';
import {updateAppointmentsAvailabilitySchema} from '@/modules/appointments-availability/appointments-availability.schema.js';
import {updateAppointmentsAvailability} from '@/modules/appointments-availability/appointments-availability.service.js';

export default baseRoute(async (data, context) => {
  return updateAppointmentsAvailability(context.profile.organization, data);
}, updateAppointmentsAvailabilitySchema, {module: 'appointments-availability'});
