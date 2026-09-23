import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {appointmentsAvailabilityTable} from '@vetisuite/database/schemas/schemas.js';
import {pkit} from '../pkit.config.js';

const availabilityColumns = [
  'id',
  'timezone',
  'week',
  'overrides',
  'slotMinutes',
  'bufferBefore',
  'bufferAfter',
  'minNoticeHours',
  'maxAdvanceDays',
  'maxPerDay',
  'onlineBooking',
  'autoConfirm',
  'createdAt',
  'updatedAt'
];

const writableFields = [
  'timezone',
  'week',
  'week.*',
  'week.*.*',
  'overrides',
  'overrides.*',
  'overrides.*.*',
  'slotMinutes',
  'bufferBefore',
  'bufferAfter',
  'minNoticeHours',
  'maxAdvanceDays',
  'maxPerDay',
  'onlineBooking',
  'autoConfirm'
];

async function assertOrganizationAvailability (data, context) {
  if (!data.id) {
    return;
  }

  const [availability] = await db.select({
    organization: appointmentsAvailabilityTable.organization,
    archivedAt: appointmentsAvailabilityTable.archivedAt
  })
  .from(appointmentsAvailabilityTable)
  .where(eq(appointmentsAvailabilityTable.id, data.id))
  .limit(1);

  if (!availability || availability.archivedAt || availability.organization !== context.profile.organization) {
    throw {error: 'Disponibilidad no encontrada', status: 404};
  }
}

const availability = pkit.module('appointments-availability').name('general');

availability.role('owner').registerActions({
  find: {enabled: true, properties: availabilityColumns},
  update: {enabled: true, properties: ['id', ...writableFields]}
})
.hook('update', assertOrganizationAvailability);

availability.role('employee').registerActions({
  find: {enabled: true, properties: availabilityColumns},
  update: {enabled: true, properties: ['id', ...writableFields]}
})
.hook('update', assertOrganizationAvailability);
