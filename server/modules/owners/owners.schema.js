import zod from 'zod';
import {nameField} from '@/modules/accounts/accounts.schema.js';

export const createOwnerSchema = zod.object({
  organization: zod.uuid(),
  firstName: nameField('nombre'),
  lastName: nameField('apellido'),
  email: zod.email('Email inválido').transform((email) => email.toLowerCase()),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: zod.string().nullish()
});

export const updateOwnerSchema = zod.object({
  id: zod.uuid(),
  firstName: nameField('nombre').optional(),
  lastName: nameField('apellido').optional(),
  phone: zod.string().nullish(),
  description: zod.string().max(500, 'La descripción no debe superar los 500 caracteres').nullish(),
  position: zod.string().nullish(),
  occupation: zod.string().nullish()
});
