import zod from 'zod';
import {listParams} from '@/utils/request-params.js';

const emptyToNull = (value) => (value === '' ? null : value);

const nameField = zod.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres');

const phoneField = zod.string().trim().min(6, 'El teléfono debe tener al menos 6 dígitos');

const emailField = zod.preprocess(emptyToNull, zod.email('Email inválido').nullish());

export const listClientsSchema = listParams;

export const countClientsSchema = zod.object({
  search: zod.string().trim().max(100).optional().catch(undefined)
});

export const createClientSchema = zod.object({
  name: nameField,
  phone: phoneField,
  email: emailField
});

export const updateClientSchema = zod.object({
  id: zod.uuid(),
  name: nameField.optional(),
  phone: phoneField.optional(),
  email: emailField
});

export const deleteClientSchema = zod.object({id: zod.uuid()});
