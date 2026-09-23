import {pkit} from '../pkit.config.js';

const appointmentColumns = ['id', 'patient', 'vet', 'startsAt', 'durationMinutes', 'reason', 'status', 'source', 'createdAt', 'updatedAt'];

const appointments = pkit.module('appointments').name('general');

appointments.role('owner').registerActions({
  find: {enabled: true, properties: [...appointmentColumns, 'search', 'date']}
});

appointments.role('employee').registerActions({
  find: {enabled: true, properties: [...appointmentColumns, 'search', 'date']}
});
