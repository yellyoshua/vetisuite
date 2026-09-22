import zod from 'zod';
import {listParams} from '@/utils/request-params.js';
import {patientSexOptions, speciesOptions} from '@/constants/patients.js';

const emptyToNull = (value) => (value === '' ? null : value);

const nameField = zod.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres');

const breedField = zod.preprocess(emptyToNull, zod.string().trim().max(100, 'La raza no debe superar los 100 caracteres').nullish());

const sexField = zod.preprocess(emptyToNull, zod.enum(patientSexOptions).nullish());

const birthDateField = zod.preprocess(emptyToNull, zod.iso.date('La fecha de nacimiento debe tener el formato AAAA-MM-DD').nullish());

export const listPatientsSchema = listParams.extend({
  client: zod.uuid().optional()
});

export const createPatientSchema = zod.object({
  client: zod.uuid(),
  name: nameField,
  species: zod.enum(speciesOptions),
  breed: breedField,
  sex: sexField,
  birthDate: birthDateField
});

export const updatePatientSchema = zod.object({
  id: zod.uuid(),
  name: nameField.optional(),
  species: zod.enum(speciesOptions).optional(),
  breed: breedField,
  sex: sexField,
  birthDate: birthDateField
});

export const deletePatientSchema = zod.object({id: zod.uuid()});
