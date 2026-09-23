import zod from 'zod';
import {listParams} from '@/utils/request-params.js';
import {appointmentStatus} from '@vetisuite/database/schemas/schemas.js';

const emptyToUndefined = (value) => (value === '' ? undefined : value);

const dateField = zod.preprocess(emptyToUndefined, zod.iso.date('La fecha debe tener el formato AAAA-MM-DD').optional());

const statusField = zod.preprocess(emptyToUndefined, zod.enum(appointmentStatus.enumValues).optional());

const vetField = zod.preprocess(emptyToUndefined, zod.uuid('Identificador de médico inválido').optional());

const patientField = zod.preprocess(emptyToUndefined, zod.uuid('Identificador de paciente inválido').optional());

export const listAppointmentsSchema = listParams.extend({
  date: dateField,
  status: statusField,
  vet: vetField,
  patient: patientField,
  order: zod.enum(['asc', 'desc']).default('asc').catch('asc')
});

export const countAppointmentsSchema = zod.object({
  search: zod.string().trim().max(100).optional().catch(undefined),
  date: dateField,
  status: statusField,
  vet: vetField,
  patient: patientField
});
